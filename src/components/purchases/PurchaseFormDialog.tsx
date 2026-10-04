'use client';

import { useState, type FormEvent } from 'react';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { addPurchase, updatePurchase } from '@/services/purchaseService';
import { useAuthStore } from '@/store/useAuthStore';
import { useHouseStore } from '@/store/useHouseStore';
import type { Purchase } from '@/types';
import { parseDateInput, toDateInputValue } from '@/utils/date';
import { formatMoney, getHouseCurrency, parseAmount, splitAmount } from '@/utils/money';
import { ItemsInput, MAX_ITEMS } from './ItemsInput';

interface PurchaseFormDialogProps {
  open: boolean;
  onClose: () => void;
  // Edit mode when set
  purchase?: Purchase | null;
}

export function PurchaseFormDialog({ open, onClose, purchase }: PurchaseFormDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} title={purchase ? 'Editar compra' : 'Registrar compra'}>
      <PurchaseForm purchase={purchase ?? null} onClose={onClose} />
    </Dialog>
  );
}

const formatInputAmount = (cents: number) => (cents / 100).toFixed(2).replace('.', ',');

function PurchaseForm({ purchase, onClose }: { purchase: Purchase | null; onClose: () => void }) {
  const house = useHouseStore((state) => state.house);
  const memberCount = useHouseStore((state) => state.members.length);
  const uid = useAuthStore((state) => state.profile?.uid) ?? '';

  const [description, setDescription] = useState(purchase?.description ?? '');
  const [items, setItems] = useState<string[]>(purchase?.items ?? []);
  const [draft, setDraft] = useState('');
  const [amount, setAmount] = useState(purchase ? formatInputAmount(purchase.amountCents) : '');
  const [date, setDate] = useState(() =>
    toDateInputValue(purchase ? purchase.date.toDate() : new Date()),
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!house) return null;

  const currency = getHouseCurrency(house);
  // Existing purchases keep the split from when they were registered
  const splitCount = purchase?.splitCount ?? memberCount;
  const amountCents = parseAmount(amount);
  const parsedDate = parseDateInput(date);
  // Includes what is still being typed in the items field
  const allItems = [...items, ...draft.split(',').map((v) => v.trim()).filter(Boolean)].slice(
    0,
    MAX_ITEMS,
  );
  const hasContent = allItems.length > 0 || description.trim().length > 0;
  const canSubmit = hasContent && amountCents !== null && parsedDate !== null;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!house || amountCents === null || !parsedDate) return;
    setError(null);
    setLoading(true);

    const input = { description: description.trim(), items: allItems, amountCents, date: parsedDate };
    try {
      if (purchase) await updatePurchase(house.id, purchase.id, input);
      else await addPurchase(house.id, uid, splitCount, input);
      onClose();
    } catch (err) {
      console.error(err);
      setError('Não foi possível salvar a compra. Tente novamente.');
      setLoading(false);
    }
  }

  return (
    // Enter in the items field adds an item instead of submitting (handled in ItemsInput)
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <Textarea
        label="Descrição (opcional)"
        placeholder="Ex.: Compra do mês no supermercado"
        rows={2}
        maxLength={200}
        value={description}
        onChange={(event) => setDescription(event.target.value)}
      />
      <ItemsInput items={items} onItemsChange={setItems} draft={draft} onDraftChange={setDraft} />
      <p className="-mt-3 text-sm text-muted">
        Preencha a descrição, os itens ou os dois. Em compras grandes, a descrição basta.
      </p>

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Valor total"
          inputMode="decimal"
          placeholder="0,00"
          required
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
        />
        <Input
          label="Data"
          type="date"
          required
          value={date}
          onChange={(event) => setDate(event.target.value)}
        />
      </div>

      {amount && amountCents === null && <Alert>Digite um valor válido, como 50 ou 12,50.</Alert>}

      {amountCents !== null && (
        <p className="rounded-xl bg-brand/10 px-4 py-3 text-sm text-brand-strong">
          <span className="block text-lg font-semibold">
            {formatMoney(splitAmount(amountCents, splitCount), currency)} por pessoa
          </span>
          {formatMoney(amountCents, currency)} dividido entre {splitCount}{' '}
          {splitCount === 1 ? 'morador' : 'moradores'}
        </p>
      )}

      {error && <Alert>{error}</Alert>}
      <Button type="submit" loading={loading} disabled={!canSubmit}>
        {purchase ? 'Salvar' : 'Registrar compra'}
      </Button>
    </form>
  );
}
