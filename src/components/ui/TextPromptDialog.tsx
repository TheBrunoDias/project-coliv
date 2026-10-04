'use client';

import { useState, type FormEvent } from 'react';
import { useT } from '@/i18n/useT';
import { Alert } from './Alert';
import { Button } from './Button';
import { Dialog } from './Dialog';
import { Input } from './Input';

interface TextPromptDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  label: string;
  submitLabel: string;
  initialValue?: string;
  placeholder?: string;
  onSubmit: (value: string) => Promise<void>;
}

/** Dialog with a single required text field (create/rename things). */
export function TextPromptDialog(props: TextPromptDialogProps) {
  return (
    <Dialog open={props.open} onClose={props.onClose} title={props.title}>
      <TextPromptForm {...props} />
    </Dialog>
  );
}

function TextPromptForm({
  onClose,
  label,
  submitLabel,
  initialValue = '',
  placeholder,
  onSubmit,
}: TextPromptDialogProps) {
  const t = useT();
  const [value, setValue] = useState(initialValue);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await onSubmit(value.trim());
      onClose();
    } catch (err) {
      console.error(err);
      setError(t.common.saveError);
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        label={label}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder={placeholder}
        required
        maxLength={60}
        autoFocus
      />
      {error && <Alert>{error}</Alert>}
      <Button type="submit" loading={loading} disabled={!value.trim()}>
        {submitLabel}
      </Button>
    </form>
  );
}
