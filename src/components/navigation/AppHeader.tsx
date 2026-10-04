'use client';

import { useHouseStore } from '@/store/useHouseStore';

export function AppHeader() {
  const houseName = useHouseStore((state) => state.house?.name);

  return (
    <header className="sticky top-0 z-10 border-b border-border bg-background/95 pt-[env(safe-area-inset-top)] backdrop-blur">
      <div className="mx-auto flex h-14 max-w-lg items-center px-4">
        <p className="truncate text-lg font-semibold">{houseName}</p>
      </div>
    </header>
  );
}
