import { create } from 'zustand';
import type { Group, House, HouseMember, Task } from '@/types';

interface HouseState {
  // null while loading the current user's house
  house: House | null;
  members: HouseMember[];
  groups: Group[];
  tasks: Task[];
  setHouse: (house: House) => void;
  setMembers: (members: HouseMember[]) => void;
  setGroups: (groups: Group[]) => void;
  setTasks: (tasks: Task[]) => void;
  reset: () => void;
}

export const useHouseStore = create<HouseState>()((set) => ({
  house: null,
  members: [],
  groups: [],
  tasks: [],
  setHouse: (house) => set({ house }),
  setMembers: (members) => set({ members }),
  setGroups: (groups) => set({ groups }),
  setTasks: (tasks) => set({ tasks }),
  reset: () => set({ house: null, members: [], groups: [], tasks: [] }),
}));
