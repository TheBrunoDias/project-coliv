'use client';

import { useState, type FormEvent } from 'react';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { useLocale, useT } from '@/i18n/useT';
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
  const t = useT();
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={purchase ? t.purchases.form.editTitle : t.purchases.form.newTitle}
    >
      <PurchaseForm purchase={purchase ?? null} onClose={onClose} />
    </Dialog>
  );
}

// Editing shows the amount with the locale's decimal separator ("12,50" / "12.50")
const formatInputAmount = (cents: number, decimalSeparator: string) =>
  (cents / 100).toFixed(2).replace('.', decimalSeparator);

function PurchaseForm({ purchase, onClose }: { purchase: Purchase | null; onClose: () => void }) {
  const house = useHouseStore((state) => state.house);
  const memberCount = useHouseStore((state) => state.members.length);
  const uid = useAuthStore((state) => state.profile?.uid) ?? '';
  const t = useT();
  const locale = useLocale();

  const [description, setDescription] = useState(purchase?.description ?? '');
  const [items, setItems] = useState<string[]>(purchase?.items ?? []);
  const [draft, setDraft] = useState('');
  const [amount, setAmount] = useState(() =>
    purchase ? formatInputAmount(purchase.amountCents, locale === 'en' ? '.' : ',') : '',
  );
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
      setError(t.purchases.form.error);
      setLoading(false);
    }
  }

  return (
    // Enter in the items field adds an item instead of submitting (handled in ItemsInput)
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <Textarea
        label={t.purchases.form.description}
        placeholder={t.purchases.form.descriptionPlaceholder}
        rows={2}
        maxLength={200}
        value={description}
        onChange={(event) => setDescription(event.target.value)}
      />
      <ItemsInput items={items} onItemsChange={setItems} draft={draft} onDraftChange={setDraft} />
      <p className="-mt-3 text-sm text-muted">{t.purchases.form.contentHint}</p>

      <div className="grid grid-cols-2 gap-3">
        <Input
          label={t.purchases.form.amount}
          inputMode="decimal"
          placeholder={t.purchases.form.amountPlaceholder}
          required
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
        />
        <Input
          label={t.purchases.form.date}
          type="date"
          required
          value={date}
          onChange={(event) => setDate(event.target.value)}
        />
      </div>

      {amount && amountCents === null && <Alert>{t.purchases.form.invalidAmount}</Alert>}

      {amountCents !== null && (
        <p className="rounded-xl bg-brand/10 px-4 py-3 text-sm text-brand-strong">
          <span className="block text-lg font-semibold">
            {t.purchases.form.perPerson(
              formatMoney(splitAmount(amountCents, splitCount), currency, locale),
            )}
          </span>
          {t.purchases.form.splitAmong(formatMoney(amountCents, currency, locale), splitCount)}
        </p>
      )}

      {error && <Alert>{error}</Alert>}
      <Button type="submit" loading={loading} disabled={!canSubmit}>
        {purchase ? t.common.save : t.purchases.form.submit}
      </Button>
    </form>
  );
}
