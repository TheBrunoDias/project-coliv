'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useT } from '@/i18n/useT';
import { registerWithEmail } from '@/services/authService';
import { getAuthErrorMessage } from '@/utils/authErrors';
import { AuthDivider } from './AuthDivider';
import { GoogleSignInButton } from './GoogleSignInButton';

export function RegisterForm() {
  const searchParams = useSearchParams();
  const t = useT();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      // On success GuestOnly redirects once the profile is loaded
      await registerWithEmail(displayName.trim(), email.trim(), password);
    } catch (err) {
      setError(getAuthErrorMessage(err, t.auth.errors));
      setLoading(false);
    }
  }

  const loginHref = searchParams.size ? `/login?${searchParams.toString()}` : '/login';

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold">{t.auth.register.title}</h1>
        <p className="text-muted">{t.auth.register.subtitle}</p>
      </div>

      {error && <Alert>{error}</Alert>}

      <GoogleSignInButton onError={setError} />
      <AuthDivider />

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label={t.auth.register.name}
          autoComplete="name"
          required
          maxLength={60}
          value={displayName}
          onChange={(event) => setDisplayName(event.target.value)}
        />
        <Input
          label={t.auth.email}
          type="email"
          autoComplete="email"
          inputMode="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <Input
          label={t.auth.password}
          type="password"
          autoComplete="new-password"
          required
          minLength={6}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        <Button type="submit" loading={loading}>
          {t.auth.register.submit}
        </Button>
      </form>

      <p className="text-center text-sm text-muted">
        {t.auth.register.haveAccount}{' '}
        <Link href={loginHref} className="font-medium text-brand hover:underline">
          {t.auth.register.signIn}
        </Link>
      </p>
    </div>
  );
}
