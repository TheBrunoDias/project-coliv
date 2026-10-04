'use client';

import { House, Megaphone, Repeat, ShoppingCart, Users, type LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  // Routes from later roadmap phases
  disabled?: boolean;
}

const items: NavItem[] = [
  { href: '/', label: 'Início', icon: House },
  { href: '/tasks', label: 'Tarefas', icon: Repeat, disabled: true },
  { href: '/shopping', label: 'Compras', icon: ShoppingCart, disabled: true },
  { href: '/notices', label: 'Mural', icon: Megaphone, disabled: true },
  { href: '/house', label: 'Casa', icon: Users },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-10 border-t border-border bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
      <ul className="mx-auto grid max-w-lg grid-cols-5">
        {items.map(({ href, label, icon: Icon, disabled }) => {
          const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href);
          const content = (
            <>
              <Icon className="size-5" strokeWidth={isActive ? 2.5 : 2} />
              {label}
            </>
          );
          const className = 'flex h-16 flex-col items-center justify-center gap-1 text-xs font-medium';

          return (
            <li key={href}>
              {disabled ? (
                <span aria-disabled="true" title="Em breve" className={`${className} text-muted opacity-40`}>
                  {content}
                </span>
              ) : (
                <Link
                  href={href}
                  aria-current={isActive ? 'page' : undefined}
                  className={`${className} ${isActive ? 'text-brand' : 'text-muted hover:text-foreground'}`}
                >
                  {content}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
