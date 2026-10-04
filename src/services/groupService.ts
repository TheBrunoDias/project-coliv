import {
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  updateDoc,
  writeBatch,
  type FirestoreError,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Group, HouseMember } from '@/types';

const groupsRef = (houseId: string) => collection(db, 'houses', houseId, 'groups');
const memberRef = (houseId: string, uid: string) => doc(db, 'houses', houseId, 'members', uid);

export async function createGroup(houseId: string, name: string): Promise<void> {
  const ref = doc(groupsRef(houseId));
  await setDoc(ref, { id: ref.id, name, createdAt: serverTimestamp() });
}

export function renameGroup(houseId: string, groupId: string, name: string): Promise<void> {
  return updateDoc(doc(groupsRef(houseId), groupId), { name });
}

/** Deletes the group and removes it from every member. */
export async function deleteGroup(
  houseId: string,
  groupId: string,
  members: HouseMember[],
): Promise<void> {
  const batch = writeBatch(db);
  members
    .filter((member) => member.groupIds.includes(groupId))
    .forEach((member) =>
      batch.update(memberRef(houseId, member.userId), { groupIds: arrayRemove(groupId) }),
    );
  batch.delete(doc(groupsRef(houseId), groupId));
  await batch.commit();
}

/** Makes `memberIds` the exact set of members in the group. */
export async function setGroupMembers(
  houseId: string,
  groupId: string,
  memberIds: Set<string>,
  members: HouseMember[],
): Promise<void> {
  const batch = writeBatch(db);
  let changes = 0;

  for (const member of members) {
    const isInGroup = member.groupIds.includes(groupId);
    const shouldBeInGroup = memberIds.has(member.userId);
    if (isInGroup === shouldBeInGroup) continue;

    batch.update(memberRef(houseId, member.userId), {
      groupIds: shouldBeInGroup ? arrayUnion(groupId) : arrayRemove(groupId),
    });
    changes++;
  }

  if (changes > 0) await batch.commit();
}

export function subscribeToGroups(
  houseId: string,
  onChange: (groups: Group[]) => void,
  onError: (error: FirestoreError) => void,
): () => void {
  return onSnapshot(
    groupsRef(houseId),
    (snapshot) => {
      const groups = snapshot.docs
        .map((d) => d.data({ serverTimestamps: 'estimate' }) as Group)
        .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR', { numeric: true }));
      onChange(groups);
    },
    onError,
  );
}
