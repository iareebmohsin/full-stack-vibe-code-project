'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Navigation, useToast } from '@/components/ui';

interface Category {
  id: number;
  name: string;
  description?: string;
  icon?: string;
}

interface Tag {
  id: number;
  name: string;
}

export default function AddToolPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const { addToast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [dataLoadError, setDataLoadError] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const availableRoles = ['owner', 'backend', 'frontend', 'designer', 'devops', 'data-scientist', 'qa'];

  const [formData, setFormData] = useState({
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
  });

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    // Fetch categories and tags with timeout and retry logic
    const fetchData = async (retryCount = 0) => {
      setIsLoadingData(true);
      setDataLoadError('');

      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8201/api';

        // Create AbortController with 20 second timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 20000);

        // Fetch categories with timeout
        const categoriesRes = await fetch(`${apiUrl}/categories`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (categoriesRes.ok) {
          const categoriesData = await categoriesRes.json();
          setCategories(categoriesData.data || []);
        } else {
          throw new Error(`Categories fetch failed with status: ${categoriesRes.status}`);
        }

        // Create new controller for tags
        const controller2 = new AbortController();
        const timeoutId2 = setTimeout(() => controller2.abort(), 20000);

        // Fetch tags with timeout
        const tagsRes = await fetch(`${apiUrl}/tags`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
          signal: controller2.signal,
        });

        clearTimeout(timeoutId2);

        if (tagsRes.ok) {
          const tagsData = await tagsRes.json();
          setTags(tagsData.data || []);
        } else {
          throw new Error(`Tags fetch failed with status: ${tagsRes.status}`);
        }

        setIsLoadingData(false);
      } catch (error: any) {
        console.error('Error fetching data:', error);
        setIsLoadingData(false);

        if (error.name === 'AbortError') {
          setDataLoadError('Request timed out. The server is taking too long to respond (>20s).');
        } else {
          setDataLoadError(error.message || 'Failed to load categories and tags.');
        }

        // Retry logic - retry up to 2 times with exponential backoff
        if (retryCount < 2) {
          const retryDelay = Math.pow(2, retryCount) * 2000; // 2s, 4s
          console.log(`Retrying in ${retryDelay/1000} seconds... (attempt ${retryCount + 1}/2)`);
          setTimeout(() => fetchData(retryCount + 1), retryDelay);
        }
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleTagToggle = (tagId: number) => {
    setSelectedTags(prev => {
      if (prev.includes(tagId)) {
        return prev.filter(id => id !== tagId);
      } else if (prev.length < 10) {
        return [...prev, tagId];
      }
      return prev;
    });
    // Clear tags error when user selects tags
    if (errors.tags) {
      setErrors(prev => ({ ...prev, tags: '' }));
    }
  };

  const handleRoleToggle = (role: string) => {
    setSelectedRoles(prev => {
      if (prev.includes(role)) {
        return prev.filter(r => r !== role);
      } else {
        return [...prev, role];
      }
    });
    // Clear roles error when user selects roles
    if (errors.roles) {
      setErrors(prev => ({ ...prev, roles: '' }));
    }
  };

  const handleRetryDataLoad = () => {
    setDataLoadError('');
    // Trigger re-fetch by calling the effect manually
    const fetchData = async () => {
      setIsLoadingData(true);
      setDataLoadError('');

      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8201/api';

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 20000);

        const categoriesRes = await fetch(`${apiUrl}/categories`, {
          method: 'GET',
          headers: { 'Accept': 'application/json' },
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (categoriesRes.ok) {
          const categoriesData = await categoriesRes.json();
          setCategories(categoriesData.data || []);
        }

        const controller2 = new AbortController();
        const timeoutId2 = setTimeout(() => controller2.abort(), 20000);

        const tagsRes = await fetch(`${apiUrl}/tags`, {
          method: 'GET',
          headers: { 'Accept': 'application/json' },
          signal: controller2.signal,
        });

        clearTimeout(timeoutId2);

        if (tagsRes.ok) {
          const tagsData = await tagsRes.json();
          setTags(tagsData.data || []);
        }

        setIsLoadingData(false);
      } catch (error: any) {
        setIsLoadingData(false);
        if (error.name === 'AbortError') {
          setDataLoadError('Request timed out after 20 seconds.');
        } else {
          setDataLoadError('Failed to load data. Please try again.');
        }
      }
    };

    fetchData();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8201/api';
      const token = localStorage.getItem('token');

      console.log('[Tool Submit] Starting submission...');
      console.log('[Tool Submit] Token exists:', !!token);
      console.log('[Tool Submit] Form data:', formData);
      console.log('[Tool Submit] Selected tags:', selectedTags);
      console.log('[Tool Submit] Selected roles:', selectedRoles);

      if (!token) {
        throw new Error('You are not logged in. Please log in and try again.');
      }

      // Create an AbortController with 180s timeout to match backend
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 180000);

      console.log('[Tool Submit] Sending fetch request...');
      const response = await fetch(`${apiUrl}/tools`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          tags: selectedTags,
          roles: selectedRoles,
        }),
        signal: controller.signal,
      });

      console.log('[Tool Submit] Response received:', response.status, response.statusText);

      clearTimeout(timeoutId);

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Non-JSON response:', text);
        throw new Error('Server returned an error. Please try again or contact support.');
      }

      const data = await response.json();

      if (response.ok) {
        // Show success toast
        addToast('Tool added successfully! Redirecting to dashboard...', 'success', 5000);

        // Reset form
        setFormData({
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
        });
        setSelectedTags([]);
        setSelectedRoles([]);

        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
      } else {
        // Handle validation errors
        if (data.errors) {
          setErrors(data.errors);
          addToast('Please fix the validation errors in the form', 'error', 6000);
        } else {
          addToast(data.message || 'An error occurred while adding the tool', 'error', 6000);
        }
      }
    } catch (error: any) {
      console.error('[Tool Submit] Error:', error);
      console.error('[Tool Submit] Error name:', error?.name);
      console.error('[Tool Submit] Error message:', error?.message);
      console.error('[Tool Submit] Full error:', JSON.stringify(error, null, 2));

      if (error.name === 'AbortError') {
        addToast('Request timed out. The server is taking too long to respond. Please check if your tool was created.', 'warning', 8000);
      } else if (error.message) {
        addToast(error.message, 'error', 6000);
      } else {
        addToast('Network error: Failed to connect to the API. Please check your connection and try again.', 'error', 6000);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f172a]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Navigation items
  const navItems = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'AI Tools', href: '/tools' },
    { label: 'Add Tool', href: '/tools/add' },
    { label: 'Profile', href: '/profile' },
    { label: 'Admin', href: '/admin', roles: ['owner'] },
  ];

  return (
    <div className="min-h-screen bg-[#0f172a]">
      {/* Navigation */}
      <Navigation items={navItems} logoText="AI Tools Platform" logoHref="/dashboard" />

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Page Title */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white">Add New Tool</h1>
          <p className="text-gray-400 mt-2">Share a new AI tool with your team</p>
        </div>
        {/* Performance Warning Banner */}
        <div className="mb-6 p-4 bg-amber-600/10 border border-amber-500/20 rounded-md">
          <div className="flex items-start">
            <svg className="w-6 h-6 text-amber-400 mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="text-amber-400 font-semibold">Initial load may take 10-15 seconds</p>
              <p className="text-amber-300/80 text-sm mt-1">Due to Windows+WSL2+Docker performance, the first request to the backend is slow. Please be patient while categories and tags load.</p>
            </div>
          </div>
        </div>

        {/* Loading Data State */}
        {isLoadingData && (
          <div className="mb-6 p-6 bg-blue-600/10 border border-blue-500/20 rounded-md">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mr-4"></div>
              <div>
                <p className="text-blue-400 font-semibold">Loading categories and tags...</p>
                <p className="text-blue-300/80 text-sm mt-1">This may take 10-15 seconds. Please wait...</p>
              </div>
            </div>
          </div>
        )}

        {/* Data Load Error */}
        {dataLoadError && (
          <div className="mb-6 p-4 bg-rose-600/10 border border-rose-500/20 rounded-md">
            <p className="text-rose-400 mb-3">{dataLoadError}</p>
            <button
              onClick={handleRetryDataLoad}
              className="px-4 py-2 text-sm font-medium text-white bg-rose-600 rounded-md hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-500"
            >
              Retry Loading
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-[#1e293b] shadow rounded-lg p-6 space-y-6 border border-[#334155]">
          {/* Name/Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">
              Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 bg-[#0f172a] text-white placeholder-gray-500 ${
                errors.title ? 'border-rose-500 focus:ring-rose-500' : 'border-[#334155] focus:border-blue-500 focus:ring-blue-500'
              }`}
              placeholder="e.g., ChatGPT, Midjourney"
            />
            {errors.title && <p className="mt-1 text-sm text-rose-400">{errors.title}</p>}
          </div>

          {/* Link/URL */}
          <div>
            <label htmlFor="url" className="block text-sm font-medium text-gray-300 mb-2">
              Link
            </label>
            <input
              type="url"
              id="url"
              name="url"
              value={formData.url}
              onChange={handleChange}
              spellCheck="false"
              autoComplete="off"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 bg-[#0f172a] text-white placeholder-gray-500 ${
                errors.url ? 'border-rose-500 focus:ring-rose-500' : 'border-[#334155] focus:border-blue-500 focus:ring-blue-500'
              }`}
              placeholder="https://example.com"
            />
            {errors.url && <p className="mt-1 text-sm text-rose-400">{errors.url}</p>}
          </div>

          {/* Official Documentation */}
          <div>
            <label htmlFor="documentation_url" className="block text-sm font-medium text-gray-300 mb-2">
              Official Documentation (link)
            </label>
            <input
              type="url"
              id="documentation_url"
              name="documentation_url"
              value={formData.documentation_url}
              onChange={handleChange}
              spellCheck="false"
              autoComplete="off"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 bg-[#0f172a] text-white placeholder-gray-500 ${
                errors.documentation_url ? 'border-rose-500 focus:ring-rose-500' : 'border-[#334155] focus:border-blue-500 focus:ring-blue-500'
              }`}
              placeholder="https://docs.example.com"
            />
            {errors.documentation_url && <p className="mt-1 text-sm text-rose-400">{errors.documentation_url}</p>}
          </div>

          {/* GitHub URL */}
          <div>
            <label htmlFor="github_url" className="block text-sm font-medium text-gray-300 mb-2">
              GitHub Repository
            </label>
            <input
              type="url"
              id="github_url"
              name="github_url"
              value={formData.github_url}
              onChange={handleChange}
              spellCheck="false"
              autoComplete="off"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 bg-[#0f172a] text-white placeholder-gray-500 ${
                errors.github_url ? 'border-rose-500 focus:ring-rose-500' : 'border-[#334155] focus:border-blue-500 focus:ring-blue-500'
              }`}
              placeholder="https://github.com/username/repo"
            />
            {errors.github_url && <p className="mt-1 text-sm text-rose-400">{errors.github_url}</p>}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
              Description <span className="text-rose-500">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 bg-[#0f172a] text-white placeholder-gray-500 ${
                errors.description ? 'border-rose-500 focus:ring-rose-500' : 'border-[#334155] focus:border-blue-500 focus:ring-blue-500'
              }`}
              placeholder="Describe what this tool does and its key features... (min 20 characters)"
            />
            <p className="mt-1 text-sm text-gray-400">{formData.description.length}/2000 characters</p>
            {errors.description && <p className="mt-1 text-sm text-rose-400">{errors.description}</p>}
          </div>

          {/* Category */}
          <div>
            <label htmlFor="category_id" className="block text-sm font-medium text-gray-300 mb-2">
              Category <span className="text-rose-500">*</span>
            </label>
            <select
              id="category_id"
              name="category_id"
              value={formData.category_id}
              onChange={handleChange}
              disabled={isLoadingData || categories.length === 0}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 bg-[#0f172a] text-white ${
                errors.category_id ? 'border-rose-500 focus:ring-rose-500' : 'border-[#334155] focus:border-blue-500 focus:ring-blue-500'
              } ${(isLoadingData || categories.length === 0) ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <option value="">{isLoadingData ? 'Loading...' : 'Select a category'}</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.icon} {category.name}
                </option>
              ))}
            </select>
            {errors.category_id && <p className="mt-1 text-sm text-rose-400">{errors.category_id}</p>}
          </div>

          {/* Tool Type */}
          <div>
            <label htmlFor="tool_type" className="block text-sm font-medium text-gray-300 mb-2">
              Tool Type <span className="text-rose-500">*</span>
            </label>
            <select
              id="tool_type"
              name="tool_type"
              value={formData.tool_type}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 bg-[#0f172a] text-white ${
                errors.tool_type ? 'border-rose-500 focus:ring-rose-500' : 'border-[#334155] focus:border-blue-500 focus:ring-blue-500'
              }`}
            >
              <option value="">Select tool type</option>
              <option value="library">Library</option>
              <option value="framework">Framework</option>
              <option value="api">API</option>
              <option value="service">Service</option>
              <option value="application">Application</option>
            </select>
            {errors.tool_type && <p className="mt-1 text-sm text-rose-400">{errors.tool_type}</p>}
          </div>

          {/* Pricing Model */}
          <div>
            <label htmlFor="pricing_model" className="block text-sm font-medium text-gray-300 mb-2">
              Pricing Model <span className="text-rose-500">*</span>
            </label>
            <select
              id="pricing_model"
              name="pricing_model"
              value={formData.pricing_model}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 bg-[#0f172a] text-white ${
                errors.pricing_model ? 'border-rose-500 focus:ring-rose-500' : 'border-[#334155] focus:border-blue-500 focus:ring-blue-500'
              }`}
            >
              <option value="">Select pricing model</option>
              <option value="free">Free</option>
              <option value="freemium">Freemium</option>
              <option value="paid">Paid</option>
              <option value="open_source">Open Source</option>
            </select>
            {errors.pricing_model && <p className="mt-1 text-sm text-rose-400">{errors.pricing_model}</p>}
          </div>

          {/* Thumbnail URL */}
          <div>
            <label htmlFor="thumbnail_url" className="block text-sm font-medium text-gray-300 mb-2">
              Thumbnail Image URL
            </label>
            <input
              type="url"
              id="thumbnail_url"
              name="thumbnail_url"
              value={formData.thumbnail_url}
              onChange={handleChange}
              spellCheck="false"
              autoComplete="off"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 bg-[#0f172a] text-white placeholder-gray-500 ${
                errors.thumbnail_url ? 'border-rose-500 focus:ring-rose-500' : 'border-[#334155] focus:border-blue-500 focus:ring-blue-500'
              }`}
              placeholder="https://example.com/image.jpg"
            />
            {errors.thumbnail_url && <p className="mt-1 text-sm text-rose-400">{errors.thumbnail_url}</p>}
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Tags <span className="text-rose-500">*</span> (Select 1-10 tags)
            </label>
            <div className={`flex flex-wrap gap-2 p-3 border border-[#334155] bg-[#0f172a] rounded-md max-h-60 overflow-y-auto ${(isLoadingData || tags.length === 0) ? 'opacity-50' : ''}`}>
              {isLoadingData && <p className="text-gray-400 text-sm">Loading tags...</p>}
              {!isLoadingData && tags.length === 0 && <p className="text-gray-400 text-sm">No tags available. Please retry loading.</p>}
              {tags.map(tag => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => handleTagToggle(tag.id)}
                  disabled={isLoadingData}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    selectedTags.includes(tag.id)
                      ? 'bg-blue-500 text-white'
                      : 'bg-[#2a2a2a] text-gray-300 hover:bg-[#333333]'
                  } ${isLoadingData ? 'cursor-not-allowed' : ''}`}
                >
                  {tag.name}
                </button>
              ))}
            </div>
            <p className="mt-1 text-sm text-gray-400">{selectedTags.length} tag(s) selected</p>
            {errors.tags && <p className="mt-1 text-sm text-rose-400">{errors.tags}</p>}
          </div>

          {/* Roles */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Relevant Roles <span className="text-rose-500">*</span> (Select at least one)
            </label>
            <div className="flex flex-wrap gap-2 p-3 border border-[#334155] bg-[#0f172a] rounded-md">
              {availableRoles.map(role => (
                <button
                  key={role}
                  type="button"
                  onClick={() => handleRoleToggle(role)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    selectedRoles.includes(role)
                      ? 'bg-emerald-500 text-white'
                      : 'bg-[#2a2a2a] text-gray-300 hover:bg-[#333333]'
                  }`}
                >
                  {role.charAt(0).toUpperCase() + role.slice(1).replace('-', ' ')}
                </button>
              ))}
            </div>
            <p className="mt-1 text-sm text-gray-400">{selectedRoles.length} role(s) selected</p>
            {errors.roles && <p className="mt-1 text-sm text-rose-400">{errors.roles}</p>}
          </div>

          {/* Status */}
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-300 mb-2">
              Status
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-[#334155] bg-[#0f172a] text-white rounded-md focus:outline-none focus:ring-2 focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
            <p className="mt-1 text-sm text-gray-400">
              Draft tools are saved but not visible to others
            </p>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={isSubmitting || isLoadingData}
              className={`flex-1 px-6 py-3 text-white font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                isSubmitting || isLoadingData
                  ? 'bg-blue-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isSubmitting ? 'Submitting... (this may take 30-60 seconds)' : 'Add Tool'}
            </button>
            <button
              type="button"
              onClick={() => router.push('/dashboard')}
              className="px-6 py-3 text-gray-300 font-medium bg-[#2a2a2a] rounded-md hover:bg-[#333333] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Cancel
            </button>
          </div>
        </form>

        {/* Real-world Examples Section (Optional) */}
        <div className="mt-8 bg-blue-600/10 border border-blue-500/20 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-400 mb-3">How to Use This Form</h3>
          <ul className="space-y-2 text-sm text-gray-300">
            <li><strong className="text-white">Name:</strong> The tool's official name (e.g., "ChatGPT", "GitHub Copilot")</li>
            <li><strong className="text-white">Description:</strong> Explain what the tool does, its key features, and use cases (minimum 20 characters)</li>
            <li><strong className="text-white">Links:</strong> Provide official website, documentation, and GitHub repository if available</li>
            <li><strong className="text-white">Category:</strong> Select the most relevant category for your tool</li>
            <li><strong className="text-white">Tags:</strong> Choose 1-10 relevant tags to help others discover your tool</li>
            <li><strong className="text-white">Status:</strong> Save as draft to review later, or publish immediately</li>
          </ul>
        </div>

        {/* Recommended Roles Section */}
        <div className="mt-6 bg-[#1e293b] border border-[#334155] rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-3">Recommended for All Roles</h3>
          <p className="text-sm text-gray-300">
            This form is suitable for: <span className="font-semibold text-white">Owners, Frontend Developers, Backend Developers, Designers, and all team members</span> who want to share useful AI tools with the team.
          </p>
        </div>
      </main>
    </div>
  );
}
