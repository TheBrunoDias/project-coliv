'use client';

import { Pencil, Trash2 } from 'lucide-react';
import { useT } from '@/i18n/useT';

/** Admin edit/delete buttons for a notice. */
export function NoticeActions({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
  const t = useT();
  return (
    <div className="-my-1 -mr-2 flex shrink-0">
      <button
        type="button"
        onClick={onEdit}
        aria-label={t.common.edit}
        className="rounded-lg p-2 text-muted hover:bg-surface-muted hover:text-foreground"
      >
        <Pencil className="size-4" />
      </button>
      <button
        type="button"
        onClick={onDelete}
        aria-label={t.common.delete}
        className="rounded-lg p-2 text-muted hover:bg-surface-muted hover:text-danger"
      >
        <Trash2 className="size-4" />
      </button>
    </div>
  );
}
