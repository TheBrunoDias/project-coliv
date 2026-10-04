'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useT } from '@/i18n/useT';
import { sendPasswordReset, signInWithEmail } from '@/services/authService';
import { getAuthErrorMessage } from '@/utils/authErrors';
import { AuthDivider } from './AuthDivider';
import { GoogleSignInButton } from './GoogleSignInButton';

export function LoginForm() {
  const searchParams = useSearchParams();
  const t = useT();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setNotice(null);
    setLoading(true);
    try {
      // On success GuestOnly redirects once the profile is loaded
      await signInWithEmail(email.trim(), password);
    } catch (err) {
      setError(getAuthErrorMessage(err, t.auth.errors));
      setLoading(false);
    }
  }

  async function handleForgotPassword() {
    setError(null);
    setNotice(null);
    if (!email.trim()) {
      setError(t.auth.login.resetNeedsEmail);
      return;
    }
    try {
      await sendPasswordReset(email.trim());
      setNotice(t.auth.login.resetSent);
    } catch (err) {
      setError(getAuthErrorMessage(err, t.auth.errors));
    }
  }

  const registerHref = searchParams.size
    ? `/register?${searchParams.toString()}`
    : '/register';

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold">{t.auth.login.title}</h1>
        <p className="text-muted">{t.auth.login.subtitle}</p>
      </div>

      {error && <Alert>{error}</Alert>}
      {notice && <Alert tone="success">{notice}</Alert>}

      <GoogleSignInButton onError={setError} />
      <AuthDivider />

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
          autoComplete="current-password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        <button
          type="button"
          onClick={handleForgotPassword}
          className="self-end text-sm font-medium text-brand hover:underline"
        >
          {t.auth.login.forgotPassword}
        </button>
        <Button type="submit" loading={loading}>
          {t.auth.login.submit}
        </Button>
      </form>

      <p className="text-center text-sm text-muted">
        {t.auth.login.noAccount}{' '}
        <Link href={registerHref} className="font-medium text-brand hover:underline">
          {t.auth.login.createAccount}
        </Link>
      </p>
    </div>
  );
}
