'use client';

import { useEffect } from 'react';
import { saveLocaleLocally } from '@/i18n/changeLocale';
import { detectBrowserLocale, isLocale, LOCALE_STORAGE_KEY } from '@/i18n/config';
import { useAuthStore } from '@/store/useAuthStore';
import { useLocaleStore } from '@/store/useLocaleStore';

/**
 * Picks the UI language: the user's profile choice, else the one saved on this device,
 * else the browser language. Mount once in the root layout.
 */
export function LocaleSync() {
  const profileLocale = useAuthStore((state) => state.profile?.locale);
  const locale = useLocaleStore((state) => state.locale);

  useEffect(() => {
    let saved: string | null = null;
    try {
      saved = localStorage.getItem(LOCALE_STORAGE_KEY);
    } catch {
      // Storage unavailable: fall back to the browser language
    }
    useLocaleStore.getState().setLocale(isLocale(saved) ? saved : detectBrowserLocale());
  }, []);

  useEffect(() => {
    if (!profileLocale) return;
    useLocaleStore.getState().setLocale(profileLocale);
    saveLocaleLocally(profileLocale);
  }, [profileLocale]);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return null;
}
