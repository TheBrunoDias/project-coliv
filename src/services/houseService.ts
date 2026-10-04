import {
  collection,
  doc,
  FirestoreError,
  getDoc,
  getDocFromServer,
  getDocs,
  onSnapshot,
  serverTimestamp,
  updateDoc,
  waitForPendingWrites,
  writeBatch,
  type DocumentReference,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Currency, House, HouseMember, Invite, User } from '@/types';
import { generateInviteCode, isValidInviteCode } from '@/utils/inviteCode';
import { removeFromRotations } from './taskService';

// Firestore allows up to 500 writes per batch
const BATCH_SIZE = 400;

// Subcollections removed when the admin deletes the house (members are handled separately)
// ('shopping_items' is legacy data from before purchases)
const HOUSE_SUBCOLLECTIONS = ['tasks', 'purchases', 'shopping_items', 'notice_board', 'groups'];

const houseRef = (houseId: string) => doc(db, 'houses', houseId);
const memberRef = (houseId: string, uid: string) => doc(db, 'houses', houseId, 'members', uid);
const inviteRef = (code: string) => doc(db, 'invites', code);
const userRef = (uid: string) => doc(db, 'users', uid);

function memberData(profile: User) {
  return {
    userId: profile.uid,
    displayName: profile.displayName,
    ...(profile.photoURL ? { photoURL: profile.photoURL } : {}),
    groupIds: [],
    joinedAt: serverTimestamp(),
  };
}

// ---------- Create / join ----------

export async function createHouse(
  name: string,
  currency: Currency,
  profile: User,
): Promise<string> {
  const ref = doc(collection(db, 'houses'));
  const inviteCode = generateInviteCode();
  const batch = writeBatch(db);

  batch.set(ref, {
    id: ref.id,
    name,
    ownerId: profile.uid,
    inviteCode,
    currency,
    createdAt: serverTimestamp(),
  });
  batch.set(inviteRef(inviteCode), { houseId: ref.id, houseName: name, createdAt: serverTimestamp() });
  batch.set(memberRef(ref.id, profile.uid), memberData(profile));
  batch.update(userRef(profile.uid), { houseId: ref.id });

  await batch.commit();
  return ref.id;
}

export async function getInvite(code: string): Promise<Invite | null> {
  if (!isValidInviteCode(code)) return null;
  const snapshot = await getDoc(inviteRef(code));
  return snapshot.exists() ? (snapshot.data() as Invite) : null;
}

export async function joinHouse(inviteCode: string, houseId: string, profile: User): Promise<void> {
  const batch = writeBatch(db);
  batch.set(memberRef(houseId, profile.uid), { ...memberData(profile), inviteCode });
  batch.update(userRef(profile.uid), { houseId });
  await batch.commit();
}

// ---------- Settings (admin) ----------

export async function renameHouse(house: House, name: string): Promise<void> {
  const batch = writeBatch(db);
  batch.update(houseRef(house.id), { name });
  batch.update(inviteRef(house.inviteCode), { houseName: name });
  await batch.commit();
}

export function updateHouseCurrency(houseId: string, currency: Currency): Promise<void> {
  return updateDoc(houseRef(houseId), { currency });
}

/** Creates a new invite link and invalidates the previous one. */
export async function regenerateInviteCode(house: House): Promise<void> {
  const inviteCode = generateInviteCode();
  const batch = writeBatch(db);
  batch.set(inviteRef(inviteCode), {
    houseId: house.id,
    houseName: house.name,
    createdAt: serverTimestamp(),
  });
  batch.delete(inviteRef(house.inviteCode));
  batch.update(houseRef(house.id), { inviteCode });
  await batch.commit();
}

// ---------- Leaving ----------

export async function leaveHouse(houseId: string, uid: string): Promise<void> {
  const batch = writeBatch(db);
  await removeFromRotations(batch, houseId, uid, 'user');
  batch.delete(memberRef(houseId, uid));
  batch.update(userRef(uid), { houseId: null });
  await batch.commit();
}

/** The removed user's own `houseId` is cleared lazily on their device. */
export async function removeMember(houseId: string, memberId: string): Promise<void> {
  const batch = writeBatch(db);
  await removeFromRotations(batch, houseId, memberId, 'user');
  batch.delete(memberRef(houseId, memberId));
  await batch.commit();
}

async function deleteDocs(refs: DocumentReference[]): Promise<void> {
  for (let i = 0; i < refs.length; i += BATCH_SIZE) {
    const batch = writeBatch(db);
    refs.slice(i, i + BATCH_SIZE).forEach((ref) => batch.delete(ref));
    await batch.commit();
  }
}

/**
 * Deletes the house and everything in it. Other residents' `houseId` is cleared lazily
 * on their devices. Safe to retry if it fails halfway.
 */
export async function deleteHouse(house: House, uid: string): Promise<void> {
  const ref = houseRef(house.id);

  for (const name of HOUSE_SUBCOLLECTIONS) {
    const snapshot = await getDocs(collection(ref, name));
    await deleteDocs(snapshot.docs.map((d) => d.ref));
  }

  const members = await getDocs(collection(ref, 'members'));
  await deleteDocs(members.docs.filter((d) => d.id !== uid).map((d) => d.ref));

  // The admin's own member document can only go together with the house itself
  const batch = writeBatch(db);
  batch.delete(inviteRef(house.inviteCode));
  batch.delete(memberRef(house.id, uid));
  batch.delete(ref);
  batch.update(userRef(uid), { houseId: null });
  await batch.commit();
}

/**
 * Asks the server (after our own pending writes land) whether the user is still a member.
 * Used before kicking the user out, since listeners can race a just-committed join.
 */
export async function isConfirmedMember(houseId: string, uid: string): Promise<boolean> {
  await waitForPendingWrites(db);
  try {
    const snapshot = await getDocFromServer(memberRef(houseId, uid));
    return snapshot.exists();
  } catch (error) {
    if (error instanceof FirestoreError && error.code === 'permission-denied') return false;
    throw error;
  }
}

// ---------- Listeners ----------

export function subscribeToHouse(
  houseId: string,
  onChange: (house: House | null, fromCache: boolean) => void,
  onError: (error: FirestoreError) => void,
): () => void {
  return onSnapshot(
    houseRef(houseId),
    (snapshot) =>
      onChange(
        snapshot.exists() ? (snapshot.data({ serverTimestamps: 'estimate' }) as House) : null,
        snapshot.metadata.fromCache,
      ),
    onError,
  );
}

export function subscribeToMembers(
  houseId: string,
  onChange: (members: HouseMember[], fromCache: boolean) => void,
  onError: (error: FirestoreError) => void,
): () => void {
  return onSnapshot(
    collection(db, 'houses', houseId, 'members'),
    (snapshot) => {
      const members = snapshot.docs
        .map((d) => d.data({ serverTimestamps: 'estimate' }) as HouseMember)
        .sort((a, b) => a.joinedAt.toMillis() - b.joinedAt.toMillis());
      onChange(members, snapshot.metadata.fromCache);
    },
    onError,
  );
}
