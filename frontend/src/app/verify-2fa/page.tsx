'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function Verify2FAPage() {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser, setToken } = useAuth();

  const email = searchParams.get('email');

  useEffect(() => {
    // Redirect to login if no email provided
    if (!email) {
      router.push('/login');
    }
  }, [email, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8201/api';
      const response = await fetch(`${apiUrl}/verify-2fa`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ email, code }),
      });

      const data = await response.json();

      if (response.ok) {
        // Store token and user data
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        // Update context
        setToken(data.token);
        setUser(data.user);

        // Redirect to dashboard
        router.push('/dashboard');
      } else {
        setError(data.errors?.code?.[0] || data.message || 'Invalid verification code');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    setError('');
    setResendMessage('');

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8201/api';
      const response = await fetch(`${apiUrl}/resend-2fa`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setResendMessage('A new verification code has been sent to your email.');
        setCode('');
      } else {
        setError(data.message || 'Failed to resend code');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
      <div className="max-w-md w-full space-y-8 p-8 bg-[#1a1a1a] rounded-lg shadow-lg border border-[#2a2a2a]">
        <div>
          <h2 className="text-center text-3xl font-bold text-white">
            Two-Factor Authentication
          </h2>
          <p className="mt-2 text-center text-sm text-gray-400">
            Enter the 6-digit code sent to
          </p>
          <p className="text-center text-sm font-semibold text-blue-400">
            {email}
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-rose-600/10 border border-rose-500/20 p-4">
              <p className="text-sm text-rose-400">{error}</p>
            </div>
          )}

          {resendMessage && (
            <div className="rounded-md bg-green-600/10 border border-green-500/20 p-4">
              <p className="text-sm text-green-400">{resendMessage}</p>
            </div>
          )}

          <div>
            <label htmlFor="code" className="block text-sm font-medium text-gray-300 mb-2">
              Verification Code
            </label>
            <input
              id="code"
              name="code"
              type="text"
              maxLength={6}
              required
              value={code}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '');
                setCode(value);
              }}
              className="block w-full px-4 py-3 border border-[#333333] bg-[#1a1a1a] rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-500 text-center text-2xl tracking-widest font-mono"
              placeholder="000000"
              autoComplete="off"
              spellCheck="false"
            />
            <p className="mt-2 text-xs text-gray-500 text-center">
              Enter the 6-digit code from your email
            </p>
          </div>

          <div className="flex flex-col space-y-3">
            <button
              type="submit"
              disabled={isLoading || code.length !== 6}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Verifying...' : 'Verify Code'}
            </button>

            <button
              type="button"
              onClick={handleResend}
              disabled={isResending}
              className="w-full flex justify-center py-2 px-4 border border-[#333333] rounded-md shadow-sm text-sm font-medium text-gray-300 bg-transparent hover:bg-[#2a2a2a] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isResending ? 'Sending...' : 'Resend Code'}
            </button>

            <button
              type="button"
              onClick={() => router.push('/login')}
              className="w-full flex justify-center py-2 px-4 text-sm font-medium text-gray-400 hover:text-white transition-colors"
            >
              Back to Login
            </button>
          </div>
        </form>

        <div className="mt-6 text-xs text-gray-500 text-center space-y-2">
          <p>The code will expire in 10 minutes.</p>
          <p>Didn't receive the code? Check your spam folder or click "Resend Code".</p>
        </div>
      </div>
    </div>
  );
}
