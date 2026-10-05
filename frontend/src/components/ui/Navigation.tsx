'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Icon, LogoMark } from '@/components/Icon';
import { initials, roleLabel } from '@/lib/api';

export interface NavItem {
  label: string;
  href: string;
  icon?: React.ReactNode | string;
  roles?: string[];
}

export interface NavigationProps {
  items?: NavItem[];
  logoText?: string;
  logoHref?: string;
}

export const DEFAULT_NAV: NavItem[] = [
  { label: 'Home', href: '/dashboard', icon: 'home' },
  { label: 'Library', href: '/tools', icon: 'grid' },
  { label: 'My kit', href: '/profile', icon: 'user' },
  { label: 'Control room', href: '/admin', icon: 'shield', roles: ['owner'] },
];

export const Navigation: React.FC<NavigationProps> = ({ items = DEFAULT_NAV, logoText = 'Loadout', logoHref = '/dashboard' }) => {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const visible = items.filter((i) => !i.roles?.length || (user && i.roles.includes(user.role)));
  const isActive = (href: string) => (href === '/tools' ? pathname === '/tools' : pathname?.startsWith(href));

  const signOut = () => {
    logout();
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-sage/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1240px] items-center gap-4 px-4 sm:px-6">
        <Link href={logoHref} className="flex items-center gap-2.5">
          <LogoMark size={26} />
          <span className="font-display text-[19px] font-extrabold tracking-[-0.03em] text-ink">{logoText}</span>
        </Link>

        <nav className="ml-6 hidden items-center gap-1 rounded-full border border-line bg-paper/70 p-1 md:flex" aria-label="Main">
          {visible.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex h-8 items-center gap-2 rounded-full px-3.5 text-[13.5px] font-semibold transition-colors ${
                isActive(item.href) ? 'bg-ink text-paper' : 'text-ink-soft hover:bg-sage-deep hover:text-ink'
              }`}
            >
              {typeof item.icon === 'string' ? <Icon name={item.icon} size={15} /> : item.icon}
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Link
            href="/tools/add"
            className="hidden h-9 items-center gap-1.5 rounded-full bg-ember px-4 text-[13.5px] font-semibold text-white transition-colors hover:bg-[#e94d14] sm:flex"
          >
            <Icon name="plus" size={15} strokeWidth={2.2} />
            Share a tool
          </Link>

          {user && (
            <div className="relative hidden md:block" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((v) => !v)}
                aria-expanded={menuOpen}
                aria-label="Account menu"
                className="flex h-9 items-center gap-2 rounded-full border border-line bg-paper pl-1 pr-3 transition-colors hover:border-ink/40"
              >
                <span className="grid h-7 w-7 place-items-center rounded-full bg-forest font-display text-[11px] font-bold text-paper">
                  {initials(user.name)}
                </span>
                <span className="max-w-[120px] truncate text-[13px] font-semibold text-ink">{user.name.split(' ')[0]}</span>
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-11 w-64 overflow-hidden rounded-2xl border border-line bg-paper shadow-[0_20px_50px_-24px_rgba(23,34,27,0.55)] animate-[pop-in_0.16s_ease-out]">
                  <div className="border-b border-line px-4 py-3.5">
                    <p className="truncate text-sm font-semibold text-ink">{user.name}</p>
                    <p className="truncate text-[13px] text-mute">{user.email}</p>
                    <span className="mt-2 inline-block rounded-md bg-moss px-2 py-0.5 font-mono text-[11px] uppercase tracking-wide text-forest">
                      {roleLabel(user.role)} seat
                    </span>
                  </div>
                  <Link href="/profile" onClick={() => setMenuOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-ink-soft hover:bg-sage">
                    <Icon name="user" size={16} /> Account and kit
                  </Link>
                  <button onClick={signOut} className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-[#b3261e] hover:bg-rosy/50">
                    <Icon name="logout" size={16} /> Sign out
                  </button>
                </div>
              )}
            </div>
          )}

          <button
            onClick={() => setSheetOpen((v) => !v)}
            aria-label="Open menu"
            aria-expanded={sheetOpen}
            className="grid h-9 w-9 place-items-center rounded-full border border-line bg-paper md:hidden"
          >
            <Icon name={sheetOpen ? 'close' : 'menu'} size={17} />
          </button>
        </div>
      </div>

      {sheetOpen && (
        <div className="border-t border-line bg-paper px-4 pb-4 pt-2 md:hidden">
          {visible.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSheetOpen(false)}
              className={`mt-1 flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-semibold ${
                isActive(item.href) ? 'bg-ink text-paper' : 'text-ink-soft'
              }`}
            >
              {typeof item.icon === 'string' ? <Icon name={item.icon} size={17} /> : item.icon}
              {item.label}
            </Link>
          ))}
          <Link
            href="/tools/add"
            onClick={() => setSheetOpen(false)}
            className="mt-2 flex items-center justify-center gap-2 rounded-xl bg-ember py-2.5 text-[15px] font-semibold text-white"
          >
            <Icon name="plus" size={16} /> Share a tool
          </Link>
          {user && (
            <div className="mt-3 flex items-center justify-between rounded-xl border border-line px-3 py-2.5">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{user.name}</p>
                <p className="truncate text-xs text-mute">{user.email}</p>
              </div>
              <button onClick={signOut} className="text-sm font-semibold text-[#b3261e]">
                Sign out
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
