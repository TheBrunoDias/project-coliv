import { create } from 'zustand';
import { DEFAULT_LOCALE, type Locale } from '@/i18n/config';

interface LocaleState {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

export const useLocaleStore = create<LocaleState>()((set) => ({
  locale: DEFAULT_LOCALE,
  setLocale: (locale) => set({ locale }),
}));
