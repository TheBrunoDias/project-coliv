import type { User as FirebaseUser } from 'firebase/auth';
import {
  deleteDoc,
  doc,
  onSnapshot,
  runTransaction,
  serverTimestamp,
  updateDoc,
  type FirestoreError,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { User } from '@/types';

const userRef = (uid: string) => doc(db, 'users', uid);

/** Creates the user's profile document on first sign-in. No-op if it already exists. */
export async function ensureUserProfile(firebaseUser: FirebaseUser): Promise<void> {
  const ref = userRef(firebaseUser.uid);

  await runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(ref);
    if (snapshot.exists()) return;

    transaction.set(ref, {
      uid: firebaseUser.uid,
      displayName:
        firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Morador',
      email: firebaseUser.email ?? '',
      // Firestore rejects undefined values, so omit the field instead
      ...(firebaseUser.photoURL ? { photoURL: firebaseUser.photoURL } : {}),
      houseId: null,
      createdAt: serverTimestamp(),
    });
  });
}

export function subscribeToUserProfile(
  uid: string,
  onChange: (profile: User | null) => void,
  onError: (error: FirestoreError) => void,
): () => void {
  return onSnapshot(
    userRef(uid),
    (snapshot) => onChange(snapshot.exists() ? (snapshot.data() as User) : null),
    onError,
  );
}

export function updateUserDisplayName(uid: string, displayName: string): Promise<void> {
  return updateDoc(userRef(uid), { displayName });
}

/** Security rules only allow this once the user has no house. */
export function deleteUserProfile(uid: string): Promise<void> {
  return deleteDoc(userRef(uid));
}

/** Lazy cleanup when the user's house was deleted or they were removed from it. */
export function clearUserHouse(uid: string): Promise<void> {
  return updateDoc(userRef(uid), { houseId: null });
}
