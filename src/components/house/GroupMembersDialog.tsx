'use client';

import { useState } from 'react';
import { Alert } from '@/components/ui/Alert';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { useT } from '@/i18n/useT';
import { setGroupMembers } from '@/services/groupService';
import type { Group, HouseMember } from '@/types';

interface GroupMembersDialogProps {
  houseId: string;
  group: Group | null;
  members: HouseMember[];
  onClose: () => void;
}

export function GroupMembersDialog({ houseId, group, members, onClose }: GroupMembersDialogProps) {
  const t = useT();
  return (
    <Dialog
      open={group !== null}
      onClose={onClose}
      title={group ? t.house.groups.membersTitle(group.name) : ''}
    >
      {group && (
        <GroupMembersForm houseId={houseId} group={group} members={members} onClose={onClose} />
      )}
    </Dialog>
  );
}

function GroupMembersForm({
  houseId,
  group,
  members,
  onClose,
}: GroupMembersDialogProps & { group: Group }) {
  const [selected, setSelected] = useState(
    () => new Set(members.filter((m) => m.groupIds.includes(group.id)).map((m) => m.userId)),
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const t = useT();

  function toggle(userId: string) {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  }

  async function handleSave() {
    setError(null);
    setLoading(true);
    try {
      await setGroupMembers(houseId, group.id, selected, members);
      onClose();
    } catch (err) {
      console.error(err);
      setError(t.common.saveError);
      setLoading(false);
    }
  }

  return (
    <>
      <ul className="flex max-h-[50dvh] flex-col overflow-y-auto">
        {members.map((member) => (
          <li key={member.userId}>
            <label className="flex cursor-pointer items-center gap-3 rounded-xl px-1 py-2 hover:bg-surface-muted">
              <Avatar name={member.displayName} photoURL={member.photoURL} />
              <span className="flex-1 truncate font-medium">{member.displayName}</span>
              <input
                type="checkbox"
                checked={selected.has(member.userId)}
                onChange={() => toggle(member.userId)}
                className="size-5 accent-brand"
              />
            </label>
          </li>
        ))}
      </ul>
      {error && <Alert>{error}</Alert>}
      <Button loading={loading} onClick={handleSave}>
        {t.common.save}
      </Button>
    </>
  );
}
