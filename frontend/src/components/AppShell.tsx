'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Navigation } from '@/components/ui/Navigation';
import { LogoMark } from '@/components/Icon';

/**
 * Signed-in page frame: top bar, width-limited content, and an auth guard.
 * `ownerOnly` sends everyone else back to Home.
 */
export function AppShell({
  children,
  ownerOnly = false,
  wide = false,
}: {
  children: React.ReactNode;
  ownerOnly?: boolean;
  wide?: boolean;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!user) router.replace('/login');
    else if (ownerOnly && user.role !== 'owner') router.replace('/dashboard');
  }, [user, isLoading, ownerOnly, router]);

  if (isLoading || !user || (ownerOnly && user.role !== 'owner')) {
    return (
      <div className="grid min-h-screen place-items-center bg-sage">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-pulse">
            <LogoMark size={40} />
          </div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-mute">Loading your kit</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sage">
      <Navigation />
      <main className={`mx-auto px-4 pb-20 pt-8 sm:px-6 ${wide ? 'max-w-[1240px]' : 'max-w-[1120px]'}`}>{children}</main>
    </div>
  );
}

/** Page heading used across signed-in screens. */
export function PageHead({
  kicker,
  title,
  lede,
  actions,
}: {
  kicker?: string;
  title: React.ReactNode;
  lede?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <div className="rise mb-8 flex flex-wrap items-end justify-between gap-5">
      <div className="max-w-2xl">
        {kicker && <p className="mb-2 font-mono text-[11.5px] uppercase tracking-[0.18em] text-ember">{kicker}</p>}
        <h1 className="font-display text-[34px] font-extrabold leading-[1.05] tracking-[-0.035em] text-ink sm:text-[42px]">{title}</h1>
        {lede && <p className="mt-3 text-[15.5px] leading-relaxed text-ink-soft">{lede}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
