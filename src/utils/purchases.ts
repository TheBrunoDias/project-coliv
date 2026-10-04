import type { Purchase } from '@/types';
import { splitAmount } from './money';

export interface MonthSummary {
  // "2026-10"
  key: string;
  // "outubro de 2026"
  label: string;
  purchases: Purchase[];
  totalCents: number;
  // Sum of each purchase's per-person share
  perPersonCents: number;
}

const monthFormat = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' });

const monthKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

/** Groups purchases (already sorted newest first) by the month they were made. */
export function groupByMonth(purchases: Purchase[]): MonthSummary[] {
  const months = new Map<string, MonthSummary>();

  for (const purchase of purchases) {
    const date = purchase.date.toDate();
    const key = monthKey(date);
    let month = months.get(key);
    if (!month) {
      month = { key, label: monthFormat.format(date), purchases: [], totalCents: 0, perPersonCents: 0 };
      months.set(key, month);
    }
    month.purchases.push(purchase);
    month.totalCents += purchase.amountCents;
    month.perPersonCents += splitAmount(purchase.amountCents, purchase.splitCount);
  }

  return [...months.values()];
}

export function getMonthSummary(purchases: Purchase[], now: Date): MonthSummary | undefined {
  return groupByMonth(purchases).find((month) => month.key === monthKey(now));
}
