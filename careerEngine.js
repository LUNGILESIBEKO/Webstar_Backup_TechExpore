// careerEngine.js
// The logic that makes the Quiz and the Roadmap AUTOMATIC instead of hardcoded:
//
//   Firestore (or Data/careerData.js as fallback)
//        |  career_tracks / quiz_questions / roadmap_steps
//        v
//   useCareerTracks + useQuizQuestions  ->  scoreQuiz()  ->  quizResult (saved on users/{uid})
//                                                              |
//                                                              v
//                          trackIdFromResult()  ->  useRoadmapSteps(trackId)  ->  Roadmap screen
//
// Retaking the quiz changes the top match, and the roadmap follows by itself.

import { useMemo, useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { doc, getDoc } from "firebase/firestore";
import { db, auth } from "./Firebase";
import { useFirestoreList, byOrder } from "./FirestoreHooks";
import { TRACKS, QUIZ_QUESTIONS, ROADMAP_STEPS } from "./Data/careerData";
import { TRACK_CONTENT, TRACK_ALIASES } from "./Data/careerContent";

export const slugify = (s) =>
  String(s || "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

/* ------------------------------ Career tracks ------------------------------ */

export function useCareerTracks() {
  const rows = useFirestoreList("career_tracks", TRACKS, byOrder);
  return useMemo(
    () =>
      rows.map((t, i) => {
        const title = typeof t === "string" ? t : t.title;
        // Keep the track's own id when it has one. Rebuilding it from the title
        // turned "QA / Test Engineer" into "qa-test-engineer", which no longer
        // matched the quiz weights and roadmap steps ("qa-engineer"), so that
        // career could never win the quiz.
        const id = typeof t === "string" ? slugify(title) : t.id || slugify(title);
        return { id, title, order: t.order ?? i + 1 };
      }),
    [rows]
  );
}

/* --------------------------------- Quiz ----------------------------------- */

// Accepts both the new shape (options = [{ text, weights }]) and the older
// Firestore shape (options = ["text", ...], where option N meant track N).
export function normalizeQuestions(rows, tracks) {
  return rows
    .map((q, qi) => ({
      id: String(q.id ?? qi),
      text: q.text || q.question || "",
      options: (q.options || []).map((o, oi) => {
        if (typeof o === "string") {
          return { text: o, weights: tracks[oi] ? { [tracks[oi].id]: 3 } : {} };
        }
        return {
          text: o.text || o.label || "",
          weights: o.weights || (o.track ? { [slugify(o.track)]: 3 } : {}),
        };
      }),
    }))
    .filter((q) => q.text && q.options.length > 0);
}

export function useQuizQuestions(tracks) {
  const rows = useFirestoreList("quiz_questions", QUIZ_QUESTIONS, byOrder);
  return useMemo(() => normalizeQuestions(rows, tracks), [rows, tracks]);
}

// answers = { [questionId]: chosenOptionIndex }
// Each track's percent = points earned / best points it could have earned.
export function scoreQuiz(questions, answers, tracks) {
  const max = {};
  const got = {};
  tracks.forEach((t) => {
    max[t.id] = 0;
    got[t.id] = 0;
  });

  questions.forEach((q) => {
    tracks.forEach((t) => {
      max[t.id] += Math.max(0, ...q.options.map((o) => o.weights?.[t.id] || 0));
    });
    const chosen = q.options[answers[q.id]];
    if (chosen) {
      Object.entries(chosen.weights || {}).forEach(([trackId, pts]) => {
        if (trackId in got) got[trackId] += pts;
      });
    }
  });

  return tracks
    .map((t) => ({
      id: t.id,
      title: t.title,
      order: t.order,
      percent: max[t.id] ? Math.round((got[t.id] / max[t.id]) * 100) : 0,
    }))
    .sort((a, b) => b.percent - a.percent || a.order - b.order)
    .map(({ order, ...match }) => match);
}

/* -------------------------------- Roadmap --------------------------------- */

// Which track a saved quiz result points at (old results only had a title).
export function trackIdFromResult(quizResult) {
  const top = quizResult?.topMatch;
  if (!top) return null;
  return top.id || slugify(top.title);
}

// The student's career track, from their saved quiz result. Explore (skills,
// certifications, jobs & salaries) and the Job Prep Hub use this so everything
// they see follows what the quiz said. Returns null until they have taken the
// quiz: { id, title, content } where content = TRACK_CONTENT[id].
export function myTrackFrom(quizResult) {
  const raw = trackIdFromResult(quizResult);
  const id = TRACK_ALIASES[raw] || raw;
  const content = id ? TRACK_CONTENT[id] : null;
  if (!content) return null;
  const title =
    quizResult?.topMatch?.title || TRACKS.find((t) => t.id === id)?.title || id;
  return { id, title, content };
}

// Steps for one track: live Firestore steps tagged with that track, else the
// built-in steps for it. Returns [] when there is no track yet (quiz not done).
export function useRoadmapSteps(trackId) {
  const all = useFirestoreList("roadmap_steps", ROADMAP_STEPS, byOrder);
  return useMemo(() => {
    if (!trackId) return [];
    const fromDb = all.filter((s) => s.track === trackId);
    const list = fromDb.length ? fromDb : ROADMAP_STEPS.filter((s) => s.track === trackId);
    return [...list].sort(byOrder).map((s) => ({ ...s, id: String(s.id) }));
  }, [all, trackId]);
}

export function countCompleted(steps, completedIds) {
  const done = new Set((completedIds || []).map(String));
  return steps.filter((s) => done.has(s.id)).length;
}

// Marks each step completed / current (first unfinished) / pending.
export function withStatuses(steps, completedIds) {
  const done = new Set((completedIds || []).map(String));
  let currentAssigned = false;
  return steps.map((s) => {
    if (done.has(s.id)) return { ...s, status: "completed" };
    if (!currentAssigned) {
      currentAssigned = true;
      return { ...s, status: "current" };
    }
    return { ...s, status: "pending" };
  });
}

/* ------------------------------ Student profile ---------------------------- */

// Loads users/{uid} and re-loads it every time the screen comes back into
// view, so Quiz / Roadmap / Mentor changes show up everywhere.
export function useUserDoc() {
  const [profile, setProfile] = useState(null);
  const [loaded, setLoaded] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const uid = auth.currentUser?.uid;
      if (!uid) {
        setLoaded(true);
        return undefined;
      }
      let cancelled = false;
      (async () => {
        try {
          const snap = await getDoc(doc(db, "users", uid));
          if (!cancelled) setProfile(snap.exists() ? snap.data() : null);
        } catch (err) {
          console.warn("Could not load profile:", err.code, err.message);
        } finally {
          if (!cancelled) setLoaded(true);
        }
      })();
      return () => {
        cancelled = true;
      };
    }, [])
  );

  return { profile, setProfile, loaded };
}
