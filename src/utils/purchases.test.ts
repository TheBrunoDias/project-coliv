import { Timestamp } from 'firebase/firestore';
import { describe, expect, it } from 'vitest';
import type { Purchase } from '@/types';
import { getMonthSummary, groupByMonth } from './purchases';

const purchase = (id: string, date: Date, amountCents: number, splitCount: number): Purchase => ({
  id,
  items: ['x'],
  amountCents,
  date: Timestamp.fromDate(date),
  paidBy: 'ana',
  splitCount,
  createdAt: Timestamp.fromDate(date),
});

const purchases = [
  purchase('oct-2', new Date(2026, 9, 20), 5000, 4),
  purchase('oct-1', new Date(2026, 9, 1), 3000, 3),
  purchase('sep', new Date(2026, 8, 30), 1000, 4),
];

describe('groupByMonth', () => {
  it('groups by month keeping order and totals', () => {
    const months = groupByMonth(purchases);
    expect(months.map((m) => m.key)).toEqual(['2026-10', '2026-09']);
    expect(months[0].purchases.map((p) => p.id)).toEqual(['oct-2', 'oct-1']);
    expect(months[0].totalCents).toBe(8000);
    // 5000/4 + 3000/3 (each purchase split among the residents at the time)
    expect(months[0].perPersonCents).toBe(2250);
  });
});

describe('getMonthSummary', () => {
  it('returns the current month or nothing', () => {
    expect(getMonthSummary(purchases, new Date(2026, 8, 15))?.totalCents).toBe(1000);
    expect(getMonthSummary(purchases, new Date(2026, 10, 1))).toBeUndefined();
  });
});
