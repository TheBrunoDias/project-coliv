'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';
import { FullScreenLoader } from '@/components/ui/FullScreenLoader';
import { useAuthStore, type AuthStatus } from '@/store/useAuthStore';
import type { User } from '@/types';
import { AuthErrorScreen } from './AuthErrorScreen';

/**
 * - `required`: user must belong to a house (dashboard routes)
 * - `forbidden`: user must NOT belong to a house (onboarding)
 * - `any`: only authentication is required (invite page)
 */
type HouseRequirement = 'required' | 'forbidden' | 'any';

function getRedirectTarget(
  status: AuthStatus,
  profile: User | null,
  house: HouseRequirement,
  pathname: string,
): string | null {
  if (status === 'unauthenticated') {
    return `/login?redirect=${encodeURIComponent(pathname)}`;
  }
  if (status !== 'authenticated' || !profile) return null;
  if (house === 'required' && !profile.houseId) return '/onboarding';
  if (house === 'forbidden' && profile.houseId) return '/';
  return null;
}

export function RequireAuth({
  children,
  house = 'required',
}: {
  children: ReactNode;
  house?: HouseRequirement;
}) {
  const status = useAuthStore((state) => state.status);
  const profile = useAuthStore((state) => state.profile);
  const router = useRouter();
  const pathname = usePathname();

  const target = getRedirectTarget(status, profile, house, pathname);

  useEffect(() => {
    if (target) router.replace(target);
  }, [target, router]);

  if (status === 'error') return <AuthErrorScreen />;
  if (target || status !== 'authenticated') return <FullScreenLoader />;

  return children;
}
