'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardBody, CardFooter, Button, Badge, Input, Select, Navigation } from '@/components/ui';
import { ToolDetailsModal } from '@/components/ToolDetailsModal';

interface Category {
  id: number;
  name: string;
  icon?: string;
  color?: string;
}

interface Tag {
  id: number;
  name: string;
}

interface Tool {
  id: number;
  title: string;
  description: string;
  url?: string;
  github_url?: string;
  documentation_url?: string;
  thumbnail_url?: string;
  category: Category;
  tags: Tag[];
  roles_list?: string[];
  tool_type: string;
  pricing_model: string;
  views_count: number;
  favorites_count: number;
  is_favorited: boolean;
  created_at: string;
}

export default function ToolsPage() {
  const router = useRouter();
  const { user, token } = useAuth();
  const [tools, setTools] = useState<Tool[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter states
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal state
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const availableRoles = [
    'owner',
    'backend',
    'frontend',
    'designer',
    'devops',
    'data-scientist',
    'qa',
  ];

  // Navigation items with icons (matching dashboard)
  const navItems = [
    {
      label: 'Dashboard',
      href: '/dashboard',
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
    },
    {
      label: 'AI Tools',
      href: '/tools',
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
    },
    {
      label: 'Add Tool',
      href: '/tools/add',
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
    },
    {
      label: 'Profile',
      href: '/profile',
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
    },
    {
      label: 'Admin',
      href: '/admin',
      roles: ['owner'],
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
    },
  ];

  useEffect(() => {
    fetchCategories();
    fetchTags();
  }, []);

  useEffect(() => {
    fetchTools();
  }, [selectedCategory, selectedRoles, selectedTags, searchQuery]);

  const fetchCategories = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8201/api';
      const res = await fetch(`${apiUrl}/categories`);
      if (res.ok) {
        const data = await res.json();
        setCategories(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchTags = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8201/api';
      const res = await fetch(`${apiUrl}/tags`);
      if (res.ok) {
        const data = await res.json();
        setTags(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching tags:', error);
    }
  };

  const fetchTools = async () => {
    setIsLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8201/api';

      // Build query parameters
      const params = new URLSearchParams();
      if (selectedCategory) params.append('category_id', selectedCategory);
      if (selectedRoles.length > 0)
        selectedRoles.forEach((role) => params.append('role[]', role));
      if (selectedTags.length > 0)
        selectedTags.forEach((tag) => params.append('tag[]', tag.toString()));
      if (searchQuery) params.append('search', searchQuery);

      const queryString = params.toString();
      const url = `${apiUrl}/tools${queryString ? `?${queryString}` : ''}`;

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setTools(data.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching tools:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleRole = (role: string) => {
    setSelectedRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  };

  const toggleTag = (tagId: number) => {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  };

  const clearFilters = () => {
    setSelectedCategory('');
    setSelectedRoles([]);
    setSelectedTags([]);
    setSearchQuery('');
  };

  const handleFavoriteToggle = async (toolId: number) => {
    if (!token) return;

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8201/api';
      const response = await fetch(`${apiUrl}/tools/${toolId}/favorite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Update tools list
        setTools(tools.map(tool =>
          tool.id === toolId
            ? { ...tool, is_favorited: data.is_favorited, favorites_count: data.favorites_count }
            : tool
        ));
        // Update selected tool if modal is open
        if (selectedTool && selectedTool.id === toolId) {
          setSelectedTool({
            ...selectedTool,
            is_favorited: data.is_favorited,
            favorites_count: data.favorites_count
          });
        }
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const handleOpenDetails = (tool: Tool) => {
    setSelectedTool(tool);
    setIsModalOpen(true);
  };

  const hasActiveFilters =
    selectedCategory || selectedRoles.length > 0 || selectedTags.length > 0 || searchQuery;

  const activeFilterCount =
    (selectedCategory ? 1 : 0) +
    selectedRoles.length +
    selectedTags.length +
    (searchQuery ? 1 : 0);

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Navigation */}
      <Navigation items={navItems} logoText="AI Tools Platform" logoHref="/dashboard" />

      {/* Header Section with Animated Particles */}
      <div className="relative overflow-hidden bg-[#0f0f0f] border-b border-[#2a2a2a]">
        {/* Animated Particles Background */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full animate-float"
              style={{
                width: `${Math.random() * 6 + 2}px`,
                height: `${Math.random() * 6 + 2}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 8}s`,
                animationDuration: `${Math.random() * 10 + 8}s`,
                background: `radial-gradient(circle, ${
                  i % 3 === 0 ? 'rgba(34, 197, 94, 0.8)' :
                  i % 3 === 1 ? 'rgba(59, 130, 246, 0.8)' :
                  'rgba(168, 85, 247, 0.8)'
                } 0%, transparent 70%)`,
                boxShadow: `0 0 ${Math.random() * 20 + 10}px ${
                  i % 3 === 0 ? 'rgba(34, 197, 94, 0.6)' :
                  i % 3 === 1 ? 'rgba(59, 130, 246, 0.6)' :
                  'rgba(168, 85, 247, 0.6)'
                }`,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4 text-white">🤖 AI Tools Catalog</h1>
            <p className="text-lg text-gray-300 mb-6 max-w-2xl mx-auto">
              Discover, explore, and share the best AI tools for your team
            </p>
            <div className="flex justify-center gap-4">
              {user && (
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => router.push('/tools/add')}
                >
                  + Share a Tool
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translate(0, 0) scale(1);
            opacity: 0.3;
          }
          25% {
            transform: translate(30px, -30px) scale(1.2);
            opacity: 0.6;
          }
          50% {
            transform: translate(-20px, 20px) scale(0.8);
            opacity: 0.4;
          }
          75% {
            transform: translate(40px, 10px) scale(1.1);
            opacity: 0.7;
          }
        }
        .animate-float {
          animation: float linear infinite;
        }
      `}</style>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <aside className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              <Card padding="md" className="bg-[#1a1a1a] border-[#2a2a2a]">
                <CardBody>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                      🔍 Filters
                      {activeFilterCount > 0 && (
                        <Badge variant="primary" size="sm">
                          {activeFilterCount}
                        </Badge>
                      )}
                    </h2>
                    {hasActiveFilters && (
                      <Button variant="ghost" size="sm" onClick={clearFilters}>
                        Clear
                      </Button>
                    )}
                  </div>

                  {/* Search */}
                  <div className="mb-6">
                    <Input
                      label="Search Tools"
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search by name..."
                      fullWidth
                    />
                  </div>

                  {/* Category Filter */}
                  <div className="mb-6">
                    <Select
                      label="Category"
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      fullWidth
                    >
                      <option value="">All Categories</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.icon} {cat.name}
                        </option>
                      ))}
                    </Select>
                  </div>

                  {/* Role Filter */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Roles
                      {selectedRoles.length > 0 && (
                        <Badge variant="default" size="sm" className="ml-2">
                          {selectedRoles.length}
                        </Badge>
                      )}
                    </label>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {availableRoles.map((role) => (
                        <label
                          key={role}
                          className="flex items-center cursor-pointer hover:bg-[#2a2a2a] rounded px-2 py-1 transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={selectedRoles.includes(role)}
                            onChange={() => toggleRole(role)}
                            className="mr-2 h-4 w-4 text-blue-500 border-gray-600 rounded focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-300">
                            {role.charAt(0).toUpperCase() + role.slice(1).replace('-', ' ')}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Tag Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Tags
                      {selectedTags.length > 0 && (
                        <Badge variant="default" size="sm" className="ml-2">
                          {selectedTags.length}
                        </Badge>
                      )}
                    </label>
                    <div className="max-h-48 overflow-y-auto space-y-2">
                      {tags.slice(0, 20).map((tag) => (
                        <label
                          key={tag.id}
                          className="flex items-center cursor-pointer hover:bg-[#2a2a2a] rounded px-2 py-1 transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={selectedTags.includes(tag.id)}
                            onChange={() => toggleTag(tag.id)}
                            className="mr-2 h-4 w-4 text-blue-500 border-gray-600 rounded focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-300">{tag.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </CardBody>
              </Card>
            </div>
          </aside>

          {/* Tools Grid */}
          <div className="lg:col-span-3">
            {/* Results Header */}
            {!isLoading && (
              <div className="mb-6 flex items-center justify-between">
                <p className="text-sm text-gray-400">
                  {tools.length === 0 ? (
                    'No tools found'
                  ) : (
                    <>
                      Showing <span className="font-semibold text-white">{tools.length}</span>{' '}
                      tool{tools.length !== 1 ? 's' : ''}
                    </>
                  )}
                </p>
              </div>
            )}

            {/* Loading State */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} padding="md" className="animate-pulse bg-[#1a1a1a] border-[#2a2a2a]">
                    <CardBody>
                      <div className="h-6 bg-gray-700 rounded w-3/4 mb-3"></div>
                      <div className="h-4 bg-gray-700 rounded w-full mb-2"></div>
                      <div className="h-4 bg-gray-700 rounded w-2/3"></div>
                    </CardBody>
                  </Card>
                ))}
              </div>
            ) : tools.length === 0 ? (
              /* Empty State */
              <Card padding="lg" className="text-center bg-[#1a1a1a] border-[#2a2a2a]">
                <CardBody>
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    No tools found
                  </h3>
                  <p className="text-gray-400 mb-6">
                    {hasActiveFilters
                      ? 'Try adjusting your filters or search query'
                      : 'Be the first to share a tool!'}
                  </p>
                  {hasActiveFilters ? (
                    <Button variant="primary" onClick={clearFilters}>
                      Clear All Filters
                    </Button>
                  ) : user ? (
                    <Button variant="primary" onClick={() => router.push('/tools/add')}>
                      + Share a Tool
                    </Button>
                  ) : null}
                </CardBody>
              </Card>
            ) : (
              /* Tools Grid */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {tools.map((tool, index) => (
                  <Card
                    key={tool.id}
                    hoverable
                    padding="none"
                    className="group overflow-hidden animate-[scaleIn_0.3s_ease-out] bg-[#1a1a1a] border-[#2a2a2a] hover:border-blue-500/50"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <CardBody className="p-6">
                      {/* Tool Header */}
                      <div className="flex items-start gap-4 mb-4">
                        {tool.thumbnail_url ? (
                          <img
                            src={tool.thumbnail_url}
                            alt={tool.title}
                            className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-2xl flex-shrink-0">
                            🤖
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h3 className="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors line-clamp-1 flex-1">
                              {tool.title}
                            </h3>
                            {user && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleFavoriteToggle(tool.id);
                                }}
                                className="flex-shrink-0 p-1 hover:scale-110 transition-transform"
                                title={tool.is_favorited ? 'Remove from favorites' : 'Add to favorites'}
                              >
                                <svg
                                  className={`w-6 h-6 transition-all ${
                                    tool.is_favorited
                                      ? 'fill-rose-500 text-rose-500'
                                      : 'fill-none text-gray-400 hover:text-rose-500'
                                  }`}
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                                  />
                                </svg>
                              </button>
                            )}
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge
                              variant="primary"
                              size="sm"
                              className="flex items-center gap-1"
                            >
                              {tool.category.icon} {tool.category.name}
                            </Badge>
                            <span className="text-xs text-gray-400 flex items-center gap-1">
                              👁️ {tool.views_count}
                            </span>
                            <span className="text-xs text-gray-400 flex items-center gap-1">
                              ❤️ {tool.favorites_count}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-sm text-gray-300 mb-4 line-clamp-2 leading-relaxed">
                        {tool.description}
                      </p>

                      {/* Tags */}
                      {tool.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {tool.tags.slice(0, 3).map((tag) => (
                            <Badge key={tag.id} variant="default" size="sm">
                              {tag.name}
                            </Badge>
                          ))}
                          {tool.tags.length > 3 && (
                            <Badge variant="default" size="sm">
                              +{tool.tags.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}

                      {/* Roles */}
                      {tool.roles_list && tool.roles_list.length > 0 && (
                        <div className="mb-4">
                          <p className="text-xs text-gray-400 mb-1.5">Relevant for:</p>
                          <div className="flex flex-wrap gap-1.5">
                            {tool.roles_list.slice(0, 3).map((role) => (
                              <Badge key={role} variant="success" size="sm">
                                {role.charAt(0).toUpperCase() + role.slice(1).replace('-', ' ')}
                              </Badge>
                            ))}
                            {tool.roles_list.length > 3 && (
                              <Badge variant="success" size="sm">
                                +{tool.roles_list.length - 3}
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                    </CardBody>

                    {/* Footer */}
                    <CardFooter className="flex items-center justify-between bg-[#0f0f0f] border-t border-[#2a2a2a] p-4">
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <Badge variant="default" size="sm">
                          {tool.tool_type}
                        </Badge>
                        <Badge variant="info" size="sm">
                          {tool.pricing_model.replace('_', ' ')}
                        </Badge>
                      </div>
                      <div className="flex gap-2">
                        {tool.url && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(tool.url, '_blank', 'noopener,noreferrer');
                            }}
                          >
                            Visit →
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenDetails(tool);
                          }}
                        >
                          Details
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Tool Details Modal */}
      {selectedTool && (
        <ToolDetailsModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          tool={selectedTool}
          onFavoriteToggle={handleFavoriteToggle}
        />
      )}
    </div>
  );
}
