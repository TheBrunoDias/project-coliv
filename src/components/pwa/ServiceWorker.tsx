'use client';

import { SerwistProvider } from '@serwist/turbopack/react';
import type { ReactNode } from 'react';

/**
 * Registers the service worker (built from src/app/sw.ts). Disabled in development so
 * cached assets never get in the way of hot reload.
 */
export function ServiceWorker({ children }: { children: ReactNode }) {
  return (
    <SerwistProvider swUrl="/serwist/sw.js" disable={process.env.NODE_ENV === 'development'}>
      {children}
    </SerwistProvider>
  );
}
