'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';

export interface NavItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
  roles?: string[]; // If specified, only show for these roles
}

export interface NavigationProps {
  items: NavItem[];
  logoText?: string;
  logoHref?: string;
}

/**
 * Navigation Component
 *
 * A responsive navigation header with role-based visibility.
 * Includes mobile hamburger menu, logout functionality, current time, and user ID.
 *
 * @example
 * <Navigation
 *   logoText="AI Tools"
 *   logoHref="/"
 *   items={[
 *     { label: 'Dashboard', href: '/dashboard' },
 *     { label: 'Tools', href: '/tools' },
 *     { label: 'Admin', href: '/admin', roles: ['owner'] }
 *   ]}
 * />
 */
export const Navigation: React.FC<NavigationProps> = ({
  items,
  logoText = 'AI Tools Platform',
  logoHref = '/',
}) => {
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState('');

  // Update time every second
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      }));
    };

    updateTime(); // Initial call
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, []);

  // Filter items based on user role
  const visibleItems = items.filter((item) => {
    if (!item.roles || item.roles.length === 0) return true;
    return user && item.roles.includes(user.role);
  });

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="bg-[#1a1a1a] border-b border-[#2a2a2a] shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo with Image */}
          <div className="flex items-center gap-3">
            <Link
              href={logoHref}
              className="flex items-center gap-3 group"
            >
              <div className="relative w-12 h-12 transition-transform duration-300 group-hover:scale-110">
                <Image
                  src="/logo.svg"
                  alt="AI Tools Logo"
                  width={48}
                  height={48}
                  className="w-full h-full object-contain"
                  style={{ filter: 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.3))' }}
                />
              </div>
              <span className="text-xl font-bold text-blue-400 group-hover:text-blue-300 transition-colors hidden sm:block">
                {logoText}
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex lg:items-center lg:space-x-2">
            {/* Navigation Items with Better Styling */}
            {visibleItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-gradient-to-r hover:from-blue-600/20 hover:to-blue-500/10 rounded-lg transition-all duration-200 border border-transparent hover:border-blue-500/30 whitespace-nowrap"
              >
                {item.icon && <span className="text-lg">{item.icon}</span>}
                {item.label}
              </Link>
            ))}

            {/* Time and User Info Section */}
            {user && (
              <div className="flex items-center gap-3 ml-4 pl-4 border-l-2 border-[#2a2a2a]">
                {/* Current Time */}
                <div className="flex items-center gap-2 px-3 py-2 bg-blue-600/10 border border-blue-500/20 rounded-lg">
                  <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm font-mono text-blue-300">{currentTime}</span>
                </div>

                {/* User Info Card */}
                <div className="flex items-center gap-3 px-3 py-2 bg-gradient-to-r from-purple-600/10 to-blue-600/10 border border-purple-500/20 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="text-sm">
                      <p className="font-semibold text-white leading-tight">{user.name}</p>
                      <p className="text-xs text-gray-400 leading-tight">
                        ID: <span className="font-mono text-blue-400">{user.id}</span> • <span className="capitalize">{user.role}</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-300 hover:text-rose-400 hover:bg-rose-600/20 border border-transparent hover:border-rose-500/30 rounded-lg transition-all duration-200"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Logout
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu button and time */}
          <div className="lg:hidden flex items-center gap-3">
            {/* Time display for mobile */}
            <div className="hidden sm:flex items-center gap-2 px-2 py-1 bg-blue-600/10 border border-blue-500/20 rounded-lg">
              <svg className="w-3 h-3 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-xs font-mono text-blue-300">{currentTime}</span>
            </div>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-lg text-gray-300 hover:text-white hover:bg-blue-600/20 border border-transparent hover:border-blue-500/30 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 transition-all duration-200"
              aria-expanded={isMobileMenuOpen}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-[#2a2a2a] bg-[#1a1a1a]">
          <div className="px-3 pt-3 pb-3 space-y-2">
            {visibleItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-base font-medium text-gray-300 hover:text-white hover:bg-gradient-to-r hover:from-blue-600/20 hover:to-blue-500/10 rounded-lg transition-all duration-200 border border-transparent hover:border-blue-500/30 whitespace-nowrap"
              >
                {item.icon && <span className="text-xl">{item.icon}</span>}
                {item.label}
              </Link>
            ))}
          </div>

          {/* Mobile user menu */}
          {user && (
            <div className="pt-3 pb-4 border-t-2 border-[#2a2a2a] px-3">
              {/* User Info Card for Mobile */}
              <div className="mb-3 p-4 bg-gradient-to-r from-purple-600/10 to-blue-600/10 border border-purple-500/20 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-base font-semibold text-white">{user.name}</p>
                    <p className="text-sm text-gray-400">
                      <span className="capitalize">{user.role}</span>
                    </p>
                  </div>
                </div>
                <div className="text-xs text-gray-400 border-t border-[#2a2a2a] pt-2 mt-2">
                  User ID: <span className="font-mono text-blue-400">{user.id}</span>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="flex items-center justify-center gap-2 w-full px-4 py-3 text-base font-medium text-rose-400 hover:text-white hover:bg-rose-600/20 border border-transparent hover:border-rose-500/30 rounded-lg transition-all duration-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};
