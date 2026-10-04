'use client';

import { Button } from '@/components/ui/Button';
import { useT } from '@/i18n/useT';
import { signOutUser } from '@/services/authService';
import { useAuthStore } from '@/store/useAuthStore';

export function AuthErrorScreen() {
  const error = useAuthStore((state) => state.error);
  const t = useT();

  return (
    <div className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center gap-4 px-6 text-center">
      <h1 className="text-xl font-semibold">{t.auth.errorScreen.title}</h1>
      <p className="text-muted">{error ? t.auth.errorScreen[error] : t.auth.errorScreen.generic}</p>
      <Button onClick={() => window.location.reload()}>{t.auth.errorScreen.retry}</Button>
      <Button variant="ghost" onClick={() => signOutUser()}>
        {t.auth.errorScreen.signOut}
      </Button>
    </div>
  );
}
