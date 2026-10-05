'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { AppShell, PageHead } from '@/components/AppShell';
import { Icon } from '@/components/Icon';
import { ToolForm } from '@/components/ToolForm';
import { StatusPill, ToolCover } from '@/components/ToolBits';
import { ToolDrawer } from '@/components/ToolDrawer';
import { Button, Input, Modal, Select, useToast } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { api, errorMessage, fieldErrors, initials, ROLES, roleLabel, shortDate, swatch } from '@/lib/api';
import { Category, formToPayload, Tag, Tool, ToolFormValues, toolToForm } from '@/lib/types';

interface Person {
  id: number;
  name: string;
  email: string;
  role: string;
  status?: 'active' | 'inactive';
  tools_count?: number;
  created_at: string;
}

type Tab = 'overview' | 'people' | 'submissions';

const EMPTY_PERSON = { name: '', email: '', password: '', role: 'frontend' };

function Bar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between text-[13.5px]">
        <span className="font-medium text-ink-soft">{label}</span>
        <span className="font-mono text-[12px] text-ink">{value}</span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-sage">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${max ? (value / max) * 100 : 0}%`, background: color }} />
      </div>
    </div>
  );
}

export default function ControlRoomPage() {
  const { user, token } = useAuth();
  const { addToast } = useToast();
  const [tab, setTab] = useState<Tab>('overview');

  const [people, setPeople] = useState<Person[] | null>(null);
  const [peopleErr, setPeopleErr] = useState('');
  const [tools, setTools] = useState<Tool[] | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);

  const [q, setQ] = useState('');
  const [roleF, setRoleF] = useState('all');
  const [statusF, setStatusF] = useState('all');
  const [toolQ, setToolQ] = useState('');
  const [toolStatusF, setToolStatusF] = useState('all');

  const [adding, setAdding] = useState(false);
  const [newPerson, setNewPerson] = useState(EMPTY_PERSON);
  const [personErr, setPersonErr] = useState<Record<string, string>>({});
  const [editingPerson, setEditingPerson] = useState<Person | null>(null);
  const [personForm, setPersonForm] = useState({ name: '', email: '', role: '' });
  const [removingPerson, setRemovingPerson] = useState<Person | null>(null);
  const [busy, setBusy] = useState(false);

  const [viewing, setViewing] = useState<Tool | null>(null);
  const [editingTool, setEditingTool] = useState<Tool | null>(null);
  const [toolValues, setToolValues] = useState<ToolFormValues | null>(null);
  const [toolErr, setToolErr] = useState<Record<string, string>>({});
  const [removingTool, setRemovingTool] = useState<Tool | null>(null);

  const loadPeople = useCallback(async () => {
    setPeopleErr('');
    const r = await api<Person[]>('/users', { token });
    if (r.ok && Array.isArray(r.data)) setPeople(r.data.map((p) => ({ ...p, status: p.status || 'active', tools_count: p.tools_count || 0 })));
    else {
      setPeople([]);
      setPeopleErr(errorMessage(r.data, 'Could not load people'));
    }
  }, [token]);

  const loadTools = useCallback(async () => {
    const r = await api<{ data: { data: Tool[] } }>('/tools', { token });
    setTools(r.ok ? r.data.data?.data || [] : []);
  }, [token]);

  useEffect(() => {
    if (!token || user?.role !== 'owner') return;
    loadPeople();
    loadTools();
    Promise.all([api<{ data: Category[] }>('/categories'), api<{ data: Tag[] }>('/tags')]).then(([c, t]) => {
      if (c.ok) setCategories(c.data.data || []);
      if (t.ok) setTags(t.data.data || []);
    });
  }, [token, user, loadPeople, loadTools]);

  /* ---------- derived ---------- */
  const filteredPeople = useMemo(
    () =>
      (people || []).filter(
        (p) =>
          (!q || `${p.name} ${p.email}`.toLowerCase().includes(q.toLowerCase())) &&
          (roleF === 'all' || p.role === roleF) &&
          (statusF === 'all' || (p.status || 'active') === statusF)
      ),
    [people, q, roleF, statusF]
  );

  const filteredTools = useMemo(
    () =>
      (tools || []).filter(
        (t) =>
          (!toolQ || `${t.title} ${t.user?.name || ''}`.toLowerCase().includes(toolQ.toLowerCase())) &&
          (toolStatusF === 'all' || t.status === toolStatusF)
      ),
    [tools, toolQ, toolStatusF]
  );

  const overview = useMemo(() => {
    const p = people || [];
    const t = tools || [];
    const byRole = ROLES.map((r) => ({ r, n: p.filter((x) => x.role === r).length })).filter((x) => x.n > 0);
    const byStatus = (['published', 'draft', 'archived'] as const).map((s) => ({ s, n: t.filter((x) => x.status === s).length }));
    const byShelf = categories
      .map((c) => ({ c, n: t.filter((x) => (x.category?.id ?? x.category_id) === c.id).length }))
      .sort((a, b) => b.n - a.n);
    return {
      active: p.filter((x) => x.status !== 'inactive').length,
      inactive: p.filter((x) => x.status === 'inactive').length,
      views: t.reduce((s, x) => s + (x.views_count || 0), 0),
      saves: t.reduce((s, x) => s + (x.favorites_count || 0), 0),
      byRole,
      byStatus,
      byShelf,
      top: [...p].sort((a, b) => (b.tools_count || 0) - (a.tools_count || 0)).filter((x) => (x.tools_count || 0) > 0).slice(0, 5),
    };
  }, [people, tools, categories]);

  /* ---------- people actions ---------- */
  const toggleStatus = async (p: Person) => {
    const r = await api<{ user: { status: 'active' | 'inactive' } }>(`/users/${p.id}/toggle-status`, { method: 'POST', token });
    if (r.ok) {
      setPeople((list) => list?.map((x) => (x.id === p.id ? { ...x, status: r.data.user.status } : x)) || list);
      addToast(`${p.name} is now ${r.data.user.status === 'active' ? 'unlocked' : 'locked out'}`, 'success');
    } else addToast(errorMessage(r.data, 'Could not change status'), 'error');
  };

  const addPerson = async () => {
    setBusy(true);
    setPersonErr({});
    try {
      const r = await api('/users', { method: 'POST', token, body: newPerson });
      if (r.ok) {
        addToast(`${newPerson.name} now has a seat`, 'success');
        setAdding(false);
        setNewPerson(EMPTY_PERSON);
        loadPeople();
      } else {
        setPersonErr(fieldErrors(r.data));
        addToast(errorMessage(r.data, 'Could not add that person'), 'error');
      }
    } finally {
      setBusy(false);
    }
  };

  const savePerson = async () => {
    if (!editingPerson) return;
    setBusy(true);
    setPersonErr({});
    try {
      const r = await api(`/users/${editingPerson.id}`, { method: 'PUT', token, body: personForm });
      if (r.ok) {
        setPeople((list) => list?.map((x) => (x.id === editingPerson.id ? { ...x, ...personForm } : x)) || list);
        addToast('Seat updated', 'success');
        setEditingPerson(null);
      } else {
        setPersonErr(fieldErrors(r.data));
        addToast(errorMessage(r.data, 'Could not update that seat'), 'error');
      }
    } finally {
      setBusy(false);
    }
  };

  const removePerson = async () => {
    if (!removingPerson) return;
    const r = await api(`/users/${removingPerson.id}`, { method: 'DELETE', token });
    if (r.ok) {
      setPeople((list) => list?.filter((x) => x.id !== removingPerson.id) || list);
      addToast(`${removingPerson.name} was removed`, 'success');
    } else addToast(errorMessage(r.data, 'Could not remove that person'), 'error');
    setRemovingPerson(null);
  };

  /* ---------- tool actions ---------- */
  const openToolEdit = async (t: Tool) => {
    const r = await api<{ data: Tool }>(`/tools/${t.id}`, { token });
    const full = r.ok ? r.data.data : t;
    setEditingTool(full);
    setToolValues(toolToForm(full));
    setToolErr({});
  };

  const saveTool = async () => {
    if (!editingTool || !toolValues) return;
    setBusy(true);
    try {
      const r = await api(`/tools/${editingTool.id}`, { method: 'PUT', token, body: formToPayload(toolValues) });
      if (r.ok) {
        addToast('Tool updated', 'success');
        setEditingTool(null);
        loadTools();
      } else {
        setToolErr(fieldErrors(r.data));
        addToast(errorMessage(r.data, 'Could not update the tool'), 'error');
      }
    } finally {
      setBusy(false);
    }
  };

  const removeTool = async () => {
    if (!removingTool) return;
    const r = await api(`/tools/${removingTool.id}`, { method: 'DELETE', token });
    if (r.ok) {
      setTools((l) => l?.filter((x) => x.id !== removingTool.id) || l);
      addToast(`${removingTool.title} was removed`, 'success');
    } else addToast('Could not remove that tool', 'error');
    setRemovingTool(null);
  };

  const tabs: { k: Tab; label: string; icon: string; n?: number }[] = [
    { k: 'overview', label: 'Overview', icon: 'chart' },
    { k: 'people', label: 'People', icon: 'user', n: people?.length },
    { k: 'submissions', label: 'Submissions', icon: 'layers', n: tools?.length },
  ];

  return (
    <AppShell ownerOnly wide>
      <PageHead
        kicker="Control room"
        title="Run the shelf."
        lede="Who has a seat, what has been filed, and where the team spends its attention."
        actions={
          <Button
            variant="outline"
            onClick={() => {
              loadPeople();
              loadTools();
            }}
          >
            <Icon name="refresh" size={15} /> Refresh
          </Button>
        }
      />

      <div className="mb-6 flex gap-1 overflow-x-auto rounded-full border border-line bg-paper p-1 sm:inline-flex">
        {tabs.map((t) => (
          <button
            key={t.k}
            onClick={() => setTab(t.k)}
            className={`flex h-9 shrink-0 items-center gap-2 rounded-full px-4 text-[13.5px] font-semibold transition-colors ${
              tab === t.k ? 'bg-ink text-paper' : 'text-ink-soft hover:text-ink'
            }`}
          >
            <Icon name={t.icon} size={15} /> {t.label}
            {t.n !== undefined && <span className={`font-mono text-[11px] ${tab === t.k ? 'text-paper/60' : 'text-mute'}`}>{t.n}</span>}
          </button>
        ))}
      </div>

      {/* ---------------- OVERVIEW ---------------- */}
      {tab === 'overview' && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { k: 'Seats', v: people?.length, sub: `${overview.active} active · ${overview.inactive} locked`, bg: 'bg-forest text-paper', subc: 'text-paper/60' },
              {
                k: 'Tools filed',
                v: tools?.length,
                sub: `${overview.byStatus[0].n} live · ${overview.byStatus[1].n} drafts`,
                bg: 'bg-paper',
                subc: 'text-mute',
              },
              { k: 'Opens', v: overview.views.toLocaleString(), sub: 'Across every tool', bg: 'bg-paper', subc: 'text-mute' },
              { k: 'Saves', v: overview.saves.toLocaleString(), sub: 'Tools kept by people', bg: 'bg-ember text-white', subc: 'text-white/75' },
            ].map((s, i) => (
              <div key={s.k} className={`rise rounded-[var(--radius-card)] border border-line p-5 ${s.bg}`} style={{ animationDelay: `${i * 50}ms` }}>
                <p className={`font-mono text-[11px] uppercase tracking-[0.16em] ${s.subc}`}>{s.k}</p>
                <p className="mt-2 font-display text-[40px] font-extrabold leading-none tracking-[-0.04em]">{s.v ?? '·'}</p>
                <p className={`mt-2 text-[13px] ${s.subc}`}>{s.sub}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <section className="rounded-[var(--radius-card)] border border-line bg-paper p-6">
              <h2 className="font-display text-lg font-bold tracking-[-0.02em]">Seats by role</h2>
              <div className="mt-5 space-y-4">
                {overview.byRole.length ? (
                  overview.byRole.map((x, i) => (
                    <Bar key={x.r} label={roleLabel(x.r)} value={x.n} max={Math.max(...overview.byRole.map((y) => y.n))} color={['#1f3a2e', '#ff5b1f', '#6b8f7a', '#e9a23b', '#6f86b8', '#b56a8a', '#8a8f5a'][i % 7]} />
                  ))
                ) : (
                  <p className="text-sm text-mute">No people yet.</p>
                )}
              </div>
            </section>

            <section className="rounded-[var(--radius-card)] border border-line bg-paper p-6">
              <h2 className="font-display text-lg font-bold tracking-[-0.02em]">Tools by status</h2>
              <div className="mt-5 flex h-4 overflow-hidden rounded-full bg-sage">
                {overview.byStatus.map((x) => (
                  <div
                    key={x.s}
                    title={`${x.s}: ${x.n}`}
                    style={{
                      width: `${tools?.length ? (x.n / tools.length) * 100 : 0}%`,
                      background: x.s === 'published' ? '#1f3a2e' : x.s === 'draft' ? '#e9c46a' : '#b9c0b4',
                    }}
                  />
                ))}
              </div>
              <ul className="mt-5 space-y-2.5">
                {overview.byStatus.map((x) => (
                  <li key={x.s} className="flex items-center justify-between text-[14px]">
                    <StatusPill status={x.s} />
                    <span className="font-mono text-ink">{x.n}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-6 border-t border-line pt-5">
                <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.14em] text-mute">By shelf</p>
                <div className="space-y-3">
                  {overview.byShelf.map((x) => (
                    <Bar key={x.c.id} label={x.c.name} value={x.n} max={Math.max(1, ...overview.byShelf.map((y) => y.n))} color={x.c.color || '#1f3a2e'} />
                  ))}
                </div>
              </div>
            </section>

            <section className="rounded-[var(--radius-card)] border border-line bg-paper p-6">
              <h2 className="font-display text-lg font-bold tracking-[-0.02em]">Top contributors</h2>
              {overview.top.length ? (
                <ol className="mt-4 space-y-3">
                  {overview.top.map((p, i) => (
                    <li key={p.id} className="flex items-center gap-3">
                      <span className="w-5 font-mono text-[12px] text-mute">{String(i + 1).padStart(2, '0')}</span>
                      <span className="grid h-9 w-9 place-items-center rounded-full font-display text-[12px] font-bold" style={{ background: swatch(p.name) }}>
                        {initials(p.name)}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[14px] font-semibold">{p.name}</p>
                        <p className="text-[12.5px] text-mute">{roleLabel(p.role)}</p>
                      </div>
                      <span className="rounded-full bg-sage px-2.5 py-1 font-mono text-[12px]">{p.tools_count}</span>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="mt-3 text-sm text-mute">Nobody has filed a tool yet.</p>
              )}
            </section>
          </div>
        </div>
      )}

      {/* ---------------- PEOPLE ---------------- */}
      {tab === 'people' && (
        <section>
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <label className="flex h-10 min-w-[220px] flex-1 items-center gap-2 rounded-full border border-line bg-paper px-4 focus-within:border-ink">
              <Icon name="search" size={16} className="text-mute" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Find by name or email" className="w-full bg-transparent text-sm focus:outline-none" />
            </label>
            <div className="w-40">
              <Select value={roleF} onChange={(e) => setRoleF(e.target.value)} aria-label="Filter by role" className="!h-10 !rounded-full">
                <option value="all">Every role</option>
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {roleLabel(r)}
                  </option>
                ))}
              </Select>
            </div>
            <div className="w-36">
              <Select value={statusF} onChange={(e) => setStatusF(e.target.value)} aria-label="Filter by status" className="!h-10 !rounded-full">
                <option value="all">Any status</option>
                <option value="active">Active</option>
                <option value="inactive">Locked</option>
              </Select>
            </div>
            <Button variant="accent" onClick={() => setAdding(true)}>
              <Icon name="plus" size={15} /> Add a person
            </Button>
          </div>

          {peopleErr && <p className="mb-4 rounded-xl bg-rosy/60 px-4 py-2.5 text-sm text-[#8a2a20]">{peopleErr}</p>}

          <div className="overflow-x-auto rounded-[var(--radius-card)] border border-line bg-paper">
            <table className="w-full min-w-[760px] text-left text-[14px]">
              <thead>
                <tr className="border-b border-line font-mono text-[11px] uppercase tracking-[0.14em] text-mute">
                  <th className="px-5 py-3 font-medium">Person</th>
                  <th className="px-5 py-3 font-medium">Role</th>
                  <th className="px-5 py-3 font-medium">Access</th>
                  <th className="px-5 py-3 font-medium">Filed</th>
                  <th className="px-5 py-3 font-medium">Joined</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {people === null ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-10 text-center text-mute">
                      Loading people
                    </td>
                  </tr>
                ) : filteredPeople.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-10 text-center text-mute">
                      Nobody matches those filters.
                    </td>
                  </tr>
                ) : (
                  filteredPeople.map((p) => {
                    const self = p.id === user?.id;
                    const active = p.status !== 'inactive';
                    return (
                      <tr key={p.id} className="border-b border-line last:border-0 hover:bg-sage/40">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full font-display text-[12px] font-bold" style={{ background: swatch(p.name) }}>
                              {initials(p.name)}
                            </span>
                            <div className="min-w-0">
                              <p className="truncate font-semibold">
                                {p.name} {self && <span className="ml-1 rounded bg-ember-soft px-1.5 py-0.5 text-[10.5px] font-semibold text-[#c23f0d]">You</span>}
                              </p>
                              <p className="truncate text-[12.5px] text-mute">{p.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="rounded-full border border-line px-2.5 py-1 text-[12.5px] font-semibold">{roleLabel(p.role)}</span>
                        </td>
                        <td className="px-5 py-3.5">
                          <button
                            onClick={() => !self && toggleStatus(p)}
                            disabled={self}
                            role="switch"
                            aria-checked={active}
                            title={self ? 'You cannot lock yourself out' : active ? 'Lock this seat' : 'Unlock this seat'}
                            className="flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            <span className={`relative h-5 w-9 rounded-full transition-colors ${active ? 'bg-forest' : 'bg-line'}`}>
                              <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all ${active ? 'left-[18px]' : 'left-0.5'}`} />
                            </span>
                            <span className={`text-[13px] font-semibold ${active ? 'text-forest' : 'text-mute'}`}>{active ? 'Active' : 'Locked'}</span>
                          </button>
                        </td>
                        <td className="px-5 py-3.5 font-mono text-[13px]">{p.tools_count}</td>
                        <td className="px-5 py-3.5 text-[13px] text-ink-soft">{shortDate(p.created_at)}</td>
                        <td className="px-5 py-3.5">
                          <div className="flex justify-end gap-1">
                            <button
                              onClick={() => {
                                setEditingPerson(p);
                                setPersonForm({ name: p.name, email: p.email, role: p.role });
                                setPersonErr({});
                              }}
                              aria-label={`Edit ${p.name}`}
                              className="grid h-8 w-8 place-items-center rounded-full border border-line text-ink-soft hover:bg-moss"
                            >
                              <Icon name="edit" size={15} />
                            </button>
                            {!self && (
                              <button
                                onClick={() => setRemovingPerson(p)}
                                aria-label={`Remove ${p.name}`}
                                className="grid h-8 w-8 place-items-center rounded-full border border-line text-ink-soft hover:bg-rosy hover:text-[#8a2a20]"
                              >
                                <Icon name="trash" size={15} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* ---------------- SUBMISSIONS ---------------- */}
      {tab === 'submissions' && (
        <section>
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <label className="flex h-10 min-w-[220px] flex-1 items-center gap-2 rounded-full border border-line bg-paper px-4 focus-within:border-ink">
              <Icon name="search" size={16} className="text-mute" />
              <input value={toolQ} onChange={(e) => setToolQ(e.target.value)} placeholder="Find by tool or person" className="w-full bg-transparent text-sm focus:outline-none" />
            </label>
            <div className="flex gap-1 rounded-full border border-line bg-paper p-1">
              {['all', 'published', 'draft', 'archived'].map((s) => (
                <button
                  key={s}
                  onClick={() => setToolStatusF(s)}
                  className={`h-8 rounded-full px-3.5 text-[13px] font-semibold ${toolStatusF === s ? 'bg-ink text-paper' : 'text-ink-soft hover:text-ink'}`}
                >
                  {s === 'all' ? 'All' : s === 'published' ? 'Live' : s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto rounded-[var(--radius-card)] border border-line bg-paper">
            <table className="w-full min-w-[820px] text-left text-[14px]">
              <thead>
                <tr className="border-b border-line font-mono text-[11px] uppercase tracking-[0.14em] text-mute">
                  <th className="px-5 py-3 font-medium">Tool</th>
                  <th className="px-5 py-3 font-medium">Shelf</th>
                  <th className="px-5 py-3 font-medium">Filed by</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Opens / saves</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {tools === null ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-10 text-center text-mute">
                      Loading submissions
                    </td>
                  </tr>
                ) : filteredTools.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-10 text-center text-mute">
                      No submissions here.
                    </td>
                  </tr>
                ) : (
                  filteredTools.map((t) => (
                    <tr key={t.id} className="border-b border-line last:border-0 hover:bg-sage/40">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <ToolCover tool={t} size={36} />
                          <div className="min-w-0">
                            <p className="truncate font-semibold">{t.title}</p>
                            <p className="text-[12.5px] text-mute">{shortDate(t.created_at)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-[13.5px]">
                        <span className="inline-flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full" style={{ background: t.category?.color || '#1f3a2e' }} />
                          {t.category?.name || 'None'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-[13.5px]">{t.user?.name || 'Unknown'}</td>
                      <td className="px-5 py-3.5">
                        <StatusPill status={t.status} />
                      </td>
                      <td className="px-5 py-3.5 font-mono text-[13px]">
                        {t.views_count} / {t.favorites_count}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex justify-end gap-1">
                          {[
                            { icon: 'eye', label: 'Open', fn: () => setViewing(t), cls: 'hover:bg-sky' },
                            { icon: 'edit', label: 'Edit', fn: () => openToolEdit(t), cls: 'hover:bg-moss' },
                            { icon: 'trash', label: 'Remove', fn: () => setRemovingTool(t), cls: 'hover:bg-rosy hover:text-[#8a2a20]' },
                          ].map((a) => (
                            <button
                              key={a.label}
                              onClick={a.fn}
                              aria-label={`${a.label} ${t.title}`}
                              className={`grid h-8 w-8 place-items-center rounded-full border border-line text-ink-soft ${a.cls}`}
                            >
                              <Icon name={a.icon} size={15} />
                            </button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* ---------------- MODALS ---------------- */}
      <Modal isOpen={adding} onClose={() => setAdding(false)} title="Give someone a seat" subtitle="They sign in with this email and password, then a code.">
        <div className="space-y-4">
          <Input label="Full name" required value={newPerson.name} onChange={(e) => setNewPerson({ ...newPerson, name: e.target.value })} error={personErr.name} />
          <Input label="Email" type="email" required value={newPerson.email} onChange={(e) => setNewPerson({ ...newPerson, email: e.target.value })} error={personErr.email} />
          <Input
            label="Starting password"
            type="password"
            required
            value={newPerson.password}
            onChange={(e) => setNewPerson({ ...newPerson, password: e.target.value })}
            error={personErr.password}
            helperText="At least 8 characters. Ask them to change it."
          />
          <Select label="Role" value={newPerson.role} onChange={(e) => setNewPerson({ ...newPerson, role: e.target.value })} error={personErr.role}>
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {roleLabel(r)}
              </option>
            ))}
          </Select>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setAdding(false)}>
            Cancel
          </Button>
          <Button onClick={addPerson} isLoading={busy} disabled={!newPerson.name || !newPerson.email || newPerson.password.length < 8}>
            Add person
          </Button>
        </div>
      </Modal>

      <Modal isOpen={!!editingPerson} onClose={() => setEditingPerson(null)} title="Edit seat" subtitle={editingPerson?.email}>
        <div className="space-y-4">
          <Input label="Full name" value={personForm.name} onChange={(e) => setPersonForm({ ...personForm, name: e.target.value })} error={personErr.name} />
          <Input label="Email" type="email" value={personForm.email} onChange={(e) => setPersonForm({ ...personForm, email: e.target.value })} error={personErr.email} />
          <Select
            label="Role"
            value={personForm.role}
            onChange={(e) => setPersonForm({ ...personForm, role: e.target.value })}
            error={personErr.role}
            disabled={editingPerson?.id === user?.id}
            helperText={editingPerson?.id === user?.id ? 'You cannot change your own role.' : 'Role decides what they see on Home.'}
          >
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {roleLabel(r)}
              </option>
            ))}
          </Select>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setEditingPerson(null)}>
            Cancel
          </Button>
          <Button onClick={savePerson} isLoading={busy}>
            Save seat
          </Button>
        </div>
      </Modal>

      <Modal isOpen={!!removingPerson} onClose={() => setRemovingPerson(null)} title="Remove this person?" size="sm">
        <p className="text-[15px] text-ink-soft">
          <b className="text-ink">{removingPerson?.name}</b> loses access straight away. Tools they filed may be removed with them.
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setRemovingPerson(null)}>
            Keep
          </Button>
          <Button variant="danger" onClick={removePerson}>
            Remove
          </Button>
        </div>
      </Modal>

      <ToolDrawer tool={viewing} isOpen={!!viewing} onClose={() => setViewing(null)} />

      <Modal isOpen={!!editingTool} onClose={() => setEditingTool(null)} title="Edit submission" subtitle={editingTool ? `Filed by ${editingTool.user?.name || 'unknown'}` : ''} size="xl" variant="drawer">
        {toolValues && (
          <>
            <ToolForm values={toolValues} onChange={setToolValues} categories={categories} tags={tags} errors={toolErr} mode="edit" />
            <div className="sticky bottom-0 -mx-6 -mb-6 mt-8 flex justify-end gap-2 border-t border-line bg-paper px-6 py-4">
              <Button variant="ghost" onClick={() => setEditingTool(null)}>
                Cancel
              </Button>
              <Button onClick={saveTool} isLoading={busy}>
                Save changes
              </Button>
            </div>
          </>
        )}
      </Modal>

      <Modal isOpen={!!removingTool} onClose={() => setRemovingTool(null)} title="Remove this tool?" size="sm">
        <p className="text-[15px] text-ink-soft">
          <b className="text-ink">{removingTool?.title}</b> comes off the shelf with its saves and notes. This cannot be undone.
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setRemovingTool(null)}>
            Keep it
          </Button>
          <Button variant="danger" onClick={removeTool}>
            Remove
          </Button>
        </div>
      </Modal>
    </AppShell>
  );
}
