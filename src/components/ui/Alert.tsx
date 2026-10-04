import type { ReactNode } from 'react';

type Tone = 'error' | 'success';

const toneClasses: Record<Tone, string> = {
  error: 'bg-danger/10 text-danger',
  success: 'bg-brand/10 text-brand-strong',
};

export function Alert({ tone = 'error', children }: { tone?: Tone; children: ReactNode }) {
  return (
    <p role={tone === 'error' ? 'alert' : 'status'} className={`rounded-xl px-4 py-3 text-sm ${toneClasses[tone]}`}>
      {children}
    </p>
  );
}
