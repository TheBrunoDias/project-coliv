'use client';

import { useAuthStore } from '@/store/useAuthStore';
import { useHouseStore } from '@/store/useHouseStore';

/** The admin is the user who created the house (`houses.ownerId`). */
export function useIsAdmin(): boolean {
  const uid = useAuthStore((state) => state.profile?.uid);
  const ownerId = useHouseStore((state) => state.house?.ownerId);
  return uid !== undefined && uid === ownerId;
}
