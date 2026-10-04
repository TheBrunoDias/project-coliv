'use client';

import { useState, type FormEvent } from 'react';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { createHouse } from '@/services/houseService';
import type { User } from '@/types';

function getSuggestions(displayName: string): string[] {
  const firstName = displayName.split(' ')[0];
  return [`Casa de ${firstName}`, 'República', 'Apê compartilhado'];
}

export function CreateHouseForm({ profile }: { profile: User }) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      // On success the profile gets a houseId and RequireAuth sends the user to the dashboard
      await createHouse(name.trim(), profile);
    } catch (err) {
      console.error(err);
      setError('Não foi possível criar a casa. Tente novamente.');
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        label="Nome da casa"
        placeholder="Ex.: República Central"
        required
        maxLength={60}
        value={name}
        onChange={(event) => setName(event.target.value)}
      />
      <div className="flex flex-wrap gap-2">
        {getSuggestions(profile.displayName).map((suggestion) => (
          <button
            key={suggestion}
            type="button"
            onClick={() => setName(suggestion)}
            className="rounded-full border border-border bg-surface px-3 py-1.5 text-sm hover:bg-surface-muted"
          >
            {suggestion}
          </button>
        ))}
      </div>
      {error && <Alert>{error}</Alert>}
      <Button type="submit" loading={loading} disabled={!name.trim()}>
        Criar casa
      </Button>
    </form>
  );
}
