// seedFirestore.js - ONE-TIME helper that fills Firestore with the shared
// content the app reads: institutions, career_tracks, quiz_questions (with
// scoring weights), roadmap_steps (one roadmap per career track) and mentors.
// The data itself lives in Data/careerData.js - edit it there, then re-run.
//
// Use: temporarily call seedFirestore() from a button while signed in, then remove it.
// Requires rules that allow writes from you (or temporarily use test mode) - see EXPLANATION.md.
import { doc, setDoc, deleteDoc } from "firebase/firestore";
import { db } from "./Firebase";
import { TRACKS, QUIZ_QUESTIONS, ROADMAP_STEPS, MENTORS } from "./Data/careerData";

const institutions = [
  "University of Cape Town (UCT)", "University of the Witwatersrand (Wits)", "Stellenbosch University",
  "University of Pretoria (UP)", "University of Johannesburg (UJ)", "University of KwaZulu-Natal (UKZN)",
  "Rhodes University", "CPUT", "Tshwane University of Technology (TUT)", "Nelson Mandela University",
  "North-West University", "University of Limpopo", "Other",
];

export async function seedFirestore() {
  for (let i = 0; i < institutions.length; i++)
    await setDoc(doc(db, "institutions", `inst_${i + 1}`), { name: institutions[i], order: i + 1 });

  for (const t of TRACKS)
    await setDoc(doc(db, "career_tracks", `track_${t.order}`), { title: t.title, order: t.order });

  for (const q of QUIZ_QUESTIONS)
    await setDoc(doc(db, "quiz_questions", q.id), q);

  // Old seed wrote 7 untagged steps (step_01..step_07). The app ignores steps
  // without a `track`, so remove them to keep the collection tidy.
  for (let i = 1; i <= 7; i++)
    await deleteDoc(doc(db, "roadmap_steps", `step_${String(i).padStart(2, "0")}`)).catch(() => {});

  for (const s of ROADMAP_STEPS)
    await setDoc(doc(db, "roadmap_steps", s.id), s);

  for (let i = 0; i < MENTORS.length; i++)
    await setDoc(doc(db, "mentors", MENTORS[i].id), { ...MENTORS[i], order: i + 1 });

  console.log("✅ Seed complete");
}
