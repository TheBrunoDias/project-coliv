// Lowercase letters and digits without look-alikes (0/o, 1/l/i); must match firestore.rules
const ALPHABET = 'abcdefghjkmnpqrstuvwxyz23456789';
export const INVITE_CODE_LENGTH = 12;

export function generateInviteCode(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(INVITE_CODE_LENGTH));
  return Array.from(bytes, (byte) => ALPHABET[byte % ALPHABET.length]).join('');
}

export function isValidInviteCode(code: string): boolean {
  return new RegExp(`^[a-z0-9]{${INVITE_CODE_LENGTH}}$`).test(code);
}

export function getInviteUrl(code: string): string {
  return `${window.location.origin}/invite/${code}`;
}
