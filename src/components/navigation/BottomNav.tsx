'use client';

import { House, Megaphone, Repeat, ShoppingCart, Users, type LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useT } from '@/i18n/useT';
import type { Messages } from '@/i18n/messages';

interface NavItem {
  href: string;
  label: keyof Messages['nav'];
  icon: LucideIcon;
}

const items: NavItem[] = [
  { href: '/', label: 'home', icon: House },
  { href: '/tasks', label: 'tasks', icon: Repeat },
  { href: '/shopping', label: 'shopping', icon: ShoppingCart },
  { href: '/notices', label: 'notices', icon: Megaphone },
  { href: '/house', label: 'house', icon: Users },
];

export function BottomNav() {
  const pathname = usePathname();
  const t = useT();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-10 border-t border-border bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
      <ul className="mx-auto grid max-w-lg grid-cols-5">
        {items.map(({ href, label, icon: Icon }) => {
          const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={isActive ? 'page' : undefined}
                className={`flex h-16 flex-col items-center justify-center gap-1 text-xs font-medium ${isActive ? 'text-brand' : 'text-muted hover:text-foreground'}`}
              >
                <Icon className="size-5" strokeWidth={isActive ? 2.5 : 2} />
                {t.nav[label]}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
