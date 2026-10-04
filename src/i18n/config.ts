export const LOCALES = ['pt-BR', 'en'] as const;
export type Locale = (typeof LOCALES)[number];

// Used for the server prerender and until the browser language is detected
export const DEFAULT_LOCALE: Locale = 'pt-BR';

// Shown in the language picker, each in its own language
export const LOCALE_NAMES: Record<Locale, string> = {
  'pt-BR': 'Português (Brasil)',
  en: 'English',
};

export const LOCALE_STORAGE_KEY = 'coliv.locale';

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (LOCALES as readonly string[]).includes(value);
}

/** Portuguese browsers get pt-BR; everything else gets English. */
export function detectBrowserLocale(): Locale {
  const languages = navigator.languages?.length ? navigator.languages : [navigator.language];
  return languages.some((language) => language.toLowerCase().startsWith('pt')) ? 'pt-BR' : 'en';
}
