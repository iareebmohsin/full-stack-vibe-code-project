'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { login, user } = useAuth();

  useEffect(() => {
    // Redirect if already logged in
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Call API directly to handle 2FA flow
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8201/api';
      const response = await fetch(`${apiUrl}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Check if 2FA is required
        if (data.requires_2fa) {
          // Redirect to 2FA verification page
          router.push(`/verify-2fa?email=${encodeURIComponent(email)}`);
        } else {
          // Old flow (shouldn't happen with 2FA enabled, but kept for compatibility)
          await login(email, password);
          router.push('/dashboard');
        }
      } else {
        setError(data.errors?.email?.[0] || data.message || 'Invalid email or password');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
      <div className="max-w-md w-full space-y-8 p-8 bg-[#1a1a1a] rounded-lg shadow-lg border border-[#2a2a2a]">
        <div>
          <h2 className="text-center text-3xl font-bold text-white">
            AI Tools Platform
          </h2>
          <p className="mt-2 text-center text-sm text-gray-400">
            Sign in to your account
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-rose-600/10 border border-rose-500/20 p-4">
              <p className="text-sm text-rose-400">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                spellCheck="false"
                autoCorrect="off"
                autoCapitalize="off"
                className="mt-1 block w-full px-3 py-2 border border-[#333333] bg-[#1a1a1a] rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-500"
                placeholder="ivan@admin.local"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-[#333333] bg-[#1a1a1a] rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-500"
                placeholder="password"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>

        <div className="mt-4 text-xs text-gray-400 space-y-1 border-t border-[#2a2a2a] pt-4">
          <p className="font-semibold text-gray-300">Demo Accounts:</p>
          <p>Owner: ivan@admin.local / password</p>
          <p>Frontend: elena@frontend.local / password</p>
          <p>Backend: petar@backend.local / password</p>
        </div>
      </div>
    </div>
  );
}
