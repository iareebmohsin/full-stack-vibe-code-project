'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/AppShell';
import { Icon } from '@/components/Icon';
import { ToolForm } from '@/components/ToolForm';
import { StatusPill, ToolCover } from '@/components/ToolBits';
import { ToolDrawer } from '@/components/ToolDrawer';
import { Button, Input, Modal, useToast } from '@/components/ui';
import { useAuth, User } from '@/contexts/AuthContext';
import { api, errorMessage, fieldErrors, initials, prettyEnum, roleLabel, shortDate } from '@/lib/api';
import { Category, formToPayload, Tag, Tool, ToolFormValues, toolToForm } from '@/lib/types';

const SEAT_RIGHTS: Record<string, string[]> = {
  owner: ['Everything a member can do', 'Add, edit, lock and remove people', 'Edit or remove any tool', 'See usage across the whole team'],
  default: ['Share tools to the library', 'Edit and remove your own tools', 'Save tools and leave notes', 'Browse every published tool'],
};

type Filter = 'all' | 'published' | 'draft' | 'archived';

export default function MyKitPage() {
  const { user, token, updateUser } = useAuth();
  const { addToast } = useToast();

  const [tab, setTab] = useState<'tools' | 'account'>('tools');
  const [tools, setTools] = useState<Tool[] | null>(null);
  const [filter, setFilter] = useState<Filter>('all');
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);

  const [profile, setProfile] = useState({ name: '', email: '' });
  const [profileErr, setProfileErr] = useState<Record<string, string>>({});
  const [savingProfile, setSavingProfile] = useState(false);

  const [viewing, setViewing] = useState<Tool | null>(null);
  const [editing, setEditing] = useState<Tool | null>(null);
  const [editValues, setEditValues] = useState<ToolFormValues | null>(null);
  const [editErr, setEditErr] = useState<Record<string, string>>({});
  const [savingEdit, setSavingEdit] = useState(false);
  const [deleting, setDeleting] = useState<Tool | null>(null);

  const loadTools = useCallback(async () => {
    const r = await api<{ success: boolean; data: { data: Tool[] } | Tool[] }>('/my-tools', { token });
    if (!r.ok || r.status === 204) return setTools([]);
    const d = r.data?.data;
    setTools(Array.isArray(d) ? d : d?.data || []);
  }, [token]);

  useEffect(() => {
    if (!user) return;
    setProfile({ name: user.name, email: user.email });
    loadTools();
    Promise.all([api<{ data: Category[] }>('/categories'), api<{ data: Tag[] }>('/tags')]).then(([c, t]) => {
      if (c.ok) setCategories(c.data.data || []);
      if (t.ok) setTags(t.data.data || []);
    });
  }, [user, loadTools]);

  const counts = useMemo(() => {
    const list = tools || [];
    const now = new Date();
    return {
      all: list.length,
      published: list.filter((t) => t.status === 'published').length,
      draft: list.filter((t) => t.status === 'draft').length,
      archived: list.filter((t) => t.status === 'archived').length,
      month: list.filter((t) => {
        const d = new Date(t.created_at);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      }).length,
    };
  }, [tools]);

  const shown = (tools || []).filter((t) => filter === 'all' || t.status === filter);

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileErr({});
    try {
      const r = await api<{ user?: User }>('/profile', { method: 'PUT', token, body: profile });
      if (r.ok && r.data.user) {
        updateUser(r.data.user);
        addToast('Account details saved', 'success');
      } else {
        setProfileErr(fieldErrors(r.data));
        addToast(errorMessage(r.data, 'Could not save your details'), 'error');
      }
    } finally {
      setSavingProfile(false);
    }
  };

  const openEdit = async (t: Tool) => {
    const r = await api<{ data: Tool }>(`/tools/${t.id}`, { token });
    const full = r.ok ? r.data.data : t;
    setEditing(full);
    setEditValues(toolToForm(full));
    setEditErr({});
  };

  const saveEdit = async () => {
    if (!editing || !editValues) return;
    setSavingEdit(true);
    try {
      const r = await api(`/tools/${editing.id}`, { method: 'PUT', token, body: formToPayload(editValues) });
      if (r.ok) {
        addToast('Tool updated', 'success');
        setEditing(null);
        loadTools();
      } else {
        setEditErr(fieldErrors(r.data));
        addToast(errorMessage(r.data, 'Could not update the tool'), 'error');
      }
    } finally {
      setSavingEdit(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    const r = await api(`/tools/${deleting.id}`, { method: 'DELETE', token });
    if (r.ok) {
      setTools((l) => l?.filter((t) => t.id !== deleting.id) || l);
      addToast(`${deleting.title} was removed`, 'success');
    } else addToast('Could not remove that tool', 'error');
    setDeleting(null);
  };

  const rights = SEAT_RIGHTS[user?.role || ''] || SEAT_RIGHTS.default;

  return (
    <AppShell>
      {user && (
        <>
          {/* Identity band */}
          <section className="rise relative overflow-hidden rounded-[28px] bg-forest px-6 py-8 text-paper sm:px-10">
            <div className="absolute inset-0 dot-grid-light opacity-60" />
            <div className="relative flex flex-wrap items-center gap-6">
              <span className="grid h-20 w-20 place-items-center rounded-[24px] bg-ember font-display text-[28px] font-extrabold text-white">
                {initials(user.name)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-paper/60">My kit</p>
                <h1 className="font-display text-[34px] font-extrabold leading-tight tracking-[-0.035em]">{user.name}</h1>
                <p className="text-paper/70">
                  {user.email} · {roleLabel(user.role)} seat
                </p>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  ['Filed', counts.all],
                  ['Live', counts.published],
                  ['This month', counts.month],
                ].map(([k, v]) => (
                  <div key={k as string} className="rounded-2xl bg-white/10 px-4 py-3 text-center">
                    <p className="font-display text-2xl font-extrabold">{tools ? v : '·'}</p>
                    <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-paper/60">{k}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Tabs */}
          <div className="mt-6 flex items-center gap-1 border-b border-line">
            {(
              [
                ['tools', 'Submissions'],
                ['account', 'Account'],
              ] as const
            ).map(([k, label]) => (
              <button
                key={k}
                onClick={() => setTab(k)}
                className={`-mb-px border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${
                  tab === k ? 'border-ember text-ink' : 'border-transparent text-mute hover:text-ink'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {tab === 'tools' ? (
            <section className="mt-6">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex gap-1 rounded-full border border-line bg-paper p-1">
                  {(['all', 'published', 'draft', 'archived'] as Filter[]).map((f) => (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className={`h-8 rounded-full px-3.5 text-[13px] font-semibold ${filter === f ? 'bg-ink text-paper' : 'text-ink-soft hover:text-ink'}`}
                    >
                      {f === 'all' ? 'All' : f === 'published' ? 'Live' : prettyEnum(f)} <span className="opacity-60">{counts[f]}</span>
                    </button>
                  ))}
                </div>
                <Link href="/tools/add" className="inline-flex h-9 items-center gap-2 rounded-full bg-ember px-4 text-sm font-semibold text-white">
                  <Icon name="plus" size={15} /> Share a tool
                </Link>
              </div>

              {tools === null ? (
                <div className="space-y-2">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="h-20 animate-pulse rounded-2xl bg-paper/70" />
                  ))}
                </div>
              ) : shown.length === 0 ? (
                <div className="rounded-[var(--radius-card)] border border-dashed border-ink/20 px-6 py-14 text-center">
                  <h3 className="font-display text-xl font-bold">{tools.length ? 'Nothing in this pile' : 'Your kit is empty'}</h3>
                  <p className="mt-1 text-sm text-mute">{tools.length ? 'Try another filter.' : 'Anything you share shows up here, drafts included.'}</p>
                </div>
              ) : (
                <ul className="overflow-hidden rounded-[var(--radius-card)] border border-line bg-paper">
                  {shown.map((t, i) => (
                    <li key={t.id} className={`flex flex-wrap items-center gap-4 px-5 py-4 sm:flex-nowrap ${i ? 'border-t border-line' : ''}`}>
                      <ToolCover tool={t} size={44} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="truncate font-semibold text-ink">{t.title}</p>
                          <StatusPill status={t.status} />
                        </div>
                        <p className="mt-0.5 truncate text-[13px] text-mute">
                          {t.category?.name || 'No shelf'} · filed {shortDate(t.created_at)} · {t.views_count} opens · {t.favorites_count} saves
                        </p>
                      </div>
                      <div className="flex shrink-0 gap-1">
                        {[
                          { icon: 'eye', label: 'Open', fn: () => setViewing(t), cls: 'hover:bg-sky' },
                          { icon: 'edit', label: 'Edit', fn: () => openEdit(t), cls: 'hover:bg-moss' },
                          { icon: 'trash', label: 'Remove', fn: () => setDeleting(t), cls: 'hover:bg-rosy hover:text-[#8a2a20]' },
                        ].map((a) => (
                          <button
                            key={a.label}
                            onClick={a.fn}
                            title={a.label}
                            aria-label={`${a.label} ${t.title}`}
                            className={`grid h-9 w-9 place-items-center rounded-full border border-line text-ink-soft transition-colors ${a.cls}`}
                          >
                            <Icon name={a.icon} size={16} />
                          </button>
                        ))}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ) : (
            <section className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
              <form onSubmit={saveProfile} className="rounded-[var(--radius-card)] border border-line bg-paper p-6 sm:p-8">
                <h2 className="font-display text-lg font-bold tracking-[-0.02em]">Account details</h2>
                <p className="text-[13.5px] text-mute">Used for sign in and shown next to your notes.</p>
                <div className="mt-5 space-y-4">
                  <Input label="Full name" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} error={profileErr.name} />
                  <Input
                    label="Email"
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    error={profileErr.email}
                    helperText="Your sign-in codes go to this address."
                  />
                </div>
                <div className="mt-6 flex gap-2">
                  <Button type="submit" isLoading={savingProfile}>
                    Save details
                  </Button>
                  <Button type="button" variant="ghost" onClick={() => setProfile({ name: user.name, email: user.email })}>
                    Reset
                  </Button>
                </div>
              </form>

              <div className="rounded-[var(--radius-card)] border border-line bg-paper p-6">
                <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-mute">{roleLabel(user.role)} seat</p>
                <h2 className="mt-1 font-display text-lg font-bold tracking-[-0.02em]">What your seat can do</h2>
                <ul className="mt-4 space-y-2.5">
                  {rights.map((r) => (
                    <li key={r} className="flex items-start gap-2.5 text-[14px] text-ink-soft">
                      <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-moss text-forest">
                        <Icon name="check" size={12} strokeWidth={2.6} />
                      </span>
                      {r}
                    </li>
                  ))}
                </ul>
                <p className="mt-6 border-t border-line pt-4 text-[13px] text-mute">
                  Member no. <span className="font-mono text-ink">{String(user.id).padStart(4, '0')}</span>
                </p>
              </div>
            </section>
          )}
        </>
      )}

      <ToolDrawer tool={viewing} isOpen={!!viewing} onClose={() => setViewing(null)} />

      <Modal isOpen={!!editing} onClose={() => setEditing(null)} title="Edit tool" subtitle={editing?.title} size="xl" variant="drawer">
        {editValues && (
          <>
            <ToolForm values={editValues} onChange={setEditValues} categories={categories} tags={tags} errors={editErr} mode="edit" />
            <div className="sticky bottom-0 -mx-6 -mb-6 mt-8 flex justify-end gap-2 border-t border-line bg-paper px-6 py-4">
              <Button variant="ghost" onClick={() => setEditing(null)}>
                Cancel
              </Button>
              <Button onClick={saveEdit} isLoading={savingEdit}>
                Save changes
              </Button>
            </div>
          </>
        )}
      </Modal>

      <Modal isOpen={!!deleting} onClose={() => setDeleting(null)} title="Remove this tool?" size="sm">
        <p className="text-[15px] text-ink-soft">
          <b className="text-ink">{deleting?.title}</b> will be taken off the shelf along with its saves and notes. This cannot be undone.
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setDeleting(null)}>
            Keep it
          </Button>
          <Button variant="danger" onClick={confirmDelete}>
            Remove
          </Button>
        </div>
      </Modal>
    </AppShell>
  );
}
