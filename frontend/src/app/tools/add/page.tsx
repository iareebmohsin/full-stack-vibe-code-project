'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell, PageHead } from '@/components/AppShell';
import { Icon } from '@/components/Icon';
import { ToolForm } from '@/components/ToolForm';
import { ToolTile } from '@/components/ToolBits';
import { useToast } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { api, errorMessage, fieldErrors } from '@/lib/api';
import { Category, EMPTY_TOOL, formToPayload, Tag, Tool, ToolFormValues } from '@/lib/types';

export default function ShareToolPage() {
  const router = useRouter();
  const { user, token } = useAuth();
  const { addToast } = useToast();

  const [values, setValues] = useState<ToolFormValues>(EMPTY_TOOL);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loadError, setLoadError] = useState('');
  const [saving, setSaving] = useState(false);

  const loadTaxonomy = async () => {
    setLoadError('');
    try {
      const [c, t] = await Promise.all([api<{ data: Category[] }>('/categories'), api<{ data: Tag[] }>('/tags')]);
      if (!c.ok || !t.ok) throw new Error();
      setCategories(c.data.data || []);
      setTags(t.data.data || []);
    } catch {
      setLoadError('Could not load shelves and labels from the API.');
    }
  };

  useEffect(() => {
    loadTaxonomy();
  }, []);

  const checks = useMemo(
    () => [
      { k: 'Name it', ok: values.title.trim().length >= 3 },
      { k: 'Write at least 20 characters', ok: values.description.trim().length >= 20 },
      { k: 'Pick a shelf', ok: !!values.category_id },
      { k: 'Say what kind it is', ok: !!values.tool_type },
      { k: 'Say what it costs', ok: !!values.pricing_model },
      { k: 'Add a label or two', ok: values.tags.length > 0 },
      { k: 'Choose who it helps', ok: values.roles.length > 0 },
    ],
    [values]
  );
  const ready = checks.every((c) => c.ok);
  const done = checks.filter((c) => c.ok).length;

  const preview: Tool = useMemo(
    () => ({
      id: 0,
      title: values.title || 'Your tool name',
      description: values.description || 'A short write-up appears here as you type. Say what it is good at and when you reach for it.',
      thumbnail_url: values.thumbnail_url || null,
      category: categories.find((c) => String(c.id) === values.category_id) || { id: 0, name: 'No shelf yet' },
      tags: tags.filter((t) => values.tags.includes(t.id)),
      tool_type: values.tool_type || 'application',
      pricing_model: values.pricing_model || 'free',
      status: values.status,
      views_count: 0,
      favorites_count: 0,
      created_at: new Date().toISOString(),
    }),
    [values, categories, tags]
  );

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSaving(true);
    setErrors({});
    try {
      const res = await api('/tools', { method: 'POST', token, body: formToPayload(values) });
      if (res.ok) {
        addToast(values.status === 'published' ? 'Published. It is on the shelf now.' : 'Saved as a draft in your kit.', 'success');
        router.push(values.status === 'published' ? '/tools' : '/profile');
      } else {
        setErrors(fieldErrors(res.data));
        addToast(errorMessage(res.data, 'The tool could not be saved.'), 'error', 6000);
      }
    } catch {
      addToast('Cannot reach the server. Check that the API is running.', 'error', 6000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppShell wide>
      <PageHead
        kicker="Share a tool"
        title="File something worth keeping."
        lede={`You are filing as ${user?.name ?? 'a team member'}. Drafts stay in your kit until you publish them.`}
      />

      {loadError && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#e8b4ad] bg-rosy/60 px-5 py-3 text-sm text-[#8a2a20]">
          {loadError}
          <button onClick={loadTaxonomy} className="inline-flex items-center gap-1.5 font-semibold">
            <Icon name="refresh" size={15} /> Try again
          </button>
        </div>
      )}

      <form onSubmit={submit} className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="rise rounded-[var(--radius-card)] border border-line bg-paper p-6 sm:p-8" style={{ animationDelay: '60ms' }}>
          <ToolForm values={values} onChange={setValues} categories={categories} tags={tags} errors={errors} withAnchors />
        </div>

        <aside className="rise space-y-4 lg:sticky lg:top-24" style={{ animationDelay: '120ms' }}>
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-mute">Live preview</p>
          <div className="pointer-events-none">
            <ToolTile tool={preview} onOpen={() => undefined} onSave={() => undefined} canSave={false} />
          </div>

          <div className="rounded-[var(--radius-card)] border border-line bg-paper p-5">
            <div className="flex items-baseline justify-between">
              <p className="font-display text-[15px] font-bold">Ready to file</p>
              <p className="font-mono text-[12px] text-mute">
                {done}/{checks.length}
              </p>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-sage">
              <div className="h-full rounded-full bg-ember transition-all" style={{ width: `${(done / checks.length) * 100}%` }} />
            </div>
            <ul className="mt-4 space-y-2">
              {checks.map((c) => (
                <li key={c.k} className={`flex items-center gap-2.5 text-[13.5px] ${c.ok ? 'text-ink' : 'text-mute'}`}>
                  <span className={`grid h-5 w-5 place-items-center rounded-full ${c.ok ? 'bg-forest text-paper' : 'border border-line'}`}>
                    {c.ok && <Icon name="check" size={12} strokeWidth={2.6} />}
                  </span>
                  {c.k}
                </li>
              ))}
            </ul>
            <button
              type="submit"
              disabled={!ready || saving}
              className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-ink text-[15px] font-semibold text-paper transition-colors hover:bg-forest disabled:opacity-40"
            >
              {saving ? 'Filing' : values.status === 'published' ? 'Publish to the library' : 'Save draft'}
            </button>
            <button type="button" onClick={() => router.back()} className="mt-2 h-10 w-full rounded-full text-sm font-semibold text-ink-soft hover:text-ink">
              Cancel
            </button>
          </div>
        </aside>
      </form>
    </AppShell>
  );
}
