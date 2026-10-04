'use client';

import { useState, type ReactNode } from 'react';
import { Alert } from './Alert';
import { Button } from './Button';
import { Dialog } from './Dialog';
import { Input } from './Input';

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description: ReactNode;
  confirmLabel: string;
  onConfirm: () => Promise<void>;
  danger?: boolean;
  // When set, the user must type this exact text to enable the confirm button
  confirmText?: string;
}

export function ConfirmDialog(props: ConfirmDialogProps) {
  return (
    <Dialog open={props.open} onClose={props.onClose} title={props.title}>
      <ConfirmDialogBody {...props} />
    </Dialog>
  );
}

function ConfirmDialogBody({
  onClose,
  description,
  confirmLabel,
  onConfirm,
  danger = false,
  confirmText,
}: ConfirmDialogProps) {
  const [typed, setTyped] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConfirm() {
    setError(null);
    setLoading(true);
    try {
      await onConfirm();
      onClose();
    } catch (err) {
      console.error(err);
      setError('Não foi possível concluir. Tente novamente.');
      setLoading(false);
    }
  }

  const canConfirm = !confirmText || typed.trim() === confirmText.trim();

  return (
    <>
      <div className="text-muted">{description}</div>
      {confirmText && (
        <Input
          label={`Digite "${confirmText}" para confirmar`}
          value={typed}
          onChange={(event) => setTyped(event.target.value)}
          autoComplete="off"
        />
      )}
      {error && <Alert>{error}</Alert>}
      <div className="flex flex-col gap-2">
        <Button
          variant={danger ? 'danger' : 'primary'}
          loading={loading}
          disabled={!canConfirm}
          onClick={handleConfirm}
        >
          {confirmLabel}
        </Button>
        <Button variant="ghost" onClick={onClose} disabled={loading}>
          Cancelar
        </Button>
      </div>
    </>
  );
}
