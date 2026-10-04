import type { User as FirebaseUser } from 'firebase/auth';
import { create } from 'zustand';
import type { User } from '@/types';

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated' | 'error';

interface AuthState {
  status: AuthStatus;
  firebaseUser: FirebaseUser | null;
  // Firestore profile; only set once status is 'authenticated'
  profile: User | null;
  error: string | null;
  setLoading: () => void;
  setAuthenticated: (firebaseUser: FirebaseUser, profile: User) => void;
  setUnauthenticated: () => void;
  setError: (error: string) => void;
}

export const useAuthStore = create<AuthState>()((set) => ({
  status: 'loading',
  firebaseUser: null,
  profile: null,
  error: null,
  setLoading: () => set({ status: 'loading', error: null }),
  setAuthenticated: (firebaseUser, profile) =>
    set({ status: 'authenticated', firebaseUser, profile, error: null }),
  setUnauthenticated: () =>
    set({ status: 'unauthenticated', firebaseUser: null, profile: null, error: null }),
  setError: (error) => set({ status: 'error', error }),
}));
