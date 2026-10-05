'use client';

import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { AppShell, PageHead } from '@/components/AppShell';
import { Icon } from '@/components/Icon';
import { ToolTile } from '@/components/ToolBits';
import { ToolDrawer } from '@/components/ToolDrawer';
import { useAuth } from '@/contexts/AuthContext';
import { api, ROLES, roleLabel } from '@/lib/api';
import { Category, Tag, Tool } from '@/lib/types';

function LibraryInner() {
  const { user, token } = useAuth();
  const params = useSearchParams();

  const [tools, setTools] = useState<Tool[] | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);

  const [shelf, setShelf] = useState<string>(params.get('category') || '');
  const [roles, setRoles] = useState<string[]>(params.get('role') ? [params.get('role') as string] : []);
  const [labels, setLabels] = useState<number[]>([]);
  const [query, setQuery] = useState('');
  const [debounced, setDebounced] = useState('');
  const [refineOpen, setRefineOpen] = useState(!!params.get('role'));
  const [open, setOpen] = useState<Tool | null>(null);

  useEffect(() => {
    api<{ data: Category[] }>('/categories').then((r) => r.ok && setCategories(r.data.data || []));
    api<{ data: Tag[] }>('/tags').then((r) => r.ok && setTags(r.data.data || []));
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query.trim()), 300);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    const ctrl = new AbortController();
    const qs = new URLSearchParams();
    if (shelf) qs.append('category_id', shelf);
    roles.forEach((r) => qs.append('role[]', r));
    labels.forEach((l) => qs.append('tag[]', String(l)));
    if (debounced) qs.append('search', debounced);
    setTools(null);
    api<{ data: { data: Tool[] } }>(`/tools${qs.toString() ? `?${qs}` : ''}`, { token, signal: ctrl.signal })
      .then((r) => setTools(r.ok ? r.data.data?.data || [] : []))
      .catch(() => undefined);
    return () => ctrl.abort();
  }, [shelf, roles, labels, debounced, token]);

  const toggleSave = useCallback(
    async (id: number) => {
      if (!token) return;
      const r = await api<{ is_favorited: boolean; favorites_count: number }>(`/tools/${id}/favorite`, { method: 'POST', token });
      if (!r.ok) return;
      const patch = (t: Tool) => (t.id === id ? { ...t, is_favorited: r.data.is_favorited, favorites_count: r.data.favorites_count } : t);
      setTools((list) => list?.map(patch) || list);
      setOpen((o) => (o ? patch(o) : o));
    },
    [token]
  );

  const activeCount = (shelf ? 1 : 0) + roles.length + labels.length + (debounced ? 1 : 0);
  const clear = () => {
    setShelf('');
    setRoles([]);
    setLabels([]);
    setQuery('');
  };

  const shelfName = useMemo(() => categories.find((c) => String(c.id) === shelf)?.name, [categories, shelf]);

  return (
    <>
      <PageHead
        kicker="The library"
        title="Everything the team runs on."
        lede="Search across names and write-ups, narrow by shelf, then refine by label or the role a tool helps."
        actions={
          <Link href="/tools/add" className="inline-flex h-10 items-center gap-2 rounded-full bg-ember px-4 text-sm font-semibold text-white hover:bg-[#e94d14]">
            <Icon name="plus" size={15} /> Share a tool
          </Link>
        }
      />

      {/* Search + refine */}
      <div className="rise sticky top-16 z-20 -mx-4 mb-6 bg-sage/90 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6" style={{ animationDelay: '60ms' }}>
        <div className="flex gap-2">
          <label className="flex h-12 flex-1 items-center gap-3 rounded-full border border-line bg-paper px-5 focus-within:border-ink focus-within:ring-4 focus-within:ring-ember/15">
            <Icon name="search" size={18} className="text-mute" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search tools, like “transcribe” or “diagram”"
              className="h-full w-full bg-transparent text-[15px] focus:outline-none"
              aria-label="Search tools"
            />
            {query && (
              <button onClick={() => setQuery('')} aria-label="Clear search" className="text-mute hover:text-ink">
                <Icon name="close" size={16} />
              </button>
            )}
          </label>
          <button
            onClick={() => setRefineOpen((v) => !v)}
            aria-expanded={refineOpen}
            className={`flex h-12 items-center gap-2 rounded-full border px-5 text-sm font-semibold transition-colors ${
              refineOpen || roles.length || labels.length ? 'border-ink bg-ink text-paper' : 'border-line bg-paper text-ink hover:border-ink/40'
            }`}
          >
            <Icon name="filter" size={16} /> Refine
            {roles.length + labels.length > 0 && (
              <span className="grid h-5 min-w-5 place-items-center rounded-full bg-ember px-1 text-[11px] text-white">{roles.length + labels.length}</span>
            )}
          </button>
        </div>

        {/* Shelves */}
        <div className="mt-3 flex gap-1.5 overflow-x-auto pb-1">
          <button
            onClick={() => setShelf('')}
            className={`h-8 shrink-0 rounded-full px-3.5 text-[13px] font-semibold transition-colors ${!shelf ? 'bg-forest text-paper' : 'bg-paper text-ink-soft hover:text-ink'}`}
          >
            All shelves
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setShelf(String(c.id) === shelf ? '' : String(c.id))}
              className={`flex h-8 shrink-0 items-center gap-2 rounded-full px-3.5 text-[13px] font-semibold transition-colors ${
                String(c.id) === shelf ? 'bg-forest text-paper' : 'bg-paper text-ink-soft hover:text-ink'
              }`}
            >
              <span className="h-2 w-2 rounded-full" style={{ background: c.color || '#1f3a2e' }} />
              {c.name}
            </button>
          ))}
        </div>

        {refineOpen && (
          <div className="mt-3 grid gap-5 rounded-[var(--radius-card)] border border-line bg-paper p-5 animate-[pop-in_0.18s_ease-out] md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
            <div>
              <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.14em] text-mute">Useful for</p>
              <div className="flex flex-wrap gap-1.5">
                {ROLES.map((r) => (
                  <button
                    key={r}
                    onClick={() => setRoles((rs) => (rs.includes(r) ? rs.filter((x) => x !== r) : [...rs, r]))}
                    aria-pressed={roles.includes(r)}
                    className={`h-8 rounded-full border px-3 text-[13px] font-semibold ${
                      roles.includes(r) ? 'border-forest bg-forest text-paper' : 'border-line text-ink-soft hover:border-ink/40'
                    }`}
                  >
                    {roleLabel(r)}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.14em] text-mute">Labels</p>
              <div className="flex max-h-32 flex-wrap gap-1.5 overflow-y-auto">
                {tags.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setLabels((ls) => (ls.includes(t.id) ? ls.filter((x) => x !== t.id) : [...ls, t.id]))}
                    aria-pressed={labels.includes(t.id)}
                    className={`h-8 rounded-full border px-3 text-[13px] font-semibold ${
                      labels.includes(t.id) ? 'border-ink bg-ink text-paper' : 'border-line text-ink-soft hover:border-ink/40'
                    }`}
                  >
                    #{t.name.toLowerCase().replace(/\s+/g, '')}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Result line */}
      <div className="mb-4 flex min-h-8 flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-ink-soft">
          {tools === null ? (
            'Looking…'
          ) : (
            <>
              <b className="font-display text-base font-bold text-ink">{tools.length}</b> {tools.length === 1 ? 'tool' : 'tools'}
              {shelfName && (
                <>
                  {' '}
                  on <b className="text-ink">{shelfName}</b>
                </>
              )}
              {debounced && (
                <>
                  {' '}
                  matching <b className="text-ink">“{debounced}”</b>
                </>
              )}
            </>
          )}
        </p>
        {activeCount > 0 && (
          <button onClick={clear} className="text-[13px] font-semibold text-[#c23f0d] hover:underline">
            Reset {activeCount} {activeCount === 1 ? 'filter' : 'filters'}
          </button>
        )}
      </div>

      {tools === null ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-60 animate-pulse rounded-[var(--radius-card)] bg-paper/70" />
          ))}
        </div>
      ) : tools.length === 0 ? (
        <div className="rounded-[var(--radius-card)] border border-dashed border-ink/20 px-6 py-16 text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-paper text-mute">
            <Icon name="search" size={24} />
          </div>
          <h3 className="mt-4 font-display text-2xl font-bold tracking-[-0.03em]">{activeCount ? 'No match on this shelf' : 'Nothing filed yet'}</h3>
          <p className="mt-1 text-ink-soft">{activeCount ? 'Loosen a filter or try a broader word.' : 'The library fills up as people share what they use.'}</p>
          <div className="mt-6 flex justify-center gap-2">
            {activeCount > 0 && (
              <button onClick={clear} className="h-10 rounded-full border border-ink/20 bg-paper px-5 text-sm font-semibold">
                Reset filters
              </button>
            )}
            {user && (
              <Link href="/tools/add" className="inline-flex h-10 items-center gap-2 rounded-full bg-ember px-5 text-sm font-semibold text-white">
                <Icon name="plus" size={15} /> Share a tool
              </Link>
            )}
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map((t, i) => (
            <ToolTile key={t.id} tool={t} index={i} canSave={!!token} onOpen={() => setOpen(t)} onSave={() => toggleSave(t.id)} />
          ))}
        </div>
      )}

      <ToolDrawer tool={open} isOpen={!!open} onClose={() => setOpen(null)} onFavoriteToggle={toggleSave} />
    </>
  );
}

export default function LibraryPage() {
  return (
    <AppShell wide>
      <Suspense fallback={null}>
        <LibraryInner />
      </Suspense>
    </AppShell>
  );
}
