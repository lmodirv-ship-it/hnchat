'use client';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Toaster } from 'sonner';
import { useRouter, useSearchParams } from 'next/navigation';
import AppLogo from '@/components/ui/AppLogo';
import Icon from '@/components/ui/AppIcon';
import { useAuth } from '@/contexts/AuthContext';
import { trackFunnelStep } from '@/lib/analytics';
import { createClient } from '@/lib/supabase/client';

type LoginForm = { email: string; password: string; remember: boolean };
type SignupForm = { fullName: string; username: string; email: string; password: string; confirmPassword: string; terms: boolean };

const demoAccounts = [
  { role: 'Creator', email: 'sara.nova@hnchat.io', password: 'Creator@2026' },
  { role: 'Shopper', email: 'james.orbit@hnchat.io', password: 'Shop@2026!' },
  { role: 'Admin', email: 'admin@hnchat.io', password: 'HnAdmin#26' },
];

const features = [
  { icon: 'ChatBubbleLeftRightIcon', label: 'Messaging & Communities' },
  { icon: 'PlayCircleIcon', label: 'Short Videos & Live Streams' },
  { icon: 'ShoppingBagIcon', label: 'Marketplace & Payments' },
  { icon: 'MagnifyingGlassIcon', label: 'Smart Search & Discovery' },
  { icon: 'SparklesIcon', label: 'AI-Powered Recommendations' },
];

export default function AuthScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inviteCode = searchParams?.get('invite') || '';
  const { signIn, signUp } = useAuth();
  const supabase = createClient();
  const [tab, setTab] = useState<'login' | 'signup'>('signup');
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const loginForm = useForm<LoginForm>({ defaultValues: { email: '', password: '', remember: false } });
  const signupForm = useForm<SignupForm>({ defaultValues: { fullName: '', username: '', email: '', password: '', confirmPassword: '', terms: false } });

  const handleLogin = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      await signIn(data.email, data.password);
      toast.success('Welcome back to hnChat!');
      router.push('/home-feed');
    } catch (err: any) {
      toast.error(err.message || 'Invalid credentials. Try the demo accounts below.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (data: SignupForm) => {
    if (data.password !== data.confirmPassword) {
      signupForm.setError('confirmPassword', { message: 'Passwords do not match' });
      return;
    }
    setIsLoading(true);
    try {
      await signUp(data.email, data.password, {
        fullName: data.fullName,
        username: data.username,
      });
      trackFunnelStep('signup', { method: 'email' });
      // Send welcome email via Brevo
      fetch('/api/email/welcome', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.email, name: data.fullName }),
      }).catch(() => {});
      toast.success('Welcome to hnChat! 🚀 Check your email for a welcome message.');
      router.push('/onboarding');
    } catch (err: any) {
      toast.error(err.message || 'Failed to create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setGoogleLoading(true);
    try {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${siteUrl}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      toast.error(err.message || 'Google sign-in failed. Please try again.');
      setGoogleLoading(false);
    }
  };

  const autofillCredentials = (email: string, password: string) => {
    loginForm.setValue('email', email);
    loginForm.setValue('password', password);
    setTab('login');
    toast.info('Credentials filled — click Sign In');
  };

  return (
    <>
      <Toaster position="bottom-right" theme="dark" />
      <div className="min-h-screen flex bg-ice-black overflow-hidden">
        {/* Left panel — brand */}
        <div
          className="hidden lg:flex flex-col justify-between w-[52%] p-12 relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #0a0a0f 0%, #0f0f1a 40%, #0d0d1f 100%)',
          }}
        >
          {/* Ambient glow blobs */}
          <div
            className="absolute top-[-80px] left-[-80px] w-96 h-96 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(110,231,247,0.08) 0%, transparent 70%)' }}
          />
          <div
            className="absolute bottom-[-60px] right-[-60px] w-80 h-80 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(167,139,250,0.08) 0%, transparent 70%)' }}
          />
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(110,231,247,0.03) 0%, transparent 60%)' }}
          />

          {/* Logo */}
          <div className="flex items-center gap-3 relative z-10">
            <AppLogo size={44} />
            <span className="font-display font-800 text-2xl gradient-text">hnChat</span>
          </div>

          {/* Hero text */}
          <div className="relative z-10 space-y-6">
            <div>
              <h1 className="text-5xl font-800 leading-tight text-white mb-4">
                Your World.
                <br />
                <span className="gradient-text">One App.</span>
              </h1>
              <p className="text-lg text-slate-400 leading-relaxed max-w-sm">
                Social networking, short videos, live streams, marketplace, and more — unified in one futuristic platform.
              </p>
            </div>

            {/* Feature list */}
            <div className="space-y-3">
              {features.map((f) => (
                <div key={`feat-${f.label}`} className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(110,231,247,0.1)', border: '1px solid rgba(110,231,247,0.2)' }}
                  >
                    <Icon name={f.icon as any} size={16} className="text-cyan-glow" />
                  </div>
                  <span className="text-sm font-500 text-slate-300">{f.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Early access stats */}
          <div className="flex gap-8 relative z-10">
            {[
              { value: 'Early', label: 'Access Open' },
              { value: '🔥', label: 'Growing Fast' },
              { value: '100%', label: 'Free to Join' },
            ].map((s) => (
              <div key={`stat-${s.label}`}>
                <p className="text-2xl font-700 gradient-text tabular-nums">{s.value}</p>
                <p className="text-xs text-slate-500 font-500 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right panel — auth form */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-12 relative">
          <div
            className="w-full max-w-md animate-fade-in"
            style={{
              background: 'rgba(255,255,255,0.03)',
              backdropFilter: 'blur(24px)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 24,
              padding: 32,
            }}
          >
            {/* Mobile logo */}
            <div className="lg:hidden flex items-center gap-2 mb-6">
              <AppLogo size={32} />
              <span className="font-bold text-xl gradient-text">hnChat</span>
            </div>

            {/* Invite banner */}
            {inviteCode && (
              <div
                className="flex items-center gap-3 p-3 rounded-xl mb-5"
                style={{ background: 'rgba(110,231,247,0.08)', border: '1px solid rgba(110,231,247,0.2)' }}
              >
                <span className="text-lg">🎉</span>
                <div>
                  <p className="text-xs font-700 text-cyan-glow">You were invited to hnChat!</p>
                  <p className="text-xs text-slate-400">Join via your friend's invite and unlock early access perks.</p>
                </div>
              </div>
            )}

            {/* Early access badge (mobile / no invite) */}
            {!inviteCode && (
              <div
                className="flex items-center gap-2 px-3 py-2 rounded-xl mb-5"
                style={{ background: 'rgba(110,231,247,0.06)', border: '1px solid rgba(110,231,247,0.15)' }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-glow animate-pulse inline-block flex-shrink-0" />
                <p className="text-xs font-600 text-slate-300">
                  <span className="text-cyan-glow font-700">Early access open</span> — be among the first creators on hnChat
                </p>
              </div>
            )}

            {/* Tabs */}
            <div className="flex rounded-xl p-1 mb-6" style={{ background: 'rgba(255,255,255,0.04)' }}>
              {(['signup', 'login'] as const).map((t) => (
                <button
                  key={`tab-${t}`}
                  onClick={() => setTab(t)}
                  className={`flex-1 py-2.5 text-sm font-600 rounded-lg transition-all duration-200 ${
                    tab === t ? 'text-ice-black' : 'text-slate-400 hover:text-slate-300'
                  }`}
                  style={tab === t ? { background: 'linear-gradient(135deg, #6ee7f7, #a78bfa)' } : {}}
                >
                  {t === 'login' ? 'Sign In' : 'Join hnChat'}
                </button>
              ))}
            </div>

            {/* Google OAuth button */}
            <button
              type="button"
              onClick={handleGoogleAuth}
              disabled={googleLoading}
              className="w-full flex items-center justify-center gap-3 py-3 rounded-xl mb-4 font-600 text-sm transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.12)',
                color: '#e2e8f0',
              }}
            >
              {googleLoading ? (
                <Icon name="ArrowPathIcon" size={18} className="animate-spin text-slate-400" />
              ) : (
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                  <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
                  <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
                  <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
                </svg>
              )}
              {tab === 'signup' ? 'Sign up with Google' : 'Continue with Google'}
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-px bg-white/08" />
              <span className="text-xs text-slate-500">or with email</span>
              <div className="flex-1 h-px bg-white/08" />
            </div>

            {/* Login Form */}
            {tab === 'login' && (
              <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4 animate-fade-in">
                <div>
                  <label className="block text-sm font-500 text-slate-300 mb-1.5">Email Address</label>
                  <input
                    {...loginForm.register('email', {
                      required: 'Email is required',
                      pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email' },
                    })}
                    type="email"
                    placeholder="you@hnchat.io"
                    className="input-glass"
                    autoComplete="email"
                  />
                  {loginForm.formState.errors.email && (
                    <p className="text-xs text-red-400 mt-1">{loginForm.formState.errors.email.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-500 text-slate-300 mb-1.5">Password</label>
                  <div className="relative">
                    <input
                      {...loginForm.register('password', { required: 'Password is required', minLength: { value: 6, message: 'Min 6 characters' } })}
                      type={showPass ? 'text' : 'password'}
                      placeholder="Enter your password"
                      className="input-glass pr-10"
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      <Icon name={showPass ? 'EyeSlashIcon' : 'EyeIcon'} size={16} className="text-slate-500 hover:text-slate-300" />
                    </button>
                  </div>
                  {loginForm.formState.errors.password && (
                    <p className="text-xs text-red-400 mt-1">{loginForm.formState.errors.password.message}</p>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      {...loginForm.register('remember')}
                      type="checkbox"
                      className="w-4 h-4 rounded accent-cyan-glow"
                    />
                    <span className="text-sm text-slate-400">Remember me</span>
                  </label>
                  <button type="button" className="text-sm text-cyan-glow hover:underline">
                    Forgot password?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary w-full flex items-center justify-center gap-2 text-sm font-700"
                  style={{ minHeight: 48 }}
                >
                  {isLoading ? (
                    <Icon name="ArrowPathIcon" size={18} className="animate-spin" />
                  ) : (
                    '🚀 Start Your Journey'
                  )}
                </button>
              </form>
            )}

            {/* Signup Form */}
            {tab === 'signup' && (
              <form onSubmit={signupForm.handleSubmit(handleSignup)} className="space-y-4 animate-fade-in">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-500 text-slate-300 mb-1.5">Full Name</label>
                    <input
                      {...signupForm.register('fullName', { required: 'Required' })}
                      type="text"
                      placeholder="Alex Mercer"
                      className="input-glass"
                    />
                    {signupForm.formState.errors.fullName && (
                      <p className="text-xs text-red-400 mt-1">{signupForm.formState.errors.fullName.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-500 text-slate-300 mb-1.5">Username</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">@</span>
                      <input
                        {...signupForm.register('username', { required: 'Required', minLength: { value: 3, message: 'Min 3 chars' } })}
                        type="text"
                        placeholder="alexm"
                        className="input-glass pl-7"
                      />
                    </div>
                    {signupForm.formState.errors.username && (
                      <p className="text-xs text-red-400 mt-1">{signupForm.formState.errors.username.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-500 text-slate-300 mb-1.5">Email Address</label>
                  <input
                    {...signupForm.register('email', { required: 'Required', pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email' } })}
                    type="email"
                    placeholder="you@hnchat.io"
                    className="input-glass"
                  />
                  {signupForm.formState.errors.email && (
                    <p className="text-xs text-red-400 mt-1">{signupForm.formState.errors.email.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-500 text-slate-300 mb-1.5">Password</label>
                  <div className="relative">
                    <input
                      {...signupForm.register('password', { required: 'Required', minLength: { value: 8, message: 'Min 8 characters' } })}
                      type={showPass ? 'text' : 'password'}
                      placeholder="Create a strong password"
                      className="input-glass pr-10"
                    />
                    <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2">
                      <Icon name={showPass ? 'EyeSlashIcon' : 'EyeIcon'} size={16} className="text-slate-500" />
                    </button>
                  </div>
                  {signupForm.formState.errors.password && (
                    <p className="text-xs text-red-400 mt-1">{signupForm.formState.errors.password.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-500 text-slate-300 mb-1.5">Confirm Password</label>
                  <div className="relative">
                    <input
                      {...signupForm.register('confirmPassword', { required: 'Required' })}
                      type={showConfirmPass ? 'text' : 'password'}
                      placeholder="Re-enter your password"
                      className="input-glass pr-10"
                    />
                    <button type="button" onClick={() => setShowConfirmPass(!showConfirmPass)} className="absolute right-3 top-1/2 -translate-y-1/2">
                      <Icon name={showConfirmPass ? 'EyeSlashIcon' : 'EyeIcon'} size={16} className="text-slate-500" />
                    </button>
                  </div>
                  {signupForm.formState.errors.confirmPassword && (
                    <p className="text-xs text-red-400 mt-1">{signupForm.formState.errors.confirmPassword.message}</p>
                  )}
                </div>

                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    {...signupForm.register('terms', { required: 'You must accept the terms' })}
                    type="checkbox"
                    className="w-4 h-4 mt-0.5 rounded accent-cyan-glow flex-shrink-0"
                  />
                  <span className="text-xs text-slate-400">
                    I agree to hnChat{' '}
                    <button type="button" className="text-cyan-glow hover:underline">Terms of Service</button>
                    {' '}and{' '}
                    <button type="button" className="text-cyan-glow hover:underline">Privacy Policy</button>
                  </span>
                </label>
                {signupForm.formState.errors.terms && (
                  <p className="text-xs text-red-400">{signupForm.formState.errors.terms.message}</p>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary w-full flex items-center justify-center gap-2 text-sm font-700"
                  style={{ minHeight: 48 }}
                >
                  {isLoading ? (
                    <Icon name="ArrowPathIcon" size={18} className="animate-spin" />
                  ) : (
                    '🔥 Join hnChat Now'
                  )}
                </button>

                <p className="text-xs text-slate-500 text-center">
                  Free forever · No credit card · Instant access
                </p>
              </form>
            )}

            {/* Demo credentials */}
            <div
              className="mt-5 rounded-xl p-4 space-y-3"
              style={{ background: 'rgba(110,231,247,0.04)', border: '1px solid rgba(110,231,247,0.12)' }}
            >
              <p className="text-xs font-600 text-cyan-glow uppercase tracking-wider">Demo Accounts</p>
              <div className="space-y-2">
                {demoAccounts.map((acc) => (
                  <div
                    key={`demo-${acc.role}`}
                    className="flex items-center justify-between gap-2 p-2 rounded-lg hover:bg-white/05 transition-all duration-150"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="text-xs font-600 px-2 py-0.5 rounded-full flex-shrink-0"
                        style={{ background: 'rgba(167,139,250,0.15)', color: '#a78bfa' }}
                      >
                        {acc.role}
                      </span>
                      <span className="text-xs text-slate-400 truncate font-mono">{acc.email}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => autofillCredentials(acc.email, acc.password)}
                      className="text-xs font-600 px-3 py-1 rounded-lg flex-shrink-0 transition-all duration-150 hover:opacity-80"
                      style={{ background: 'linear-gradient(135deg, #6ee7f7, #a78bfa)', color: '#0a0a0f' }}
                    >
                      Use
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}