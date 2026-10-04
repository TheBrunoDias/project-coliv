'use client';

import { useState, type FormEvent } from 'react';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useT } from '@/i18n/useT';
import { createHouse } from '@/services/houseService';
import type { Currency, User } from '@/types';
import { CURRENCIES, DEFAULT_CURRENCY } from '@/utils/money';

export function CreateHouseForm({ profile }: { profile: User }) {
  const t = useT();
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
      setError(t.createHouse.error);
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        label={t.createHouse.name}
        placeholder={t.createHouse.namePlaceholder}
        required
        maxLength={60}
        value={name}
        onChange={(event) => setName(event.target.value)}
      />
      <div className="flex flex-wrap gap-2">
        {t.createHouse.suggestions(profile.displayName.split(' ')[0]).map((suggestion) => (
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
          {t.createHouse.currency}
        </label>
        <select
          id="new-house-currency"
          value={currency}
          onChange={(event) => setCurrency(event.target.value as Currency)}
          className="h-12 rounded-xl border border-border bg-surface px-3 text-base outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
        >
          {CURRENCIES.map((option) => (
            <option key={option} value={option}>
              {t.currencies[option]}
            </option>
          ))}
        </select>
      </div>
      {error && <Alert>{error}</Alert>}
      <Button type="submit" loading={loading} disabled={!name.trim()}>
        {t.createHouse.submit}
      </Button>
    </form>
  );
}
