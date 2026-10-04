import { RequireAuth } from '@/components/auth/RequireAuth';

export default function DashboardLayout({ children }: LayoutProps<'/'>) {
  return <RequireAuth house="required">{children}</RequireAuth>;
}
