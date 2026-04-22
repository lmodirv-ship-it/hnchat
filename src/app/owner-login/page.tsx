'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import AppLogo from '@/components/ui/AppLogo';

const OWNER_EMAIL = 'lmodirv@gmail.com';
const COOLDOWN_SECONDS = 52;

export default function OwnerLoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [status, setStatus] = useState<'idle' | 'checking' | 'sending' | 'sent' | 'error'>('checking');
  const [errorMsg, setErrorMsg] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user?.email === OWNER_EMAIL) {
        router.replace('/owner');
      } else {
        setStatus('idle');
      }
    });
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startCooldown = () => {
    setCooldown(COOLDOWN_SECONDS);
    timerRef.current = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const sendMagicLink = async () => {
    if (cooldown > 0) return;
    setStatus('sending');
    setErrorMsg('');
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
      startCooldown();
    } catch (err: any) {
      const msg: string = err.message || '';
      if (msg.toLowerCase().includes('security') || msg.toLowerCase().includes('after')) {
        setErrorMsg('Please wait a moment before requesting another link.');
        startCooldown();
      } else {
        setErrorMsg(msg || 'Failed to send login link');
      }
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
          {status === 'checking' ? (
            <div className="flex flex-col items-center gap-3 py-4">
              <div className="w-8 h-8 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
              <p className="text-sm text-slate-400">Checking session...</p>
            </div>
          ) : status === 'sending' ? (
            <div className="flex flex-col items-center gap-3 py-4">
              <div className="w-8 h-8 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
              <p className="text-sm text-slate-400">Sending secure login link...</p>
            </div>
          ) : status === 'sent' ? (
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto"
                style={{ background: 'rgba(52,211,153,0.15)', border: '1px solid rgba(52,211,153,0.3)' }}>
                <span className="text-2xl">✉️</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Check Your Email</p>
                <p className="text-xs text-slate-500 mt-1">A secure login link has been sent to</p>
                <p className="text-xs font-medium mt-1" style={{ color: '#00d2ff' }}>{OWNER_EMAIL}</p>
              </div>
              <p className="text-xs text-slate-600">
                Click the link in your email to access the owner dashboard. No password required.
              </p>
              <button
                onClick={sendMagicLink}
                disabled={cooldown > 0}
                className="w-full py-2.5 rounded-xl text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: cooldown > 0 ? '#64748b' : '#e2e8f0' }}>
                {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend Link'}
              </button>
            </div>
          ) : status === 'error' ? (
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto"
                style={{ background: 'rgba(248,113,113,0.15)', border: '1px solid rgba(248,113,113,0.3)' }}>
                <span className="text-2xl">⚠️</span>
              </div>
              <p className="text-sm text-red-400">{errorMsg}</p>
              <button
                onClick={sendMagicLink}
                disabled={cooldown > 0}
                className="w-full py-2.5 rounded-xl text-sm font-medium text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: 'linear-gradient(135deg, rgba(0,210,255,0.2), rgba(155,89,255,0.15))', border: '1px solid rgba(0,210,255,0.3)' }}>
                {cooldown > 0 ? `Try Again in ${cooldown}s` : 'Try Again'}
              </button>
            </div>
          ) : (
            /* idle — show send button */
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto"
                style={{ background: 'rgba(0,210,255,0.1)', border: '1px solid rgba(0,210,255,0.25)' }}>
                <span className="text-2xl">🔐</span>
              </div>
              <div>
                <p className="text-sm text-slate-400">Send a secure magic link to</p>
                <p className="text-xs font-medium mt-1" style={{ color: '#00d2ff' }}>{OWNER_EMAIL}</p>
              </div>
              <button
                onClick={sendMagicLink}
                className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95"
                style={{ background: 'linear-gradient(135deg, #00d2ff, #9b59ff)', boxShadow: '0 0 20px rgba(0,210,255,0.3)' }}>
                Send Login Link
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
