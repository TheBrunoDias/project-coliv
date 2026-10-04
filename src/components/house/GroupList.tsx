'use client';

import { Pencil, Plus, Trash2, UserPlus } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { TextPromptDialog } from '@/components/ui/TextPromptDialog';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { useT } from '@/i18n/useT';
import { createGroup, deleteGroup, renameGroup } from '@/services/groupService';
import { useHouseStore } from '@/store/useHouseStore';
import type { Group } from '@/types';
import { GroupMembersDialog } from './GroupMembersDialog';

export function GroupList() {
  const houseId = useHouseStore((state) => state.house?.id);
  const members = useHouseStore((state) => state.members);
  const groups = useHouseStore((state) => state.groups);
  const isAdmin = useIsAdmin();
  const t = useT();

  const [creating, setCreating] = useState(false);
  const [renaming, setRenaming] = useState<Group | null>(null);
  const [editingMembers, setEditingMembers] = useState<Group | null>(null);
  const [deleting, setDeleting] = useState<Group | null>(null);

  if (!houseId) return null;

  // Residents only see the section when there is something to show
  if (!isAdmin && groups.length === 0) return null;

  return (
    <Card
      title={t.house.groups.title}
      description={t.house.groups.description}
      action={
        isAdmin && (
          <Button size="sm" variant="secondary" onClick={() => setCreating(true)}>
            <Plus className="size-4" />
            {t.house.groups.new}
          </Button>
        )
      }
    >
      {groups.length === 0 ? (
        <p className="text-sm text-muted">{t.house.groups.empty}</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {groups.map((group) => {
            const groupMembers = members.filter((m) => m.groupIds.includes(group.id));
            return (
              <li key={group.id} className="rounded-xl bg-surface-muted p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate font-medium">{group.name}</p>
                  {isAdmin && (
                    <div className="-my-1 flex shrink-0 items-center">
                      <IconButton label={t.house.groups.editMembers} onClick={() => setEditingMembers(group)}>
                        <UserPlus className="size-4" />
                      </IconButton>
                      <IconButton label={t.house.groups.rename} onClick={() => setRenaming(group)}>
                        <Pencil className="size-4" />
                      </IconButton>
                      <IconButton label={t.house.groups.delete} onClick={() => setDeleting(group)} danger>
                        <Trash2 className="size-4" />
                      </IconButton>
                    </div>
                  )}
                </div>
                <p className="mt-1 text-sm text-muted">
                  {groupMembers.length > 0
                    ? groupMembers.map((m) => m.displayName).join(', ')
                    : t.house.groups.noMembers}
                </p>
              </li>
            );
          })}
        </ul>
      )}

      <TextPromptDialog
        open={creating}
        onClose={() => setCreating(false)}
        title={t.house.groups.newTitle}
        label={t.house.groups.nameLabel}
        placeholder={t.house.groups.namePlaceholder}
        submitLabel={t.house.groups.create}
        onSubmit={(name) => createGroup(houseId, name)}
      />
      <TextPromptDialog
        open={renaming !== null}
        onClose={() => setRenaming(null)}
        title={t.house.groups.rename}
        label={t.house.groups.nameLabel}
        submitLabel={t.common.save}
        initialValue={renaming?.name}
        // No `renaming!.id` here: React Compiler reads closure deps during render
        onSubmit={async (name) => {
          if (renaming) await renameGroup(houseId, renaming.id, name);
        }}
      />
      <GroupMembersDialog
        houseId={houseId}
        group={editingMembers}
        members={members}
        onClose={() => setEditingMembers(null)}
      />
      <ConfirmDialog
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        title={t.house.groups.deleteTitle}
        description={t.house.groups.deleteDescription(deleting?.name ?? '')}
        confirmLabel={t.common.delete}
        danger
        onConfirm={async () => {
          if (deleting) await deleteGroup(houseId, deleting.id, members);
        }}
      />
    </Card>
  );
}

function IconButton({
  label,
  onClick,
  danger = false,
  children,
}: {
  label: string;
  onClick: () => void;
  danger?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`rounded-lg p-2 text-muted hover:bg-surface ${danger ? 'hover:text-danger' : 'hover:text-foreground'}`}
    >
      {children}
    </button>
  );
}
