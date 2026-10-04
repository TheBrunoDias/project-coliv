'use client';

import type { ReactNode } from 'react';
import { FullScreenLoader } from '@/components/ui/FullScreenLoader';
import { useHouseListeners } from '@/hooks/useHouseListeners';
import { useAuthStore } from '@/store/useAuthStore';
import { useHouseStore } from '@/store/useHouseStore';
import { AppHeader } from './AppHeader';
import { BottomNav } from './BottomNav';

/** Must be rendered inside <RequireAuth house="required">. */
export function DashboardShell({ children }: { children: ReactNode }) {
  const profile = useAuthStore((state) => state.profile);

  if (!profile?.houseId) return <FullScreenLoader />;

  return (
    <HouseSession houseId={profile.houseId} uid={profile.uid}>
      {children}
    </HouseSession>
  );
}

function HouseSession({
  houseId,
  uid,
  children,
}: {
  houseId: string;
  uid: string;
  children: ReactNode;
}) {
  useHouseListeners(houseId, uid);
  const house = useHouseStore((state) => state.house);

  if (!house) return <FullScreenLoader />;

  return (
    <div className="flex min-h-dvh flex-col">
      <AppHeader />
      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-4 px-4 pt-4 pb-[calc(5rem+env(safe-area-inset-bottom))]">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
