'use client';
import React, { useState } from 'react';
import AppLogo from '@/components/ui/AppLogo';

const OWNER_EMAIL = 'lmodirv@gmail.com';

export default function OwnerLoginClient() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'sent' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');
    try {
      const res = await fetch('/api/owner-login', { method: 'POST' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to send login link');
      setStatus('sent');
    } catch (err: any) {
      setErrorMsg(err.message || 'حدث خطأ، حاول مجدداً');
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

          {status === 'sent' ? (
            <div className="space-y-4">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto"
                style={{ background: 'rgba(52,211,153,0.15)', border: '1px solid rgba(52,211,153,0.3)' }}>
                <span className="text-3xl">✉️</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-white">تم إرسال رابط الدخول</p>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  تحقق من بريدك الإلكتروني<br />
                  <span style={{ color: '#00d2ff' }}>{OWNER_EMAIL}</span><br />
                  وانقر على الرابط للدخول
                </p>
              </div>
              <button
                onClick={() => setStatus('idle')}
                className="text-xs text-slate-500 hover:text-slate-300 transition-colors underline">
                إعادة الإرسال
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">Owner Email</label>
                <div className="w-full px-4 py-3 rounded-xl text-sm text-slate-300"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}>
                  {OWNER_EMAIL}
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
                {status === 'loading' ? 'جاري الإرسال...' : 'إرسال رابط الدخول'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
