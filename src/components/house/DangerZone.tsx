'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { deleteHouse, leaveHouse } from '@/services/houseService';
import { useAuthStore } from '@/store/useAuthStore';
import type { House } from '@/types';

/** Residents can leave; the admin can only delete the whole house. */
export function DangerZone({ house }: { house: House }) {
  const uid = useAuthStore((state) => state.profile?.uid);
  const isAdmin = useIsAdmin();
  const [confirming, setConfirming] = useState(false);

  if (!uid) return null;

  return (
    <Card
      title={isAdmin ? 'Excluir casa' : 'Sair da casa'}
      description={
        isAdmin
          ? 'Como admin, para sair você precisa excluir a casa. Todos os moradores, tarefas, compras e avisos serão apagados.'
          : 'Você deixará de ver as tarefas, compras e avisos desta casa.'
      }
      className="border-danger/30"
    >
      <Button variant="danger" size="sm" onClick={() => setConfirming(true)}>
        {isAdmin ? 'Excluir casa' : 'Sair da casa'}
      </Button>

      {isAdmin ? (
        <ConfirmDialog
          open={confirming}
          onClose={() => setConfirming(false)}
          title="Excluir casa?"
          description="Esta ação não pode ser desfeita. Todos os dados da casa serão apagados permanentemente."
          confirmText={house.name}
          confirmLabel="Excluir casa"
          danger
          onConfirm={() => deleteHouse(house, uid)}
        />
      ) : (
        <ConfirmDialog
          open={confirming}
          onClose={() => setConfirming(false)}
          title="Sair da casa?"
          description="Para voltar, você precisará de um novo convite."
          confirmLabel="Sair da casa"
          danger
          onConfirm={() => leaveHouse(house.id, uid)}
        />
      )}
    </Card>
  );
}
