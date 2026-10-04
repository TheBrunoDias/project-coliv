'use client';

import { X } from 'lucide-react';
import { useEffect, useRef, type ReactNode } from 'react';

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

/** Native <dialog>: bottom sheet on mobile, centered card on larger screens. */
export function Dialog({ open, onClose, title, children }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      // Clicking the backdrop targets the <dialog> element itself
      onClick={(event) => {
        if (event.target === ref.current) onClose();
      }}
      className="mx-auto mt-auto mb-0 w-full max-w-md rounded-t-2xl bg-surface text-foreground backdrop:bg-black/50 sm:mb-auto sm:rounded-2xl"
    >
      {/* Children mount only while open so forms start fresh every time */}
      {open && (
        <div className="flex flex-col gap-5 p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-lg font-semibold">{title}</h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Fechar"
              className="-mr-2 rounded-lg p-2 text-muted hover:bg-surface-muted"
            >
              <X className="size-5" />
            </button>
          </div>
          {children}
        </div>
      )}
    </dialog>
  );
}
