'use client';

import { useT } from '@/i18n/useT';

export function AuthDivider() {
  const t = useT();
  return (
    <div className="flex items-center gap-3 text-sm text-muted">
      <span className="h-px flex-1 bg-border" />
      {t.common.or}
      <span className="h-px flex-1 bg-border" />
    </div>
  );
}
