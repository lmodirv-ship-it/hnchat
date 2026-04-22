'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AppLogo from '@/components/ui/AppLogo';
import { createClient } from '@/lib/supabase/client';

const OWNER_EMAIL = 'lmodirv@gmail.com';

export default function OwnerLoginClient() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'checking' | 'idle' | 'loading' | 'error' | 'sent'>('checking');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user?.email === OWNER_EMAIL) {
          router.replace('/owner');
          return;
        }
      } catch {
        // ignore
      }
      setStatus('idle');
    };
    checkSession();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim().toLowerCase() !== OWNER_EMAIL.toLowerCase()) {
      setErrorMsg('Access denied. This email is not authorized.');
      setStatus('error');
      return;
    }
    setStatus('loading');
    setErrorMsg('');
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/owner`,
        },
      });
      if (error) {
        setErrorMsg(error.message || 'Failed to send login link.');
        setStatus('error');
        return;
      }
      setStatus('sent');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to send login link.');
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#050508' }}>
      {/* Ambient orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full opacity-[0.05]"
          style={{ background: 'radial-gradient(circle, #00d2ff 0%, transparent 70%)' }} />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full opacity-[0.05]"
          style={{ background: 'radial-gradient(circle, #9b59ff 0%, transparent 70%)' }} />
      </div>

      <div className="relative z-10 w-full max-w-sm mx-4">
        <div className="rounded-2xl p-8 text-center space-y-6"
          style={{
            background: 'rgba(10,10,18,0.95)',
            border: '1px solid rgba(255,255,255,0.08)',
            backdropFilter: 'blur(32px)',
            boxShadow: '0 0 60px rgba(0,210,255,0.06)',
          }}>
          {/* Logo */}
          <div className="flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #00d2ff, #9b59ff)', boxShadow: '0 0 30px rgba(0,210,255,0.4)' }}>
              <AppLogo size={32} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Owner Access</h1>
              <p className="text-xs text-slate-500 mt-1">hnChat Site Owner Portal</p>
            </div>
          </div>

          {status === 'checking' ? (
            <div className="flex flex-col items-center gap-3 py-4">
              <div className="w-8 h-8 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
              <p className="text-sm text-slate-400">Checking session...</p>
            </div>
          ) : status === 'sent' ? (
            <div className="flex flex-col items-center gap-3 py-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(0,210,255,0.1)', border: '1px solid rgba(0,210,255,0.3)' }}>
                <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-sm text-white font-medium">Check your email</p>
              <p className="text-xs text-slate-400 text-center">A login link has been sent to <span className="text-cyan-400">{email}</span>. Click the link to access the dashboard.</p>
              <button
                onClick={() => setStatus('idle')}
                className="text-xs text-slate-500 hover:text-slate-300 transition-colors mt-2">
                Send again
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">Owner Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setStatus('idle'); setErrorMsg(''); }}
                  placeholder="Enter owner email"
                  required
                  autoComplete="username"
                  className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-slate-600 outline-none focus:ring-1 focus:ring-cyan-500 transition-all"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                />
              </div>

              {status === 'error' && (
                <p className="text-xs text-red-400 text-center">{errorMsg}</p>
              )}

              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg, #00d2ff, #9b59ff)', boxShadow: '0 0 20px rgba(0,210,255,0.3)' }}>
                {status === 'loading' && (
                  <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                )}
                {status === 'loading' ? 'Sending...' : 'Send Login Link'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
