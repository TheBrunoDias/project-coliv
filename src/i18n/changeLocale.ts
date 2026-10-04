import { updateUserLocale } from '@/services/userService';
import { useAuthStore } from '@/store/useAuthStore';
import { useLocaleStore } from '@/store/useLocaleStore';
import { LOCALE_STORAGE_KEY, type Locale } from './config';

export function saveLocaleLocally(locale: Locale) {
  try {
    localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  } catch {
    // Private mode / blocked storage: the choice just won't persist on this device
  }
}

/** Switches the UI language and remembers it on this device and in the user's profile. */
export async function changeLocale(locale: Locale): Promise<void> {
  useLocaleStore.getState().setLocale(locale);
  saveLocaleLocally(locale);
  const uid = useAuthStore.getState().profile?.uid;
  if (uid) await updateUserLocale(uid, locale);
}
