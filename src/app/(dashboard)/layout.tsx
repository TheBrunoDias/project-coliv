import { RequireAuth } from '@/components/auth/RequireAuth';
import { DashboardShell } from '@/components/navigation/DashboardShell';

export default function DashboardLayout({ children }: LayoutProps<'/'>) {
  return (
    <RequireAuth house="required">
      <DashboardShell>{children}</DashboardShell>
    </RequireAuth>
  );
}
