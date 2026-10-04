import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  updateDoc,
  type FirestoreError,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Notice } from '@/types';

const noticesRef = (houseId: string) => collection(db, 'houses', houseId, 'notice_board');

export interface NoticeInput {
  title: string;
  content: string;
  isRule: boolean;
}

export async function createNotice(houseId: string, uid: string, input: NoticeInput): Promise<void> {
  const ref = doc(noticesRef(houseId));
  await setDoc(ref, { id: ref.id, ...input, createdBy: uid, createdAt: serverTimestamp() });
}

export function updateNotice(houseId: string, noticeId: string, input: NoticeInput): Promise<void> {
  return updateDoc(doc(noticesRef(houseId), noticeId), { ...input, updatedAt: serverTimestamp() });
}

export function deleteNotice(houseId: string, noticeId: string): Promise<void> {
  return deleteDoc(doc(noticesRef(houseId), noticeId));
}

export function subscribeToNotices(
  houseId: string,
  onChange: (notices: Notice[]) => void,
  onError: (error: FirestoreError) => void,
): () => void {
  return onSnapshot(
    noticesRef(houseId),
    (snapshot) => {
      const notices = snapshot.docs
        .map((d) => d.data({ serverTimestamps: 'estimate' }) as Notice)
        // Newest first; rules are re-sorted by the UI
        .sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());
      onChange(notices);
    },
    onError,
  );
}
