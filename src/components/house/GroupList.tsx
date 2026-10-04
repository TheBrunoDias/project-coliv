'use client';

import { Pencil, Plus, Trash2, UserPlus } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { TextPromptDialog } from '@/components/ui/TextPromptDialog';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { createGroup, deleteGroup, renameGroup } from '@/services/groupService';
import { useHouseStore } from '@/store/useHouseStore';
import type { Group } from '@/types';
import { GroupMembersDialog } from './GroupMembersDialog';

export function GroupList() {
  const houseId = useHouseStore((state) => state.house?.id);
  const members = useHouseStore((state) => state.members);
  const groups = useHouseStore((state) => state.groups);
  const isAdmin = useIsAdmin();

  const [creating, setCreating] = useState(false);
  const [renaming, setRenaming] = useState<Group | null>(null);
  const [editingMembers, setEditingMembers] = useState<Group | null>(null);
  const [deleting, setDeleting] = useState<Group | null>(null);

  if (!houseId) return null;

  // Residents only see the section when there is something to show
  if (!isAdmin && groups.length === 0) return null;

  return (
    <Card
      title="Grupos"
      description="Quartos ou equipes que podem dividir tarefas."
      action={
        isAdmin && (
          <Button size="sm" variant="secondary" onClick={() => setCreating(true)}>
            <Plus className="size-4" />
            Novo
          </Button>
        )
      }
    >
      {groups.length === 0 ? (
        <p className="text-sm text-muted">Nenhum grupo ainda. Ex.: &quot;Quarto 1&quot;, &quot;Cozinha&quot;.</p>
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
                      <IconButton label="Editar membros" onClick={() => setEditingMembers(group)}>
                        <UserPlus className="size-4" />
                      </IconButton>
                      <IconButton label="Renomear grupo" onClick={() => setRenaming(group)}>
                        <Pencil className="size-4" />
                      </IconButton>
                      <IconButton label="Excluir grupo" onClick={() => setDeleting(group)} danger>
                        <Trash2 className="size-4" />
                      </IconButton>
                    </div>
                  )}
                </div>
                <p className="mt-1 text-sm text-muted">
                  {groupMembers.length > 0
                    ? groupMembers.map((m) => m.displayName).join(', ')
                    : 'Sem membros'}
                </p>
              </li>
            );
          })}
        </ul>
      )}

      <TextPromptDialog
        open={creating}
        onClose={() => setCreating(false)}
        title="Novo grupo"
        label="Nome do grupo"
        placeholder="Ex.: Quarto 1"
        submitLabel="Criar grupo"
        onSubmit={(name) => createGroup(houseId, name)}
      />
      <TextPromptDialog
        open={renaming !== null}
        onClose={() => setRenaming(null)}
        title="Renomear grupo"
        label="Nome do grupo"
        submitLabel="Salvar"
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
        title="Excluir grupo?"
        description={`O grupo "${deleting?.name}" será excluído. Os moradores continuam na casa.`}
        confirmLabel="Excluir"
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
