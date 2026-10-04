import { describe, expect, it } from 'vitest';
import { formatMoney, parseAmount, splitAmount } from './money';

// Intl uses a non-breaking space between symbol and value
const normalize = (value: string) => value.replace(/\s/g, ' ');

describe('parseAmount', () => {
  it('accepts comma or dot decimals', () => {
    expect(parseAmount('50')).toBe(5000);
    expect(parseAmount('12,50')).toBe(1250);
    expect(parseAmount('12.5')).toBe(1250);
    expect(parseAmount('0,99')).toBe(99);
  });

  it('accepts thousands separators and currency symbols', () => {
    expect(parseAmount('1.234,56')).toBe(123456);
    expect(parseAmount('1,234.56')).toBe(123456);
    expect(parseAmount('1.234')).toBe(123400);
    expect(parseAmount('€ 8')).toBe(800);
    expect(parseAmount('R$ 10,00')).toBe(1000);
  });

  it('rejects empty, zero and absurd values', () => {
    expect(parseAmount('')).toBeNull();
    expect(parseAmount('abc')).toBeNull();
    expect(parseAmount('0')).toBeNull();
    expect(parseAmount('99999999')).toBeNull();
  });
});

describe('splitAmount + formatMoney', () => {
  it('splits the example from the spec: 50 among 4 people', () => {
    expect(normalize(formatMoney(splitAmount(5000, 4), 'EUR'))).toBe('€ 12,50');
  });

  it('rounds shares to cents when displaying', () => {
    expect(normalize(formatMoney(splitAmount(5000, 3), 'BRL'))).toBe('R$ 16,67');
  });
});
