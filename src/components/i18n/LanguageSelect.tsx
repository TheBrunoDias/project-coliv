'use client';

import { Languages } from 'lucide-react';
import { useId } from 'react';
import { changeLocale } from '@/i18n/changeLocale';
import { isLocale, LOCALE_NAMES, LOCALES } from '@/i18n/config';
import { useLocale, useT } from '@/i18n/useT';

export function LanguageSelect({ className = '' }: { className?: string }) {
  const t = useT();
  const locale = useLocale();
  const id = useId();

  return (
    <div className={`flex items-center justify-center gap-2 text-sm text-muted ${className}`}>
      <Languages className="size-4" aria-hidden="true" />
      <label htmlFor={id} className="sr-only">
        {t.common.language}
      </label>
      <select
        id={id}
        value={locale}
        onChange={(event) => {
          const value = event.target.value;
          if (isLocale(value)) {
            changeLocale(value).catch((err: unknown) => console.error('Failed to save language', err));
          }
        }}
        className="rounded-lg bg-transparent py-1 pr-1 font-medium text-foreground outline-none focus:ring-2 focus:ring-brand/20"
      >
        {LOCALES.map((value) => (
          <option key={value} value={value}>
            {LOCALE_NAMES[value]}
          </option>
        ))}
      </select>
    </div>
  );
}
