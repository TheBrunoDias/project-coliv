'use client';

import { LogOut, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { DeleteAccountDialog } from '@/components/auth/DeleteAccountDialog';
import { LanguageSelect } from '@/components/i18n/LanguageSelect';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useT } from '@/i18n/useT';
import { signOutUser } from '@/services/authService';
import { useAuthStore } from '@/store/useAuthStore';
import { useHouseStore } from '@/store/useHouseStore';

export function AccountCard() {
  const profile = useAuthStore((state) => state.profile);
  const house = useHouseStore((state) => state.house);
  const [deleting, setDeleting] = useState(false);
  const t = useT();

  if (!profile) return null;

  return (
    <Card title={t.house.account.title} action={<LanguageSelect />}>
      <div className="flex items-center gap-3">
        <Avatar name={profile.displayName} photoURL={profile.photoURL} />
        <div className="min-w-0">
          <p className="truncate font-medium">{profile.displayName}</p>
          <p className="truncate text-sm text-muted">{profile.email}</p>
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <Button variant="secondary" size="sm" onClick={() => signOutUser()}>
          <LogOut className="size-4" />
          {t.common.signOut}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="hover:text-danger"
          onClick={() => setDeleting(true)}
        >
          <Trash2 className="size-4" />
          {t.common.deleteAccount}
        </Button>
      </div>

      <DeleteAccountDialog open={deleting} onClose={() => setDeleting(false)} house={house} />
    </Card>
  );
}
