import React, { useState, useEffect, useRef, useMemo } from "react";
import { View, Text, Image, TouchableOpacity, ScrollView, StyleSheet, Modal } from "react-native";
import {
  collection,
  onSnapshot,
  doc,
  getDoc,
  setDoc,
  arrayUnion,
  arrayRemove,
  serverTimestamp,
  deleteField,
} from "firebase/firestore";
import { db, auth } from "../Firebase";
import { useCardTheme, BRAND, PALETTE } from "../theme";
import { useToast } from "../components/Toast";
import { Screen, ScreenHeader, GlassCard, Pill } from "../components/UI";
import { MENTORS } from "../Data/careerData";
import { myTrackFrom } from "../careerEngine";

// Words in a mentor's role / tags that tell us which career track they fit, so
// mentors who match the student's quiz result can be shown first.
const MENTOR_KEYWORDS = {
  "backend-developer": ["backend", "python", "java", "microservices", "api"],
  "frontend-developer": ["frontend", "react", "typescript"],
  "devops-engineer": ["devops", "kubernetes", "terraform", "ci/cd", "cloud"],
  "data-engineer": ["data engineer", "spark", "dbt", "snowflake", "pipeline"],
  "data-scientist": ["data scientist", "machine learning"],
  "cybersecurity-analyst": ["security", "cyber"],
  "mobile-developer": ["mobile", "android", "ios", "flutter"],
  "qa-engineer": ["qa", "tester", "testing"],
  "ux-ui-designer": ["ux", "designer", "figma"],
  "product-manager": ["product manager", "product owner", "scrum"],
};
const mentorMatches = (mentor, trackId) => {
  const text = `${mentor.role || ""} ${(mentor.tags || []).join(" ")}`.toLowerCase();
  return (MENTOR_KEYWORDS[trackId] || []).some((k) => text.includes(k));
};

export default function MentorshipScreen({ navigate }) {
  const t = useCardTheme();
  const toast = useToast();

  // Mentors come live from Firestore (`mentors`), falling back to the
  // built-in list until/unless Firestore has data.
  const [mentors, setMentors] = useState(MENTORS);
  const [mentorsReady, setMentorsReady] = useState(false);
  const previousAvailability = useRef(null); // { [mentor name]: boolean }

  const [quizResult, setQuizResult] = useState(null); // the student's quiz result
  const [requested, setRequested] = useState(new Set());
  const [confirmMentor, setConfirmMentor] = useState(null); // mentor being withdrawn

  // This student's notification settings (Settings > Notifications).
  const [prefs, setPrefs] = useState({ notifs: true, mentor: false });
  const [prefsLoaded, setPrefsLoaded] = useState(false);
  const alertsOn = prefs.notifs !== false && prefs.mentor === true;
  const alertsOnRef = useRef(alertsOn);
  alertsOnRef.current = alertsOn;

  const uid = auth.currentUser?.uid;

  // ---- Load this student's saved requests + notification settings ----
  useEffect(() => {
    if (!uid) {
      setPrefsLoaded(true);
      return;
    }
    (async () => {
      try {
        const snap = await getDoc(doc(db, "users", uid));
        if (snap.exists()) {
          const data = snap.data();
          if (data.quizResult) setQuizResult(data.quizResult);
          if (Array.isArray(data.mentorRequests)) setRequested(new Set(data.mentorRequests));
          if (data.notificationPrefs) setPrefs((p) => ({ ...p, ...data.notificationPrefs }));
        }
      } catch (err) {
        console.warn("Could not load mentor requests:", err.code, err.message);
      } finally {
        setPrefsLoaded(true);
      }
    })();
  }, [uid]);

  // ---- Live mentor list; pop-up when a busy mentor becomes available ----
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "mentors"),
      (snap) => {
        const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        if (rows.length > 0) {
          rows.sort((a, b) => (a.order ?? 999) - (b.order ?? 999) || String(a.name).localeCompare(String(b.name)));

          const before = previousAvailability.current;
          if (before) {
            const nowFree = rows.filter((m) => before[m.name] === false && m.available === true);
            if (nowFree.length > 0 && alertsOnRef.current) {
              const names = nowFree.map((m) => m.name);
              toast.show({
                type: "info",
                title: names.length === 1 ? `${names[0]} is now available` : "Mentors now available",
                message:
                  names.length === 1
                    ? "Tap the card below to request mentorship."
                    : `${names.join(" and ")} can take new mentees.`,
              });
            }
          }
          previousAvailability.current = Object.fromEntries(rows.map((m) => [m.name, !!m.available]));
          setMentors(rows);
        } else {
          previousAvailability.current = Object.fromEntries(MENTORS.map((m) => [m.name, !!m.available]));
        }
        setMentorsReady(true);
      },
      (err) => {
        console.warn("Could not load mentors from Firestore, using built-in list:", err.code, err.message);
        previousAvailability.current = Object.fromEntries(MENTORS.map((m) => [m.name, !!m.available]));
        setMentorsReady(true);
      }
    );
    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- Pop-up when the screen opens (only if the student turned alerts on) ----
  const openingAlertShown = useRef(false);
  useEffect(() => {
    if (!prefsLoaded || !mentorsReady || openingAlertShown.current) return;
    openingAlertShown.current = true;
    if (!alertsOn) return;
    const free = mentors.filter((m) => m.available).length;
    toast.show({
      type: "info",
      title: free === 1 ? "1 mentor available now" : `${free} mentors available now`,
      message: free > 0 ? "Pick one and send a request." : "We'll alert you when someone is free.",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefsLoaded, mentorsReady]);

  // ---- Send / withdraw a request ----
  const saveRequest = async (mentor, add) => {
    // Update the screen immediately...
    setRequested((prev) => {
      const next = new Set(prev);
      if (add) next.add(mentor.name);
      else next.delete(mentor.name);
      return next;
    });
    if (!uid) return true; // not signed in: only lasts for this session
    try {
      // 1) The request document the mentor portal reads
      const reqRef = doc(db, "mentorRequests", `${uid}_${mentor.id}`);
      if (add) {
        if (!mentor.id) throw new Error("This mentor has no id");
        const me = (await getDoc(doc(db, "users", uid))).data() || {};
        await setDoc(reqRef, {
          studentId: uid,
          studentName: me.fullName || "Student",
          studentEmail: auth.currentUser?.email || me.email || "",
          course: me.course || "",
          institution: me.institution || "",
          year: me.year || "",
          careerMatch: quizResult?.topMatch?.title || null,
          mentorId: mentor.id,
          mentorName: mentor.name,
          status: "pending",
          requestedAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } else {
        // Old requests (sent before this change) have no document: that's fine, skip it.
        try {
          await setDoc(reqRef, { status: "withdrawn", updatedAt: serverTimestamp() }, { merge: true });
        } catch (e) {
          console.log("No request document to withdraw (old request):", e.code);
        }
      }
      // 2) Your existing save on the student's own document
      await setDoc(
        doc(db, "users", uid),
        {
          mentorRequests: add ? arrayUnion(mentor.name) : arrayRemove(mentor.name),
          mentorRequestTimes: { [mentor.name]: add ? serverTimestamp() : deleteField() },
        },
        { merge: true }
      );
      return true;
    } catch (err) {
      console.warn("Could not save mentor request:", err.code, err.message);
      // Put the button back the way it was
      setRequested((prev) => {
        const next = new Set(prev);
        if (add) next.delete(mentor.name);
        else next.add(mentor.name);
        return next;
      });
      return false;
    }
  };

  const onPressRequest = async (mentor) => {
    if (!mentor.available) {
      toast.show({
        type: "info",
        title: `${mentor.name} is busy right now`,
        message: alertsOn
          ? "We'll pop up a notification as soon as they're available."
          : "Turn on Mentor Availability Alerts in Settings to be told when they're free.",
      });
      return;
    }

    if (requested.has(mentor.name)) {
      setConfirmMentor(mentor); // ask before withdrawing
      return;
    }

    const ok = await saveRequest(mentor, true);
    toast.show(
      ok
        ? { type: "success", title: "Request sent", message: `${mentor.name} has been notified of your request.` }
        : { type: "error", title: "Couldn't send request", message: "Check your connection and try again." }
    );
  };

  const withdraw = async () => {
    const mentor = confirmMentor;
    setConfirmMentor(null);
    if (!mentor) return;
    const ok = await saveRequest(mentor, false);
    toast.show(
      ok
        ? { type: "info", title: "Request withdrawn", message: `Your request to ${mentor.name} was cancelled.` }
        : { type: "error", title: "Couldn't withdraw request", message: "Check your connection and try again." }
    );
  };

  const availableCount = mentors.filter((m) => m.available).length;

  // Mentors who fit the student's career come first (the sort keeps the original
  // order inside each group).
  const track = useMemo(() => myTrackFrom(quizResult), [quizResult]);
  const orderedMentors = useMemo(() => {
    if (!track) return mentors.map((m) => ({ m, match: false }));
    const tagged = mentors.map((m) => ({ m, match: mentorMatches(m, track.id) }));
    return [...tagged.filter((x) => x.match), ...tagged.filter((x) => !x.match)];
  }, [mentors, track]);
  const matchCount = orderedMentors.filter((x) => x.match).length;

  return (
    <Screen>
      <ScreenHeader
        onBack={() => navigate("profile")}
        eyebrow="Learn from those who've been there"
        title="Find a Mentor"
        subtitle={
          track && matchCount > 0
            ? `${matchCount} match your career · ${availableCount} available now`
            : `${availableCount} mentors available now`
        }
      />

      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {track && matchCount === 0 && (
          <GlassCard style={{ marginBottom: 12 }}>
            <Text style={[styles.bio, { color: t.subtext, marginTop: 0 }]}>
              We don't have a {track.title} mentor yet, so you're seeing everyone. More mentors are being added.
            </Text>
          </GlassCard>
        )}
        {orderedMentors.map(({ m: mentor, match }) => {
          const isReq = requested.has(mentor.name);
          return (
            <GlassCard key={mentor.id || mentor.name}>
              <View style={styles.headerRow}>
                <View style={styles.avatarWrap}>
                  <Image source={{ uri: mentor.img }} style={[styles.avatar, { backgroundColor: t.accentSoft }]} />
                  {mentor.available && <View style={[styles.availableDot, { borderColor: t.dark ? PALETTE.text : PALETTE.white }]} />}
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={[styles.name, { color: t.text }]}>{mentor.name}</Text>
                  <Text style={[styles.roleText, { color: t.subtext }]}>
                    {mentor.role} · {mentor.company}
                  </Text>
                  <Text style={[styles.locationText, { color: t.subtext }]}>{mentor.location}</Text>
                </View>

                <Pill label={mentor.available ? "Available" : "Busy"} tone={mentor.available ? "green" : "muted"} />
              </View>

              {match && (
                <View style={{ marginTop: 10, alignSelf: "flex-start" }}>
                  <Pill label={`Fits your career · ${track.title}`} />
                </View>
              )}

              <Text style={[styles.bio, { color: t.subtext }]}>{mentor.bio}</Text>

              <View style={styles.tagsRow}>
                {(mentor.tags || []).map((tag) => (
                  <Pill key={tag} label={tag} />
                ))}
              </View>

              <TouchableOpacity
                onPress={() => onPressRequest(mentor)}
                activeOpacity={0.85}
                style={[
                  styles.requestButton,
                  { backgroundColor: BRAND.dark },
                  isReq && { backgroundColor: "transparent", borderWidth: 2, borderColor: t.accent },
                  !mentor.available && { backgroundColor: t.track },
                ]}
              >
                <Text
                  style={[
                    styles.requestButtonText,
                    isReq && { color: t.accent },
                    !mentor.available && { color: t.subtext },
                  ]}
                >
                  {isReq ? "Request Sent" : mentor.available ? "Request Mentorship" : "Currently Unavailable"}
                </Text>
              </TouchableOpacity>
            </GlassCard>
          );
        })}
      </ScrollView>

      {/* Confirmation pop-up before withdrawing a request */}
      <Modal visible={!!confirmMentor} transparent animationType="fade" onRequestClose={() => setConfirmMentor(null)}>
        <View style={styles.modalRoot}>
          <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setConfirmMentor(null)} />
          <View style={[styles.dialog, { backgroundColor: t.dark ? PALETTE.text : PALETTE.white }]}>
            <Text style={[styles.dialogTitle, { color: t.text }]}>Withdraw request?</Text>
            <Text style={[styles.dialogBody, { color: t.subtext }]}>
              Cancel your mentorship request to {confirmMentor?.name}? You can send it again later.
            </Text>
            <View style={styles.dialogRow}>
              <TouchableOpacity
                onPress={() => setConfirmMentor(null)}
                style={[styles.dialogButton, { borderWidth: 1.5, borderColor: t.divider }]}
              >
                <Text style={[styles.dialogButtonText, { color: t.text }]}>Keep request</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={withdraw} style={[styles.dialogButton, { backgroundColor: PALETTE.danger }]}>
                <Text style={[styles.dialogButtonText, { color: PALETTE.white }]}>Withdraw</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scrollContent: { paddingHorizontal: 20, paddingBottom: 24, gap: 12 },
  headerRow: { flexDirection: "row", alignItems: "flex-start", gap: 14, marginBottom: 10 },
  avatarWrap: { position: "relative" },
  avatar: { width: 54, height: 54, borderRadius: 16 },
  availableDot: {
    position: "absolute",
    bottom: -3,
    right: -3,
    width: 13,
    height: 13,
    borderRadius: 7,
    backgroundColor: PALETTE.success,
    borderWidth: 2.5,
  },
  name: { fontSize: 16, fontWeight: "700" },
  roleText: { fontSize: 12, marginTop: 2 },
  locationText: { fontSize: 11, marginTop: 1 },
  bio: { fontSize: 13, lineHeight: 19, marginBottom: 10 },
  tagsRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 12 },
  requestButton: { width: "100%", paddingVertical: 13, borderRadius: 12, alignItems: "center" },
  requestButtonText: { fontSize: 14, fontWeight: "700", color: PALETTE.white },

  modalRoot: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  modalBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.5)" },
  dialog: { width: "100%", maxWidth: 380, borderRadius: 20, padding: 22 },
  dialogTitle: { fontSize: 18, fontWeight: "800", marginBottom: 8 },
  dialogBody: { fontSize: 14, lineHeight: 20, marginBottom: 20 },
  dialogRow: { flexDirection: "row", gap: 10 },
  dialogButton: { flex: 1, paddingVertical: 13, borderRadius: 12, alignItems: "center" },
  dialogButtonText: { fontSize: 14, fontWeight: "700" },
});