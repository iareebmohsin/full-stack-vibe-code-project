export interface Category {
  id: number;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
}

export interface Tag {
  id: number;
  name: string;
}

export type ToolStatus = 'draft' | 'published' | 'archived';

export interface Tool {
  id: number;
  title: string;
  description: string;
  url?: string | null;
  github_url?: string | null;
  documentation_url?: string | null;
  thumbnail_url?: string | null;
  category_id?: number;
  category?: Category | null;
  tags?: Tag[];
  roles_list?: string[];
  tool_type: string;
  pricing_model: string;
  status?: ToolStatus;
  views_count: number;
  favorites_count: number;
  is_favorited?: boolean;
  user?: { id: number; name: string; email?: string } | null;
  created_at: string;
  updated_at?: string;
  published_at?: string | null;
}

export interface ToolFormValues {
  title: string;
  description: string;
  category_id: string;
  url: string;
  github_url: string;
  documentation_url: string;
  thumbnail_url: string;
  tool_type: string;
  pricing_model: string;
  status: ToolStatus;
  tags: number[];
  roles: string[];
}

export const EMPTY_TOOL: ToolFormValues = {
  title: '',
  description: '',
  category_id: '',
  url: '',
  github_url: '',
  documentation_url: '',
  thumbnail_url: '',
  tool_type: '',
  pricing_model: '',
  status: 'draft',
  tags: [],
  roles: [],
};

export const TOOL_TYPES = [
  { value: 'application', label: 'Application' },
  { value: 'service', label: 'Service' },
  { value: 'api', label: 'API' },
  { value: 'library', label: 'Library' },
  { value: 'framework', label: 'Framework' },
];

export const PRICING = [
  { value: 'free', label: 'Free' },
  { value: 'freemium', label: 'Freemium' },
  { value: 'paid', label: 'Paid' },
  { value: 'open_source', label: 'Open source' },
];

export function toolToForm(t: Tool): ToolFormValues {
  return {
    title: t.title || '',
    description: t.description || '',
    category_id: String(t.category?.id ?? t.category_id ?? ''),
    url: t.url || '',
    github_url: t.github_url || '',
    documentation_url: t.documentation_url || '',
    thumbnail_url: t.thumbnail_url || '',
    tool_type: t.tool_type || '',
    pricing_model: t.pricing_model || '',
    status: (t.status as ToolStatus) || 'draft',
    tags: t.tags?.map((x) => x.id) || [],
    roles: t.roles_list || [],
  };
}

/** Request body the Laravel API expects; empty links are sent as null. */
export function formToPayload(v: ToolFormValues) {
  const orNull = (s: string) => (s.trim() ? s.trim() : null);
  return {
    title: v.title.trim(),
    description: v.description.trim(),
    category_id: v.category_id ? Number(v.category_id) : '',
    url: orNull(v.url),
    github_url: orNull(v.github_url),
    documentation_url: orNull(v.documentation_url),
    thumbnail_url: orNull(v.thumbnail_url),
    tool_type: v.tool_type,
    pricing_model: v.pricing_model,
    status: v.status,
    tags: v.tags,
    roles: v.roles,
  };
}
