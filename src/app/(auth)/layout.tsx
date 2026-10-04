import { Suspense } from 'react';
import { GuestOnly } from '@/components/auth/GuestOnly';
import { FullScreenLoader } from '@/components/ui/FullScreenLoader';

export default function AuthLayout({ children }: LayoutProps<'/'>) {
  return (
    // GuestOnly and the forms read the `redirect` search param
    <Suspense fallback={<FullScreenLoader />}>
      <GuestOnly>
        <main className="mx-auto flex min-h-dvh w-full max-w-sm flex-col justify-center gap-8 px-6 py-10">
          <p className="text-center text-3xl font-bold tracking-tight text-brand">Coliv</p>
          {children}
        </main>
      </GuestOnly>
    </Suspense>
  );
}
