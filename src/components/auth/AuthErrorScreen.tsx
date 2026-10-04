'use client';

import { Button } from '@/components/ui/Button';
import { signOutUser } from '@/services/authService';
import { useAuthStore } from '@/store/useAuthStore';

export function AuthErrorScreen() {
  const error = useAuthStore((state) => state.error);

  return (
    <div className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center gap-4 px-6 text-center">
      <h1 className="text-xl font-semibold">Ops!</h1>
      <p className="text-muted">{error ?? 'Algo deu errado.'}</p>
      <Button onClick={() => window.location.reload()}>Tentar novamente</Button>
      <Button variant="ghost" onClick={() => signOutUser()}>
        Sair
      </Button>
    </div>
  );
}
