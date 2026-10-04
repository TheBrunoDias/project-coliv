'use client';

import { WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useT } from '@/i18n/useT';

/** Precached by the service worker; shown when navigating to an uncached page offline. */
export default function OfflinePage() {
  const t = useT();

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-sm flex-col justify-center gap-6 px-6 text-center">
      <span className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-brand/15 text-brand">
        <WifiOff className="size-8" />
      </span>
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold">{t.offline.title}</h1>
        <p className="text-muted">{t.offline.description}</p>
      </div>
      <div className="flex flex-col gap-2">
        <Button onClick={() => window.location.reload()}>{t.offline.retry}</Button>
        {/* A full page load (not client navigation) lets the service worker serve the cached home */}
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <a
          href="/"
          className="inline-flex h-12 items-center justify-center rounded-xl px-4 font-medium text-muted hover:bg-surface-muted hover:text-foreground"
        >
          {t.offline.goHome}
        </a>
      </div>
    </main>
  );
}
