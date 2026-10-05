export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8201/api';

type ApiOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  token?: string | null;
  body?: unknown;
  signal?: AbortSignal;
};

export type ApiResult<T> = {
  ok: boolean;
  status: number;
  data: T;
};

/** Small fetch wrapper: JSON in, JSON out, bearer token when given. */
export async function api<T = unknown>(path: string, opts: ApiOptions = {}): Promise<ApiResult<T>> {
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (opts.body !== undefined) headers['Content-Type'] = 'application/json';
  const token = opts.token ?? (typeof window !== 'undefined' ? localStorage.getItem('token') : null);
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, {
    method: opts.method || 'GET',
    headers,
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
    signal: opts.signal,
  });

  let data: unknown = null;
  if (res.status !== 204) {
    const type = res.headers.get('content-type') || '';
    data = type.includes('application/json') ? await res.json() : await res.text();
  }
  return { ok: res.ok, status: res.status, data: data as T };
}

/** Pull the first readable message out of a Laravel error payload. */
export function errorMessage(data: unknown, fallback = 'Something went wrong'): string {
  if (data && typeof data === 'object') {
    const d = data as { message?: string; errors?: Record<string, string[] | string> };
    if (d.errors) {
      const first = Object.values(d.errors)[0];
      if (Array.isArray(first) && first[0]) return first[0];
      if (typeof first === 'string') return first;
    }
    if (d.message) return d.message;
  }
  return fallback;
}

/** Flatten Laravel validation errors to one message per field. */
export function fieldErrors(data: unknown): Record<string, string> {
  const out: Record<string, string> = {};
  if (data && typeof data === 'object' && 'errors' in data) {
    const errs = (data as { errors: Record<string, string[] | string> }).errors || {};
    for (const [k, v] of Object.entries(errs)) out[k] = Array.isArray(v) ? v[0] : String(v);
  }
  return out;
}

export const ROLES = ['owner', 'backend', 'frontend', 'designer', 'devops', 'data-scientist', 'qa'] as const;

export function roleLabel(role: string): string {
  const map: Record<string, string> = {
    owner: 'Owner',
    backend: 'Backend',
    frontend: 'Frontend',
    designer: 'Design',
    devops: 'DevOps',
    'data-scientist': 'Data science',
    qa: 'QA',
  };
  return map[role] || role;
}

export function prettyEnum(value?: string | null): string {
  if (!value) return '';
  const v = value.replace(/_/g, ' ');
  return v.charAt(0).toUpperCase() + v.slice(1);
}

export function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function shortDate(value?: string | null): string {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

/** Stable pastel for anything keyed by a string (category, person). */
const SWATCHES = ['#cfe3c4', '#d7e6f3', '#f6ecc4', '#f5d7d3', '#e3d9f2', '#d4ece8'];
export function swatch(key: string | number | undefined): string {
  const s = String(key ?? '');
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return SWATCHES[h % SWATCHES.length];
}
