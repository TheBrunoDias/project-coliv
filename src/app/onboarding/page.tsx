'use client';

import { Button } from '@/components/ui/Button';
import { signOutUser } from '@/services/authService';
import { useAuthStore } from '@/store/useAuthStore';

// Placeholder until Phase 2 (create house / join via invite link)
export default function OnboardingPage() {
  const profile = useAuthStore((state) => state.profile);

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-sm flex-col justify-center gap-6 px-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold">Olá, {profile?.displayName}!</h1>
        <p className="text-muted">
          Você ainda não faz parte de nenhuma casa. Crie uma nova casa ou peça o link de convite
          para quem administra a sua.
        </p>
      </div>
      <Button disabled>Criar uma casa (em breve)</Button>
      <Button variant="ghost" onClick={() => signOutUser()}>
        Sair
      </Button>
    </main>
  );
}
