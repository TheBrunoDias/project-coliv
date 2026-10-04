import { create } from 'zustand';
import type { Group, House, HouseMember, Notice, Purchase, Task } from '@/types';

interface HouseState {
  // null while loading the current user's house
  house: House | null;
  members: HouseMember[];
  groups: Group[];
  tasks: Task[];
  purchases: Purchase[];
  notices: Notice[];
  setHouse: (house: House) => void;
  setMembers: (members: HouseMember[]) => void;
  setGroups: (groups: Group[]) => void;
  setTasks: (tasks: Task[]) => void;
  setPurchases: (purchases: Purchase[]) => void;
  setNotices: (notices: Notice[]) => void;
  reset: () => void;
}

export const useHouseStore = create<HouseState>()((set) => ({
  house: null,
  members: [],
  groups: [],
  tasks: [],
  purchases: [],
  notices: [],
  setHouse: (house) => set({ house }),
  setMembers: (members) => set({ members }),
  setGroups: (groups) => set({ groups }),
  setTasks: (tasks) => set({ tasks }),
  setPurchases: (purchases) => set({ purchases }),
  setNotices: (notices) => set({ notices }),
  reset: () => set({ house: null, members: [], groups: [], tasks: [], purchases: [], notices: [] }),
}));
