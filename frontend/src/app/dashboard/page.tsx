'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardBody, Button, Badge, Navigation } from '@/components/ui';

interface DashboardCard {
  title: string;
  description: string;
  icon: string;
  href?: string;
  badge?: string;
  badgeVariant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
}

interface Activity {
  type: string;
  icon: string;
  title: string;
  description: string;
  time: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoading, token } = useAuth();
  const [stats, setStats] = useState({
    tools_shared: 0,
    total_views: 0,
    total_favorites: 0,
    rank: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [activitiesLoading, setActivitiesLoading] = useState(true);

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  // Fetch user statistics
  useEffect(() => {
    const fetchStats = async () => {
      if (!token || !user) return;

      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8201/api';
        const response = await fetch(`${apiUrl}/user/stats`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setStats(data.data);
          }
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setStatsLoading(false);
      }
    };

    fetchStats();
  }, [token, user]);

  // Fetch user activities
  useEffect(() => {
    const fetchActivities = async () => {
      if (!token || !user) return;

      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8201/api';
        const response = await fetch(`${apiUrl}/user/activities`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setActivities(data.data);
          }
        }
      } catch (error) {
        console.error('Error fetching activities:', error);
      } finally {
        setActivitiesLoading(false);
      }
    };

    fetchActivities();
  }, [token, user]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Role-based menu items
  const getRoleMenuItems = (): DashboardCard[] => {
    switch (user.role) {
      case 'owner':
        return [
          {
            title: 'User Management',
            description: 'Manage users, roles, and permissions across the platform',
            icon: '👥',
            href: '/admin/users',
            badge: 'Admin',
            badgeVariant: 'danger',
          },
          {
            title: 'All AI Tools',
            description: 'Browse, manage, and moderate all tools in the catalog',
            icon: '🤖',
            href: '/tools',
            badge: 'Featured',
            badgeVariant: 'primary',
          },
          {
            title: 'Analytics Dashboard',
            description: 'View platform statistics, usage metrics, and insights',
            icon: '📊',
            href: '/admin/analytics',
          },
          {
            title: 'Platform Settings',
            description: 'Configure platform settings and preferences',
            icon: '⚙️',
            href: '/admin/settings',
          },
          {
            title: 'Categories & Tags',
            description: 'Manage tool categories and tag taxonomy',
            icon: '🏷️',
            href: '/admin/categories',
          },
          {
            title: 'Content Moderation',
            description: 'Review and approve submitted tools',
            icon: '✅',
            href: '/admin/moderation',
            badge: 'New',
            badgeVariant: 'success',
          },
        ];
      case 'frontend':
        return [
          {
            title: 'Frontend Tools',
            description: 'Discover AI tools for frontend development',
            icon: '🎨',
            href: '/tools?role=frontend',
          },
          {
            title: 'UI Libraries',
            description: 'Component libraries and design systems',
            icon: '📦',
            href: '/tools?category=ui-libraries',
          },
          {
            title: 'Design Resources',
            description: 'Design tools, assets, and inspiration',
            icon: '🎯',
            href: '/tools?category=design',
          },
          {
            title: 'My Contributions',
            description: 'Tools and resources you have shared',
            icon: '⭐',
            href: '/dashboard/my-tools',
          },
        ];
      case 'backend':
        return [
          {
            title: 'Backend Tools',
            description: 'AI tools for backend development',
            icon: '⚡',
            href: '/tools?role=backend',
          },
          {
            title: 'API Resources',
            description: 'API tools, SDKs, and services',
            icon: '🔌',
            href: '/tools?category=api',
          },
          {
            title: 'Database Tools',
            description: 'Database management and optimization',
            icon: '🗄️',
            href: '/tools?category=database',
          },
          {
            title: 'My Contributions',
            description: 'Tools and resources you have shared',
            icon: '⭐',
            href: '/dashboard/my-tools',
          },
        ];
      case 'designer':
        return [
          {
            title: 'Design Tools',
            description: 'AI-powered design and creative tools',
            icon: '🎨',
            href: '/tools?role=designer',
          },
          {
            title: 'UI/UX Resources',
            description: 'User experience and interface design tools',
            icon: '✨',
            href: '/tools?category=design',
          },
          {
            title: 'Prototyping Tools',
            description: 'Rapid prototyping and wireframing',
            icon: '🖼️',
            href: '/tools?tag=prototyping',
          },
          {
            title: 'My Contributions',
            description: 'Tools and resources you have shared',
            icon: '⭐',
            href: '/dashboard/my-tools',
          },
        ];
      default:
        return [
          {
            title: 'Browse All Tools',
            description: 'Explore the complete AI tools catalog',
            icon: '🔍',
            href: '/tools',
          },
          {
            title: 'Popular Tools',
            description: 'Most viewed and favorited tools',
            icon: '🔥',
            href: '/tools?sort=popular',
          },
          {
            title: 'My Contributions',
            description: 'Tools and resources you have shared',
            icon: '⭐',
            href: '/dashboard/my-tools',
          },
          {
            title: 'My Profile',
            description: 'View and edit your profile',
            icon: '👤',
            href: '/profile',
          },
        ];
    }
  };

  const menuItems = getRoleMenuItems();

  // Navigation items with icons
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

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Navigation */}
      <Navigation items={navItems} logoText="AI Tools Platform" logoHref="/dashboard" />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="mb-8 animate-[fadeIn_0.5s_ease-out]">
          <Card padding="lg" className="bg-gradient-to-r from-blue-600/10 to-purple-600/10 border-blue-500/20">
            <CardBody>
              <div className="flex items-start justify-between flex-wrap gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">
                    Welcome back, {user.name}! 👋
                  </h1>
                  <p className="text-lg text-gray-300 mb-3">
                    Ready to discover and share amazing AI tools?
                  </p>
                  <div className="flex items-center gap-2">
                    <Badge variant="primary" size="md">
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </Badge>
                    <span className="text-sm text-gray-500">•</span>
                    <span className="text-sm text-gray-400">{user.email}</span>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="primary"
                    size="md"
                    onClick={() => router.push('/tools/add')}
                  >
                    + Add New Tool
                  </Button>
                  <Button
                    variant="outline"
                    size="md"
                    onClick={() => router.push('/tools')}
                  >
                    Browse Tools
                  </Button>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* User Information Section */}
        <div className="mb-8 animate-[fadeIn_0.6s_ease-out_0.1s_both]">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Account Information
          </h2>
          <Card padding="lg" className="bg-[#1a1a1a] border-[#2a2a2a]">
            <CardBody>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* User ID */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-400 mb-1">User ID</p>
                    <p className="text-lg font-mono font-semibold text-white truncate">#{user.id}</p>
                  </div>
                </div>

                {/* Full Name */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-purple-600/20 border border-purple-500/30 flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-400 mb-1">Full Name</p>
                    <p className="text-lg font-semibold text-white truncate">{user.name}</p>
                  </div>
                </div>

                {/* Email Address */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-400 mb-1">Email Address</p>
                    <p className="text-lg font-semibold text-white truncate">{user.email}</p>
                  </div>
                </div>

                {/* Role */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-amber-600/20 border border-amber-500/30 flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-400 mb-1">Account Role</p>
                    <p className="text-lg font-semibold text-white capitalize truncate">{user.role}</p>
                  </div>
                </div>

                {/* Account Status */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-green-600/20 border border-green-500/30 flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-400 mb-1">Status</p>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                      <p className="text-lg font-semibold text-green-400">Active</p>
                    </div>
                  </div>
                </div>

                {/* Member Since */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-rose-600/20 border border-rose-500/30 flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-400 mb-1">Member Since</p>
                    <p className="text-lg font-semibold text-white">{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}</p>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Dashboard Cards */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">
            Your Dashboard
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {menuItems.map((item, index) => (
              <Card
                key={index}
                padding="lg"
                className="group relative overflow-hidden transition-all duration-500 animate-[scaleIn_0.3s_ease-out] bg-[#1a1a1a] border-[#2a2a2a] hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-500/20"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Shine effect overlay */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                </div>

                <CardBody className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-5xl transition-all duration-500 group-hover:brightness-150 group-hover:drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]">
                      {item.icon}
                    </div>
                    {item.badge && (
                      <Badge variant={item.badgeVariant || 'default'} size="sm">
                        {item.badge}
                      </Badge>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2 transition-all duration-300 group-hover:text-blue-400">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors duration-300">
                    {item.description}
                  </p>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">
            Quick Stats
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card padding="md" className="bg-[#1a1a1a] border-[#2a2a2a]">
              <CardBody>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Tools Shared</p>
                    {statsLoading ? (
                      <div className="h-9 w-16 bg-gray-700 animate-pulse rounded"></div>
                    ) : (
                      <p className="text-3xl font-bold text-blue-400">{stats.tools_shared}</p>
                    )}
                  </div>
                  <div className="text-4xl">📝</div>
                </div>
              </CardBody>
            </Card>

            <Card padding="md" className="bg-[#1a1a1a] border-[#2a2a2a]">
              <CardBody>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Total Views</p>
                    {statsLoading ? (
                      <div className="h-9 w-16 bg-gray-700 animate-pulse rounded"></div>
                    ) : (
                      <p className="text-3xl font-bold text-emerald-400">
                        {stats.total_views >= 1000
                          ? `${(stats.total_views / 1000).toFixed(1)}k`
                          : stats.total_views}
                      </p>
                    )}
                  </div>
                  <div className="text-4xl">👀</div>
                </div>
              </CardBody>
            </Card>

            <Card padding="md" className="bg-[#1a1a1a] border-[#2a2a2a]">
              <CardBody>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Favorites</p>
                    {statsLoading ? (
                      <div className="h-9 w-16 bg-gray-700 animate-pulse rounded"></div>
                    ) : (
                      <p className="text-3xl font-bold text-rose-400">{stats.total_favorites}</p>
                    )}
                  </div>
                  <div className="text-4xl">❤️</div>
                </div>
              </CardBody>
            </Card>

            <Card padding="md" className="bg-[#1a1a1a] border-[#2a2a2a]">
              <CardBody>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Rank</p>
                    {statsLoading ? (
                      <div className="h-9 w-16 bg-gray-700 animate-pulse rounded"></div>
                    ) : (
                      <p className="text-3xl font-bold text-amber-400">#{stats.rank}</p>
                    )}
                  </div>
                  <div className="text-4xl">🏆</div>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-6">
            Recent Activity
          </h2>
          <Card padding="none" className="bg-[#1a1a1a] border-[#2a2a2a]">
            <CardBody>
              {activitiesLoading ? (
                <div className="divide-y divide-[#2a2a2a]">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="w-8 h-8 bg-gray-700 animate-pulse rounded"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 w-32 bg-gray-700 animate-pulse rounded"></div>
                          <div className="h-3 w-64 bg-gray-700 animate-pulse rounded"></div>
                          <div className="h-3 w-20 bg-gray-700 animate-pulse rounded"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : activities.length > 0 ? (
                <div className="divide-y divide-[#2a2a2a]">
                  {activities.map((activity, index) => (
                    <ActivityItem
                      key={index}
                      icon={activity.icon}
                      title={activity.title}
                      description={activity.description}
                      time={activity.time}
                    />
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <div className="text-5xl mb-4">📭</div>
                  <p className="text-gray-400 text-lg">No recent activity</p>
                  <p className="text-gray-500 text-sm mt-2">
                    Start sharing tools to see your activity here
                  </p>
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </main>
    </div>
  );
}

// Activity Item Component
function ActivityItem({
  icon,
  title,
  description,
  time,
}: {
  icon: string;
  title: string;
  description: string;
  time: string;
}) {
  return (
    <div className="p-4 hover:bg-[#222222] transition-colors">
      <div className="flex items-start gap-4">
        <div className="text-2xl mt-1">{icon}</div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white">{title}</p>
          <p className="text-sm text-gray-400 mt-0.5">{description}</p>
          <p className="text-xs text-gray-500 mt-1">{time}</p>
        </div>
      </div>
    </div>
  );
}
