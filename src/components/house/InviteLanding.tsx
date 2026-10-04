'use client';

import { House } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { FullScreenLoader } from '@/components/ui/FullScreenLoader';
import { useT } from '@/i18n/useT';
import { signOutUser } from '@/services/authService';
import { getInvite, joinHouse } from '@/services/houseService';
import { useAuthStore } from '@/store/useAuthStore';
import type { Invite } from '@/types';

type InviteState = { status: 'loading' } | { status: 'ready'; invite: Invite | null };

/** Must be rendered inside <RequireAuth house="any">. */
export function InviteLanding({ code }: { code: string }) {
  const profile = useAuthStore((state) => state.profile);
  const router = useRouter();
  const t = useT();
  const [state, setState] = useState<InviteState>({ status: 'loading' });
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getInvite(code)
      .then((invite) => {
        if (!cancelled) setState({ status: 'ready', invite });
      })
      .catch((err: unknown) => {
        console.error('Failed to load invite', err);
        if (!cancelled) setState({ status: 'ready', invite: null });
      });
    return () => {
      cancelled = true;
    };
  }, [code]);

  if (!profile || state.status === 'loading') return <FullScreenLoader />;

  const { invite } = state;

  async function handleJoin() {
    if (!profile || !invite) return;
    setError(null);
    setJoining(true);
    try {
      await joinHouse(code, invite.houseId, profile);
      router.replace('/');
    } catch (err) {
      console.error(err);
      setError(t.invite.joinError);
      setJoining(false);
    }
  }

  if (!invite) {
    return (
      <InviteLayout
        title={t.invite.invalidTitle}
        description={t.invite.invalidDescription}
      >
        <Link href="/" className="text-center font-medium text-brand hover:underline">
          {t.invite.backHome}
        </Link>
      </InviteLayout>
    );
  }

  if (profile.houseId === invite.houseId) {
    return (
      <InviteLayout title={invite.houseName} description={t.invite.alreadyMember}>
        <Button onClick={() => router.replace('/')}>{t.invite.goToHouse}</Button>
      </InviteLayout>
    );
  }

  if (profile.houseId) {
    return (
      <InviteLayout
        title={t.invite.otherHouseTitle(invite.houseName)}
        description={t.invite.otherHouseDescription}
      >
        <Button onClick={() => router.push('/house')}>{t.invite.goToMyHouse}</Button>
      </InviteLayout>
    );
  }

  return (
    <InviteLayout title={invite.houseName} description={t.invite.invited}>
      {error && <Alert>{error}</Alert>}
      <Button loading={joining} onClick={handleJoin}>
        {t.invite.join}
      </Button>
      <Button variant="ghost" disabled={joining} onClick={() => signOutUser()}>
        {t.invite.switchAccount(profile.displayName.split(' ')[0])}
      </Button>
    </InviteLayout>
  );
}

function InviteLayout({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-sm flex-col justify-center gap-6 px-6 py-10">
      <div className="flex flex-col items-center gap-3 text-center">
        <span className="flex size-16 items-center justify-center rounded-2xl bg-brand/15 text-brand">
          <House className="size-8" />
        </span>
        <h1 className="text-2xl font-semibold">{title}</h1>
        <p className="text-muted">{description}</p>
      </div>
      <div className="flex flex-col gap-2">{children}</div>
    </main>
  );
}
