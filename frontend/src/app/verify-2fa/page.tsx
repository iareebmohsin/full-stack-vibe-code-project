'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth, User } from '@/contexts/AuthContext';
import { Icon, LogoMark } from '@/components/Icon';
import { api, errorMessage } from '@/lib/api';

const LEN = 6;

function VerifyInner() {
  const router = useRouter();
  const params = useSearchParams();
  const email = params.get('email');
  const { completeLogin } = useAuth();

  const [digits, setDigits] = useState<string[]>(Array(LEN).fill(''));
  const [error, setError] = useState('');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [resending, setResending] = useState(false);
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!email) router.replace('/login');
    else refs.current[0]?.focus();
  }, [email, router]);

  const code = digits.join('');

  const setAt = (i: number, v: string) => {
    const clean = v.replace(/\D/g, '');
    if (clean.length > 1) {
      // Pasted a whole code
      const next = clean.slice(0, LEN).split('');
      setDigits([...next, ...Array(LEN - next.length).fill('')]);
      refs.current[Math.min(next.length, LEN - 1)]?.focus();
      return;
    }
    const next = [...digits];
    next[i] = clean;
    setDigits(next);
    if (clean && i < LEN - 1) refs.current[i + 1]?.focus();
  };

  const onKey = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) refs.current[i - 1]?.focus();
    if (e.key === 'ArrowLeft' && i > 0) refs.current[i - 1]?.focus();
    if (e.key === 'ArrowRight' && i < LEN - 1) refs.current[i + 1]?.focus();
  };

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (code.length !== LEN) return;
    setError('');
    setNote('');
    setBusy(true);
    try {
      const res = await api<{ user: User; token: string }>('/verify-2fa', { method: 'POST', token: null, body: { email, code } });
      if (res.ok && res.data.token) {
        completeLogin(res.data.user, res.data.token);
        router.replace('/dashboard');
      } else {
        setError(errorMessage(res.data, 'That code did not work. Check it and try again.'));
      }
    } catch {
      setError('Cannot reach the server. Check that the API is running.');
    } finally {
      setBusy(false);
    }
  };

  const resend = async () => {
    setResending(true);
    setError('');
    setNote('');
    try {
      const res = await api('/resend-2fa', { method: 'POST', token: null, body: { email } });
      if (res.ok) {
        setNote('A fresh code is on its way. The old one no longer works.');
        setDigits(Array(LEN).fill(''));
        refs.current[0]?.focus();
      } else setError(errorMessage(res.data, 'Could not send a new code.'));
    } catch {
      setError('Cannot reach the server.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-sage px-5 py-12">
      <div className="rise w-full max-w-[460px] rounded-[32px] border border-line bg-paper p-8 sm:p-10">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <LogoMark size={24} />
            <span className="font-display text-base font-extrabold tracking-[-0.03em]">Loadout</span>
          </Link>
          <span className="font-mono text-[11.5px] uppercase tracking-[0.18em] text-ember">Step 2 of 2</span>
        </div>

        <div className="mt-8 grid h-14 w-14 place-items-center rounded-2xl bg-ember-soft text-[#c23f0d]">
          <Icon name="mail" size={26} />
        </div>
        <h1 className="mt-5 font-display text-[32px] font-extrabold leading-tight tracking-[-0.04em]">Check your inbox</h1>
        <p className="mt-2 text-[15px] text-ink-soft">
          We sent a six-digit code to <b className="font-semibold text-ink">{email}</b>. It expires in ten minutes.
        </p>

        <form onSubmit={submit} className="mt-7">
          <div className="flex justify-between gap-2" onPaste={(e) => setAt(0, e.clipboardData.getData('text'))}>
            {digits.map((d, i) => (
              <input
                key={i}
                ref={(el) => {
                  refs.current[i] = el;
                }}
                inputMode="numeric"
                autoComplete={i === 0 ? 'one-time-code' : 'off'}
                aria-label={`Digit ${i + 1}`}
                value={d}
                maxLength={LEN}
                onChange={(e) => setAt(i, e.target.value)}
                onKeyDown={(e) => onKey(i, e)}
                className={`h-16 w-full min-w-0 rounded-2xl border bg-white text-center font-mono text-2xl font-medium text-ink transition-colors focus:outline-none focus:ring-4 focus:ring-ember/15 ${
                  d ? 'border-ink' : 'border-line'
                } focus:border-ink`}
              />
            ))}
          </div>

          {error && <p role="alert" className="mt-4 rounded-xl bg-rosy/60 px-3.5 py-2.5 text-sm text-[#8a2a20]">{error}</p>}
          {note && <p className="mt-4 rounded-xl bg-moss/70 px-3.5 py-2.5 text-sm text-forest">{note}</p>}

          <button
            type="submit"
            disabled={busy || code.length !== LEN}
            className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-ink text-[15px] font-semibold text-paper transition-colors hover:bg-forest disabled:opacity-40"
          >
            {busy ? 'Verifying' : 'Open my kit'}
            {!busy && <Icon name="arrowRight" size={16} />}
          </button>
        </form>

        <div className="mt-6 flex items-center justify-between text-[13.5px]">
          <button onClick={() => router.push('/login')} className="flex items-center gap-1.5 font-semibold text-ink-soft hover:text-ink">
            <Icon name="arrowLeft" size={15} /> Different account
          </button>
          <button onClick={resend} disabled={resending} className="font-semibold text-[#c23f0d] hover:underline disabled:opacity-50">
            {resending ? 'Sending' : 'Send a new code'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-sage" />}>
      <VerifyInner />
    </Suspense>
  );
}
