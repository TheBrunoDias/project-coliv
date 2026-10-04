'use client';

import { Pencil, Trash2 } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { useLocale, useT } from '@/i18n/useT';
import type { Currency, HouseMember, Purchase } from '@/types';
import { formatRelativeDay } from '@/utils/date';
import { getMemberName } from '@/utils/members';
import { formatMoney, splitAmount } from '@/utils/money';

interface PurchaseCardProps {
  purchase: Purchase;
  members: HouseMember[];
  uid: string;
  currency: Currency;
  now: Date;
  // Payer or admin
  onEdit?: () => void;
  onDelete?: () => void;
}

export function PurchaseCard({
  purchase,
  members,
  uid,
  currency,
  now,
  onEdit,
  onDelete,
}: PurchaseCardProps) {
  const t = useT();
  const locale = useLocale();
  const payer = members.find((member) => member.userId === purchase.paidBy);
  const payerName = getMemberName(members, purchase.paidBy, uid, {
    you: payer?.displayName ?? t.common.you,
    formerMember: t.common.formerMember,
  });

  return (
    <article className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-4">
      <div className="flex items-start gap-3">
        <Avatar name={payer?.displayName ?? payerName} photoURL={payer?.photoURL} />
        <div className="min-w-0 flex-1">
          <p className="font-medium">
            {t.purchases.card.paidBy(payerName)}{' '}
            <span className="font-semibold">{formatMoney(purchase.amountCents, currency, locale)}</span>
          </p>
          <p className="text-sm text-muted">
            {formatRelativeDay(purchase.date.toDate(), now, locale)}
          </p>
        </div>
        {(onEdit || onDelete) && (
          <div className="-my-1 -mr-2 flex shrink-0">
            {onEdit && (
              <button
                type="button"
                onClick={onEdit}
                aria-label={t.purchases.editLabel}
                className="rounded-lg p-2 text-muted hover:bg-surface-muted hover:text-foreground"
              >
                <Pencil className="size-4" />
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                onClick={onDelete}
                aria-label={t.purchases.deleteLabel}
                className="rounded-lg p-2 text-muted hover:bg-surface-muted hover:text-danger"
              >
                <Trash2 className="size-4" />
              </button>
            )}
          </div>
        )}
      </div>

      {(purchase.description || purchase.items.length > 0) && (
        <div className="flex flex-col gap-0.5">
          {purchase.description && (
            <p className="font-medium whitespace-pre-line">{purchase.description}</p>
          )}
          {purchase.items.length > 0 && (
            <p className="text-sm text-muted">{purchase.items.join(', ')}</p>
          )}
        </div>
      )}

      <div className="flex items-baseline justify-between gap-2 rounded-xl bg-surface-muted px-3 py-2">
        <span className="text-sm text-muted">
          {t.purchases.card.splitAmong(purchase.splitCount)}
        </span>
        <span className="font-semibold">
          {formatMoney(splitAmount(purchase.amountCents, purchase.splitCount), currency, locale)}
          <span className="text-sm font-normal text-muted"> {t.purchases.card.perPersonShort}</span>
        </span>
      </div>
    </article>
  );
}
