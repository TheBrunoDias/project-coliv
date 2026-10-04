'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { sendPasswordReset, signInWithEmail } from '@/services/authService';
import { getAuthErrorMessage } from '@/utils/authErrors';
import { AuthDivider } from './AuthDivider';
import { GoogleSignInButton } from './GoogleSignInButton';

export function LoginForm() {
  const searchParams = useSearchParams();
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
      setError(getAuthErrorMessage(err));
      setLoading(false);
    }
  }

  async function handleForgotPassword() {
    setError(null);
    setNotice(null);
    if (!email.trim()) {
      setError('Digite seu e-mail acima para redefinir a senha.');
      return;
    }
    try {
      await sendPasswordReset(email.trim());
      setNotice('Se houver uma conta com este e-mail, você receberá um link para redefinir a senha.');
    } catch (err) {
      setError(getAuthErrorMessage(err));
    }
  }

  const registerHref = searchParams.size
    ? `/register?${searchParams.toString()}`
    : '/register';

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold">Entrar</h1>
        <p className="text-muted">Bem-vindo de volta à sua casa.</p>
      </div>

      {error && <Alert>{error}</Alert>}
      {notice && <Alert tone="success">{notice}</Alert>}

      <GoogleSignInButton onError={setError} />
      <AuthDivider />

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="E-mail"
          type="email"
          autoComplete="email"
          inputMode="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <Input
          label="Senha"
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
          Esqueci minha senha
        </button>
        <Button type="submit" loading={loading}>
          Entrar
        </Button>
      </form>

      <p className="text-center text-sm text-muted">
        Ainda não tem conta?{' '}
        <Link href={registerHref} className="font-medium text-brand hover:underline">
          Criar conta
        </Link>
      </p>
    </div>
  );
}
