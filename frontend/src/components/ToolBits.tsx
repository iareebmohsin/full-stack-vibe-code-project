'use client';

import React from 'react';
import { Icon } from '@/components/Icon';
import { prettyEnum, roleLabel } from '@/lib/api';
import { Category, Tool } from '@/lib/types';

function abbr(name?: string) {
  if (!name) return '··';
  const words = name.replace(/&/g, ' ').split(/\s+/).filter(Boolean);
  return (words.length > 1 ? words[0][0] + words[1][0] : name.slice(0, 2)).toUpperCase();
}

/** Two-letter shelf mark tinted with the category colour. */
export function ShelfMark({ category, size = 44 }: { category?: Category | null; size?: number }) {
  const color = category?.color || '#1f3a2e';
  return (
    <span
      className="grid shrink-0 place-items-center rounded-[14px] font-display font-extrabold tracking-[-0.03em]"
      style={{ width: size, height: size, background: `${color}22`, color, fontSize: size * 0.34 }}
      aria-hidden="true"
    >
      {abbr(category?.name)}
    </span>
  );
}

/** Cover image if one was given, otherwise the shelf mark. */
export function ToolCover({ tool, size = 44 }: { tool: Tool; size?: number }) {
  if (tool.thumbnail_url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={tool.thumbnail_url}
        alt=""
        className="shrink-0 rounded-[14px] border border-line object-cover"
        style={{ width: size, height: size }}
      />
    );
  }
  return <ShelfMark category={tool.category} size={size} />;
}

export function StatusPill({ status }: { status?: string }) {
  const map: Record<string, string> = {
    published: 'bg-moss text-forest',
    draft: 'bg-butter text-[#6b5412]',
    archived: 'bg-sage-deep text-mute',
  };
  return (
    <span className={`inline-flex h-6 items-center gap-1.5 rounded-full px-2.5 text-[12px] font-semibold ${map[status || 'draft'] || map.draft}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {status === 'published' ? 'Live' : prettyEnum(status || 'draft')}
    </span>
  );
}

export function SaveButton({ saved, count, onClick, compact = false }: { saved?: boolean; count: number; onClick: () => void; compact?: boolean }) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      aria-pressed={!!saved}
      title={saved ? 'Saved to your kit' : 'Save to your kit'}
      className={`inline-flex items-center gap-1.5 rounded-full border font-semibold transition-colors ${
        compact ? 'h-8 px-2.5 text-[12.5px]' : 'h-9 px-3.5 text-[13px]'
      } ${saved ? 'border-ember bg-ember-soft text-[#c23f0d]' : 'border-line bg-white text-ink-soft hover:border-ember hover:text-[#c23f0d]'}`}
    >
      <Icon name="heart" size={15} filled={saved} />
      {count}
    </button>
  );
}

/** Library card. */
export function ToolTile({
  tool,
  onOpen,
  onSave,
  canSave,
  index = 0,
}: {
  tool: Tool;
  onOpen: () => void;
  onSave: () => void;
  canSave: boolean;
  index?: number;
}) {
  return (
    <article
      onClick={onOpen}
      className="rise group flex cursor-pointer flex-col rounded-[var(--radius-card)] border border-line bg-paper p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-ink/30 hover:shadow-[0_14px_34px_-22px_rgba(23,34,27,0.55)]"
      style={{ animationDelay: `${Math.min(index, 12) * 35}ms` }}
    >
      <div className="flex items-start gap-3.5">
        <ToolCover tool={tool} />
        <div className="min-w-0 flex-1">
          <p className="truncate font-mono text-[11px] uppercase tracking-[0.12em] text-mute">{tool.category?.name || 'Unshelved'}</p>
          <h3 className="mt-0.5 line-clamp-1 font-display text-[18px] font-bold tracking-[-0.025em] text-ink group-hover:text-forest">{tool.title}</h3>
        </div>
        {tool.status && tool.status !== 'published' && <StatusPill status={tool.status} />}
      </div>

      <p className="mt-3 line-clamp-3 flex-1 text-[14px] leading-relaxed text-ink-soft">{tool.description}</p>

      {!!tool.tags?.length && (
        <div className="mt-4 flex flex-wrap gap-1">
          {tool.tags.slice(0, 3).map((t) => (
            <span key={t.id} className="rounded-md bg-sage px-2 py-0.5 text-[12px] font-medium text-ink-soft">
              #{t.name.toLowerCase().replace(/\s+/g, '')}
            </span>
          ))}
          {tool.tags.length > 3 && <span className="px-1 py-0.5 text-[12px] text-mute">+{tool.tags.length - 3}</span>}
        </div>
      )}

      <div className="mt-4 flex items-center justify-between border-t border-dashed border-line pt-3.5">
        <div className="flex items-center gap-3 text-[12.5px] text-mute">
          <span className="rounded-md border border-line px-1.5 py-0.5 font-mono text-[11px] uppercase">{prettyEnum(tool.pricing_model)}</span>
          <span className="flex items-center gap-1">
            <Icon name="eye" size={14} /> {tool.views_count}
          </span>
        </div>
        {canSave ? (
          <SaveButton compact saved={tool.is_favorited} count={tool.favorites_count} onClick={onSave} />
        ) : (
          <span className="flex items-center gap-1 text-[12.5px] text-mute">
            <Icon name="heart" size={14} /> {tool.favorites_count}
          </span>
        )}
      </div>
    </article>
  );
}

export function RoleList({ roles }: { roles?: string[] }) {
  if (!roles?.length) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {roles.map((r) => (
        <span key={r} className="rounded-full bg-forest px-2.5 py-1 text-[12px] font-semibold text-paper">
          {roleLabel(r)}
        </span>
      ))}
    </div>
  );
}
