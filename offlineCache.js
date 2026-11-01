// offlineCache.js - keeps a copy of what the app loaded on the phone, so it still works offline,
// and holds changes made while offline until they can be sent to Firestore.
import AsyncStorage from "@react-native-async-storage/async-storage";
import { doc, setDoc, Timestamp } from "firebase/firestore";
import { db } from "./Firebase";

const PREFIX = "cache:";

// JSON turns a Firestore Timestamp into a plain { seconds, nanoseconds } object: turn it back.
function revive(value) {
  if (Array.isArray(value)) return value.map(revive);
  if (value && typeof value === "object") {
    if (typeof value.seconds === "number" && typeof value.nanoseconds === "number") {
      return new Timestamp(value.seconds, value.nanoseconds);
    }
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, revive(v)]));
  }
  return value;
}

export async function cacheGet(key) {
  try {
    const text = await AsyncStorage.getItem(PREFIX + key);
    return text ? revive(JSON.parse(text)) : null;
  } catch (e) {
    return null;
  }
}

export async function cacheSet(key, value) {
  try {
    await AsyncStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch (e) {}
}

// Gives up after `ms` milliseconds, so an offline phone does not wait forever.
export function withTimeout(promise, ms = 6000) {
  let timer;
  const limit = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error("timeout")), ms);
  });
  return Promise.race([promise, limit]).finally(() => clearTimeout(timer));
}

let flushing = false;

// Sends changes that were saved while offline. Safe to call any time; does nothing if there are none.
export async function flushPending(uid) {
  if (flushing) return false;
  const pending = await cacheGet(`pending:${uid}`);
  if (!pending || Object.keys(pending).length === 0) return true;
  flushing = true;
  try {
    await withTimeout(setDoc(doc(db, "users", uid), pending, { merge: true }), 8000);
    // Forget only what was sent (a newer change made meanwhile stays queued)
    const latest = (await cacheGet(`pending:${uid}`)) || {};
    for (const key of Object.keys(pending)) {
      if (JSON.stringify(latest[key]) === JSON.stringify(pending[key])) delete latest[key];
    }
    await cacheSet(`pending:${uid}`, latest);
    return true;
  } catch (e) {
    return false; // still offline: it stays queued and is tried again next time
  } finally {
    flushing = false;
  }
}

// Save a change to the student's profile: on the phone first (so it shows at once, even offline),
// then to Firestore now or as soon as the phone is back online.
export async function saveUserPatch(uid, patch) {
  const profile = (await cacheGet(`profile:${uid}`)) || {};
  await cacheSet(`profile:${uid}`, { ...profile, ...patch });
  const pending = (await cacheGet(`pending:${uid}`)) || {};
  await cacheSet(`pending:${uid}`, { ...pending, ...patch });
  flushPending(uid); // not awaited, so the screen never waits on the network
}