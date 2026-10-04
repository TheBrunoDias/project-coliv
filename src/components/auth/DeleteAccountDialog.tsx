'use client';

import { useState, type FormEvent } from 'react';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { Input } from '@/components/ui/Input';
import { useT } from '@/i18n/useT';
import { deleteAccount } from '@/services/accountService';
import { getSignInMethod, reauthenticate } from '@/services/authService';
import { useAuthStore } from '@/store/useAuthStore';
import type { House } from '@/types';
import { getAuthErrorMessage } from '@/utils/authErrors';

interface DeleteAccountDialogProps {
  open: boolean;
  onClose: () => void;
  // The user's current house, if any
  house: House | null;
}

export function DeleteAccountDialog({ open, onClose, house }: DeleteAccountDialogProps) {
  const t = useT();
  return (
    <Dialog open={open} onClose={onClose} title={t.deleteAccount.title}>
      <DeleteAccountForm house={house} />
    </Dialog>
  );
}

function DeleteAccountForm({ house }: { house: House | null }) {
  const firebaseUser = useAuthStore((state) => state.firebaseUser);
  const t = useT();
  const [typed, setTyped] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!firebaseUser) return null;

  const method = getSignInMethod(firebaseUser);
  const isAdmin = house?.ownerId === firebaseUser.uid;
  const confirmWord = t.deleteAccount.confirmWord;
  const canSubmit = typed.trim().toUpperCase() === confirmWord && (method === 'google' || password);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!firebaseUser) return;
    setError(null);
    setLoading(true);

    // Reauthenticate first (must run right after the click, or the Google popup gets blocked)
    try {
      await reauthenticate(firebaseUser, password);
    } catch (err) {
      const message = getAuthErrorMessage(err, t.auth.errors);
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
      setAuthError('deleteAccount');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2 text-muted">
        <p>{t.deleteAccount.warning}</p>
        {house && isAdmin && (
          <p className="font-medium text-danger">{t.deleteAccount.adminWarning(house.name)}</p>
        )}
        {house && !isAdmin && <p>{t.deleteAccount.residentWarning(house.name)}</p>}
      </div>

      <Input
        label={t.common.typeToConfirm(confirmWord)}
        value={typed}
        onChange={(event) => setTyped(event.target.value)}
        autoComplete="off"
      />

      {method === 'password' ? (
        <Input
          label={t.deleteAccount.passwordLabel}
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      ) : (
        <p className="text-sm text-muted">{t.deleteAccount.googleReauth}</p>
      )}

      {error && <Alert>{error}</Alert>}

      <Button type="submit" variant="danger" loading={loading} disabled={!canSubmit}>
        {t.deleteAccount.submit}
      </Button>
    </form>
  );
}
