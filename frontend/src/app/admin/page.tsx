'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button, Badge, Input, Select, Navigation, Modal, useToast } from '@/components/ui';

// User interface matching backend structure
interface User {
  id: number;
  name: string;
  email: string;
  role: 'owner' | 'frontend' | 'backend' | 'designer' | 'devops' | 'data-scientist' | 'qa';
  status?: 'active' | 'inactive';
  tools_count?: number;
  created_at: string;
}

// Tool interface matching backend structure
interface Category {
  id: number;
  name: string;
  icon?: string;
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
  status: 'draft' | 'published' | 'archived';
  user: {
    id: number;
    name: string;
    email: string;
  };
  created_at: string;
  updated_at: string;
  published_at?: string;
}

// Tab type
type TabType = 'overview' | 'users' | 'tools';

export default function AdminPage() {
  const router = useRouter();
  const { user, token, isLoading } = useAuth();
  const { addToast } = useToast();

  // State management
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editFormData, setEditFormData] = useState({ name: '', email: '', role: '' });
  const [addUserFormData, setAddUserFormData] = useState({ name: '', email: '', password: '', role: 'frontend' });
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);
  const [isSubmittingAdd, setIsSubmittingAdd] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Tools state management
  const [tools, setTools] = useState<Tool[]>([]);
  const [isLoadingTools, setIsLoadingTools] = useState(true);
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const [showViewToolModal, setShowViewToolModal] = useState(false);
  const [showEditToolModal, setShowEditToolModal] = useState(false);
  const [showDeleteToolModal, setShowDeleteToolModal] = useState(false);

  // Edit tool form state
  const [categories, setCategories] = useState<Category[]>([]);
  const [tagsData, setTagsData] = useState<Tag[]>([]);
  const [editToolFormData, setEditToolFormData] = useState<any>({});
  const [selectedToolTags, setSelectedToolTags] = useState<number[]>([]);
  const [isSubmittingToolEdit, setIsSubmittingToolEdit] = useState(false);

  // Redirect if not owner
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    } else if (!isLoading && user && user.role !== 'owner') {
      router.push('/dashboard');
    }
  }, [user, isLoading, router]);

  // Fetch users
  useEffect(() => {
    if (user && user.role === 'owner' && token) {
      fetchUsers();
    }
  }, [user, token]);

  // Fetch tools when tools or overview tab is active
  useEffect(() => {
    if (user && user.role === 'owner' && token && (activeTab === 'tools' || activeTab === 'overview')) {
      fetchTools();
    }
  }, [user, token, activeTab]);

  // Fetch categories and tags for edit modal
  useEffect(() => {
    const fetchCategoriesAndTags = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8201/api';

        const [categoriesRes, tagsRes] = await Promise.all([
          fetch(`${apiUrl}/categories`),
          fetch(`${apiUrl}/tags`)
        ]);

        if (categoriesRes.ok) {
          const data = await categoriesRes.json();
          setCategories(data.data || []);
        }

        if (tagsRes.ok) {
          const data = await tagsRes.json();
          setTagsData(data.data || []);
        }
      } catch (error) {
        console.error('Error fetching categories/tags:', error);
      }
    };

    if (user && user.role === 'owner') {
      fetchCategoriesAndTags();
    }
  }, [user]);

  // Filter users based on search and filters
  useEffect(() => {
    let filtered = users;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (u) =>
          u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          u.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter((u) => u.role === roleFilter);
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((u) => (u.status || 'active') === statusFilter);
    }

    setFilteredUsers(filtered);
  }, [searchQuery, roleFilter, statusFilter, users]);

  const fetchUsers = async () => {
    setIsLoadingUsers(true);
    setError(null);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8201/api';
      const response = await fetch(`${apiUrl}/users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      // Add status field if not present (default to active)
      const usersWithStatus = data.map((u: User) => ({
        ...u,
        status: u.status || 'active',
        tools_count: u.tools_count || 0,
      }));
      setUsers(usersWithStatus);
      setFilteredUsers(usersWithStatus);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users');
      console.error('Error fetching users:', err);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const handleRefresh = () => {
    fetchUsers();
  };

  const handleToggleUserStatus = async (userId: number) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8201/api';
      const response = await fetch(`${apiUrl}/users/${userId}/toggle-status`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to toggle user status');
      }

      const data = await response.json();

      // Update local state with new status
      setUsers(users.map(u =>
        u.id === userId
          ? { ...u, status: data.user.status }
          : u
      ));
    } catch (err) {
      console.error('Error toggling user status:', err);
      alert('Failed to toggle user status');
    }
  };

  const handleEditUser = (userToEdit: User) => {
    setSelectedUser(userToEdit);
    setEditFormData({
      name: userToEdit.name,
      email: userToEdit.email,
      role: userToEdit.role,
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedUser) return;

    try {
      setIsSubmittingEdit(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8201/api';

      const response = await fetch(`${apiUrl}/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
        body: JSON.stringify(editFormData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update user');
      }

      const data = await response.json();

      // Update local state
      setUsers(users.map(u =>
        u.id === selectedUser.id
          ? { ...u, name: editFormData.name, email: editFormData.email, role: editFormData.role as any }
          : u
      ));

      setShowEditModal(false);
      setSelectedUser(null);
      addToast('User updated successfully', 'success', 4000);
    } catch (err) {
      console.error('Error updating user:', err);
      addToast(err instanceof Error ? err.message : 'Failed to update user', 'error', 4000);
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  const handleAddUser = async () => {
    try {
      setIsSubmittingAdd(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8201/api';

      const response = await fetch(`${apiUrl}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
        body: JSON.stringify(addUserFormData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create user');
      }

      const data = await response.json();

      // Reset form and close modal
      setAddUserFormData({ name: '', email: '', password: '', role: 'frontend' });
      setShowAddUserModal(false);
      addToast('User created successfully', 'success', 4000);

      // Refresh users list
      fetchUsers();
    } catch (err) {
      console.error('Error creating user:', err);
      addToast(err instanceof Error ? err.message : 'Failed to create user', 'error', 4000);
    } finally {
      setIsSubmittingAdd(false);
    }
  };

  const handleDeleteUser = (user: User) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const confirmDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8201/api';
      const response = await fetch(`${apiUrl}/users/${selectedUser.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete user');
      }

      // Update local state
      setUsers(users.filter(u => u.id !== selectedUser.id));
      setShowDeleteModal(false);
      setSelectedUser(null);
    } catch (err) {
      console.error('Error deleting user:', err);
      alert('Failed to delete user');
    }
  };

  // Fetch tools
  const fetchTools = async () => {
    setIsLoadingTools(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8201/api';
      console.log('Fetching tools from:', `${apiUrl}/tools`);

      const response = await fetch(`${apiUrl}/tools`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to fetch tools:', response.status, errorText);
        throw new Error('Failed to fetch tools');
      }

      const data = await response.json();
      console.log('Tools data received:', data);

      // The API returns paginated data in data.data.data structure
      const toolsList = data.data?.data || [];
      console.log('Setting tools:', toolsList.length, 'items');
      setTools(toolsList);
    } catch (err) {
      console.error('Error fetching tools:', err);
      addToast('Failed to load tools', 'error', 4000);
    } finally {
      setIsLoadingTools(false);
    }
  };

  // Handle view tool
  const handleViewTool = (tool: Tool) => {
    setSelectedTool(tool);
    setShowViewToolModal(true);
  };

  // Handle edit tool
  const handleEditTool = async (tool: Tool) => {
    // Fetch full tool details for editing
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8201/api';

      const response = await fetch(`${apiUrl}/tools/${tool.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        const fullTool = data.data || data;
        setSelectedTool(fullTool);
        setEditToolFormData({
          title: fullTool.title,
          description: fullTool.description,
          url: fullTool.url || '',
          github_url: fullTool.github_url || '',
          documentation_url: fullTool.documentation_url || '',
          thumbnail_url: fullTool.thumbnail_url || '',
          category_id: fullTool.category?.id || fullTool.category_id,
          tool_type: fullTool.tool_type,
          pricing_model: fullTool.pricing_model,
          status: fullTool.status,
        });
        setSelectedToolTags(fullTool.tags?.map((t: any) => t.id) || []);
        setShowEditToolModal(true);
      } else {
        addToast('Failed to load tool details', 'error', 4000);
      }
    } catch (error) {
      console.error('Error fetching tool:', error);
      addToast('Error loading tool details', 'error', 4000);
    }
  };

  // Handle save tool edit
  const handleSaveToolEdit = async () => {
    if (!selectedTool) return;

    try {
      setIsSubmittingToolEdit(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8201/api';

      const response = await fetch(`${apiUrl}/tools/${selectedTool.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          ...editToolFormData,
          tags: selectedToolTags,
        }),
      });

      if (response.ok) {
        setShowEditToolModal(false);
        setSelectedTool(null);
        addToast('Tool updated successfully', 'success', 4000);
        fetchTools(); // Refresh the tools list
      } else {
        const errorData = await response.json();
        addToast(errorData.message || 'Failed to update tool', 'error', 4000);
      }
    } catch (error) {
      console.error('Error updating tool:', error);
      addToast('Error updating tool', 'error', 4000);
    } finally {
      setIsSubmittingToolEdit(false);
    }
  };

  // Handle delete tool
  const handleDeleteTool = (tool: Tool) => {
    setSelectedTool(tool);
    setShowDeleteToolModal(true);
  };

  // Confirm delete tool
  const confirmDeleteTool = async () => {
    if (!selectedTool) return;

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8201/api';
      const response = await fetch(`${apiUrl}/tools/${selectedTool.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete tool');
      }

      setTools(tools.filter(t => t.id !== selectedTool.id));
      setShowDeleteToolModal(false);
      setSelectedTool(null);
      addToast('Tool deleted successfully', 'success', 4000);
    } catch (err) {
      console.error('Error deleting tool:', err);
      addToast('Failed to delete tool', 'error', 4000);
    }
  };

  // Get user initials for avatar
  const getUserInitial = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  // Get role badge color
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'owner':
        return 'bg-purple-500/20 text-purple-400 border border-purple-500/30';
      case 'frontend':
        return 'bg-blue-500/20 text-blue-400 border border-blue-500/30';
      case 'backend':
        return 'bg-green-500/20 text-green-400 border border-green-500/30';
      case 'designer':
        return 'bg-orange-500/20 text-orange-400 border border-orange-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border border-gray-500/30';
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  if (isLoading || !user || user.role !== 'owner') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f172a]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading admin panel...</p>
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
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-8 animate-[fadeIn_0.5s_ease-out]">
          <div className="flex items-center gap-3 mb-2">
            <div className="text-4xl">
              <svg className="w-10 h-10 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                Admin Panel
              </h1>
              <p className="text-gray-400 mt-1">System and user management</p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="bg-[#1e293b] rounded-lg p-2 inline-flex gap-2">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 rounded-md font-medium transition-all duration-200 flex items-center gap-2 ${
                activeTab === 'overview'
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-[#334155]'
              }`}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Overview
            </button>

            <button
              onClick={() => setActiveTab('users')}
              className={`px-4 py-2 rounded-md font-medium transition-all duration-200 flex items-center gap-2 ${
                activeTab === 'users'
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-[#334155]'
              }`}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              Users
              <span className="bg-purple-500/30 text-purple-300 px-2 py-0.5 rounded-full text-xs font-semibold">
                {users.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('tools')}
              className={`px-4 py-2 rounded-md font-medium transition-all duration-200 flex items-center gap-2 ${
                activeTab === 'tools'
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-[#334155]'
              }`}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
              Tools
              {tools.length > 0 && (
                <span className="bg-purple-500/30 text-purple-300 px-2 py-0.5 rounded-full text-xs font-semibold">
                  {tools.length}
                </span>
              )}
            </button>

          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'users' && (
          <div className="animate-[fadeIn_0.3s_ease-out]">
            {/* Search and Filter Bar */}
            <div className="bg-[#1e293b] rounded-lg p-4 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Search */}
                <div className="md:col-span-1">
                  <div className="relative">
                    <svg
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                      type="text"
                      placeholder="Search by name or email..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-[#0f172a] border border-[#334155] rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Role Filter */}
                <div>
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="w-full px-4 py-2 bg-[#0f172a] border border-[#334155] rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="all">All Roles</option>
                    <option value="owner">Owner</option>
                    <option value="frontend">Frontend</option>
                    <option value="backend">Backend</option>
                    <option value="designer">Designer</option>
                  </select>
                </div>

                {/* Status Filter */}
                <div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-4 py-2 bg-[#0f172a] border border-[#334155] rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                {/* Refresh Button */}
                <div>
                  <button
                    onClick={handleRefresh}
                    disabled={isLoadingUsers}
                    className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md font-medium transition-colors duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg
                      className={`w-5 h-5 ${isLoadingUsers ? 'animate-spin' : ''}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Refresh
                  </button>
                </div>
              </div>
            </div>

            {/* Users Table Section */}
            <div className="bg-[#1e293b] rounded-lg overflow-hidden">
              {/* Table Header */}
              <div className="flex items-center justify-between p-6 border-b border-[#334155]">
                <h2 className="text-xl font-semibold text-white">
                  Users ({filteredUsers.length})
                </h2>
                <button
                  onClick={() => setShowAddUserModal(true)}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add User
                </button>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-4 bg-red-500/10 border-l-4 border-red-500 m-6">
                  <p className="text-red-400">{error}</p>
                </div>
              )}

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#0f172a]">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Tools
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Registration
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#334155]">
                    {isLoadingUsers ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center">
                          <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                            <span className="ml-3 text-gray-400">Loading users...</span>
                          </div>
                        </td>
                      </tr>
                    ) : filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                          No users found
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((u) => (
                        <tr
                          key={u.id}
                          className="hover:bg-[#334155]/30 transition-colors duration-150"
                        >
                          {/* User Column */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold text-lg">
                                {getUserInitial(u.name)}
                              </div>
                              <div>
                                <div className="text-sm font-medium text-white">{u.name}</div>
                                <div className="text-sm text-gray-400">{u.email}</div>
                              </div>
                            </div>
                          </td>

                          {/* Role Column */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getRoleBadgeColor(u.role)}`}>
                              {u.role.charAt(0).toUpperCase() + u.role.slice(1)}
                            </span>
                          </td>

                          {/* Status Column */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                                u.status === 'active'
                                  ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                  : 'bg-red-500/20 text-red-400 border border-red-500/30'
                              }`}
                            >
                              {u.status === 'active' ? (
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              ) : (
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                              )}
                              {u.status === 'active' ? 'Active' : 'Inactive'}
                            </span>
                          </td>

                          {/* Tools Column */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm font-semibold text-white">{u.tools_count || 0}</span>
                          </td>

                          {/* Registration Column */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2 text-sm text-gray-400">
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              {formatDate(u.created_at)}
                            </div>
                          </td>

                          {/* Actions Column */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              {/* Lock/Unlock Button */}
                              <button
                                onClick={() => handleToggleUserStatus(u.id)}
                                className="p-2 text-red-400 hover:bg-red-500/10 rounded-md transition-colors duration-150"
                                title={u.status === 'active' ? 'Lock user' : 'Unlock user'}
                              >
                                {u.status === 'active' ? (
                                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                  </svg>
                                ) : (
                                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                                  </svg>
                                )}
                              </button>

                              {/* Edit Button */}
                              <button
                                onClick={() => handleEditUser(u)}
                                className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-md transition-colors duration-150"
                                title="Edit user"
                              >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>

                              {/* Delete Button */}
                              <button
                                onClick={() => handleDeleteUser(u)}
                                className="p-2 text-red-400 hover:bg-red-500/10 rounded-md transition-colors duration-150"
                                title="Delete user"
                                disabled={u.id === user.id}
                              >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="animate-[fadeIn_0.3s_ease-out] space-y-6">
            {/* Statistics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Total Users Card */}
              <div className="bg-gradient-to-br from-purple-600/20 to-purple-900/20 border border-purple-500/30 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-purple-500/20 rounded-lg">
                    <svg className="w-8 h-8 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <span className="text-xs font-medium text-purple-400">USERS</span>
                </div>
                <div className="space-y-2">
                  <div className="text-3xl font-bold text-white">{users.length}</div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-green-400">
                      {users.filter(u => (u.status || 'active') === 'active').length} active
                    </span>
                    <span className="text-gray-500">•</span>
                    <span className="text-red-400">
                      {users.filter(u => (u.status || 'active') === 'inactive').length} inactive
                    </span>
                  </div>
                </div>
              </div>

              {/* Total Tools Card */}
              <div className="bg-gradient-to-br from-blue-600/20 to-blue-900/20 border border-blue-500/30 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-blue-500/20 rounded-lg">
                    <svg className="w-8 h-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                    </svg>
                  </div>
                  <span className="text-xs font-medium text-blue-400">TOOLS</span>
                </div>
                <div className="space-y-2">
                  <div className="text-3xl font-bold text-white">{tools.length}</div>
                  <div className="flex items-center gap-2 text-sm flex-wrap">
                    <span className="text-green-400">
                      {tools.filter(t => t.status === 'published').length} published
                    </span>
                    <span className="text-gray-500">•</span>
                    <span className="text-yellow-400">
                      {tools.filter(t => t.status === 'draft').length} drafts
                    </span>
                  </div>
                </div>
              </div>

              {/* Total Views Card */}
              <div className="bg-gradient-to-br from-green-600/20 to-green-900/20 border border-green-500/30 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-green-500/20 rounded-lg">
                    <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </div>
                  <span className="text-xs font-medium text-green-400">VIEWS</span>
                </div>
                <div className="space-y-2">
                  <div className="text-3xl font-bold text-white">
                    {tools.reduce((sum, t) => sum + t.views_count, 0).toLocaleString()}
                  </div>
                  <p className="text-sm text-gray-400">Total tool views</p>
                </div>
              </div>

              {/* Total Favorites Card */}
              <div className="bg-gradient-to-br from-rose-600/20 to-rose-900/20 border border-rose-500/30 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-rose-500/20 rounded-lg">
                    <svg className="w-8 h-8 text-rose-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                  <span className="text-xs font-medium text-rose-400">FAVORITES</span>
                </div>
                <div className="space-y-2">
                  <div className="text-3xl font-bold text-white">
                    {tools.reduce((sum, t) => sum + t.favorites_count, 0).toLocaleString()}
                  </div>
                  <p className="text-sm text-gray-400">Total favorites</p>
                </div>
              </div>
            </div>

            {/* Users by Role & Tools by Status */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Users by Role */}
              <div className="bg-[#1e293b] rounded-lg p-6 border border-[#334155]">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Users by Role
                </h3>
                <div className="space-y-3">
                  {['owner', 'frontend', 'backend', 'designer', 'devops', 'data-scientist', 'qa'].map(role => {
                    const count = users.filter(u => u.role === role).length;
                    const percentage = users.length > 0 ? ((count / users.length) * 100).toFixed(1) : '0.0';
                    return count > 0 ? (
                      <div key={role} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-300 capitalize">{role.replace('-', ' ')}</span>
                          <span className="text-white font-semibold">{count} ({percentage}%)</span>
                        </div>
                        <div className="h-2 bg-[#0f172a] rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              role === 'owner' ? 'bg-purple-500' :
                              role === 'frontend' ? 'bg-blue-500' :
                              role === 'backend' ? 'bg-green-500' :
                              role === 'designer' ? 'bg-orange-500' :
                              role === 'devops' ? 'bg-cyan-500' :
                              role === 'data-scientist' ? 'bg-pink-500' :
                              'bg-gray-500'
                            }`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    ) : null;
                  })}
                </div>
              </div>

              {/* Tools by Status */}
              <div className="bg-[#1e293b] rounded-lg p-6 border border-[#334155]">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Tools by Status
                </h3>
                <div className="space-y-3">
                  {['published', 'draft', 'archived'].map(status => {
                    const count = tools.filter(t => t.status === status).length;
                    const percentage = tools.length > 0 ? ((count / tools.length) * 100).toFixed(1) : '0.0';
                    return (
                      <div key={status} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-300 capitalize">{status}</span>
                          <span className="text-white font-semibold">{count} ({percentage}%)</span>
                        </div>
                        <div className="h-2 bg-[#0f172a] rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              status === 'published' ? 'bg-green-500' :
                              status === 'draft' ? 'bg-yellow-500' :
                              'bg-gray-500'
                            }`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Top Contributors */}
            <div className="bg-[#1e293b] rounded-lg p-6 border border-[#334155]">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
                Top Contributors
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#0f172a]">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">User</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Role</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Tools</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#334155]">
                    {users
                      .filter(u => (u.tools_count || 0) > 0)
                      .sort((a, b) => (b.tools_count || 0) - (a.tools_count || 0))
                      .slice(0, 5)
                      .map((user, index) => (
                        <tr key={user.id} className="hover:bg-[#334155]/30 transition-colors">
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold text-sm">
                                {getUserInitial(user.name)}
                              </div>
                              <div>
                                <div className="text-sm font-medium text-white">{user.name}</div>
                                <div className="text-xs text-gray-400">{user.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getRoleBadgeColor(user.role)}`}>
                              {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-white">{user.tools_count}</span>
                              <span className="text-xs text-gray-400">tools</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    {users.filter(u => (u.tools_count || 0) > 0).length === 0 && (
                      <tr>
                        <td colSpan={3} className="px-4 py-8 text-center text-gray-400">
                          No tools have been created yet
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tools Tab */}
        {activeTab === 'tools' && (
          <div className="animate-[fadeIn_0.3s_ease-out]">
            {/* Tools Table Section */}
            <div className="bg-[#1e293b] rounded-lg overflow-hidden">
              {/* Table Header */}
              <div className="flex items-center justify-between p-6 border-b border-[#334155]">
                <h2 className="text-xl font-semibold text-white">
                  Manage the tools table
                </h2>
                <button
                  onClick={fetchTools}
                  disabled={isLoadingTools}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg
                    className={`w-5 h-5 ${isLoadingTools ? 'animate-spin' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh
                </button>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#0f172a]">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Tool
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Owner
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Stats
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#334155]">
                    {isLoadingTools ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center">
                          <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                            <span className="ml-3 text-gray-400">Loading tools...</span>
                          </div>
                        </td>
                      </tr>
                    ) : tools.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                          No tools found
                        </td>
                      </tr>
                    ) : (
                      tools.map((tool) => (
                        <tr
                          key={tool.id}
                          className="hover:bg-[#334155]/30 transition-colors duration-150"
                        >
                          {/* Tool Column */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              {tool.thumbnail_url ? (
                                <img
                                  src={tool.thumbnail_url}
                                  alt={tool.title}
                                  className="w-10 h-10 rounded-lg object-cover"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-lg">
                                  🤖
                                </div>
                              )}
                              <div>
                                <div className="text-sm font-medium text-white max-w-xs truncate">
                                  {tool.title}
                                </div>
                                <div className="text-xs text-gray-400 max-w-xs truncate">
                                  {tool.description}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Category Column */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                              {tool.category.icon} {tool.category.name}
                            </span>
                          </td>

                          {/* Owner Column */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-white">{tool.user.name}</div>
                            <div className="text-xs text-gray-400">{tool.user.email}</div>
                          </td>

                          {/* Status Column */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                tool.status === 'published'
                                  ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                  : tool.status === 'draft'
                                  ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                                  : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                              }`}
                            >
                              {tool.status.charAt(0).toUpperCase() + tool.status.slice(1)}
                            </span>
                          </td>

                          {/* Stats Column */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3 text-sm text-gray-400">
                              <span className="flex items-center gap-1">
                                👁️ {tool.views_count}
                              </span>
                              <span className="flex items-center gap-1">
                                ❤️ {tool.favorites_count}
                              </span>
                            </div>
                          </td>

                          {/* Actions Column */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              {/* View Button */}
                              <button
                                onClick={() => handleViewTool(tool)}
                                className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-md transition-colors duration-150"
                                title="View tool details"
                              >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                              </button>

                              {/* Edit Button */}
                              <button
                                onClick={() => handleEditTool(tool)}
                                className="p-2 text-green-400 hover:bg-green-500/10 rounded-md transition-colors duration-150"
                                title="Edit tool"
                              >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>

                              {/* Delete Button */}
                              <button
                                onClick={() => handleDeleteTool(tool)}
                                className="p-2 text-red-400 hover:bg-red-500/10 rounded-md transition-colors duration-150"
                                title="Delete tool"
                              >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* Add User Modal */}
      {showAddUserModal && (
        <Modal
          isOpen={showAddUserModal}
          onClose={() => setShowAddUserModal(false)}
          title="Add New User"
        >
          <div className="space-y-4">
            {/* Info Banner */}
            <div className="p-4 bg-purple-600/10 border border-purple-500/20 rounded-md">
              <div className="flex items-start gap-2">
                <svg className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <div>
                  <p className="text-sm text-purple-400 font-medium mb-1">Create New User</p>
                  <p className="text-xs text-purple-300/80">
                    Enter the user's information below to create a new account in the system.
                  </p>
                </div>
              </div>
            </div>

            {/* Add User Form */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={addUserFormData.name}
                  onChange={(e) => setAddUserFormData({ ...addUserFormData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-[#0f172a] border border-[#334155] rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter user name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  value={addUserFormData.email}
                  onChange={(e) => setAddUserFormData({ ...addUserFormData, email: e.target.value })}
                  className="w-full px-3 py-2 bg-[#0f172a] border border-[#334155] rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter email address"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Password <span className="text-rose-500">*</span>
                </label>
                <input
                  type="password"
                  value={addUserFormData.password}
                  onChange={(e) => setAddUserFormData({ ...addUserFormData, password: e.target.value })}
                  className="w-full px-3 py-2 bg-[#0f172a] border border-[#334155] rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter password"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Role <span className="text-rose-500">*</span>
                </label>
                <select
                  value={addUserFormData.role}
                  onChange={(e) => setAddUserFormData({ ...addUserFormData, role: e.target.value })}
                  className="w-full px-3 py-2 bg-[#0f172a] border border-[#334155] rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="frontend">Frontend</option>
                  <option value="backend">Backend</option>
                  <option value="designer">Designer</option>
                  <option value="devops">DevOps</option>
                  <option value="data-scientist">Data Scientist</option>
                  <option value="qa">QA</option>
                  <option value="owner">Owner</option>
                </select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 justify-end pt-4 border-t border-[#334155]">
              <Button
                variant="outline"
                onClick={() => setShowAddUserModal(false)}
                disabled={isSubmittingAdd}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleAddUser}
                disabled={isSubmittingAdd}
              >
                {isSubmittingAdd ? 'Creating...' : 'Create User'}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <Modal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedUser(null);
          }}
          title="Edit User"
        >
          <div className="space-y-4">
            {/* User Avatar and Info */}
            <div className="flex items-center gap-4 p-4 bg-[#0f172a] rounded-lg border border-[#334155]">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-2xl">
                {getUserInitial(selectedUser.name)}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">{selectedUser.name}</h3>
                <p className="text-sm text-gray-400">{selectedUser.email}</p>
                <span className={`inline-block mt-1 px-2 py-1 rounded-full text-xs font-semibold ${getRoleBadgeColor(selectedUser.role)}`}>
                  {selectedUser.role.charAt(0).toUpperCase() + selectedUser.role.slice(1)}
                </span>
              </div>
            </div>

            {/* Edit Form */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-[#0f172a] border border-[#334155] rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter user name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  value={editFormData.email}
                  onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                  className="w-full px-3 py-2 bg-[#0f172a] border border-[#334155] rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter email address"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Role <span className="text-rose-500">*</span>
                </label>
                <select
                  value={editFormData.role}
                  onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value })}
                  className="w-full px-3 py-2 bg-[#0f172a] border border-[#334155] rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="owner">Owner</option>
                  <option value="frontend">Frontend</option>
                  <option value="backend">Backend</option>
                  <option value="designer">Designer</option>
                  <option value="devops">DevOps</option>
                  <option value="data-scientist">Data Scientist</option>
                  <option value="qa">QA</option>
                </select>
              </div>

              {/* Info Box */}
              <div className="p-4 bg-blue-600/10 border border-blue-500/20 rounded-md">
                <div className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-sm text-blue-400 font-medium mb-1">User Information</p>
                    <p className="text-xs text-blue-300/80">
                      User ID: {selectedUser.id} • Tools: {selectedUser.tools_count || 0} • Joined: {formatDate(selectedUser.created_at)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 justify-end pt-4 border-t border-[#334155]">
              <Button
                variant="outline"
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedUser(null);
                }}
                disabled={isSubmittingEdit}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleSaveEdit}
                disabled={isSubmittingEdit}
              >
                {isSubmittingEdit ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete User Modal */}
      {showDeleteModal && selectedUser && (
        <Modal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setSelectedUser(null);
          }}
          title="Delete User"
        >
          <div className="p-6">
            <p className="text-gray-400 mb-4">
              Are you sure you want to delete <strong className="text-white">{selectedUser.name}</strong>? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedUser(null);
                }}
              >
                Cancel
              </Button>
              <Button variant="danger" onClick={confirmDeleteUser}>
                Delete User
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* View Tool Modal */}
      {showViewToolModal && selectedTool && (
        <Modal
          isOpen={showViewToolModal}
          onClose={() => {
            setShowViewToolModal(false);
            setSelectedTool(null);
          }}
          title="Tool Details"
        >
          <div className="space-y-6">
            {/* Tool Header */}
            <div className="flex items-start gap-4 p-4 bg-[#0f172a] rounded-lg border border-[#334155]">
              {selectedTool.thumbnail_url ? (
                <img
                  src={selectedTool.thumbnail_url}
                  alt={selectedTool.title}
                  className="w-20 h-20 rounded-lg object-cover"
                />
              ) : (
                <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-3xl">
                  🤖
                </div>
              )}
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-2">{selectedTool.title}</h3>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                    {selectedTool.category.icon} {selectedTool.category.name}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    selectedTool.status === 'published'
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                      : selectedTool.status === 'draft'
                      ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                      : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                  }`}>
                    {selectedTool.status.charAt(0).toUpperCase() + selectedTool.status.slice(1)}
                  </span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
              <p className="text-gray-400 text-sm leading-relaxed">{selectedTool.description}</p>
            </div>

            {/* Links */}
            <div className="grid grid-cols-1 gap-3">
              {selectedTool.url && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Website</label>
                  <a
                    href={selectedTool.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 text-sm break-all"
                  >
                    {selectedTool.url}
                  </a>
                </div>
              )}
              {selectedTool.github_url && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">GitHub</label>
                  <a
                    href={selectedTool.github_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 text-sm break-all"
                  >
                    {selectedTool.github_url}
                  </a>
                </div>
              )}
              {selectedTool.documentation_url && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Documentation</label>
                  <a
                    href={selectedTool.documentation_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 text-sm break-all"
                  >
                    {selectedTool.documentation_url}
                  </a>
                </div>
              )}
            </div>

            {/* Tags */}
            {selectedTool.tags.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Tags</label>
                <div className="flex flex-wrap gap-2">
                  {selectedTool.tags.map((tag) => (
                    <span key={tag.id} className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-500/20 text-gray-400 border border-gray-500/30">
                      {tag.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Roles */}
            {selectedTool.roles_list && selectedTool.roles_list.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Relevant for Roles</label>
                <div className="flex flex-wrap gap-2">
                  {selectedTool.roles_list.map((role) => (
                    <span key={role} className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-400 border border-purple-500/30">
                      {role.charAt(0).toUpperCase() + role.slice(1).replace('-', ' ')}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Stats & Info */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-[#0f172a] rounded-lg border border-[#334155]">
              <div>
                <div className="text-xs text-gray-400 mb-1">Type</div>
                <div className="text-sm font-semibold text-white">{selectedTool.tool_type}</div>
              </div>
              <div>
                <div className="text-xs text-gray-400 mb-1">Pricing</div>
                <div className="text-sm font-semibold text-white">{selectedTool.pricing_model.replace('_', ' ')}</div>
              </div>
              <div>
                <div className="text-xs text-gray-400 mb-1">Views</div>
                <div className="text-sm font-semibold text-white">👁️ {selectedTool.views_count}</div>
              </div>
              <div>
                <div className="text-xs text-gray-400 mb-1">Favorites</div>
                <div className="text-sm font-semibold text-white">❤️ {selectedTool.favorites_count}</div>
              </div>
              <div>
                <div className="text-xs text-gray-400 mb-1">Owner</div>
                <div className="text-sm font-semibold text-white">{selectedTool.user.name}</div>
              </div>
              <div>
                <div className="text-xs text-gray-400 mb-1">Created</div>
                <div className="text-sm font-semibold text-white">{formatDate(selectedTool.created_at)}</div>
              </div>
            </div>

            {/* Close Button */}
            <div className="flex justify-end pt-4 border-t border-[#334155]">
              <Button
                variant="outline"
                onClick={() => {
                  setShowViewToolModal(false);
                  setSelectedTool(null);
                }}
              >
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Edit Tool Modal */}
      {showEditToolModal && selectedTool && (
        <Modal
          isOpen={showEditToolModal}
          onClose={() => {
            setShowEditToolModal(false);
            setSelectedTool(null);
          }}
          title="Edit Tool"
        >
          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={editToolFormData.title || ''}
                onChange={(e) => setEditToolFormData({ ...editToolFormData, title: e.target.value })}
                className="w-full px-3 py-2 bg-[#0f172a] border border-[#334155] rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description <span className="text-rose-500">*</span>
              </label>
              <textarea
                value={editToolFormData.description || ''}
                onChange={(e) => setEditToolFormData({ ...editToolFormData, description: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 bg-[#0f172a] border border-[#334155] rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">URL</label>
              <input
                type="url"
                value={editToolFormData.url || ''}
                onChange={(e) => setEditToolFormData({ ...editToolFormData, url: e.target.value })}
                spellCheck="false"
                autoComplete="off"
                className="w-full px-3 py-2 bg-[#0f172a] border border-[#334155] rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">GitHub URL</label>
              <input
                type="url"
                value={editToolFormData.github_url || ''}
                onChange={(e) => setEditToolFormData({ ...editToolFormData, github_url: e.target.value })}
                spellCheck="false"
                autoComplete="off"
                className="w-full px-3 py-2 bg-[#0f172a] border border-[#334155] rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Documentation URL</label>
              <input
                type="url"
                value={editToolFormData.documentation_url || ''}
                onChange={(e) => setEditToolFormData({ ...editToolFormData, documentation_url: e.target.value })}
                spellCheck="false"
                autoComplete="off"
                className="w-full px-3 py-2 bg-[#0f172a] border border-[#334155] rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Category <span className="text-rose-500">*</span>
              </label>
              <select
                value={editToolFormData.category_id || ''}
                onChange={(e) => setEditToolFormData({ ...editToolFormData, category_id: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-[#0f172a] border border-[#334155] rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Tool Type <span className="text-rose-500">*</span>
                </label>
                <select
                  value={editToolFormData.tool_type || ''}
                  onChange={(e) => setEditToolFormData({ ...editToolFormData, tool_type: e.target.value })}
                  className="w-full px-3 py-2 bg-[#0f172a] border border-[#334155] rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select type</option>
                  <option value="library">Library</option>
                  <option value="framework">Framework</option>
                  <option value="api">API</option>
                  <option value="service">Service</option>
                  <option value="application">Application</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Pricing <span className="text-rose-500">*</span>
                </label>
                <select
                  value={editToolFormData.pricing_model || ''}
                  onChange={(e) => setEditToolFormData({ ...editToolFormData, pricing_model: e.target.value })}
                  className="w-full px-3 py-2 bg-[#0f172a] border border-[#334155] rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select pricing</option>
                  <option value="free">Free</option>
                  <option value="freemium">Freemium</option>
                  <option value="paid">Paid</option>
                  <option value="open_source">Open Source</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Tags <span className="text-rose-500">*</span>
              </label>
              <div className="flex flex-wrap gap-2 p-3 border border-[#334155] bg-[#0f172a] rounded-md max-h-40 overflow-y-auto">
                {tagsData.map((tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => {
                      if (selectedToolTags.includes(tag.id)) {
                        setSelectedToolTags(selectedToolTags.filter((id) => id !== tag.id));
                      } else {
                        setSelectedToolTags([...selectedToolTags, tag.id]);
                      }
                    }}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      selectedToolTags.includes(tag.id)
                        ? 'bg-blue-500 text-white'
                        : 'bg-[#2a2a2a] text-gray-300 hover:bg-[#333333]'
                    }`}
                  >
                    {tag.name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
              <select
                value={editToolFormData.status || 'draft'}
                onChange={(e) => setEditToolFormData({ ...editToolFormData, status: e.target.value })}
                className="w-full px-3 py-2 bg-[#0f172a] border border-[#334155] rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <div className="flex gap-3 justify-end pt-4 border-t border-[#334155]">
              <Button
                variant="ghost"
                onClick={() => {
                  setShowEditToolModal(false);
                  setSelectedTool(null);
                }}
                disabled={isSubmittingToolEdit}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleSaveToolEdit}
                disabled={isSubmittingToolEdit}
              >
                {isSubmittingToolEdit ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Tool Modal */}
      {showDeleteToolModal && selectedTool && (
        <Modal
          isOpen={showDeleteToolModal}
          onClose={() => {
            setShowDeleteToolModal(false);
            setSelectedTool(null);
          }}
          title="Delete Tool"
        >
          <div className="space-y-4">
            {/* Warning Banner */}
            <div className="p-4 bg-red-600/10 border border-red-500/20 rounded-md">
              <div className="flex items-start gap-2">
                <svg className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                  <p className="text-sm text-red-400 font-medium mb-1">Warning: This action cannot be undone</p>
                  <p className="text-xs text-red-300/80">
                    All data associated with this tool including comments and favorites will be permanently deleted.
                  </p>
                </div>
              </div>
            </div>

            {/* Tool Preview */}
            <div className="flex items-center gap-3 p-4 bg-[#0f172a] rounded-lg border border-[#334155]">
              {selectedTool.thumbnail_url ? (
                <img
                  src={selectedTool.thumbnail_url}
                  alt={selectedTool.title}
                  className="w-16 h-16 rounded-lg object-cover"
                />
              ) : (
                <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-2xl">
                  🤖
                </div>
              )}
              <div>
                <h3 className="text-lg font-semibold text-white">{selectedTool.title}</h3>
                <p className="text-sm text-gray-400">
                  Owner: {selectedTool.user.name} • {selectedTool.views_count} views • {selectedTool.favorites_count} favorites
                </p>
              </div>
            </div>

            <p className="text-gray-400 text-sm">
              Are you sure you want to delete <strong className="text-white">{selectedTool.title}</strong>?
            </p>

            {/* Action Buttons */}
            <div className="flex gap-3 justify-end pt-4 border-t border-[#334155]">
              <Button
                variant="outline"
                onClick={() => {
                  setShowDeleteToolModal(false);
                  setSelectedTool(null);
                }}
              >
                Cancel
              </Button>
              <Button variant="danger" onClick={confirmDeleteTool}>
                Delete Tool
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
