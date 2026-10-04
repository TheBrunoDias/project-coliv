'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { useT } from '@/i18n/useT';
import { deleteHouse, leaveHouse } from '@/services/houseService';
import { useAuthStore } from '@/store/useAuthStore';
import type { House } from '@/types';

/** Residents can leave; the admin can only delete the whole house. */
export function DangerZone({ house }: { house: House }) {
  const uid = useAuthStore((state) => state.profile?.uid);
  const isAdmin = useIsAdmin();
  const t = useT();
  const [confirming, setConfirming] = useState(false);

  if (!uid) return null;

  return (
    <Card
      title={isAdmin ? t.house.danger.deleteHouse : t.house.danger.leave}
      description={isAdmin ? t.house.danger.adminDescription : t.house.danger.residentDescription}
      className="border-danger/30"
    >
      <Button variant="danger" size="sm" onClick={() => setConfirming(true)}>
        {isAdmin ? t.house.danger.deleteHouse : t.house.danger.leave}
      </Button>

      {isAdmin ? (
        <ConfirmDialog
          open={confirming}
          onClose={() => setConfirming(false)}
          title={t.house.danger.deleteTitle}
          description={t.house.danger.deleteDescription}
          confirmText={house.name}
          confirmLabel={t.house.danger.deleteHouse}
          danger
          onConfirm={() => deleteHouse(house, uid)}
        />
      ) : (
        <ConfirmDialog
          open={confirming}
          onClose={() => setConfirming(false)}
          title={t.house.danger.leaveTitle}
          description={t.house.danger.leaveDescription}
          confirmLabel={t.house.danger.leave}
          danger
          onConfirm={() => leaveHouse(house.id, uid)}
        />
      )}
    </Card>
  );
}
