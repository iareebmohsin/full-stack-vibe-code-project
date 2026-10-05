'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { AppShell, PageHead } from '@/components/AppShell';
import { Icon } from '@/components/Icon';
import { ToolCover } from '@/components/ToolBits';
import { ToolDrawer } from '@/components/ToolDrawer';
import { useAuth } from '@/contexts/AuthContext';
import { api, prettyEnum, roleLabel } from '@/lib/api';
import { Tool } from '@/lib/types';

interface Stats {
  tools_shared: number;
  total_views: number;
  total_favorites: number;
  rank: number;
}

interface Activity {
  type: string;
  title: string;
  description: string;
  time: string;
}

const ACTIVITY_ICON: Record<string, string> = {
  tool_added: 'plus',
  tool_favorited: 'heart',
  new_comment: 'chat',
};

function greeting() {
  const h = new Date().getHours();
  if (h < 5) return 'Up late';
  if (h < 12) return 'Morning';
  if (h < 18) return 'Afternoon';
  return 'Evening';
}

const ROLE_LEDE: Record<string, string> = {
  owner: 'You run the shelf. Review new submissions, keep people tidy, and see what the team leans on.',
  frontend: 'Tools picked for building interfaces, plus everything the rest of the team is saving.',
  backend: 'Tools picked for APIs, data and services, plus what the rest of the team is saving.',
  designer: 'Tools picked for design work, plus what the rest of the team is saving.',
};

function compact(n: number) {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);
}

export default function HomePage() {
  const { user, token } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [activity, setActivity] = useState<Activity[] | null>(null);
  const [picks, setPicks] = useState<Tool[] | null>(null);
  const [picksForRole, setPicksForRole] = useState(true);
  const [open, setOpen] = useState<Tool | null>(null);

  useEffect(() => {
    if (!token || !user) return;
    api<{ success: boolean; data: Stats }>('/user/stats', { token }).then((r) => r.ok && setStats(r.data.data));
    api<{ success: boolean; data: Activity[] }>('/user/activities', { token }).then((r) => setActivity(r.ok ? r.data.data || [] : []));

    (async () => {
      const byRole = user.role === 'owner' ? null : await api<{ data: { data: Tool[] } }>(`/tools?role[]=${encodeURIComponent(user.role)}`, { token });
      let list = byRole?.ok ? byRole.data.data?.data || [] : [];
      if (!list.length) {
        const all = await api<{ data: { data: Tool[] } }>('/tools', { token });
        list = all.ok ? all.data.data?.data || [] : [];
        setPicksForRole(false);
      }
      setPicks(list.slice(0, 5));
    })();
  }, [token, user]);

  const toggleSave = useCallback(
    async (id: number) => {
      const r = await api<{ is_favorited: boolean; favorites_count: number }>(`/tools/${id}/favorite`, { method: 'POST', token });
      if (!r.ok) return;
      const patch = (t: Tool) => (t.id === id ? { ...t, is_favorited: r.data.is_favorited, favorites_count: r.data.favorites_count } : t);
      setPicks((p) => p?.map(patch) || p);
      setOpen((o) => (o ? patch(o) : o));
    },
    [token]
  );

  const routes = [
    { href: '/tools', icon: 'grid', t: 'Browse the library', d: 'Every published tool, by shelf and label' },
    { href: '/tools/add', icon: 'plus', t: 'Share a tool', d: 'File something that saved you time' },
    { href: '/profile', icon: 'user', t: 'My kit', d: 'Your submissions and account details' },
    ...(user?.role === 'owner' ? [{ href: '/admin', icon: 'shield', t: 'Control room', d: 'People, submissions and usage' }] : []),
    ...(user && user.role !== 'owner'
      ? [{ href: `/tools?role=${user.role}`, icon: 'filter', t: `${roleLabel(user.role)} picks`, d: 'The library filtered to your role' }]
      : []),
  ];

  const today = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <AppShell>
      {user && (
        <>
          <PageHead
            kicker={today}
            title={
              <>
                {greeting()}, {user.name.split(' ')[0]}.
              </>
            }
            lede={ROLE_LEDE[user.role] || 'Here is what is new on the shelf and what you have contributed.'}
            actions={
              <>
                <Link href="/tools" className="inline-flex h-10 items-center gap-2 rounded-full border border-ink/20 bg-paper px-4 text-sm font-semibold hover:border-ink">
                  <Icon name="grid" size={15} /> Library
                </Link>
                <Link href="/tools/add" className="inline-flex h-10 items-center gap-2 rounded-full bg-ink px-4 text-sm font-semibold text-paper hover:bg-forest">
                  <Icon name="plus" size={15} /> Share a tool
                </Link>
              </>
            }
          />

          {/* Stat strip */}
          <section className="rise grid grid-cols-2 overflow-hidden rounded-[var(--radius-card)] border border-line bg-paper md:grid-cols-4" style={{ animationDelay: '60ms' }}>
            {[
              { k: 'Tools you shared', v: stats ? stats.tools_shared : null, icon: 'layers' },
              { k: 'Times opened', v: stats ? compact(stats.total_views) : null, icon: 'eye' },
              { k: 'Saves received', v: stats ? stats.total_favorites : null, icon: 'heart' },
              { k: 'Team standing', v: stats ? `No. ${stats.rank}` : null, icon: 'star' },
            ].map((s, i) => (
              <div key={s.k} className={`p-5 sm:p-6 ${i % 2 === 1 ? 'border-l' : ''} ${i >= 2 ? 'border-t md:border-t-0' : ''} ${i === 2 ? 'md:border-l' : ''} border-line`}>
                <div className="flex items-center gap-2 text-mute">
                  <Icon name={s.icon} size={15} />
                  <p className="font-mono text-[11px] uppercase tracking-[0.14em]">{s.k}</p>
                </div>
                {s.v === null ? (
                  <div className="mt-3 h-9 w-16 animate-pulse rounded-lg bg-sage" />
                ) : (
                  <p className="mt-2 font-display text-[38px] font-extrabold leading-none tracking-[-0.04em]">{s.v}</p>
                )}
              </div>
            ))}
          </section>

          <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]">
            {/* Picks */}
            <section className="rise rounded-[var(--radius-card)] border border-line bg-paper" style={{ animationDelay: '120ms' }}>
              <div className="flex items-center justify-between border-b border-line px-6 py-4">
                <div>
                  <h2 className="font-display text-lg font-bold tracking-[-0.02em]">{picksForRole && user.role !== 'owner' ? `Picked for ${roleLabel(user.role)}` : 'Fresh on the shelf'}</h2>
                  <p className="text-[13px] text-mute">{picksForRole && user.role !== 'owner' ? 'Tagged as useful for your role' : 'Most recent tools in the library'}</p>
                </div>
                <Link href="/tools" className="text-[13px] font-semibold text-forest hover:underline">
                  See all
                </Link>
              </div>
              {picks === null ? (
                <div className="space-y-3 p-6">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="h-14 animate-pulse rounded-2xl bg-sage" />
                  ))}
                </div>
              ) : picks.length === 0 ? (
                <div className="px-6 py-12 text-center">
                  <p className="font-display text-xl font-bold">The shelf is empty</p>
                  <p className="mt-1 text-sm text-mute">Be the one who files the first tool.</p>
                  <Link href="/tools/add" className="mt-5 inline-flex h-10 items-center gap-2 rounded-full bg-ember px-5 text-sm font-semibold text-white">
                    <Icon name="plus" size={15} /> Share a tool
                  </Link>
                </div>
              ) : (
                <ul className="divide-y divide-line">
                  {picks.map((t) => (
                    <li key={t.id}>
                      <button onClick={() => setOpen(t)} className="flex w-full items-center gap-4 px-6 py-4 text-left transition-colors hover:bg-sage/60">
                        <ToolCover tool={t} size={42} />
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-semibold text-ink">{t.title}</p>
                          <p className="truncate text-[13px] text-mute">{t.description}</p>
                        </div>
                        <span className="hidden rounded-md border border-line px-2 py-0.5 font-mono text-[11px] uppercase text-ink-soft sm:inline">
                          {prettyEnum(t.pricing_model)}
                        </span>
                        <span className="flex items-center gap-1 text-[13px] text-mute">
                          <Icon name="heart" size={14} filled={t.is_favorited} className={t.is_favorited ? 'text-ember' : ''} /> {t.favorites_count}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <div className="space-y-6">
              {/* Activity */}
              <section className="rise rounded-[var(--radius-card)] border border-line bg-paper p-6" style={{ animationDelay: '180ms' }}>
                <h2 className="font-display text-lg font-bold tracking-[-0.02em]">Your trail</h2>
                {activity === null ? (
                  <div className="mt-4 space-y-3">
                    {[0, 1].map((i) => (
                      <div key={i} className="h-10 animate-pulse rounded-xl bg-sage" />
                    ))}
                  </div>
                ) : activity.length === 0 ? (
                  <p className="mt-3 text-sm text-mute">Nothing yet. Share, save or comment on a tool and it lands here.</p>
                ) : (
                  <ol className="relative mt-4 space-y-4 before:absolute before:bottom-2 before:left-[13px] before:top-2 before:w-px before:bg-line">
                    {activity.map((a, i) => (
                      <li key={i} className="relative flex gap-3">
                        <span className="z-10 grid h-7 w-7 shrink-0 place-items-center rounded-full border border-line bg-paper text-forest">
                          <Icon name={ACTIVITY_ICON[a.type] || 'spark'} size={14} />
                        </span>
                        <div className="min-w-0">
                          <p className="text-[14px] font-semibold text-ink">{a.title}</p>
                          <p className="truncate text-[13px] text-ink-soft">{a.description}</p>
                          <p className="font-mono text-[11px] text-mute">{a.time}</p>
                        </div>
                      </li>
                    ))}
                  </ol>
                )}
              </section>

              {/* Routes */}
              <section className="rise overflow-hidden rounded-[var(--radius-card)] bg-forest text-paper" style={{ animationDelay: '240ms' }}>
                <p className="px-6 pt-5 font-mono text-[11px] uppercase tracking-[0.16em] text-paper/60">Jump to</p>
                <ul className="mt-2 pb-2">
                  {routes.map((r) => (
                    <li key={r.href}>
                      <Link href={r.href} className="group flex items-center gap-3 px-6 py-3 transition-colors hover:bg-white/5">
                        <span className="grid h-8 w-8 place-items-center rounded-xl bg-white/10">
                          <Icon name={r.icon} size={15} />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-[14px] font-semibold">{r.t}</p>
                          <p className="truncate text-[12.5px] text-paper/60">{r.d}</p>
                        </div>
                        <Icon name="arrowRight" size={15} className="text-paper/40 transition-transform group-hover:translate-x-0.5 group-hover:text-ember" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            </div>
          </div>

          {/* Seat summary */}
          <section className="rise mt-6 flex flex-wrap items-center gap-x-8 gap-y-3 rounded-[var(--radius-card)] border border-dashed border-line px-6 py-4 text-[13.5px]" style={{ animationDelay: '300ms' }}>
            <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-mute">Your seat</span>
            <span>
              <span className="text-mute">Email</span> <b className="font-semibold">{user.email}</b>
            </span>
            <span>
              <span className="text-mute">Role</span> <b className="font-semibold">{roleLabel(user.role)}</b>
            </span>
            <span>
              <span className="text-mute">Member no.</span> <b className="font-mono font-medium">{String(user.id).padStart(4, '0')}</b>
            </span>
            <span className="flex items-center gap-1.5 text-forest">
              <span className="h-2 w-2 rounded-full bg-[#3aa55b]" /> Active
            </span>
          </section>
        </>
      )}

      <ToolDrawer tool={open} isOpen={!!open} onClose={() => setOpen(null)} onFavoriteToggle={toggleSave} />
    </AppShell>
  );
}
