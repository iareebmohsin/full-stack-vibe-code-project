'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth, User } from '@/contexts/AuthContext';
import { Icon, LogoMark } from '@/components/Icon';
import { Input } from '@/components/ui';
import { api, errorMessage } from '@/lib/api';

const DEMO = [
  { label: 'Owner', email: 'areebmhsn@gmail.com' },
  { label: 'Frontend', email: 'maya@loadout.test' },
  { label: 'Backend', email: 'omar@loadout.test' },
];

export default function LoginPage() {
  const router = useRouter();
  const { user, completeLogin } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (user) router.replace('/dashboard');
  }, [user, router]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const res = await api<{ requires_2fa?: boolean; user?: User; token?: string }>('/login', { method: 'POST', token: null, body: { email, password } });
      if (res.ok && res.data.requires_2fa) {
        router.push(`/verify-2fa?email=${encodeURIComponent(email)}`);
      } else if (res.ok && res.data.token && res.data.user) {
        // Code step switched off on the server: go straight in
        completeLogin(res.data.user, res.data.token);
        router.replace('/dashboard');
      } else if (res.ok) {
        setError('Unexpected response from the server.');
      } else {
        setError(errorMessage(res.data, 'That email and password did not match.'));
      }
    } catch {
      setError('Cannot reach the server. Check that the API is running.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid min-h-screen bg-sage lg:grid-cols-[1fr_1.05fr]">
      {/* Brand panel */}
      <aside className="relative hidden overflow-hidden bg-forest p-12 text-paper lg:flex lg:flex-col">
        <div className="absolute inset-0 dot-grid-light" />
        <Link href="/" className="relative flex items-center gap-2.5">
          <LogoMark size={30} light />
          <span className="font-display text-xl font-extrabold tracking-[-0.03em]">Loadout</span>
        </Link>
        <div className="relative mt-auto max-w-md">
          <h2 className="font-display text-[44px] font-extrabold leading-[1.02] tracking-[-0.04em]">
            One shelf for every AI tool your team trusts.
          </h2>
          <p className="mt-4 text-[16px] leading-relaxed text-paper/70">
            Sign in with your work email. We send a six-digit code as a second step, so a leaked password alone is not enough.
          </p>
          <div className="mt-10 flex items-center gap-3">
            {['#cfe3c4', '#f6ecc4', '#d7e6f3', '#f5d7d3'].map((c, i) => (
              <span key={c} className="h-3 rounded-full" style={{ background: c, width: 56 - i * 10 }} />
            ))}
          </div>
        </div>
      </aside>

      {/* Form */}
      <main className="flex items-center justify-center px-5 py-12">
        <div className="rise w-full max-w-[420px]">
          <Link href="/" className="mb-10 flex items-center gap-2.5 lg:hidden">
            <LogoMark size={26} />
            <span className="font-display text-lg font-extrabold tracking-[-0.03em]">Loadout</span>
          </Link>

          <p className="font-mono text-[11.5px] uppercase tracking-[0.18em] text-ember">Team sign in</p>
          <h1 className="mt-2 font-display text-[38px] font-extrabold leading-tight tracking-[-0.04em]">Welcome back</h1>
          <p className="mt-2 text-[15px] text-ink-soft">Use your team account to open your kit.</p>

          <form onSubmit={submit} className="mt-8 space-y-4">
            {error && (
              <div role="alert" className="flex items-start gap-2.5 rounded-2xl border border-[#e8b4ad] bg-rosy/60 px-4 py-3 text-sm text-[#8a2a20]">
                <Icon name="close" size={16} className="mt-0.5 shrink-0" />
                {error}
              </div>
            )}
            <Input
              label="Work email"
              type="email"
              autoComplete="email"
              spellCheck={false}
              autoCapitalize="off"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
            />
            <Input
              label="Password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your password"
            />
            <button
              type="submit"
              disabled={busy}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-ink text-[15px] font-semibold text-paper transition-colors hover:bg-forest disabled:opacity-50"
            >
              {busy ? 'Checking' : 'Continue'}
              {!busy && <Icon name="arrowRight" size={16} />}
            </button>
          </form>

          <div className="mt-8 rounded-2xl border border-dashed border-line bg-paper/60 p-4">
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-mute">Demo seats · tap to fill</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {DEMO.map((d) => (
                <button
                  key={d.email}
                  type="button"
                  onClick={() => {
                    setEmail(d.email);
                    setPassword('password');
                  }}
                  className="rounded-full border border-line bg-white px-3 py-1.5 text-left text-[12.5px] transition-colors hover:border-ink/40"
                >
                  <b className="font-semibold text-ink">{d.label}</b> <span className="text-mute">{d.email}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
