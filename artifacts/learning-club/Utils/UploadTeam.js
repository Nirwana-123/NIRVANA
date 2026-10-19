// Utilities to upload TeamData.js to Firestore and to check what is stored there.
import {
  collection,
  doc,
  getDocs,
  writeBatch,
} from 'firebase/firestore';
// Adjust these two imports to your project:
//  - `firestore` must be exported from your firebase file (next to `auth`)
//  - the TeamData path must point to your TeamData.js
import { firestore as db } from '@/lib/firebase';
// import * as TeamData from '@/components/Pages/Team/TeamData';

const COLLECTION = 'volunteers';
const BATCH_SIZE = 400; // Firestore allows 500 writes per batch

// Core groups + every export that starts with "Team" (Team2019, Team2020, ...)
export function getAllCategories() {
  const core = {
    Sir: TeamData.Sir,
    ProgramCoordinators: TeamData.ProgramCoordinators,
    Founder: TeamData.Founder,
    CoFounder: TeamData.CoFounder,
  };
  const years = Object.fromEntries(
    Object.entries(TeamData).filter(([key, value]) => key.startsWith('Team') && Array.isArray(value)),
  );
  const all = { ...core, ...years };
  // drop anything that is missing or not a list
  return Object.fromEntries(Object.entries(all).filter(([, v]) => Array.isArray(v)));
}

// Stable id => running the upload twice updates documents instead of duplicating them
const docId = (category, index) => `${category}_${String(index + 1).padStart(3, '0')}`;

/**
 * Uploads every team member to the "volunteers" collection.
 * @param {object} currentUser  the signed-in Firebase user (auth.currentUser)
 * @param {(done:number,total:number)=>void} [onProgress]
 * @returns {Promise<{total:number, successful:number, failed:number, byCategory:object}>}
 */
export async function uploadAllTeamData(currentUser, onProgress) {
  if (!currentUser) throw new Error('You must be logged in to upload team data.');

  const categories = getAllCategories();
  const total = Object.values(categories).reduce((n, list) => n + list.length, 0);
  const stats = { total, successful: 0, failed: 0, byCategory: {} };

  // Flat list of writes
  const writes = [];
  for (const [category, members] of Object.entries(categories)) {
    stats.byCategory[category] = { total: members.length, successful: 0, failed: 0 };
    members.forEach((member, i) => {
      writes.push({
        category,
        ref: doc(db, COLLECTION, docId(category, i)),
        data: { ...member, category, approved: true }, // static data is pre-approved
      });
    });
  }

  // Commit in chunks; if a chunk fails, only that chunk is marked failed
  let done = 0;
  for (let start = 0; start < writes.length; start += BATCH_SIZE) {
    const chunk = writes.slice(start, start + BATCH_SIZE);
    const batch = writeBatch(db);
    chunk.forEach(({ ref, data }) => batch.set(ref, data));
    try {
      await batch.commit();
      chunk.forEach(({ category }) => {
        stats.successful++;
        stats.byCategory[category].successful++;
      });
    } catch (error) {
      console.error('Team data chunk failed:', error);
      chunk.forEach(({ category }) => {
        stats.failed++;
        stats.byCategory[category].failed++;
      });
    }
    done += chunk.length;
    onProgress?.(done, writes.length);
  }

  return stats;
}

/**
 * Compares what is in Firestore with TeamData.js.
 * @returns {Promise<{inFile:number, inFirestore:number, byCategory:object, issues:string[]}>}
 */
export async function validateTeamData() {
  const categories = getAllCategories();
  const snapshot = await getDocs(collection(db, COLLECTION));

  const stored = {};   // category -> count in Firestore
  const issues = [];
  let inFirestore = 0;

  snapshot.forEach((d) => {
    const data = d.data();
    inFirestore++;
    stored[data.category] = (stored[data.category] ?? 0) + 1;
    if (!data.name) issues.push(`${d.id}: missing "name"`);
    if (!data.category) issues.push(`${d.id}: missing "category"`);
  });

  const byCategory = {};
  let inFile = 0;
  for (const [category, members] of Object.entries(categories)) {
    inFile += members.length;
    const inDb = stored[category] ?? 0;
    byCategory[category] = { inFile: members.length, inFirestore: inDb };
    if (inDb === 0) issues.push(`${category}: not uploaded yet`);
    else if (inDb < members.length) issues.push(`${category}: ${members.length - inDb} missing`);
    else if (inDb > members.length) issues.push(`${category}: ${inDb - members.length} extra (possible duplicates)`);
  }
  // categories in Firestore that no longer exist in TeamData.js
  Object.keys(stored).forEach((c) => {
    if (!categories[c]) issues.push(`${c}: in Firestore but not in TeamData.js`);
  });

  return { inFile, inFirestore, byCategory, issues };
}