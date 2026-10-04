import { describe, expect, it } from 'vitest';
import { messages } from './messages';

// Walks both dictionaries: TypeScript already enforces the same keys, this also catches
// empty strings and functions that return nothing.
function collect(value: unknown, path: string, out: [string, unknown][]) {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    for (const [key, child] of Object.entries(value)) collect(child, `${path}.${key}`, out);
  } else {
    out.push([path, value]);
  }
}

describe('i18n messages', () => {
  for (const [locale, dictionary] of Object.entries(messages)) {
    it(`has no empty translations in ${locale}`, () => {
      const entries: [string, unknown][] = [];
      collect(dictionary, locale, entries);
      for (const [path, value] of entries) {
        const sample = typeof value === 'function' ? value('x', 2) : value;
        expect(sample, path).toBeTruthy();
      }
    });
  }

  it('formats schedules in both languages', () => {
    expect(messages['pt-BR'].tasks.schedule('weekly', 2)).toBe('A cada 2 semanas');
    expect(messages.en.tasks.schedule('weekly', 2)).toBe('Every 2 weeks');
    expect(messages.en.tasks.schedule('monthly', 1)).toBe('Every month');
  });
});
