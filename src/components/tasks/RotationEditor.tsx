'use client';

import { ArrowDown, ArrowUp, Plus, X } from 'lucide-react';
import type { Assignee } from '@/utils/taskView';
import { AssigneeAvatar } from './AssigneeAvatar';

interface RotationEditorProps {
  // Ordered ids in the rotation; the first one has the first turn
  value: string[];
  onChange: (value: string[]) => void;
  // Everyone who can be added (users or groups)
  options: Assignee[];
  resolve: (id: string) => Assignee;
}

export function RotationEditor({ value, onChange, options, resolve }: RotationEditorProps) {
  const available = options.filter((option) => !value.includes(option.id));

  function move(index: number, offset: -1 | 1) {
    const next = [...value];
    [next[index], next[index + offset]] = [next[index + offset], next[index]];
    onChange(next);
  }

  return (
    <div className="flex flex-col gap-3">
      {value.length > 0 && (
        <ol className="flex flex-col gap-1">
          {value.map((id, index) => {
            const assignee = resolve(id);
            return (
              <li key={id} className="flex items-center gap-2 rounded-xl bg-surface-muted p-2">
                <span className="w-5 text-center text-sm font-semibold text-muted">{index + 1}</span>
                <AssigneeAvatar assignee={assignee} />
                <span className="min-w-0 flex-1 truncate font-medium">{assignee.name}</span>
                <IconButton label="Subir" disabled={index === 0} onClick={() => move(index, -1)}>
                  <ArrowUp className="size-4" />
                </IconButton>
                <IconButton
                  label="Descer"
                  disabled={index === value.length - 1}
                  onClick={() => move(index, 1)}
                >
                  <ArrowDown className="size-4" />
                </IconButton>
                <IconButton label="Remover" onClick={() => onChange(value.filter((v) => v !== id))}>
                  <X className="size-4" />
                </IconButton>
              </li>
            );
          })}
        </ol>
      )}

      {available.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {available.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => onChange([...value, option.id])}
              className="flex items-center gap-1 rounded-full border border-border bg-surface px-3 py-1.5 text-sm hover:bg-surface-muted"
            >
              <Plus className="size-3.5" />
              {option.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function IconButton({
  label,
  onClick,
  disabled = false,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="rounded-lg p-1.5 text-muted hover:bg-surface hover:text-foreground disabled:opacity-30 disabled:hover:bg-transparent"
    >
      {children}
    </button>
  );
}
