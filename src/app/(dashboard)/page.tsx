'use client';

import { Button } from '@/components/ui/Button';
import { signOutUser } from '@/services/authService';
import { useAuthStore } from '@/store/useAuthStore';

// Placeholder until Phase 3 ("who's on duty now")
export default function DashboardPage() {
  const profile = useAuthStore((state) => state.profile);

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-sm flex-col justify-center gap-6 px-6">
      <h1 className="text-2xl font-semibold">Olá, {profile?.displayName}!</h1>
      <Button variant="secondary" onClick={() => signOutUser()}>
        Sair
      </Button>
    </main>
  );
}
