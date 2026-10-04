'use client';

import { Plus, Receipt } from 'lucide-react';
import { useState } from 'react';
import { PurchaseCard } from '@/components/purchases/PurchaseCard';
import { PurchaseFormDialog } from '@/components/purchases/PurchaseFormDialog';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { useNow } from '@/hooks/useNow';
import { useLocale, useT } from '@/i18n/useT';
import { deletePurchase } from '@/services/purchaseService';
import { useAuthStore } from '@/store/useAuthStore';
import { useHouseStore } from '@/store/useHouseStore';
import type { Purchase } from '@/types';
import { formatMonth } from '@/utils/date';
import { formatMoney, getHouseCurrency } from '@/utils/money';
import { groupByMonth } from '@/utils/purchases';

export default function PurchasesPage() {
  const house = useHouseStore((state) => state.house);
  const purchases = useHouseStore((state) => state.purchases);
  const members = useHouseStore((state) => state.members);
  const uid = useAuthStore((state) => state.profile?.uid) ?? '';
  const isAdmin = useIsAdmin();
  const now = useNow();
  const t = useT();
  const locale = useLocale();

  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Purchase | null>(null);
  const [deleting, setDeleting] = useState<Purchase | null>(null);

  if (!house) return null;

  const currency = getHouseCurrency(house);
  const months = groupByMonth(purchases);
  const canManage = (purchase: Purchase) => isAdmin || purchase.paidBy === uid;

  return (
    <>
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">{t.purchases.title}</h1>
        <Button size="sm" onClick={() => setCreating(true)}>
          <Plus className="size-4" />
          {t.purchases.register}
        </Button>
      </div>

      {months.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border p-6 text-center text-muted">
          <Receipt className="size-8 text-brand" />
          {t.purchases.empty}
        </div>
      ) : (
        months.map((month) => (
          <section key={month.key} className="flex flex-col gap-3">
            <div className="flex items-end justify-between gap-3 pt-2">
              <h2 className="font-semibold capitalize">{formatMonth(month.date, locale)}</h2>
              <p className="text-right text-sm text-muted">
                {t.purchases.monthTotal(formatMoney(month.totalCents, currency, locale))} ·{' '}
                <span className="font-semibold text-foreground">
                  {formatMoney(month.perPersonCents, currency, locale)}
                </span>{' '}
                {t.purchases.perPerson}
              </p>
            </div>
            {month.purchases.map((purchase) => (
              <PurchaseCard
                key={purchase.id}
                purchase={purchase}
                members={members}
                uid={uid}
                currency={currency}
                now={now}
                onEdit={canManage(purchase) ? () => setEditing(purchase) : undefined}
                onDelete={canManage(purchase) ? () => setDeleting(purchase) : undefined}
              />
            ))}
          </section>
        ))
      )}

      <PurchaseFormDialog open={creating} onClose={() => setCreating(false)} />
      <PurchaseFormDialog
        open={editing !== null}
        onClose={() => setEditing(null)}
        purchase={editing}
      />
      <ConfirmDialog
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        title={t.purchases.deleteTitle}
        description={t.purchases.deleteDescription}
        confirmLabel={t.common.delete}
        danger
        onConfirm={async () => {
          if (deleting) await deletePurchase(house.id, deleting.id);
        }}
      />
    </>
  );
}
