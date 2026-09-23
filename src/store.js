import { app } from './firebase';
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { uid } from './utils';

let db = null;
let cloud = false;

async function probeCloud() {
  try {
    db = getFirestore(app);
    await getDocs(collection(db, '_probe'));
    cloud = true;
  } catch {
    cloud = false;
  }
  return cloud;
}

export function getSyncStatus() {
  return cloud ? 'cloud' : 'local';
}

// ---------------------------------------------------------------- local helpers
function lsGet(key) {
  try {
    return JSON.parse(localStorage.getItem(key)) || null;
  } catch {
    return null;
  }
}
function lsSet(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

const K_WORKOUTS = 'toba-workouts';
const K_COMPLETIONS = 'toba-completions';

// ---------------------------------------------------------------- weight
export function getWeight() {
  const w = Number(localStorage.getItem('toba-weight'));
  return isFinite(w) && w > 20 && w < 300 ? w : 70;
}
export function setWeight(w) {
  localStorage.setItem('toba-weight', String(w));
}

// ---------------------------------------------------------------- workouts
export async function saveWorkout(rec) {
  const local = lsGet(K_WORKOUTS) || [];
  local.push(rec);
  lsSet(K_WORKOUTS, local);
  if (cloud) {
    try {
      await addDoc(collection(db, 'workouts'), rec);
    } catch {
      /* cloud write failed, local copy is kept */
    }
  }
  return rec;
}

export async function listWorkouts() {
  const map = new Map();
  const local = lsGet(K_WORKOUTS) || [];
  local.forEach((r) => map.set(r.id, r));
  if (cloud) {
    try {
      const q = query(collection(db, 'workouts'), orderBy('ts', 'desc'));
      const snap = await getDocs(q);
      snap.forEach((d) => {
        const r = { id: d.id, ...d.data() };
        if (!r.id) r.id = uid();
        map.set(r.id, r);
      });
    } catch {
      /* ignore, use local */
    }
  }
  return Array.from(map.values()).sort((a, b) => (b.ts || 0) - (a.ts || 0));
}

export async function removeWorkout(id) {
  const local = (lsGet(K_WORKOUTS) || []).filter((r) => r.id !== id);
  lsSet(K_WORKOUTS, local);
  if (cloud) {
    try {
      await deleteDoc(doc(db, 'workouts', id));
    } catch {
      /* ignore */
    }
  }
}

// ---------------------------------------------------------------- challenge completions
export async function getCompletions(category) {
  const key = `${K_COMPLETIONS}-${category}`;
  const set = new Set(lsGet(key) || []);
  if (cloud) {
    try {
      const snap = await getDocs(collection(db, 'completions'));
      snap.forEach((d) => {
        const data = d.data();
        if (data.category === category) set.add(String(data.challengeId));
      });
    } catch {
      /* ignore */
    }
  }
  return set;
}

export async function setCompletion(category, challengeId, completed) {
  const key = `${K_COMPLETIONS}-${category}`;
  const set = new Set(lsGet(key) || []);
  if (completed) set.add(String(challengeId));
  else set.delete(String(challengeId));
  lsSet(key, Array.from(set));
  if (cloud) {
    try {
      const snap = await getDocs(collection(db, 'completions'));
      const matching = [];
      snap.forEach((d) => {
        const data = d.data();
        if (data.category === category && String(data.challengeId) === String(challengeId)) {
          matching.push(d.id);
        }
      });
      for (const id of matching) await deleteDoc(doc(db, 'completions', id));
      if (completed) {
        await addDoc(collection(db, 'completions'), { category, challengeId, completedAt: Date.now() });
      }
    } catch {
      /* ignore */
    }
  }
}

// ---------------------------------------------------------------- bootstrap
export async function initStore() {
  await probeCloud();
  return cloud;
}

export function makeWorkout(activity, distance, durationSec, calories, mode) {
  return {
    id: uid(),
    activity,
    distance,
    durationSec,
    speed: durationSec > 0 ? (distance / (durationSec / 3600)) : 0,
    pace: distance > 0 ? durationSec / 60 / distance : 0,
    calories,
    ts: Date.now(),
    mode: mode || 'gps'
  };
}