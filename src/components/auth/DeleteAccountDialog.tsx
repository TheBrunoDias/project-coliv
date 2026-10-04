'use client';

import { useState, type FormEvent } from 'react';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { Input } from '@/components/ui/Input';
import { deleteAccount } from '@/services/accountService';
import { getSignInMethod, reauthenticate } from '@/services/authService';
import { useAuthStore } from '@/store/useAuthStore';
import type { House } from '@/types';
import { getAuthErrorMessage } from '@/utils/authErrors';

const CONFIRM_WORD = 'EXCLUIR';

interface DeleteAccountDialogProps {
  open: boolean;
  onClose: () => void;
  // The user's current house, if any
  house: House | null;
}

export function DeleteAccountDialog({ open, onClose, house }: DeleteAccountDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} title="Excluir conta?">
      <DeleteAccountForm house={house} />
    </Dialog>
  );
}

function DeleteAccountForm({ house }: { house: House | null }) {
  const firebaseUser = useAuthStore((state) => state.firebaseUser);
  const [typed, setTyped] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!firebaseUser) return null;

  const method = getSignInMethod(firebaseUser);
  const isAdmin = house?.ownerId === firebaseUser.uid;
  const canSubmit = typed.trim().toUpperCase() === CONFIRM_WORD && (method === 'google' || password);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!firebaseUser) return;
    setError(null);
    setLoading(true);

    // Reauthenticate first (must run right after the click, or the Google popup gets blocked)
    try {
      await reauthenticate(firebaseUser, password);
    } catch (err) {
      const message = getAuthErrorMessage(err);
      if (message) setError(message);
      setLoading(false);
      return;
    }

    // From here the dashboard unmounts behind a loader; failures go to the global error screen
    const { setDeletingAccount, setError: setAuthError } = useAuthStore.getState();
    setDeletingAccount(true);
    try {
      await deleteAccount(firebaseUser, house);
      // onAuthStateChanged(null) now signs the user out and sends them to /login
    } catch (err) {
      console.error('Failed to delete account', err);
      setAuthError('Não foi possível excluir sua conta por completo. Tente novamente.');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2 text-muted">
        <p>Esta ação não pode ser desfeita. Seu perfil e seu login serão apagados.</p>
        {house && isAdmin && (
          <p className="font-medium text-danger">
            Como você é admin, a casa &quot;{house.name}&quot; também será excluída, com todos os
            moradores, tarefas, compras e avisos.
          </p>
        )}
        {house && !isAdmin && <p>Você sairá da casa &quot;{house.name}&quot;.</p>}
      </div>

      <Input
        label={`Digite "${CONFIRM_WORD}" para confirmar`}
        value={typed}
        onChange={(event) => setTyped(event.target.value)}
        autoComplete="off"
      />

      {method === 'password' ? (
        <Input
          label="Sua senha"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      ) : (
        <p className="text-sm text-muted">
          Por segurança, vamos pedir para você entrar com o Google mais uma vez.
        </p>
      )}

      {error && <Alert>{error}</Alert>}

      <Button type="submit" variant="danger" loading={loading} disabled={!canSubmit}>
        Excluir minha conta
      </Button>
    </form>
  );
}
