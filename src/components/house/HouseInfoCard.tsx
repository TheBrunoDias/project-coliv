'use client';

import { Pencil } from 'lucide-react';
import { useState } from 'react';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { TextPromptDialog } from '@/components/ui/TextPromptDialog';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { renameHouse, updateHouseCurrency } from '@/services/houseService';
import type { Currency, House } from '@/types';
import { CURRENCIES, getHouseCurrency } from '@/utils/money';

export function HouseInfoCard({ house }: { house: House }) {
  const isAdmin = useIsAdmin();
  const [renaming, setRenaming] = useState(false);
  const [currencyError, setCurrencyError] = useState(false);
  const currency = getHouseCurrency(house);

  function handleCurrencyChange(value: Currency) {
    setCurrencyError(false);
    updateHouseCurrency(house.id, value).catch((err: unknown) => {
      console.error(err);
      setCurrencyError(true);
    });
  }

  return (
    <Card>
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm text-muted">Casa</p>
          <h1 className="truncate text-xl font-semibold">{house.name}</h1>
        </div>
        {isAdmin && (
          <Button variant="secondary" size="sm" onClick={() => setRenaming(true)}>
            <Pencil className="size-4" />
            Renomear
          </Button>
        )}
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-border pt-3">
        {isAdmin ? (
          <label htmlFor="house-currency" className="text-sm text-muted">
            Moeda das compras
          </label>
        ) : (
          <span className="text-sm text-muted">Moeda das compras</span>
        )}
        {isAdmin ? (
          <select
            id="house-currency"
            value={currency}
            onChange={(event) => handleCurrencyChange(event.target.value as Currency)}
            className="h-9 rounded-lg border border-border bg-surface px-2 text-sm outline-none focus:border-brand"
          >
            {CURRENCIES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        ) : (
          <span className="text-sm font-medium">
            {CURRENCIES.find((option) => option.value === currency)?.label}
          </span>
        )}
      </div>
      {currencyError && <Alert>Não foi possível alterar a moeda. Tente novamente.</Alert>}

      <TextPromptDialog
        open={renaming}
        onClose={() => setRenaming(false)}
        title="Renomear casa"
        label="Nome da casa"
        submitLabel="Salvar"
        initialValue={house.name}
        onSubmit={(name) => renameHouse(house, name)}
      />
    </Card>
  );
}
