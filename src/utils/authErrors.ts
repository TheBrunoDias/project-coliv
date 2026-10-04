import { FirebaseError } from 'firebase/app';

const messages: Record<string, string> = {
  'auth/invalid-credential': 'E-mail ou senha incorretos.',
  'auth/invalid-email': 'E-mail inválido.',
  'auth/user-disabled': 'Esta conta foi desativada.',
  'auth/email-already-in-use': 'Já existe uma conta com este e-mail.',
  'auth/weak-password': 'A senha precisa ter pelo menos 6 caracteres.',
  'auth/too-many-requests': 'Muitas tentativas. Aguarde um pouco e tente novamente.',
  'auth/network-request-failed': 'Sem conexão. Verifique sua internet.',
  'auth/popup-blocked': 'O navegador bloqueou a janela de login. Permita pop-ups e tente novamente.',
  'auth/user-mismatch': 'Entre com a mesma conta que você está usando agora.',
  'auth/requires-recent-login': 'Por segurança, entre novamente e tente outra vez.',
  'auth/missing-password': 'Digite sua senha.',
  'auth/account-exists-with-different-credential':
    'Este e-mail já está cadastrado com outro método de login.',
};

// The user closed the Google popup on purpose: not an error worth showing.
const ignoredCodes = new Set(['auth/popup-closed-by-user', 'auth/cancelled-popup-request']);

/** Returns a user-facing message, or null when the error should be silently ignored. */
export function getAuthErrorMessage(error: unknown): string | null {
  if (error instanceof FirebaseError) {
    if (ignoredCodes.has(error.code)) return null;
    if (messages[error.code]) return messages[error.code];
  }
  return 'Algo deu errado. Tente novamente.';
}
