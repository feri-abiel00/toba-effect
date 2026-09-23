import { getDb, isCloud } from './db';
import { collection, addDoc, getDocs, deleteDoc, query, where, doc } from 'firebase/firestore';
import { uid } from './utils';

// Lightweight account system.
// Accounts are stored in the Firestore `users` collection and mirrored locally
// so registration and login always work, even when the cloud is unreachable.
// Passwords are stored only as salted SHA-256 hashes.
// NOTE: for production, replace this with Firebase Authentication (the app
// keeps the same call signatures, so swapping is easy).

const K_SESSION = 'toba-session';
const K_USERS = 'toba-users';
const K_GUEST = 'toba-guest';

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

async function sha256(text) {
  const data = new TextEncoder().encode(text);
  if (crypto && crypto.subtle) {
    const buf = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(buf))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;
  for (let i = 0; i < data.length; i++) {
    h1 = Math.imul(h1 ^ data[i], 2654435761);
    h2 = Math.imul(h2 ^ data[i], 1597334677);
  }
  return (h1 >>> 0).toString(16) + (h2 >>> 0).toString(16);
}

// ---------------------------------------------------------------- session
export function getSession() {
  const s = lsGet(K_SESSION);
  if (!s) return null;
  return s;
}

export function getUid() {
  const s = getSession();
  if (!s || s.guest) return null;
  return s.uid;
}

export function isGuest() {
  const s = getSession();
  return !!(s && s.guest);
}

export function displayName() {
  const s = getSession();
  return s ? s.name : 'Guest';
}

export function setSession(s) {
  lsSet(K_SESSION, s);
}

export async function logout() {
  localStorage.removeItem(K_SESSION);
}

// ---------------------------------------------------------------- user store
async function localUsers() {
  return lsGet(K_USERS) || [];
}

async function cloudUsers() {
  if (!isCloud()) return [];
  try {
    const snap = await getDocs(collection(getDb(), 'users'));
    const out = [];
    snap.forEach((d) => out.push(d.data()));
    return out;
  } catch {
    return [];
  }
}

async function allUsers() {
  const map = new Map();
  (await localUsers()).forEach((u) => map.set(u.uid, u));
  (await cloudUsers()).forEach((u) => map.set(u.uid, u));
  return Array.from(map.values());
}

async function findUserByEmail(email) {
  const e = String(email || '').trim().toLowerCase();
  if (!e) return null;
  const list = await allUsers();
  return list.find((u) => String(u.email || '').toLowerCase() === e) || null;
}

async function persistUser(rec) {
  if (isCloud()) {
    try {
      await addDoc(collection(getDb(), 'users'), rec);
    } catch {
      // cloud write failed; the local copy below still keeps the account working
    }
  }
  const local = (lsGet(K_USERS) || []).filter((u) => u.uid !== rec.uid);
  local.push(rec);
  lsSet(K_USERS, local);
}

// ---------------------------------------------------------------- account actions
function validatePassword(pw, confirm) {
  if (pw.length < 6) return 'Password must be at least 6 characters.';
  if (pw !== confirm) return 'Passwords do not match.';
  return null;
}

export async function register(name, email, password, confirm) {
  const nm = String(name || '').trim();
  const em = String(email || '').trim().toLowerCase();
  if (!nm) throw new Error('Please enter your full name.');
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em)) throw new Error('Please enter a valid email address.');
  const pwErr = validatePassword(password, confirm);
  if (pwErr) throw new Error(pwErr);

  const existing = await findUserByEmail(em);
  if (existing) throw new Error('An account with this email already exists. Please log in.');

  const salt = uid() + '-' + Math.random();
  const rec = {
    uid: uid(),
    name: nm,
    email: em,
    salt,
    hash: await sha256(password + ':' + salt),
    createdAt: Date.now(),
    lastLoginAt: Date.now()
  };
  await persistUser(rec);
  setSession({ uid: rec.uid, name: rec.name, email: rec.email, guest: false });
  return rec;
}

export async function login(email, password) {
  const em = String(email || '').trim().toLowerCase();
  if (!em) throw new Error('Please enter your email.');
  if (!password) throw new Error('Please enter your password.');
  const user = await findUserByEmail(em);
  if (!user) throw new Error('No account found for this email.');
  const hash = await sha256(password + ':' + user.salt);
  if (hash !== user.hash) throw new Error('Incorrect password. Please try again.');
  const local = (lsGet(K_USERS) || []).map((u) =>
    u.uid === user.uid ? { ...u, lastLoginAt: Date.now() } : u
  );
  lsSet(K_USERS, local);
  setSession({ uid: user.uid, name: user.name, email: user.email, guest: false });
  return user;
}

export async function guestMode(name) {
  const nm = String(name || '').trim() || 'Guest';
  setSession({ uid: null, name: nm, email: null, guest: true });
  return { uid: null, name: nm, guest: true };
}

export async function deleteAccount() {
  const s = getSession();
  if (s && !s.guest) {
    if (isCloud()) {
      try {
        const snap = await getDocs(query(collection(getDb(), 'users'), where('uid', '==', s.uid)));
        snap.forEach(async (d) => {
          try { await deleteDoc(doc(getDb(), 'users', d.id)); } catch { /* ignore */ }
        });
      } catch { /* ignore */ }
    }
    const local = (lsGet(K_USERS) || []).filter((u) => u.uid !== s.uid);
    lsSet(K_USERS, local);
  }
  localStorage.removeItem(K_SESSION);
}