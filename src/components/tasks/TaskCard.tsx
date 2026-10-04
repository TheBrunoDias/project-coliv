'use client';

import { Pencil, Trash2 } from 'lucide-react';
import { formatRelativeDay } from '@/utils/date';
import type { Assignee, TaskView } from '@/utils/taskView';
import { AssigneeAvatar } from './AssigneeAvatar';

interface TaskCardProps {
  view: TaskView;
  now: Date;
  // Admin actions
  onEdit?: () => void;
  onDelete?: () => void;
}

function assigneeLabel(assignee: Assignee): string {
  return assignee.includesMe && !assignee.isGroup ? `${assignee.name} (você)` : assignee.name;
}

export function TaskCard({ view, now, onEdit, onDelete }: TaskCardProps) {
  const { task, current, next, changeAt, status, isFixed, isMine, schedule } = view;

  let caption = 'Responsável agora';
  if (status === 'upcoming' && changeAt) caption = `Começa ${formatRelativeDay(changeAt, now)}`;
  else if (isFixed) caption = 'Responsável fixo';

  return (
    <article className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h2 className="font-semibold">{task.title}</h2>
          {task.description && (
            <p className="mt-0.5 text-sm whitespace-pre-line text-muted">{task.description}</p>
          )}
        </div>
        {(onEdit || onDelete) && (
          <div className="-my-1 -mr-2 flex shrink-0">
            {onEdit && (
              <button
                type="button"
                onClick={onEdit}
                aria-label="Editar tarefa"
                className="rounded-lg p-2 text-muted hover:bg-surface-muted hover:text-foreground"
              >
                <Pencil className="size-4" />
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                onClick={onDelete}
                aria-label="Excluir tarefa"
                className="rounded-lg p-2 text-muted hover:bg-surface-muted hover:text-danger"
              >
                <Trash2 className="size-4" />
              </button>
            )}
          </div>
        )}
      </div>

      {current ? (
        <div
          className={`flex items-center gap-3 rounded-xl p-3 ${isMine ? 'bg-brand/10 ring-1 ring-brand/30' : 'bg-surface-muted'}`}
        >
          <AssigneeAvatar assignee={current} />
          <div className="min-w-0">
            <p className="truncate font-medium">{assigneeLabel(current)}</p>
            <p className="truncate text-sm text-muted">
              {current.isGroup && current.memberNames.length > 0
                ? `${caption} · ${current.memberNames.join(', ')}`
                : caption}
            </p>
          </div>
        </div>
      ) : (
        <p className="rounded-xl bg-surface-muted p-3 text-sm text-muted">Sem responsável</p>
      )}

      <p className="text-sm text-muted">
        {status === 'active' && next && changeAt ? (
          <>
            Próximo: <span className="font-medium text-foreground">{assigneeLabel(next)}</span>
            {' · '}troca {formatRelativeDay(changeAt, now)}
            {' · '}
            {schedule}
          </>
        ) : status === 'upcoming' && !isFixed ? (
          `Rodízio entre ${task.rotation.length} · ${schedule}`
        ) : (
          'Sem rodízio'
        )}
      </p>
    </article>
  );
}
