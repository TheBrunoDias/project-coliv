'use client';

import { AccountCard } from '@/components/house/AccountCard';
import { DangerZone } from '@/components/house/DangerZone';
import { GroupList } from '@/components/house/GroupList';
import { HouseInfoCard } from '@/components/house/HouseInfoCard';
import { InviteLinkCard } from '@/components/house/InviteLinkCard';
import { MemberList } from '@/components/house/MemberList';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { useHouseStore } from '@/store/useHouseStore';

export default function HousePage() {
  const house = useHouseStore((state) => state.house);
  const isAdmin = useIsAdmin();

  // DashboardShell only renders pages once the house is loaded
  if (!house) return null;

  return (
    <>
      <HouseInfoCard house={house} />
      {isAdmin && <InviteLinkCard house={house} />}
      <MemberList />
      <GroupList />
      <AccountCard />
      <DangerZone house={house} />
    </>
  );
}
