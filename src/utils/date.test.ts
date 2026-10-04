import { describe, expect, it } from 'vitest';
import { formatRelativeDay, parseDateInput, toDateInputValue } from './date';

describe('formatRelativeDay', () => {
  const now = new Date(2026, 9, 14, 22, 30); // Wednesday night

  it('uses relative words for nearby days', () => {
    expect(formatRelativeDay(new Date(2026, 9, 14, 8), now)).toBe('hoje');
    expect(formatRelativeDay(new Date(2026, 9, 15, 0), now)).toBe('amanhã');
    expect(formatRelativeDay(new Date(2026, 9, 13), now)).toBe('ontem');
  });

  it('uses the weekday within a week and a date beyond', () => {
    expect(formatRelativeDay(new Date(2026, 9, 19), now)).toBe('segunda-feira');
    expect(formatRelativeDay(new Date(2026, 9, 21), now)).toMatch(/21\/10/);
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
