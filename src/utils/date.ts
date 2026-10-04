import type { Locale } from '@/i18n/config';
import { startOfDay } from './rotation';

const DAY_MS = 86_400_000;

// Intl formatters are expensive to create; keep one per locale and options
const formatters = new Map<string, Intl.DateTimeFormat | Intl.RelativeTimeFormat>();

function dateFormat(locale: Locale, options: Intl.DateTimeFormatOptions): Intl.DateTimeFormat {
  const key = `${locale}:${JSON.stringify(options)}`;
  let format = formatters.get(key) as Intl.DateTimeFormat | undefined;
  if (!format) {
    format = new Intl.DateTimeFormat(locale, options);
    formatters.set(key, format);
  }
  return format;
}

function relativeFormat(locale: Locale): Intl.RelativeTimeFormat {
  const key = `${locale}:relative`;
  let format = formatters.get(key) as Intl.RelativeTimeFormat | undefined;
  if (!format) {
    format = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
    formatters.set(key, format);
  }
  return format;
}

/** "hoje"/"today", "amanhã"/"tomorrow", the weekday within a week, or a short date. */
export function formatRelativeDay(date: Date, now: Date, locale: Locale): string {
  const days = Math.round((startOfDay(date).getTime() - startOfDay(now).getTime()) / DAY_MS);
  if (Math.abs(days) <= 1) return relativeFormat(locale).format(days, 'day');
  if (days > 1 && days < 7) return dateFormat(locale, { weekday: 'long' }).format(date);
  return dateFormat(locale, { weekday: 'short', day: '2-digit', month: '2-digit' }).format(date);
}

/** "outubro de 2026" / "October 2026". */
export function formatMonth(date: Date, locale: Locale): string {
  return dateFormat(locale, { month: 'long', year: 'numeric' }).format(date);
}

/** Value for <input type="date"> in local time. */
export function toDateInputValue(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** Parses <input type="date"> as local midnight (Date('yyyy-mm-dd') would be UTC). */
export function parseDateInput(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
}
