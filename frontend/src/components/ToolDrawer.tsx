'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Modal } from '@/components/ui';
import { Icon } from '@/components/Icon';
import { RoleList, SaveButton, ShelfMark, StatusPill, ToolCover } from '@/components/ToolBits';
import { useAuth } from '@/contexts/AuthContext';
import { api, initials, prettyEnum, shortDate, swatch } from '@/lib/api';
import { Tool } from '@/lib/types';

interface Comment {
  id: number;
  comment: string;
  user: { id: number; name: string };
  created_at: string;
}

/** Right-hand drawer with the full tool record and its discussion thread. */
export function ToolDrawer({
  tool,
  isOpen,
  onClose,
  onFavoriteToggle,
}: {
  tool: Tool | null;
  isOpen: boolean;
  onClose: () => void;
  onFavoriteToggle?: (toolId: number) => void;
}) {
  const { token } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [draft, setDraft] = useState('');
  const [posting, setPosting] = useState(false);
  const [views, setViews] = useState<number | null>(null);

  const load = useCallback(async (id: number) => {
    setLoading(true);
    setViews(null);
    // Opening the file counts as a view on the server
    api<{ data: Tool }>(`/tools/${id}`).then((r) => r.ok && setViews(r.data.data.views_count));
    try {
      const res = await api<{ data: Comment[] }>(`/tools/${id}/comments`, { token: null });
      if (res.ok) setComments(res.data.data || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen && tool) load(tool.id);
  }, [isOpen, tool, load]);

  const post = async () => {
    if (!tool || !draft.trim() || !token) return;
    setPosting(true);
    try {
      const res = await api<{ data: Comment }>(`/tools/${tool.id}/comments`, { method: 'POST', token, body: { comment: draft.trim() } });
      if (res.ok) {
        setComments((c) => [res.data.data, ...c]);
        setDraft('');
      }
    } finally {
      setPosting(false);
    }
  };

  if (!tool) return null;

  const links = [
    { href: tool.url, label: 'Open website', icon: 'arrowUpRight', primary: true },
    { href: tool.documentation_url, label: 'Read the docs', icon: 'book' },
    { href: tool.github_url, label: 'Source on GitHub', icon: 'code' },
  ].filter((l) => l.href);

  return (
    <Modal isOpen={isOpen} onClose={onClose} variant="drawer" size="lg" title="Tool file" subtitle={tool.category?.name}>
      <div className="space-y-7">
        <div className="flex items-start gap-4">
          <ToolCover tool={tool} size={64} />
          <div className="min-w-0 flex-1">
            <h2 className="font-display text-[28px] font-extrabold leading-tight tracking-[-0.035em] text-ink">{tool.title}</h2>
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              {tool.status && <StatusPill status={tool.status} />}
              <span className="rounded-md border border-line px-2 py-0.5 font-mono text-[11px] uppercase text-ink-soft">{prettyEnum(tool.tool_type)}</span>
              <span className="rounded-md border border-line px-2 py-0.5 font-mono text-[11px] uppercase text-ink-soft">{prettyEnum(tool.pricing_model)}</span>
            </div>
          </div>
        </div>

        <p className="text-[15.5px] leading-relaxed text-ink-soft">{tool.description}</p>

        <div className="grid grid-cols-3 overflow-hidden rounded-2xl border border-line bg-white text-center">
          <div className="border-r border-line px-3 py-3">
            <p className="font-display text-2xl font-extrabold">{views ?? tool.views_count}</p>
            <p className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-mute">Opens</p>
          </div>
          <div className="border-r border-line px-3 py-3">
            <p className="font-display text-2xl font-extrabold">{tool.favorites_count}</p>
            <p className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-mute">Saves</p>
          </div>
          <div className="px-3 py-3">
            <p className="font-display text-2xl font-extrabold">{comments.length}</p>
            <p className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-mute">Notes</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {links.map((l) => (
            <a
              key={l.label}
              href={l.href as string}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex h-10 items-center gap-2 rounded-full px-4 text-sm font-semibold transition-colors ${
                l.primary ? 'bg-ink text-paper hover:bg-forest' : 'border border-line bg-white text-ink hover:border-ink/40'
              }`}
            >
              <Icon name={l.icon} size={15} />
              {l.label}
            </a>
          ))}
          {token && onFavoriteToggle && (
            <SaveButton saved={tool.is_favorited} count={tool.favorites_count} onClick={() => onFavoriteToggle(tool.id)} />
          )}
        </div>

        {(!!tool.tags?.length || !!tool.roles_list?.length) && (
          <div className="grid gap-5 sm:grid-cols-2">
            {!!tool.tags?.length && (
              <div>
                <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.14em] text-mute">Labels</p>
                <div className="flex flex-wrap gap-1">
                  {tool.tags.map((t) => (
                    <span key={t.id} className="rounded-md bg-sage px-2 py-1 text-[12.5px] font-medium text-ink-soft">
                      #{t.name.toLowerCase().replace(/\s+/g, '')}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {!!tool.roles_list?.length && (
              <div>
                <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.14em] text-mute">Useful for</p>
                <RoleList roles={tool.roles_list} />
              </div>
            )}
          </div>
        )}

        <div className="flex items-center gap-3 rounded-2xl bg-sage px-4 py-3">
          <ShelfMark category={tool.category} size={34} />
          <p className="text-[13.5px] text-ink-soft">
            Shared {tool.user?.name ? <>by <b className="text-ink">{tool.user.name}</b></> : ''} on {shortDate(tool.created_at)}
          </p>
        </div>

        <div>
          <div className="mb-3 flex items-baseline justify-between">
            <h3 className="font-display text-lg font-bold tracking-[-0.02em]">Team notes</h3>
            <span className="font-mono text-[11px] text-mute">{comments.length} total</span>
          </div>

          {token ? (
            <div className="mb-4 rounded-2xl border border-line bg-white p-2 focus-within:border-ink">
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                rows={2}
                placeholder="Add a note for the team: a tip, a warning, a use case"
                className="w-full resize-none bg-transparent px-2 py-1.5 text-[14.5px] focus:outline-none"
              />
              <div className="flex justify-end">
                <button
                  onClick={post}
                  disabled={!draft.trim() || posting}
                  className="h-8 rounded-full bg-ink px-4 text-[13px] font-semibold text-paper disabled:opacity-40"
                >
                  {posting ? 'Posting' : 'Post note'}
                </button>
              </div>
            </div>
          ) : (
            <p className="mb-4 text-sm text-mute">Sign in to leave a note.</p>
          )}

          {loading ? (
            <div className="space-y-2">
              {[0, 1].map((i) => (
                <div key={i} className="h-16 animate-pulse rounded-2xl bg-sage" />
              ))}
            </div>
          ) : comments.length ? (
            <ol className="space-y-3">
              {comments.map((c) => (
                <li key={c.id} className="flex gap-3">
                  <span
                    className="grid h-8 w-8 shrink-0 place-items-center rounded-full font-display text-[11px] font-bold text-ink"
                    style={{ background: swatch(c.user?.name) }}
                  >
                    {initials(c.user?.name || '?')}
                  </span>
                  <div className="min-w-0 flex-1 rounded-2xl rounded-tl-md bg-white px-3.5 py-2.5 ring-1 ring-line">
                    <p className="text-[13px]">
                      <b className="font-semibold text-ink">{c.user?.name}</b> <span className="text-mute">· {c.created_at}</span>
                    </p>
                    <p className="mt-0.5 text-[14px] leading-relaxed text-ink-soft">{c.comment}</p>
                  </div>
                </li>
              ))}
            </ol>
          ) : (
            <p className="rounded-2xl border border-dashed border-line px-4 py-6 text-center text-sm text-mute">No notes yet. Start the thread.</p>
          )}
        </div>
      </div>
    </Modal>
  );
}
