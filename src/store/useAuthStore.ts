import type { User as FirebaseUser } from 'firebase/auth';
import { create } from 'zustand';
import type { User } from '@/types';

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated' | 'error';
// Translated by AuthErrorScreen (t.auth.errorScreen)
export type AuthErrorCode = 'profileLoad' | 'deleteAccount';

interface AuthState {
  status: AuthStatus;
  firebaseUser: FirebaseUser | null;
  // Firestore profile; only set once status is 'authenticated'
  profile: User | null;
  error: AuthErrorCode | null;
  // Keeps the UI on a loader (no redirects) while the account is being deleted
  deletingAccount: boolean;
  setLoading: () => void;
  setAuthenticated: (firebaseUser: FirebaseUser, profile: User) => void;
  setUnauthenticated: () => void;
  setError: (error: AuthErrorCode) => void;
  setDeletingAccount: (deletingAccount: boolean) => void;
}

export const useAuthStore = create<AuthState>()((set) => ({
  status: 'loading',
  firebaseUser: null,
  profile: null,
  error: null,
  deletingAccount: false,
  setLoading: () => set({ status: 'loading', error: null }),
  setAuthenticated: (firebaseUser, profile) =>
    set({ status: 'authenticated', firebaseUser, profile, error: null }),
  setUnauthenticated: () =>
    set({
      status: 'unauthenticated',
      firebaseUser: null,
      profile: null,
      error: null,
      deletingAccount: false,
    }),
  setError: (error) => set({ status: 'error', error, deletingAccount: false }),
  setDeletingAccount: (deletingAccount) =>
    set(deletingAccount ? { deletingAccount, status: 'loading' } : { deletingAccount }),
}));
