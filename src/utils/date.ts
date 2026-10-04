import { startOfDay } from './rotation';

const DAY_MS = 86_400_000;

const weekdayFormat = new Intl.DateTimeFormat('pt-BR', { weekday: 'long' });
const shortDateFormat = new Intl.DateTimeFormat('pt-BR', {
  weekday: 'short',
  day: '2-digit',
  month: '2-digit',
});

/** "hoje", "amanhã", "segunda-feira" (within a week) or "seg., 12/10". */
export function formatRelativeDay(date: Date, now: Date): string {
  const days = Math.round((startOfDay(date).getTime() - startOfDay(now).getTime()) / DAY_MS);
  if (days === 0) return 'hoje';
  if (days === 1) return 'amanhã';
  if (days === -1) return 'ontem';
  if (days > 1 && days < 7) return weekdayFormat.format(date);
  return shortDateFormat.format(date);
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
