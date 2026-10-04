'use client';

import { Plus } from 'lucide-react';
import { useState } from 'react';
import { TaskCard } from '@/components/tasks/TaskCard';
import { TaskFormDialog } from '@/components/tasks/TaskFormDialog';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { useNow } from '@/hooks/useNow';
import { useTaskViews } from '@/hooks/useTaskViews';
import { deleteTask } from '@/services/taskService';
import { useHouseStore } from '@/store/useHouseStore';
import type { Task } from '@/types';

export default function TasksPage() {
  const houseId = useHouseStore((state) => state.house?.id);
  const views = useTaskViews();
  const now = useNow();
  const isAdmin = useIsAdmin();

  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);
  const [deleting, setDeleting] = useState<Task | null>(null);

  if (!houseId) return null;

  return (
    <>
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Tarefas</h1>
        {isAdmin && (
          <Button size="sm" onClick={() => setCreating(true)}>
            <Plus className="size-4" />
            Nova tarefa
          </Button>
        )}
      </div>

      {views.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border p-6 text-center text-muted">
          {isAdmin
            ? 'Nenhuma tarefa ainda. Crie a primeira, como "Tirar o lixo", e defina o rodízio.'
            : 'Nenhuma tarefa ainda. O admin da casa pode criar os rodízios.'}
        </p>
      ) : (
        views.map((view) => (
          <TaskCard
            key={view.task.id}
            view={view}
            now={now}
            onEdit={isAdmin ? () => setEditing(view.task) : undefined}
            onDelete={isAdmin ? () => setDeleting(view.task) : undefined}
          />
        ))
      )}

      <TaskFormDialog open={creating} onClose={() => setCreating(false)} />
      <TaskFormDialog open={editing !== null} onClose={() => setEditing(null)} task={editing} />
      <ConfirmDialog
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        title="Excluir tarefa?"
        description={`"${deleting?.title}" deixará de aparecer para todos os moradores.`}
        confirmLabel="Excluir"
        danger
        onConfirm={async () => {
          if (deleting) await deleteTask(houseId, deleting.id);
        }}
      />
    </>
  );
}
