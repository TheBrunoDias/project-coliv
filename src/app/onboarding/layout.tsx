import type { Metadata } from 'next';
import { RequireAuth } from '@/components/auth/RequireAuth';

export const metadata: Metadata = {
  title: 'Bem-vindo',
};

export default function OnboardingLayout({ children }: LayoutProps<'/onboarding'>) {
  return <RequireAuth house="forbidden">{children}</RequireAuth>;
}
