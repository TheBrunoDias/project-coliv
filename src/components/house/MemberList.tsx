'use client';

import { UserMinus } from 'lucide-react';
import { useState } from 'react';
import { Avatar } from '@/components/ui/Avatar';
import { Card } from '@/components/ui/Card';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { removeMember } from '@/services/houseService';
import { useAuthStore } from '@/store/useAuthStore';
import { useHouseStore } from '@/store/useHouseStore';
import type { HouseMember } from '@/types';

export function MemberList() {
  const house = useHouseStore((state) => state.house);
  const members = useHouseStore((state) => state.members);
  const groups = useHouseStore((state) => state.groups);
  const uid = useAuthStore((state) => state.profile?.uid);
  const isAdmin = useIsAdmin();
  const [removing, setRemoving] = useState<HouseMember | null>(null);

  if (!house) return null;

  const groupNames = new Map(groups.map((group) => [group.id, group.name]));

  return (
    <Card title="Moradores" description={`${members.length} na casa`}>
      <ul className="-mx-1 flex flex-col">
        {members.map((member) => {
          const memberGroups = member.groupIds
            .map((id) => groupNames.get(id))
            .filter((name): name is string => Boolean(name));

          return (
            <li key={member.userId} className="flex items-center gap-3 rounded-xl px-1 py-2">
              <Avatar name={member.displayName} photoURL={member.photoURL} />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">
                  {member.displayName}
                  {member.userId === uid && <span className="font-normal text-muted"> (você)</span>}
                </p>
                <p className="truncate text-sm text-muted">
                  {[member.userId === house.ownerId ? 'Admin' : 'Morador', ...memberGroups].join(' · ')}
                </p>
              </div>
              {isAdmin && member.userId !== uid && (
                <button
                  type="button"
                  onClick={() => setRemoving(member)}
                  aria-label={`Remover ${member.displayName}`}
                  className="rounded-lg p-2 text-muted hover:bg-surface-muted hover:text-danger"
                >
                  <UserMinus className="size-5" />
                </button>
              )}
            </li>
          );
        })}
      </ul>

      <ConfirmDialog
        open={removing !== null}
        onClose={() => setRemoving(null)}
        title="Remover morador?"
        description={`${removing?.displayName} sairá da casa e precisará de um novo convite para voltar.`}
        confirmLabel="Remover"
        danger
        // No `removing!.userId` here: React Compiler reads closure deps during render
        onConfirm={async () => {
          if (removing) await removeMember(house.id, removing.userId);
        }}
      />
    </Card>
  );
}
