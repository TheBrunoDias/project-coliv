import { describe, expect, it } from 'vitest';
import { getSafeRedirect } from './redirect';

describe('getSafeRedirect', () => {
  it('keeps same-origin paths', () => {
    expect(getSafeRedirect('/invite/abc')).toBe('/invite/abc');
  });

  it('falls back to home for missing or external targets', () => {
    expect(getSafeRedirect(null)).toBe('/');
    expect(getSafeRedirect('https://evil.com')).toBe('/');
    expect(getSafeRedirect('//evil.com')).toBe('/');
    expect(getSafeRedirect('/\\evil.com')).toBe('/');
  });
});
