import type { ReactNode } from 'react';

interface CardProps {
  title?: string;
  description?: ReactNode;
  action?: ReactNode;
  children?: ReactNode;
  className?: string;
}

export function Card({ title, description, action, children, className = '' }: CardProps) {
  return (
    <section
      className={`flex flex-col gap-4 rounded-2xl border border-border bg-surface p-4 ${className}`}
    >
      {(title || action) && (
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-0.5">
            {title && <h2 className="font-semibold">{title}</h2>}
            {description && <p className="text-sm text-muted">{description}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}
