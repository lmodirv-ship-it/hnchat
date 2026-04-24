'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AppLogo from '@/components/ui/AppLogo';
import { createClient } from '@/lib/supabase/client';

const OWNER_EMAIL = 'lmodirv@gmail.com';

export default function OwnerLoginClient() {
  const router = useRouter();
  const supabase = createClient();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<'checking' | 'idle' | 'loading' | 'error'>('checking');
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
    if (!password.trim()) {
      setErrorMsg('Please enter your password.');
      setStatus('error');
      return;
    }
    setStatus('loading');
    setErrorMsg('');
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: OWNER_EMAIL,
        password: password.trim(),
      });
      if (error) {
        setErrorMsg(error.message || 'Invalid password. Please try again.');
        setStatus('error');
        return;
      }
      if (data.session) {
        router.replace('/owner');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Login failed. Please try again.');
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
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">Owner Email</label>
                <div className="w-full px-4 py-3 rounded-xl text-sm text-slate-400"
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.06)',
                  }}>
                  {OWNER_EMAIL}
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setStatus('idle'); setErrorMsg(''); }}
                    placeholder="Enter your password"
                    required
                    autoComplete="current-password"
                    className="w-full px-4 py-3 pr-11 rounded-xl text-sm text-white placeholder-slate-600 outline-none focus:ring-1 focus:ring-cyan-500 transition-all"
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                    {showPassword ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 4.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
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
                {status === 'loading' ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
