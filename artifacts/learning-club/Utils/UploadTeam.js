// Uploads TeamData.js to Firestore: ONE DOCUMENT PER EXPORT, named like the export.
//   teamData/ProgramCoordinators   { category, count, members: [...] }
//   teamData/Head                  { ... }
//   teamData/Team2026              { ... }
// Every array exported from TeamData.js is picked up automatically (add Team2027 and it just works).
import { collection, doc, getDocs, serverTimestamp, setDoc } from 'firebase/firestore';
// Adjust these two imports to your project
import { firestore as db } from '@/lib/firebase';
import * as TeamData from '../src/components/Team/TeamData';

const COLLECTION = 'Team';

// Trim strings and drop empty keys (Firestore rejects `undefined`)
const clean = (member) =>
  Object.fromEntries(
    Object.entries(member)
      .filter(([, v]) => v !== undefined && v !== null)
      .map(([k, v]) => [k, typeof v === 'string' ? v.trim() : v]),
  );

export function getAllCategories() {
  return Object.fromEntries(
    Object.entries(TeamData)
      .filter(([name, value]) => name !== 'default' && Array.isArray(value))
      .map(([name, list]) => [name, list.map(clean)]),
  );
}

// Firestore does not keep key order, so compare with sorted keys
const stable = (value) =>
  JSON.stringify(value, (_, v) =>
    v && typeof v === 'object' && !Array.isArray(v)
      ? Object.fromEntries(Object.entries(v).sort(([a], [b]) => (a < b ? -1 : 1)))
      : v,
  );

/**
 * Writes each category as one document (replacing the old version of that document).
 * @param {object} currentUser  auth.currentUser
 * @param {(done:number,total:number)=>void} [onProgress]  counts members
 */
export async function uploadAllTeamData(currentUser, onProgress) {
  if (!currentUser) throw new Error('You must be logged in to upload team data.');

  const categories = getAllCategories();
  const total = Object.values(categories).reduce((n, list) => n + list.length, 0);
  const stats = { total, successful: 0, failed: 0, byCategory: {} };
  let done = 0;

  for (const [name, members] of Object.entries(categories)) {
    stats.byCategory[name] = { total: members.length, successful: 0, failed: 0 };
    try {
      await setDoc(doc(db, COLLECTION, name), {
        category: name,
        count: members.length,
        members,
        updatedAt: serverTimestamp(),
      });
      stats.successful += members.length;
      stats.byCategory[name].successful = members.length;
    } catch (error) {
      console.error(`Failed to upload ${name}:`, error);
      if (error.code === 'permission-denied') throw error; // lets the page handle it
      stats.failed += members.length;
      stats.byCategory[name].failed = members.length;
    }
    done += members.length;
    onProgress?.(done, total);
  }

  return stats;
}

/**
 * Compares the documents in Firestore with TeamData.js.
 * @returns {Promise<{inFile:number, inFirestore:number, byCategory:object, issues:string[]}>}
 */
export async function validateTeamData() {
  const local = getAllCategories();
  const snapshot = await getDocs(collection(db, COLLECTION));

  const stored = {};
  snapshot.forEach((d) => { stored[d.id] = d.data(); });

  const issues = [];
  const byCategory = {};
  let inFile = 0;
  let inFirestore = 0;

  for (const [name, members] of Object.entries(local)) {
    inFile += members.length;
    const remote = stored[name];
    const remoteMembers = Array.isArray(remote?.members) ? remote.members : [];
    inFirestore += remoteMembers.length;
    byCategory[name] = { inFile: members.length, inFirestore: remoteMembers.length };

    if (!remote) issues.push(`${name}: document not uploaded yet`);
    else if (remoteMembers.length !== members.length) {
      issues.push(`${name}: ${remoteMembers.length} in Firestore, ${members.length} in TeamData.js`);
    } else if (stable(remoteMembers) !== stable(members)) {
      issues.push(`${name}: content differs from TeamData.js, upload again`);
    }
    members.forEach((m, i) => {
      if (!m.name) issues.push(`${name} #${i + 1}: missing "name"`);
    });
  }

  Object.keys(stored).forEach((name) => {
    if (!local[name]) issues.push(`${name}: in Firestore but not in TeamData.js`);
  });

  return { inFile, inFirestore, byCategory, issues };
}