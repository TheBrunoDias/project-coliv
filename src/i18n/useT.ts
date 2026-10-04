'use client';

import { useLocaleStore } from '@/store/useLocaleStore';
import type { Locale } from './config';
import { messages, type Messages } from './messages';

/** UI copy for the current language: `const t = useT(); t.tasks.title`. */
export function useT(): Messages {
  return messages[useLocaleStore((state) => state.locale)];
}

export function useLocale(): Locale {
  return useLocaleStore((state) => state.locale);
}
