'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';
import { FullScreenLoader } from '@/components/ui/FullScreenLoader';
import { useAuthStore } from '@/store/useAuthStore';
import { getSafeRedirect } from '@/utils/redirect';
import { AuthErrorScreen } from './AuthErrorScreen';

/** Renders auth pages only for signed-out users; signed-in users go to `?redirect=` or home. */
export function GuestOnly({ children }: { children: ReactNode }) {
  const status = useAuthStore((state) => state.status);
  const router = useRouter();
  const redirect = getSafeRedirect(useSearchParams().get('redirect'));

  useEffect(() => {
    if (status === 'authenticated') router.replace(redirect);
  }, [status, redirect, router]);

  if (status === 'error') return <AuthErrorScreen />;
  if (status !== 'unauthenticated') return <FullScreenLoader />;

  return children;
}
