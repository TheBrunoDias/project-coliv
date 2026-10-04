import { describe, expect, it } from 'vitest';
import { generateInviteCode, isValidInviteCode } from './inviteCode';

describe('invite codes', () => {
  it('generates codes accepted by the validator (and by firestore.rules)', () => {
    for (let i = 0; i < 100; i++) {
      expect(isValidInviteCode(generateInviteCode())).toBe(true);
    }
  });

  it('rejects malformed codes', () => {
    expect(isValidInviteCode('')).toBe(false);
    expect(isValidInviteCode('ABCDEFGHJK23')).toBe(false);
    expect(isValidInviteCode('abc/defghjk2')).toBe(false);
    expect(isValidInviteCode('abcdefghjk234')).toBe(false);
  });
});
