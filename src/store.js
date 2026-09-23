import { getDb, isCloud } from './db';
import { getUid } from './accounts';
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { uid, routeSample } from './utils';

const K_PREFIX = 'toba';

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

function uidKey() {
  return getUid() || 'guest';
}

export function getSyncStatus() {
  return isCloud() ? 'cloud' : 'local';
}

// ---------------------------------------------------------------- weight
export function getWeight() {
  const w = Number(localStorage.getItem('toba-weight'));
  return isFinite(w) && w > 20 && w < 300 ? w : 70;
}
export function setWeight(w) {
  localStorage.setItem('toba-weight', String(w));
}

// ---------------------------------------------------------------- workouts
export function makeWorkout(activity, distance, durationSec, calories, mode, points) {
  return {
    id: uid(),
    uid: getUid() || null,
    activity,
    distance,
    durationSec,
    speed: durationSec > 0 ? distance / (durationSec / 3600) : 0,
    pace: distance > 0 ? durationSec / 60 / distance : 0,
    calories,
    ts: Date.now(),
    mode: mode || 'gps',
    points: routeSample(points || [], 180)
  };
}

export async function saveWorkout(rec) {
  const key = `${K_PREFIX}-workouts-${uidKey()}`;
  const local = lsGet(key) || [];
  local.push(rec);
  lsSet(key, local);
  if (isCloud() && rec.uid) {
    try {
      await addDoc(collection(getDb(), 'workouts'), rec);
    } catch {
      /* cloud write failed, local copy kept */
    }
  }
  return rec;
}

export async function listWorkouts() {
  const u = getUid();
  const key = `${K_PREFIX}-workouts-${uidKey()}`;
  const map = new Map();
  (lsGet(key) || []).forEach((r) => map.set(r.id, r));

  if (isCloud() && u) {
    try {
      const q = query(collection(getDb(), 'workouts'), orderBy('ts', 'desc'));
      const snap = await getDocs(q);
      snap.forEach((d) => {
        const data = d.data();
        if (data.uid !== u) return;
        const r = { id: d.id, ...data };
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
  const key = `${K_PREFIX}-workouts-${uidKey()}`;
  const local = (lsGet(key) || []).filter((r) => r.id !== id);
  lsSet(key, local);
  if (isCloud() && getUid()) {
    try {
      await deleteDoc(doc(getDb(), 'workouts', id));
    } catch {
      /* ignore */
    }
  }
}

// ---------------------------------------------------------------- challenge completions
export async function getCompletions(category) {
  const u = getUid();
  const key = `${K_PREFIX}-completions-${uidKey()}-${category}`;
  const set = new Set(lsGet(key) || []);
  if (isCloud() && u) {
    try {
      const snap = await getDocs(collection(getDb(), 'completions'));
      snap.forEach((d) => {
        const data = d.data();
        if (data.uid === u && data.category === category) set.add(String(data.challengeId));
      });
    } catch {
      /* ignore */
    }
  }
  return set;
}

export async function setCompletion(category, challengeId, completed) {
  const u = getUid();
  const key = `${K_PREFIX}-completions-${uidKey()}-${category}`;
  const set = new Set(lsGet(key) || []);
  if (completed) set.add(String(challengeId));
  else set.delete(String(challengeId));
  lsSet(key, Array.from(set));

  if (isCloud() && u) {
    try {
      const snap = await getDocs(collection(getDb(), 'completions'));
      const matches = [];
      snap.forEach((d) => {
        const data = d.data();
        if (data.uid === u && data.category === category && String(data.challengeId) === String(challengeId)) {
          matches.push(d.id);
        }
      });
      for (const id of matches) await deleteDoc(doc(getDb(), 'completions', id));
      if (completed) {
        await addDoc(collection(getDb(), 'completions'), {
          uid: u,
          category,
          challengeId,
          completedAt: Date.now()
        });
      }
    } catch {
      /* ignore */
    }
  }
}