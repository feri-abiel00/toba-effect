import { app } from './firebase';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

let db = null;
let cloud = false;

export async function probeCloud() {
  try {
    db = getFirestore(app, 'default');
    await getDocs(collection(db, '_probe'));
    cloud = true;
  } catch {
    cloud = false;
  }
  return cloud;
}

export function getDb() {
  return db;
}

export function isCloud() {
  return cloud;
}

export function syncStatus() {
  return cloud ? 'cloud' : 'local';
}