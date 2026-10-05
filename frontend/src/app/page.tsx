'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Icon, LogoMark } from '@/components/Icon';

const SHELF = [
  { name: 'Research assistant', shelf: 'Chat & Assistants', tone: '#10B981', saves: 24, tag: '#research' },
  { name: 'Pair programmer', shelf: 'Code Generation', tone: '#3B82F6', saves: 41, tag: '#typescript' },
  { name: 'Moodboard maker', shelf: 'Image Generation', tone: '#8B5CF6', saves: 17, tag: '#design' },
];

const STEPS = [
  { n: '01', t: 'Share what works', d: 'Anyone can file a tool with links, labels and the roles it helps. Drafts stay private until you publish.' },
  { n: '02', t: 'Find it by shelf', d: 'Browse by shelf, label or role. Search cuts across names and write-ups in one box.' },
  { n: '03', t: 'Keep the good stuff', d: 'Save tools to your kit, leave notes for teammates, and see what the team opens most.' },
];

export default function Landing() {
  const { user } = useAuth();
  const cta = user ? '/dashboard' : '/login';

  return (
    <div className="min-h-screen bg-sage text-ink">
      <header className="mx-auto flex h-20 max-w-[1180px] items-center justify-between px-5">
        <Link href="/" className="flex items-center gap-2.5">
          <LogoMark size={28} />
          <span className="font-display text-xl font-extrabold tracking-[-0.03em]">Loadout</span>
        </Link>
        <Link
          href={cta}
          className="inline-flex h-10 items-center gap-2 rounded-full border border-ink/20 bg-paper px-5 text-sm font-semibold transition-colors hover:border-ink"
        >
          {user ? 'Go to my kit' : 'Sign in'}
          <Icon name="arrowRight" size={15} />
        </Link>
      </header>

      <section className="mx-auto grid max-w-[1180px] items-center gap-12 px-5 pb-16 pt-6 lg:grid-cols-[1.1fr_0.9fr] lg:pt-12">
        <div className="rise">
          <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-line bg-paper px-3 py-1 font-mono text-[11.5px] uppercase tracking-[0.16em] text-ink-soft">
            <span className="h-1.5 w-1.5 rounded-full bg-ember" /> Internal AI tool library
          </p>
          <h1 className="font-display text-[46px] font-extrabold leading-[0.98] tracking-[-0.045em] sm:text-[68px]">
            The AI kit your team <span className="relative whitespace-nowrap text-forest">actually uses<svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 300 12" preserveAspectRatio="none" aria-hidden="true"><path d="M2 8c60-6 140-7 296-2" stroke="#ff5b1f" strokeWidth="4" fill="none" strokeLinecap="round" /></svg></span>.
          </h1>
          <p className="mt-7 max-w-xl text-[17px] leading-relaxed text-ink-soft">
            Loadout is one shared shelf for every assistant, model and plugin your people rely on. File a tool once, tag who it helps, and stop
            answering the same question in chat.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Link href={cta} className="inline-flex h-12 items-center gap-2 rounded-full bg-ember px-6 text-[15px] font-semibold text-white transition-colors hover:bg-[#e94d14]">
              Open Loadout <Icon name="arrowRight" size={16} />
            </Link>
            <a href="#how" className="inline-flex h-12 items-center rounded-full px-5 text-[15px] font-semibold text-ink-soft hover:text-ink">
              How it works
            </a>
          </div>
        </div>

        {/* Product vignette */}
        <div className="rise relative" style={{ animationDelay: '120ms' }}>
          <div className="absolute -inset-4 -z-10 rounded-[36px] bg-forest dot-grid-light" />
          <div className="rounded-[28px] border border-line bg-paper p-5 shadow-[0_40px_80px_-40px_rgba(23,34,27,0.6)]">
            <div className="mb-4 flex items-center justify-between">
              <p className="font-display text-[15px] font-bold">This week on the shelf</p>
              <span className="rounded-full bg-moss px-2.5 py-0.5 font-mono text-[11px] uppercase text-forest">Live</span>
            </div>
            <div className="mb-4 flex items-center gap-2 rounded-xl border border-line bg-white px-3 py-2.5 text-sm text-mute">
              <Icon name="search" size={16} /> Search tools, labels, roles
            </div>
            <ul className="space-y-2.5">
              {SHELF.map((s) => (
                <li key={s.name} className="flex items-center gap-3 rounded-2xl border border-line bg-white p-3">
                  <span
                    className="grid h-10 w-10 place-items-center rounded-xl font-display text-sm font-extrabold"
                    style={{ background: `${s.tone}22`, color: s.tone }}
                  >
                    {s.shelf
                      .split(' ')
                      .filter((w) => w !== '&')
                      .slice(0, 2)
                      .map((w) => w[0])
                      .join('')}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[14.5px] font-semibold">{s.name}</p>
                    <p className="font-mono text-[11px] uppercase tracking-wider text-mute">
                      {s.shelf} · {s.tag}
                    </p>
                  </div>
                  <span className="flex items-center gap-1 rounded-full border border-line px-2.5 py-1 text-[12.5px] font-semibold text-ink-soft">
                    <Icon name="heart" size={13} /> {s.saves}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              {[
                ['6', 'shelves'],
                ['25', 'labels'],
                ['7', 'roles'],
              ].map(([n, l]) => (
                <div key={l} className="rounded-xl bg-sage py-2.5">
                  <p className="font-display text-xl font-extrabold">{n}</p>
                  <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-mute">{l}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="how" className="border-y border-line bg-paper">
        <div className="mx-auto grid max-w-[1180px] gap-px px-5 py-14 md:grid-cols-3 md:gap-10">
          {STEPS.map((s) => (
            <div key={s.n} className="py-5 md:py-0">
              <p className="font-mono text-xs tracking-[0.16em] text-ember">{s.n}</p>
              <h2 className="mt-2 font-display text-2xl font-bold tracking-[-0.03em]">{s.t}</h2>
              <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1180px] px-5 py-16">
        <div className="flex flex-col items-start justify-between gap-6 rounded-[32px] bg-ink px-8 py-10 text-paper md:flex-row md:items-center">
          <div>
            <h2 className="font-display text-3xl font-extrabold tracking-[-0.035em]">Two-step sign in, role-aware from the first screen.</h2>
            <p className="mt-2 text-paper/70">Owners get a control room for people and tools. Everyone else gets a kit that fits their role.</p>
          </div>
          <Link href={cta} className="inline-flex h-12 shrink-0 items-center gap-2 rounded-full bg-ember px-6 font-semibold text-white hover:bg-[#e94d14]">
            {user ? 'Continue' : 'Sign in'} <Icon name="arrowRight" size={16} />
          </Link>
        </div>
      </section>

      <footer className="mx-auto flex max-w-[1180px] items-center justify-between px-5 pb-10 text-[13px] text-mute">
        <span className="flex items-center gap-2">
          <LogoMark size={18} /> Loadout
        </span>
        <span>Built for teams that ship with AI</span>
      </footer>
    </div>
  );
}
