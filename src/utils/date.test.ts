import { describe, expect, it } from 'vitest';
import { formatMonth, formatRelativeDay, parseDateInput, toDateInputValue } from './date';

describe('formatRelativeDay', () => {
  const now = new Date(2026, 9, 14, 22, 30); // Wednesday night

  it('uses relative words for nearby days', () => {
    expect(formatRelativeDay(new Date(2026, 9, 14, 8), now, 'pt-BR')).toBe('hoje');
    expect(formatRelativeDay(new Date(2026, 9, 15, 0), now, 'pt-BR')).toBe('amanhã');
    expect(formatRelativeDay(new Date(2026, 9, 13), now, 'pt-BR')).toBe('ontem');
    expect(formatRelativeDay(new Date(2026, 9, 14, 8), now, 'en')).toBe('today');
    expect(formatRelativeDay(new Date(2026, 9, 15, 0), now, 'en')).toBe('tomorrow');
    expect(formatRelativeDay(new Date(2026, 9, 13), now, 'en')).toBe('yesterday');
  });

  it('uses the weekday within a week and a date beyond', () => {
    expect(formatRelativeDay(new Date(2026, 9, 19), now, 'pt-BR')).toBe('segunda-feira');
    expect(formatRelativeDay(new Date(2026, 9, 19), now, 'en')).toBe('Monday');
    expect(formatRelativeDay(new Date(2026, 9, 21), now, 'pt-BR')).toMatch(/21\/10/);
    expect(formatRelativeDay(new Date(2026, 9, 21), now, 'en')).toMatch(/10\/21/);
  });
});

describe('formatMonth', () => {
  it('names the month in each language', () => {
    expect(formatMonth(new Date(2026, 9, 1), 'pt-BR')).toBe('outubro de 2026');
    expect(formatMonth(new Date(2026, 9, 1), 'en')).toBe('October 2026');
  });
});

describe('date input', () => {
  it('round-trips local dates', () => {
    const date = new Date(2026, 0, 5);
    expect(toDateInputValue(date)).toBe('2026-01-05');
    expect(parseDateInput('2026-01-05')).toEqual(date);
    expect(parseDateInput('')).toBeNull();
  });
});
