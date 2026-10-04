import {
  collection,
  deleteDoc,
  deleteField,
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  type FirestoreError,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Purchase } from '@/types';
import { startOfDay } from '@/utils/rotation';

const purchasesRef = (houseId: string) => collection(db, 'houses', houseId, 'purchases');

export interface PurchaseInput {
  description: string;
  items: string[];
  amountCents: number;
  date: Date;
}

function toFirestore(input: PurchaseInput) {
  return {
    items: input.items,
    amountCents: input.amountCents,
    date: Timestamp.fromDate(startOfDay(input.date)),
  };
}

/** `splitCount` is the number of residents right now; it never changes afterwards. */
export async function addPurchase(
  houseId: string,
  uid: string,
  splitCount: number,
  input: PurchaseInput,
): Promise<void> {
  const ref = doc(purchasesRef(houseId));
  await setDoc(ref, {
    id: ref.id,
    ...toFirestore(input),
    ...(input.description ? { description: input.description } : {}),
    paidBy: uid,
    splitCount,
    createdAt: serverTimestamp(),
  });
}

export function updatePurchase(
  houseId: string,
  purchaseId: string,
  input: PurchaseInput,
): Promise<void> {
  return updateDoc(doc(purchasesRef(houseId), purchaseId), {
    ...toFirestore(input),
    description: input.description || deleteField(),
    updatedAt: serverTimestamp(),
  });
}

export function deletePurchase(houseId: string, purchaseId: string): Promise<void> {
  return deleteDoc(doc(purchasesRef(houseId), purchaseId));
}

export function subscribeToPurchases(
  houseId: string,
  onChange: (purchases: Purchase[]) => void,
  onError: (error: FirestoreError) => void,
): () => void {
  return onSnapshot(
    purchasesRef(houseId),
    (snapshot) => {
      const purchases = snapshot.docs
        .map((d) => d.data({ serverTimestamps: 'estimate' }) as Purchase)
        // Newest purchase day first, then most recently registered
        .sort(
          (a, b) =>
            b.date.toMillis() - a.date.toMillis() || b.createdAt.toMillis() - a.createdAt.toMillis(),
        );
      onChange(purchases);
    },
    onError,
  );
}
