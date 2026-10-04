'use client';

import { onAuthStateChanged } from 'firebase/auth';
import { useEffect } from 'react';
import { auth } from '@/lib/firebase';
import { ensureUserProfile, subscribeToUserProfile } from '@/services/userService';
import { useAuthStore } from '@/store/useAuthStore';

/** Keeps useAuthStore in sync with Firebase Auth and the user's Firestore profile. Mount once. */
export function useAuthListener() {
  useEffect(() => {
    const { setLoading, setAuthenticated, setUnauthenticated, setError } =
      useAuthStore.getState();

    let unsubscribeProfile: (() => void) | undefined;
    // Incremented on every auth change so stale async work can bail out
    let session = 0;

    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      unsubscribeProfile?.();
      unsubscribeProfile = undefined;
      const currentSession = ++session;

      if (!firebaseUser) {
        setUnauthenticated();
        return;
      }

      setLoading();
      ensureUserProfile(firebaseUser)
        .then(() => {
          if (currentSession !== session) return;
          unsubscribeProfile = subscribeToUserProfile(
            firebaseUser.uid,
            (profile) => {
              // While deleting the account the profile changes and disappears on purpose
              if (useAuthStore.getState().deletingAccount) return;
              if (profile) setAuthenticated(firebaseUser, profile);
              else setError('profileLoad');
            },
            (error) => {
              if (useAuthStore.getState().deletingAccount) return;
              console.error('Profile listener failed', error);
              setError('profileLoad');
            },
          );
        })
        .catch((error: unknown) => {
          if (currentSession !== session) return;
          console.error('Failed to create user profile', error);
          setError('profileLoad');
        });
    });

    return () => {
      session++;
      unsubscribeAuth();
      unsubscribeProfile?.();
    };
  }, []);
}
