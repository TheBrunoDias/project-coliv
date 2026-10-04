import {
  collection,
  deleteDoc,
  deleteField,
  doc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
  type FirestoreError,
  type WriteBatch,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Frequency, Task } from '@/types';
import { reanchor, startOfDay, type Rotation } from '@/utils/rotation';

const tasksRef = (houseId: string) => collection(db, 'houses', houseId, 'tasks');

/** What the task form edits. The first person in `rotation` is responsible from `startDate`. */
export interface TaskInput {
  title: string;
  description: string;
  assigneeType: Task['assigneeType'];
  rotation: string[];
  frequency: Exclude<Frequency, 'biweekly'>;
  interval: number;
  startDate: Date;
}

function toFirestore(input: TaskInput) {
  return {
    title: input.title,
    assigneeType: input.assigneeType,
    rotation: input.rotation,
    frequency: input.frequency,
    interval: input.interval,
    anchorDate: Timestamp.fromDate(startOfDay(input.startDate)),
    anchorIndex: 0,
    updatedAt: serverTimestamp(),
  };
}

export function toRotation(task: Task): Rotation {
  const interval = task.interval ?? 1;
  return {
    rotation: task.rotation,
    // Legacy 'biweekly' tasks are weekly turns of 2 weeks
    ...(task.frequency === 'biweekly'
      ? { frequency: 'weekly', interval: interval * 2 }
      : { frequency: task.frequency, interval }),
    anchorDate: task.anchorDate.toDate(),
    anchorIndex: task.anchorIndex,
  };
}

export async function createTask(houseId: string, uid: string, input: TaskInput): Promise<void> {
  const ref = doc(tasksRef(houseId));
  await setDoc(ref, {
    id: ref.id,
    ...toFirestore(input),
    ...(input.description ? { description: input.description } : {}),
    createdBy: uid,
    createdAt: serverTimestamp(),
  });
}

export function updateTask(houseId: string, taskId: string, input: TaskInput): Promise<void> {
  return updateDoc(doc(tasksRef(houseId), taskId), {
    ...toFirestore(input),
    description: input.description || deleteField(),
  });
}

export function deleteTask(houseId: string, taskId: string): Promise<void> {
  return deleteDoc(doc(tasksRef(houseId), taskId));
}

/**
 * Adds to `batch` the updates that take `assigneeId` (a user or group) out of every rotation,
 * keeping whoever currently has the turn (or handing it to the next in line).
 */
export async function removeFromRotations(
  batch: WriteBatch,
  houseId: string,
  assigneeId: string,
  assigneeType: Task['assigneeType'],
): Promise<void> {
  const snapshot = await getDocs(
    query(tasksRef(houseId), where('rotation', 'array-contains', assigneeId)),
  );
  const now = new Date();

  for (const taskDoc of snapshot.docs) {
    const task = taskDoc.data() as Task;
    if (task.assigneeType !== assigneeType) continue;

    const next = reanchor(
      toRotation(task),
      task.rotation.filter((id) => id !== assigneeId),
      now,
    );
    batch.update(taskDoc.ref, {
      rotation: next.rotation,
      anchorDate: Timestamp.fromDate(next.anchorDate),
      anchorIndex: next.anchorIndex,
      updatedAt: serverTimestamp(),
    });
  }
}

export function subscribeToTasks(
  houseId: string,
  onChange: (tasks: Task[]) => void,
  onError: (error: FirestoreError) => void,
): () => void {
  return onSnapshot(
    tasksRef(houseId),
    (snapshot) => {
      const tasks = snapshot.docs
        .map((d) => d.data({ serverTimestamps: 'estimate' }) as Task)
        .sort((a, b) => a.title.localeCompare(b.title, 'pt-BR'));
      onChange(tasks);
    },
    onError,
  );
}
