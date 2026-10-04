import type { Metadata } from 'next';
import { RequireAuth } from '@/components/auth/RequireAuth';

export const metadata: Metadata = {
  title: 'Convite',
};

export default function InviteLayout({ children }: LayoutProps<'/invite/[code]'>) {
  return <RequireAuth house="any">{children}</RequireAuth>;
}
