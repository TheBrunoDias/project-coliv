import { FirebaseError } from 'firebase/app';
import type { Messages } from '@/i18n/messages';

type AuthErrorMessages = Messages['auth']['errors'];

// The user closed the Google popup on purpose: not an error worth showing.
const ignoredCodes = new Set(['auth/popup-closed-by-user', 'auth/cancelled-popup-request']);

/** Returns a user-facing message, or null when the error should be silently ignored. */
export function getAuthErrorMessage(error: unknown, messages: AuthErrorMessages): string | null {
  if (error instanceof FirebaseError) {
    if (ignoredCodes.has(error.code)) return null;
    if (error.code in messages) return messages[error.code as keyof AuthErrorMessages];
  }
  return messages.generic;
}
