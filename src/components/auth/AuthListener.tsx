'use client';

import { useAuthListener } from '@/hooks/useAuthListener';

export function AuthListener() {
  useAuthListener();
  return null;
}
