import { create } from 'zustand';
import type { Group, House, HouseMember } from '@/types';

interface HouseState {
  // null while loading the current user's house
  house: House | null;
  members: HouseMember[];
  groups: Group[];
  setHouse: (house: House) => void;
  setMembers: (members: HouseMember[]) => void;
  setGroups: (groups: Group[]) => void;
  reset: () => void;
}

export const useHouseStore = create<HouseState>()((set) => ({
  house: null,
  members: [],
  groups: [],
  setHouse: (house) => set({ house }),
  setMembers: (members) => set({ members }),
  setGroups: (groups) => set({ groups }),
  reset: () => set({ house: null, members: [], groups: [] }),
}));
