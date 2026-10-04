'use client';

import { useState, type FormEvent } from 'react';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { createHouse } from '@/services/houseService';
import type { Currency, User } from '@/types';
import { CURRENCIES, DEFAULT_CURRENCY } from '@/utils/money';

function getSuggestions(displayName: string): string[] {
  const firstName = displayName.split(' ')[0];
  return [`Casa de ${firstName}`, 'República', 'Apê compartilhado'];
}

export function CreateHouseForm({ profile }: { profile: User }) {
  const [name, setName] = useState('');
  const [currency, setCurrency] = useState<Currency>(DEFAULT_CURRENCY);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      // On success the profile gets a houseId and RequireAuth sends the user to the dashboard
      await createHouse(name.trim(), currency, profile);
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
      <div className="flex flex-col gap-1.5">
        <label htmlFor="new-house-currency" className="text-sm font-medium">
          Moeda das compras
        </label>
        <select
          id="new-house-currency"
          value={currency}
          onChange={(event) => setCurrency(event.target.value as Currency)}
          className="h-12 rounded-xl border border-border bg-surface px-3 text-base outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
        >
          {CURRENCIES.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      {error && <Alert>{error}</Alert>}
      <Button type="submit" loading={loading} disabled={!name.trim()}>
        Criar casa
      </Button>
    </form>
  );
}
