'use client';

import { Link2 } from 'lucide-react';
import { useState } from 'react';
import { DeleteAccountDialog } from '@/components/auth/DeleteAccountDialog';
import { CreateHouseForm } from '@/components/house/CreateHouseForm';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { signOutUser } from '@/services/authService';
import { useAuthStore } from '@/store/useAuthStore';

export default function OnboardingPage() {
  const profile = useAuthStore((state) => state.profile);
  const [deleting, setDeleting] = useState(false);

  // RequireAuth only renders this once the profile is loaded
  if (!profile) return null;

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-sm flex-col justify-center gap-6 px-6 py-10">
      <div className="flex flex-col gap-2">
        <p className="text-3xl font-bold tracking-tight text-brand">Coliv</p>
        <h1 className="text-2xl font-semibold">Olá, {profile.displayName.split(' ')[0]}!</h1>
        <p className="text-muted">Você ainda não faz parte de nenhuma casa.</p>
      </div>

      <Card title="Criar uma casa" description="Você será o admin e poderá convidar os moradores.">
        <CreateHouseForm profile={profile} />
      </Card>

      <Card>
        <div className="flex gap-3">
          <Link2 className="mt-0.5 size-5 shrink-0 text-brand" />
          <div className="flex flex-col gap-0.5">
            <p className="font-semibold">Recebeu um convite?</p>
            <p className="text-sm text-muted">
              Abra o link que o admin da casa compartilhou com você para entrar.
            </p>
          </div>
        </div>
      </Card>

      <div className="flex flex-col gap-1">
        <Button variant="ghost" onClick={() => signOutUser()}>
          Sair da conta
        </Button>
        <Button variant="ghost" size="sm" className="hover:text-danger" onClick={() => setDeleting(true)}>
          Excluir conta
        </Button>
      </div>

      <DeleteAccountDialog open={deleting} onClose={() => setDeleting(false)} house={null} />
    </main>
  );
}
