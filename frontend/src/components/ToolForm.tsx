'use client';

import React from 'react';
import { Input, Select, Textarea } from '@/components/ui';
import { ROLES, roleLabel } from '@/lib/api';
import { Category, PRICING, Tag, TOOL_TYPES, ToolFormValues } from '@/lib/types';

type Props = {
  values: ToolFormValues;
  onChange: (next: ToolFormValues) => void;
  categories: Category[];
  tags: Tag[];
  errors?: Record<string, string>;
  mode?: 'create' | 'edit';
  /** Section anchors let the add page scroll-spy its step list. */
  withAnchors?: boolean;
};

export function Section({
  id,
  step,
  title,
  hint,
  children,
}: {
  id?: string;
  step?: string;
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24 border-t border-line pt-6 first:border-t-0 first:pt-0">
      <div className="mb-4 flex items-baseline gap-3">
        {step && <span className="font-mono text-[11px] font-medium tracking-[0.14em] text-ember">{step}</span>}
        <div>
          <h3 className="font-display text-[17px] font-bold tracking-[-0.02em] text-ink">{title}</h3>
          {hint && <p className="text-[13px] text-mute">{hint}</p>}
        </div>
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Chip({ on, onClick, children, tone = 'ink' }: { on: boolean; onClick: () => void; children: React.ReactNode; tone?: 'ink' | 'forest' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      className={`h-8 rounded-full border px-3.5 text-[13px] font-semibold transition-colors ${
        on
          ? tone === 'ink'
            ? 'border-ink bg-ink text-paper'
            : 'border-forest bg-forest text-paper'
          : 'border-line bg-white text-ink-soft hover:border-ink/40 hover:text-ink'
      }`}
    >
      {children}
    </button>
  );
}

export function ToolForm({ values, onChange, categories, tags, errors = {}, mode = 'create', withAnchors = false }: Props) {
  const set = <K extends keyof ToolFormValues>(key: K, value: ToolFormValues[K]) => onChange({ ...values, [key]: value });

  const toggle = (key: 'tags' | 'roles', item: number | string, max?: number) => {
    const list = values[key] as (number | string)[];
    if (list.includes(item)) set(key, list.filter((x) => x !== item) as never);
    else if (!max || list.length < max) set(key, [...list, item] as never);
  };

  const a = (id: string) => (withAnchors ? id : undefined);

  return (
    <div className="space-y-7">
      <Section id={a('basics')} step={withAnchors ? '01' : undefined} title="The basics" hint="What is it, in one name and a few honest lines.">
        <Input
          label="Tool name"
          required
          value={values.title}
          onChange={(e) => set('title', e.target.value)}
          placeholder="Perplexity, Cursor, Runway"
          error={errors.title}
        />
        <Textarea
          label="Why the team should care"
          required
          rows={5}
          value={values.description}
          onChange={(e) => set('description', e.target.value)}
          placeholder="What it does, where it saved you time, and any gotchas. At least 20 characters."
          error={errors.description}
          helperText={`${values.description.length} of 2000 characters`}
        />
      </Section>

      <Section id={a('links')} step={withAnchors ? '02' : undefined} title="Where to find it" hint="All optional. Links open in a new tab.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Website" type="url" spellCheck={false} value={values.url} onChange={(e) => set('url', e.target.value)} placeholder="https://" error={errors.url} />
          <Input
            label="Docs"
            type="url"
            spellCheck={false}
            value={values.documentation_url}
            onChange={(e) => set('documentation_url', e.target.value)}
            placeholder="https://"
            error={errors.documentation_url}
          />
          <Input
            label="GitHub repo"
            type="url"
            spellCheck={false}
            value={values.github_url}
            onChange={(e) => set('github_url', e.target.value)}
            placeholder="https://github.com/owner/repo"
            error={errors.github_url}
          />
          <Input
            label="Cover image"
            type="url"
            spellCheck={false}
            value={values.thumbnail_url}
            onChange={(e) => set('thumbnail_url', e.target.value)}
            placeholder="https://…/cover.png"
            error={errors.thumbnail_url}
          />
        </div>
      </Section>

      <Section id={a('classify')} step={withAnchors ? '03' : undefined} title="Shelve it" hint="Helps people find it in the library.">
        <div className="grid gap-4 sm:grid-cols-3">
          <Select label="Shelf" required value={values.category_id} onChange={(e) => set('category_id', e.target.value)} error={errors.category_id}>
            <option value="">Choose a shelf</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
          <Select label="Kind" required value={values.tool_type} onChange={(e) => set('tool_type', e.target.value)} error={errors.tool_type}>
            <option value="">Choose a kind</option>
            {TOOL_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </Select>
          <Select label="Cost" required value={values.pricing_model} onChange={(e) => set('pricing_model', e.target.value)} error={errors.pricing_model}>
            <option value="">Choose a cost</option>
            {PRICING.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <div className="mb-2 flex items-baseline justify-between">
            <p className="text-[13px] font-semibold text-ink-soft">
              Labels <span className="text-ember">*</span>
            </p>
            <p className="font-mono text-[11px] text-mute">{values.tags.length} / 10</p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {tags.length === 0 && <p className="text-sm text-mute">Loading labels</p>}
            {tags.map((t) => (
              <Chip key={t.id} on={values.tags.includes(t.id)} onClick={() => toggle('tags', t.id, 10)}>
                {t.name}
              </Chip>
            ))}
          </div>
          {errors.tags && <p className="mt-1.5 text-[13px] text-[#b3261e]">{errors.tags}</p>}
        </div>

        <div>
          <p className="mb-2 text-[13px] font-semibold text-ink-soft">
            Useful for <span className="text-ember">*</span>
          </p>
          <div className="flex flex-wrap gap-1.5">
            {ROLES.map((r) => (
              <Chip key={r} tone="forest" on={values.roles.includes(r)} onClick={() => toggle('roles', r)}>
                {roleLabel(r)}
              </Chip>
            ))}
          </div>
          {errors.roles && <p className="mt-1.5 text-[13px] text-[#b3261e]">{errors.roles}</p>}
        </div>
      </Section>

      <Section id={a('publish')} step={withAnchors ? '04' : undefined} title="Visibility">
        <div className="grid gap-2 sm:grid-cols-3">
          {(
            [
              { v: 'draft', t: 'Keep as draft', d: 'Only you can see it' },
              { v: 'published', t: 'Publish now', d: 'Shows up in the library' },
              ...(mode === 'edit' ? [{ v: 'archived', t: 'Archive', d: 'Hidden, kept for records' }] : []),
            ] as { v: ToolFormValues['status']; t: string; d: string }[]
          ).map((o) => (
            <button
              key={o.v}
              type="button"
              onClick={() => set('status', o.v)}
              aria-pressed={values.status === o.v}
              className={`rounded-2xl border p-3.5 text-left transition-colors ${
                values.status === o.v ? 'border-ink bg-ink text-paper' : 'border-line bg-white hover:border-ink/40'
              }`}
            >
              <span className="block text-sm font-semibold">{o.t}</span>
              <span className={`block text-[12.5px] ${values.status === o.v ? 'text-paper/70' : 'text-mute'}`}>{o.d}</span>
            </button>
          ))}
        </div>
      </Section>
    </div>
  );
}
