// firestoreHooks.js  (put this in the project ROOT, next to firebase.js)
//
// One shared hook used by every screen that reads shared reference content
// (skills, certs, jobs, roadmap steps, quiz questions, job prep tips,
// institutions). Each screen keeps its existing hardcoded array as a
// fallback - this hook only *replaces* it once Firestore actually returns
// data, and quietly keeps the fallback if Firestore is empty, offline, or
// blocked by the security rules.

import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "./Firebase";

export function useFirestoreList(collectionName, fallback, sortFn) {
  const [items, setItems] = useState(fallback);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const snap = await getDocs(collection(db, collectionName));
        const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        if (!cancelled && docs.length > 0) {
          setItems(sortFn ? [...docs].sort(sortFn) : docs);
        }
      } catch (err) {
        console.warn(
          `Could not load "${collectionName}" from Firestore, using built-in data:`,
          err.message
        );
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collectionName]);

  return items;
}

export const byOrder = (a, b) => (a.order ?? 999) - (b.order ?? 999);