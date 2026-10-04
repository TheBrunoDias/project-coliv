'use client';

import { useT } from '@/i18n/useT';

export function Spinner({ className = 'size-6' }: { className?: string }) {
  const t = useT();
  return (
    <span
      role="status"
      aria-label={t.common.loading}
      className={`inline-block animate-spin rounded-full border-2 border-current border-t-transparent ${className}`}
    />
  );
}
