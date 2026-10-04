import type { Locale } from '@/i18n/config';
import type { Currency, House } from '@/types';

export const DEFAULT_CURRENCY: Currency = 'EUR';

// Labels live in the i18n messages (`t.currencies`)
export const CURRENCIES: Currency[] = ['EUR', 'BRL', 'USD', 'GBP'];

// Money is stored in integer cents to avoid floating point errors
const MAX_CENTS = 100_000_000;

export function getHouseCurrency(house: Pick<House, 'currency'> | null | undefined): Currency {
  return house?.currency ?? DEFAULT_CURRENCY;
}

export function formatMoney(cents: number, currency: Currency, locale: Locale): string {
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(cents / 100);
}

/**
 * Parses what people type ("50", "12,50", "12.5", "1.234,56", "€ 8") into cents.
 * The last "," or "." followed by 1-2 digits is the decimal separator.
 */
export function parseAmount(value: string): number | null {
  const cleaned = value.replace(/[^\d.,]/g, '');
  if (!/\d/.test(cleaned)) return null;

  const match = /^(.*?)[.,](\d{1,2})$/.exec(cleaned);
  const whole = (match ? match[1] : cleaned).replace(/[.,]/g, '');
  const fraction = match ? match[2].padEnd(2, '0') : '00';

  const cents = Number(whole || '0') * 100 + Number(fraction);
  return Number.isSafeInteger(cents) && cents > 0 && cents <= MAX_CENTS ? cents : null;
}

/** Each person's share, in (fractional) cents; format with formatMoney. */
export function splitAmount(cents: number, people: number): number {
  return people > 0 ? cents / people : cents;
}
