'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardBody, Button, Badge, Navigation, Modal, useToast } from '@/components/ui';

interface Tool {
  id: number;
  title: string;
  description: string;
  url: string;
  github_url: string | null;
  documentation_url: string | null;
  thumbnail_url: string | null;
  tool_type: string;
  pricing_model: string;
  status: 'draft' | 'published' | 'archived';
  views_count: number;
  favorites_count: number;
  category_id: number;
  category?: {
    id: number;
    name: string;
  };
  tags?: Array<{ id: number; name: string }>;
  created_at: string;
  updated_at: string;
}

interface ProfileStats {
  totalTools: number;
  activeTools: number;
  monthlyTools: number;
  rank: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, isLoading, updateUser } = useAuth();
  const { addToast } = useToast();
  const [tools, setTools] = useState<Tool[]>([]);
  const [stats, setStats] = useState<ProfileStats>({
    totalTools: 0,
    activeTools: 0,
    monthlyTools: 0,
    rank: 'Member',
  });
  const [isLoadingTools, setIsLoadingTools] = useState(true);

  // Profile edit state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({ name: '', email: '' });
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Tool modals state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [toolToDelete, setToolToDelete] = useState<Tool | null>(null);
  const [toolToView, setToolToView] = useState<Tool | null>(null);
  const [toolToEdit, setToolToEdit] = useState<Tool | null>(null);

  // Edit tool form state
  const [categories, setCategories] = useState<Array<{ id: number; name: string }>>([]);
  const [tags, setTags] = useState<Array<{ id: number; name: string }>>([]);
  const [editFormData, setEditFormData] = useState<any>({});
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (user) {
      fetchUserTools();
      setProfileData({ name: user.name, email: user.email });
    }
  }, [user]);

  useEffect(() => {
    // Fetch categories and tags for edit modal
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
          setTags(data.data || []);
        }
      } catch (error) {
        console.error('Error fetching categories/tags:', error);
      }
    };

    fetchCategoriesAndTags();
  }, []);

  const fetchUserTools = async () => {
    try {
      setIsLoadingTools(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8201/api';
      const token = localStorage.getItem('token');

      console.log('🔍 Fetching tools for user:', user?.name, 'ID:', user?.id);
      console.log('🔍 Token:', token?.substring(0, 20) + '...');
      console.log('🔍 API URL:', `${apiUrl}/my-tools`);

      const response = await fetch(`${apiUrl}/my-tools`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      console.log('🔍 Response status:', response.status, response.statusText);

      // Handle 204 No Content
      if (response.status === 204) {
        console.warn('⚠️ API returned 204 No Content - no tools found');
        setTools([]);
        setStats({
          totalTools: 0,
          activeTools: 0,
          monthlyTools: 0,
          rank: user?.role.charAt(0).toUpperCase() + user?.role.slice(1) || 'Member',
        });
        return;
      }

      if (response.ok) {
        const data = await response.json();
        console.log('✅ API Response:', data);
        console.log('✅ data.success:', data.success);
        console.log('✅ data.data:', data.data);
        console.log('✅ data.data.data:', data.data?.data);

        // Backend returns: { success: true, data: { data: [tools], ...pagination } }
        let userTools: Tool[] = [];
        if (data.success && data.data) {
          // Handle paginated response
          if (data.data.data && Array.isArray(data.data.data)) {
            userTools = data.data.data;
            console.log('✅ Extracted tools from data.data.data:', userTools.length);
          } else if (Array.isArray(data.data)) {
            userTools = data.data;
            console.log('✅ Extracted tools from data.data:', userTools.length);
          }
        } else if (Array.isArray(data)) {
          userTools = data;
          console.log('✅ Extracted tools from data:', userTools.length);
        }

        console.log('✅ Final userTools array:', userTools);
        console.log('✅ Number of tools:', userTools.length);
        setTools(userTools);

        // Calculate stats
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        const monthlyTools = userTools.filter((tool: Tool) => {
          const toolDate = new Date(tool.created_at);
          return toolDate.getMonth() === currentMonth && toolDate.getFullYear() === currentYear;
        }).length;

        const activeTools = userTools.filter((tool: Tool) => tool.status === 'published').length;

        setStats({
          totalTools: userTools.length,
          activeTools,
          monthlyTools,
          rank: user?.role.charAt(0).toUpperCase() + user?.role.slice(1) || 'Member',
        });
      } else {
        console.error('Failed to fetch tools:', response.status, response.statusText);
        // Set empty tools array on error
        setTools([]);
      }
    } catch (error) {
      console.error('Error fetching tools:', error);
      // Set empty tools array on error
      setTools([]);
    } finally {
      setIsLoadingTools(false);
    }
  };

  const handleDeleteClick = (tool: Tool) => {
    setToolToDelete(tool);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!toolToDelete) return;

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8201/api';
      const token = localStorage.getItem('token');

      const response = await fetch(`${apiUrl}/tools/${toolToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        // Remove tool from list
        setTools(tools.filter(t => t.id !== toolToDelete.id));
        setDeleteModalOpen(false);
        setToolToDelete(null);
        addToast('Tool deleted successfully', 'success', 4000);
        // Refresh stats
        fetchUserTools();
      } else {
        addToast('Failed to delete tool', 'error', 4000);
      }
    } catch (error) {
      console.error('Error deleting tool:', error);
      addToast('Error deleting tool', 'error', 4000);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setIsSavingProfile(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8201/api';
      const token = localStorage.getItem('token');

      const response = await fetch(`${apiUrl}/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
        body: JSON.stringify(profileData),
      });

      if (response.ok) {
        const data = await response.json();
        if (updateUser && data.user) {
          updateUser(data.user);
        }
        setIsEditingProfile(false);
        addToast('Profile updated successfully', 'success', 4000);
      } else {
        const errorData = await response.json();
        addToast(errorData.message || 'Failed to update profile', 'error', 4000);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      addToast('Error updating profile', 'error', 4000);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleViewClick = async (tool: Tool) => {
    // Fetch full tool details
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8201/api';
      const token = localStorage.getItem('token');

      const response = await fetch(`${apiUrl}/tools/${tool.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setToolToView(data.data || data);
        setViewModalOpen(true);
      } else {
        addToast('Failed to load tool details', 'error', 4000);
      }
    } catch (error) {
      console.error('Error fetching tool:', error);
      addToast('Error loading tool details', 'error', 4000);
    }
  };

  const handleEditClick = async (tool: Tool) => {
    // Fetch full tool details for editing
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8201/api';
      const token = localStorage.getItem('token');

      const response = await fetch(`${apiUrl}/tools/${tool.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        const fullTool = data.data || data;
        setToolToEdit(fullTool);
        setEditFormData({
          title: fullTool.title,
          description: fullTool.description,
          url: fullTool.url || '',
          github_url: fullTool.github_url || '',
          documentation_url: fullTool.documentation_url || '',
          thumbnail_url: fullTool.thumbnail_url || '',
          category_id: fullTool.category_id,
          tool_type: fullTool.tool_type,
          pricing_model: fullTool.pricing_model,
          status: fullTool.status,
        });
        setSelectedTags(fullTool.tags?.map((t: any) => t.id) || []);
        setEditModalOpen(true);
      } else {
        addToast('Failed to load tool details', 'error', 4000);
      }
    } catch (error) {
      console.error('Error fetching tool:', error);
      addToast('Error loading tool details', 'error', 4000);
    }
  };

  const handleSaveEdit = async () => {
    if (!toolToEdit) return;

    try {
      setIsSubmittingEdit(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8201/api';
      const token = localStorage.getItem('token');

      const response = await fetch(`${apiUrl}/tools/${toolToEdit.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          ...editFormData,
          tags: selectedTags,
        }),
      });

      if (response.ok) {
        setEditModalOpen(false);
        setToolToEdit(null);
        addToast('Tool updated successfully', 'success', 4000);
        fetchUserTools(); // Refresh the tools list
      } else {
        const errorData = await response.json();
        addToast(errorData.message || 'Failed to update tool', 'error', 4000);
      }
    } catch (error) {
      console.error('Error updating tool:', error);
      addToast('Error updating tool', 'error', 4000);
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  const getPermissionsByRole = (role: string) => {
    switch (role) {
      case 'owner':
        return [
          'Full system access',
          'Manage all users',
          'Edit all tools',
          'Administer categories and tags',
        ];
      case 'frontend':
        return [
          'Submit tools',
          'Edit own tools',
          'Browse all tools',
          'Access frontend resources',
        ];
      case 'backend':
        return [
          'Submit tools',
          'Edit own tools',
          'Browse all tools',
          'Access backend resources',
        ];
      case 'designer':
        return [
          'Submit tools',
          'Edit own tools',
          'Browse all tools',
          'Access design resources',
        ];
      default:
        return [
          'Submit tools',
          'Edit own tools',
          'Browse all tools',
        ];
    }
  };

  const getMemberSinceDate = () => {
    // For now, return a static date. In production, this would come from user.created_at
    return 'September 16, 2025';
  };

  const getUserInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f172a]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading your profile...</p>
        </div>
      </div>
    );
  }

  const permissions = getPermissionsByRole(user.role);

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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Sidebar - Profile Card */}
          <div className="lg:col-span-3 space-y-6">
            {/* Profile Card */}
            <Card className="bg-[#1e293b] border-[#334155]">
              <CardBody>
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <h2 className="text-lg font-semibold text-white">Profile</h2>
                  </div>
                  {!isEditingProfile ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsEditingProfile(true)}
                      className="text-blue-400 hover:text-blue-300"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setIsEditingProfile(false);
                          setProfileData({ name: user.name, email: user.email });
                        }}
                        disabled={isSavingProfile}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={handleSaveProfile}
                        disabled={isSavingProfile}
                      >
                        {isSavingProfile ? 'Saving...' : 'Save'}
                      </Button>
                    </div>
                  )}
                </div>

                {/* Avatar */}
                <div className="flex justify-center mb-4">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center">
                    <span className="text-3xl font-bold text-white">
                      {getUserInitials(isEditingProfile ? profileData.name : user.name)}
                    </span>
                  </div>
                </div>

                {/* User Info */}
                {!isEditingProfile ? (
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-semibold text-white mb-1">{user.name}</h3>
                    <p className="text-sm text-gray-400 mb-3">{user.email}</p>
                    <Badge variant="primary" size="md">
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </Badge>
                  </div>
                ) : (
                  <div className="mb-6 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
                      <input
                        type="text"
                        value={profileData.name}
                        onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                        className="w-full px-3 py-2 bg-[#0f172a] border border-[#334155] rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                      <input
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                        className="w-full px-3 py-2 bg-[#0f172a] border border-[#334155] rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="text-center">
                      <Badge variant="primary" size="md">
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </Badge>
                    </div>
                  </div>
                )}

                {/* Member Since */}
                <div className="flex items-center justify-center gap-2 text-sm text-gray-400 pt-4 border-t border-[#334155]">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>Member since {getMemberSinceDate()}</span>
                </div>
              </CardBody>
            </Card>

            {/* Permissions Card */}
            <Card className="bg-[#1e293b] border-[#334155]">
              <CardBody>
                <div className="flex items-center gap-2 mb-4">
                  <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <h3 className="text-base font-semibold text-white">Access Rights</h3>
                </div>
                <ul className="space-y-3">
                  {permissions.map((permission, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-gray-300">
                      <svg className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>{permission}</span>
                    </li>
                  ))}
                </ul>
              </CardBody>
            </Card>
          </div>

          {/* Right Main Content */}
          <div className="lg:col-span-9 space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Total Tools */}
              <Card className="bg-gradient-to-br from-blue-500 to-blue-600 border-blue-400">
                <CardBody>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-100 mb-1">Total Tools</p>
                      <p className="text-3xl font-bold text-white">{stats.totalTools}</p>
                    </div>
                    <div className="text-4xl opacity-80">
                      <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                    </div>
                  </div>
                </CardBody>
              </Card>

              {/* Active Tools */}
              <Card className="bg-gradient-to-br from-green-500 to-green-600 border-green-400">
                <CardBody>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-green-100 mb-1">Active</p>
                      <p className="text-3xl font-bold text-white">{stats.activeTools}</p>
                    </div>
                    <div className="text-4xl opacity-80">
                      <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                  </div>
                </CardBody>
              </Card>

              {/* This Month */}
              <Card className="bg-gradient-to-br from-purple-500 to-purple-600 border-purple-400">
                <CardBody>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-purple-100 mb-1">This Month</p>
                      <p className="text-3xl font-bold text-white">{stats.monthlyTools}</p>
                    </div>
                    <div className="text-4xl opacity-80">
                      <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                  </div>
                </CardBody>
              </Card>

              {/* Rank */}
              <Card className="bg-gradient-to-br from-orange-500 to-orange-600 border-orange-400">
                <CardBody>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-orange-100 mb-1">Rank</p>
                      <p className="text-2xl font-bold text-white">{stats.rank}</p>
                    </div>
                    <div className="text-4xl opacity-80">
                      <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </div>

            {/* My Tools Section */}
            <Card className="bg-[#1e293b] border-[#334155]">
              <CardBody>
                {/* Section Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                    </svg>
                    <h2 className="text-xl font-semibold text-white">My Tools</h2>
                  </div>
                  <Button
                    variant="primary"
                    size="md"
                    onClick={() => router.push('/tools/add')}
                  >
                    + Add New
                  </Button>
                </div>

                {/* Tools List */}
                {isLoadingTools ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-400">Loading your tools...</p>
                  </div>
                ) : tools.length === 0 ? (
                  <div className="text-center py-12">
                    <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                    <p className="text-gray-400 mb-4">You haven't submitted any tools yet</p>
                    <Button variant="primary" onClick={() => router.push('/tools/add')}>
                      Submit Your First Tool
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {tools.map((tool) => (
                      <div
                        key={tool.id}
                        className="flex items-start gap-4 p-4 rounded-lg bg-[#0f172a] border border-[#334155] hover:border-blue-500/50 transition-colors"
                      >
                        {/* Tool Icon */}
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                        </div>

                        {/* Tool Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <h3 className="text-base font-semibold text-white mb-1 truncate">{tool.title}</h3>
                              <p className="text-sm text-gray-400 mb-2 line-clamp-2">{tool.description}</p>
                              <div className="flex items-center gap-4 text-xs text-gray-500">
                                <span className="flex items-center gap-1">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                  {formatDate(tool.created_at)}
                                </span>
                                <Badge
                                  variant={tool.status === 'published' ? 'success' : tool.status === 'draft' ? 'warning' : 'default'}
                                  size="sm"
                                >
                                  {tool.status}
                                </Badge>
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <button
                                onClick={() => handleViewClick(tool)}
                                className="p-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors"
                                title="View tool"
                                aria-label="View tool"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleEditClick(tool)}
                                className="p-2 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20 transition-colors"
                                title="Edit tool"
                                aria-label="Edit tool"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleDeleteClick(tool)}
                                className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                                title="Delete tool"
                                aria-label="Delete tool"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardBody>
            </Card>
          </div>
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && toolToDelete && (
        <Modal
          isOpen={deleteModalOpen}
          onClose={() => {
            setDeleteModalOpen(false);
            setToolToDelete(null);
          }}
          title="Delete Tool"
        >
          <div className="space-y-4">
            <p className="text-gray-300">
              Are you sure you want to delete <strong className="text-white">{toolToDelete.title}</strong>?
              This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                variant="ghost"
                onClick={() => {
                  setDeleteModalOpen(false);
                  setToolToDelete(null);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleDeleteConfirm}
              >
                Delete Tool
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* View Tool Modal */}
      {viewModalOpen && toolToView && (
        <Modal
          isOpen={viewModalOpen}
          onClose={() => {
            setViewModalOpen(false);
            setToolToView(null);
          }}
          title="Tool Details"
        >
          <div className="space-y-4">
            <div>
              <h3 className="text-2xl font-bold text-white mb-2">{toolToView.title}</h3>
              <Badge variant={toolToView.status === 'published' ? 'success' : toolToView.status === 'draft' ? 'warning' : 'default'}>
                {toolToView.status}
              </Badge>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Description</label>
              <p className="text-gray-300">{toolToView.description}</p>
            </div>

            {toolToView.url && (
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">URL</label>
                <a href={toolToView.url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 break-all">
                  {toolToView.url}
                </a>
              </div>
            )}

            {toolToView.github_url && (
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">GitHub</label>
                <a href={toolToView.github_url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 break-all">
                  {toolToView.github_url}
                </a>
              </div>
            )}

            {toolToView.documentation_url && (
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Documentation</label>
                <a href={toolToView.documentation_url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 break-all">
                  {toolToView.documentation_url}
                </a>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Tool Type</label>
                <p className="text-gray-300 capitalize">{toolToView.tool_type}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Pricing</label>
                <p className="text-gray-300 capitalize">{toolToView.pricing_model?.replace('_', ' ')}</p>
              </div>
            </div>

            {toolToView.category && (
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Category</label>
                <p className="text-gray-300">{toolToView.category.name}</p>
              </div>
            )}

            {toolToView.tags && toolToView.tags.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Tags</label>
                <div className="flex flex-wrap gap-2">
                  {toolToView.tags.map((tag) => (
                    <Badge key={tag.id} variant="default" size="sm">
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-between text-sm text-gray-400 pt-4 border-t border-[#334155]">
              <div>
                <span className="font-medium">Views:</span> {toolToView.views_count}
              </div>
              <div>
                <span className="font-medium">Favorites:</span> {toolToView.favorites_count}
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Edit Tool Modal */}
      {editModalOpen && toolToEdit && (
        <Modal
          isOpen={editModalOpen}
          onClose={() => {
            setEditModalOpen(false);
            setToolToEdit(null);
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
                value={editFormData.title || ''}
                onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                className="w-full px-3 py-2 bg-[#0f172a] border border-[#334155] rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description <span className="text-rose-500">*</span>
              </label>
              <textarea
                value={editFormData.description || ''}
                onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 bg-[#0f172a] border border-[#334155] rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">URL</label>
              <input
                type="url"
                value={editFormData.url || ''}
                onChange={(e) => setEditFormData({ ...editFormData, url: e.target.value })}
                spellCheck="false"
                autoComplete="off"
                className="w-full px-3 py-2 bg-[#0f172a] border border-[#334155] rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">GitHub URL</label>
              <input
                type="url"
                value={editFormData.github_url || ''}
                onChange={(e) => setEditFormData({ ...editFormData, github_url: e.target.value })}
                spellCheck="false"
                autoComplete="off"
                className="w-full px-3 py-2 bg-[#0f172a] border border-[#334155] rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Documentation URL</label>
              <input
                type="url"
                value={editFormData.documentation_url || ''}
                onChange={(e) => setEditFormData({ ...editFormData, documentation_url: e.target.value })}
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
                value={editFormData.category_id || ''}
                onChange={(e) => setEditFormData({ ...editFormData, category_id: Number(e.target.value) })}
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
                  value={editFormData.tool_type || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, tool_type: e.target.value })}
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
                  value={editFormData.pricing_model || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, pricing_model: e.target.value })}
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
                {tags.map((tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => {
                      if (selectedTags.includes(tag.id)) {
                        setSelectedTags(selectedTags.filter((id) => id !== tag.id));
                      } else {
                        setSelectedTags([...selectedTags, tag.id]);
                      }
                    }}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      selectedTags.includes(tag.id)
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
                value={editFormData.status || 'draft'}
                onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
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
                  setEditModalOpen(false);
                  setToolToEdit(null);
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
    </div>
  );
}
