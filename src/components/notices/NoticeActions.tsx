import { Pencil, Trash2 } from 'lucide-react';

/** Admin edit/delete buttons for a notice. */
export function NoticeActions({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
  return (
    <div className="-my-1 -mr-2 flex shrink-0">
      <button
        type="button"
        onClick={onEdit}
        aria-label="Editar"
        className="rounded-lg p-2 text-muted hover:bg-surface-muted hover:text-foreground"
      >
        <Pencil className="size-4" />
      </button>
      <button
        type="button"
        onClick={onDelete}
        aria-label="Excluir"
        className="rounded-lg p-2 text-muted hover:bg-surface-muted hover:text-danger"
      >
        <Trash2 className="size-4" />
      </button>
    </div>
  );
}
