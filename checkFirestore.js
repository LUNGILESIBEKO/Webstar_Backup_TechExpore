// checkFirestore.js - proves the database connection really works.
// Writes one doc to `_connection_test`, reads it back, deletes it.
import { doc, setDoc, getDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./Firebase";

export async function checkFirestoreConnection() {
  const ref = doc(db, "_connection_test", "ping");
  try {
    await setDoc(ref, { ok: true, at: serverTimestamp() });
    const snap = await getDoc(ref);
    await deleteDoc(ref);
    if (snap.exists()) {
      console.log("✅ Firestore is CONNECTED (write + read worked).");
      return { ok: true };
    }
    console.warn("⚠️ Write worked but read returned nothing.");
    return { ok: false, error: "read returned nothing" };
  } catch (err) {
    console.error("❌ Firestore connection FAILED:", err.code, err.message);
    return { ok: false, error: `${err.code}: ${err.message}` };
  }
}
