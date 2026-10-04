import { RequireAuth } from '@/components/auth/RequireAuth';

export default function InviteLayout({ children }: LayoutProps<'/invite/[code]'>) {
  return <RequireAuth house="any">{children}</RequireAuth>;
}
