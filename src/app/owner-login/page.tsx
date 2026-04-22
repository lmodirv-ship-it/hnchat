'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import AppLogo from '@/components/ui/AppLogo';

const OWNER_EMAIL = 'lmodirv@gmail.com';

export default function OwnerLoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [status, setStatus] = useState<'checking' | 'sending' | 'sent' | 'error'>('checking');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    // Check if already logged in as owner
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user?.email === OWNER_EMAIL) {
        router.replace('/owner');
      } else {
        sendMagicLink();
      }
    });
  }, []);

  const sendMagicLink = async () => {
    setStatus('sending');
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: OWNER_EMAIL,
        options: {
          shouldCreateUser: true,
          emailRedirectTo: `${window.location.origin}/owner`,
        },
      });
      if (error) throw error;
      setStatus('sent');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to send login link');
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

          {/* Status */}
          {status === 'checking' || status === 'sending' ? (
            <div className="flex flex-col items-center gap-3 py-4">
              <div className="w-8 h-8 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
              <p className="text-sm text-slate-400">
                {status === 'checking' ? 'Checking session...' : 'Sending secure login link...'}
              </p>
            </div>
          ) : status === 'sent' ? (
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto"
                style={{ background: 'rgba(52,211,153,0.15)', border: '1px solid rgba(52,211,153,0.3)' }}>
                <span className="text-2xl">✉️</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Check Your Email</p>
                <p className="text-xs text-slate-500 mt-1">
                  A secure login link has been sent to
                </p>
                <p className="text-xs font-medium mt-1" style={{ color: '#00d2ff' }}>
                  {OWNER_EMAIL}
                </p>
              </div>
              <p className="text-xs text-slate-600">
                Click the link in your email to access the owner dashboard. No password required.
              </p>
              <button
                onClick={sendMagicLink}
                className="w-full py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white transition-all"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                Resend Link
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto"
                style={{ background: 'rgba(248,113,113,0.15)', border: '1px solid rgba(248,113,113,0.3)' }}>
                <span className="text-2xl">⚠️</span>
              </div>
              <p className="text-sm text-red-400">{errorMsg}</p>
              <button
                onClick={sendMagicLink}
                className="w-full py-2.5 rounded-xl text-sm font-medium text-white transition-all"
                style={{ background: 'linear-gradient(135deg, rgba(0,210,255,0.2), rgba(155,89,255,0.15))', border: '1px solid rgba(0,210,255,0.3)' }}>
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
