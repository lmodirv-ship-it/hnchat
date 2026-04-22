'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import AppLogo from '@/components/ui/AppLogo';

const OWNER_EMAIL = 'lmodirv@gmail.com';

export default function OwnerLoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'checking' | 'idle' | 'error'>('checking');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user?.email === OWNER_EMAIL) {
        router.replace('/owner');
      } else {
        setStatus('idle');
      }
    });
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim().toLowerCase() === OWNER_EMAIL.toLowerCase()) {
      sessionStorage.setItem('owner_access', 'granted');
      router.replace('/owner');
    } else {
      setErrorMsg('Access denied. This email is not authorized.');
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
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setStatus('idle'); setErrorMsg(''); }}
                  placeholder="Enter your email"
                  required
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
                className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95"
                style={{ background: 'linear-gradient(135deg, #00d2ff, #9b59ff)', boxShadow: '0 0 20px rgba(0,210,255,0.3)' }}>
                Enter Dashboard
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
