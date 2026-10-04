import { RequireAuth } from '@/components/auth/RequireAuth';

export default function OnboardingLayout({ children }: LayoutProps<'/onboarding'>) {
  return <RequireAuth house="forbidden">{children}</RequireAuth>;
}
