import type { Timestamp } from 'firebase/firestore';

export interface User {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  houseId: string | null; // A user belongs to at most one house
  createdAt: Timestamp;
}

export interface House {
  id: string;
  name: string;
  ownerId: string; // Creator of the house = the only admin
  inviteCode: string;
  createdAt: Timestamp;
}

export interface Invite {
  houseId: string;
  houseName: string; // Shown to non-members on the invite page
  createdAt: Timestamp;
}

export interface HouseMember {
  userId: string;
  displayName: string;
  photoURL?: string;
  groupIds: string[];
  joinedAt: Timestamp;
  inviteCode?: string; // Invite used to join; validated by security rules (absent for the admin)
}

export interface Group {
  id: string;
  name: string;
  createdAt: Timestamp;
}

// 'biweekly' is legacy (read as weekly with interval 2); new tasks use interval instead
export type Frequency = 'daily' | 'weekly' | 'biweekly' | 'monthly';

export interface Task {
  id: string;
  title: string;
  description?: string;
  assigneeType: 'user' | 'group';
  rotation: string[]; // Ordered userIds or groupIds; a single id = fixed assignee
  frequency: Frequency;
  interval?: number; // Turn length in `frequency` units (default 1): weekly + 2 = every 2 weeks
  anchorDate: Timestamp; // Start of the period in which rotation[anchorIndex] is responsible
  anchorIndex: number;
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface ShoppingItem {
  id: string;
  title: string;
  quantity?: string;
  isPurchased: boolean;
  createdBy: string;
  purchasedBy?: string;
  createdAt: Timestamp;
  purchasedAt?: Timestamp;
}

export interface Notice {
  id: string;
  title: string;
  content: string;
  isRule: boolean; // true = permanent house rule, false = temporary announcement
  createdBy: string;
  createdAt: Timestamp;
}
