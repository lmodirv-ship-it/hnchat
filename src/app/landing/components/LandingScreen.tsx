'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import AppLogo from '@/components/ui/AppLogo';
import Icon from '@/components/ui/AppIcon';

const features = [
  {
    icon: 'FilmIcon',
    title: 'Short Videos',
    desc: 'TikTok-style feed with personalized algorithm — the more you watch, the smarter it gets.',
    color: '#00d2ff',
    size: 'large',
  },
  {
    icon: 'ChatBubbleLeftRightIcon',
    title: 'Real-time Chat',
    desc: 'Instant messaging with read receipts, media sharing, and group conversations.',
    color: '#9b59ff',
    size: 'small',
  },
  {
    icon: 'SparklesIcon',
    title: 'hn AI Hub',
    desc: 'GPT-4, Claude, Gemini — all in one place.',
    color: '#e879f9',
    size: 'small',
  },
  {
    icon: 'ShoppingBagIcon',
    title: 'Marketplace',
    desc: 'Buy and sell products directly within your social feed. Commerce meets community.',
    color: '#00d2ff',
    size: 'medium',
  },
  {
    icon: 'SignalIcon',
    title: 'Live Streaming',
    desc: 'Go live instantly. Build your audience in real time.',
    color: '#9b59ff',
    size: 'medium',
  },
  {
    icon: 'MicrophoneIcon',
    title: 'Voice Rooms',
    desc: 'Drop-in audio conversations. Like Clubhouse, but better.',
    color: '#e879f9',
    size: 'small',
  },
  {
    icon: 'GiftIcon',
    title: 'Invite & Earn',
    desc: 'Refer friends, earn rewards, unlock VIP status.',
    color: '#00d2ff',
    size: 'small',
  },
  {
    icon: 'CurrencyDollarIcon',
    title: 'Crypto Trading',
    desc: 'Track and trade crypto without leaving the app.',
    color: '#9b59ff',
    size: 'large',
  },
];

const stats = [
  { value: '10+', label: 'Features' },
  { value: '∞', label: 'Possibilities' },
  { value: '1', label: 'Super App' },
  { value: '0', label: 'Limits' },
];

export default function LandingScreen() {
  const [mounted, setMounted] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div
      className="min-h-screen overflow-x-hidden"
      style={{ background: '#050508', color: '#e2e8f0' }}
    >
      {/* Animated background orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute rounded-full"
          style={{
            width: 600,
            height: 600,
            top: -200,
            right: -100,
            background: 'radial-gradient(circle, rgba(0,210,255,0.08) 0%, transparent 70%)',
            transform: mounted ? `translateY(${scrollY * 0.1}px)` : 'none',
            transition: 'transform 0.1s linear',
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            width: 500,
            height: 500,
            bottom: 100,
            left: -150,
            background: 'radial-gradient(circle, rgba(155,89,255,0.08) 0%, transparent 70%)',
            transform: mounted ? `translateY(${-scrollY * 0.05}px)` : 'none',
            transition: 'transform 0.1s linear',
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            width: 300,
            height: 300,
            top: '40%',
            left: '40%',
            background: 'radial-gradient(circle, rgba(232,121,249,0.05) 0%, transparent 70%)',
          }}
        />
      </div>

      {/* Navbar */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 lg:px-12 py-4 transition-all duration-300"
        style={{
          background: scrollY > 50 ? 'rgba(5,5,8,0.95)' : 'transparent',
          backdropFilter: scrollY > 50 ? 'blur(24px)' : 'none',
          borderBottom: scrollY > 50 ? '1px solid rgba(255,255,255,0.06)' : 'none',
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #00d2ff, #9b59ff)', boxShadow: '0 0 16px rgba(0,210,255,0.4)' }}
          >
            <AppLogo size={20} />
          </div>
          <span className="font-800 text-xl" style={{ background: 'linear-gradient(135deg, #00d2ff, #9b59ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            hnChat
          </span>
        </div>
        <div className="hidden md:flex items-center gap-8">
          {['Features', 'About', 'Community'].map(item => (
            <a key={item} href={`#${item.toLowerCase()}`} className="text-sm text-slate-400 hover:text-slate-200 transition-colors font-500">
              {item}
            </a>
          ))}
        </div>
        <Link
          href="/sign-up-login"
          className="px-5 py-2.5 rounded-xl text-sm font-700 text-ice-black transition-all duration-200 hover:scale-105"
          style={{ background: 'linear-gradient(135deg, #00d2ff, #9b59ff)', boxShadow: '0 0 20px rgba(0,210,255,0.3)' }}
        >
          Join Now
        </Link>
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-24 pb-16 text-center">
        {/* Diamond badge */}
        <div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 text-sm font-600"
          style={{
            background: 'rgba(0,210,255,0.08)',
            border: '1px solid rgba(0,210,255,0.2)',
            color: '#00d2ff',
          }}
        >
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse inline-block" />
          <span>Early Access — Be Among the First Creators</span>
        </div>

        {/* Main headline */}
        <h1 className="text-5xl sm:text-6xl lg:text-8xl font-800 leading-none tracking-tight mb-6 max-w-5xl">
          <span className="text-slate-100">Your World.</span>
          <br />
          <span
            style={{
              background: 'linear-gradient(135deg, #00d2ff 0%, #9b59ff 50%, #e879f9 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            One App.
          </span>
        </h1>

        <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mb-10 leading-relaxed">
          Videos, chat, AI, marketplace, live streaming, voice rooms — everything you need, nothing you don't. Built for the next generation.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-16">
          <Link
            href="/sign-up-login"
            className="px-8 py-4 rounded-2xl text-base font-700 text-ice-black transition-all duration-300 hover:scale-105 hover:shadow-glow-cyan"
            style={{
              background: 'linear-gradient(135deg, #00d2ff, #9b59ff)',
              boxShadow: '0 0 32px rgba(0,210,255,0.3), 0 0 64px rgba(155,89,255,0.15)',
            }}
          >
            🚀 Join hnChat Free
          </Link>
          <Link
            href="/home-feed"
            className="px-8 py-4 rounded-2xl text-base font-600 text-slate-300 transition-all duration-200 hover:text-slate-100 hover:bg-white/06"
            style={{ border: '1px solid rgba(255,255,255,0.1)' }}
          >
            Explore the App →
          </Link>
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-8 sm:gap-16">
          {[
            { value: 'Early', label: 'Access Open' },
            { value: '🔥', label: 'Growing Fast' },
            { value: '100%', label: 'Free to Join' },
          ].map(stat => (
            <div key={stat.label} className="text-center">
              <div
                className="text-3xl sm:text-4xl font-800 mb-1"
                style={{
                  background: 'linear-gradient(135deg, #00d2ff, #9b59ff)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                {stat.value}
              </div>
              <div className="text-xs text-slate-600 font-500 uppercase tracking-widest">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
          <div className="text-xs text-slate-600">Scroll to explore</div>
          <Icon name="ChevronDownIcon" size={16} className="text-slate-600" />
        </div>
      </section>

      {/* Features Bento Grid */}
      <section id="features" className="relative px-6 lg:px-12 py-24 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 text-sm font-600"
            style={{ background: 'rgba(155,89,255,0.08)', border: '1px solid rgba(155,89,255,0.2)', color: '#9b59ff' }}
          >
            ✦ Everything in one place
          </div>
          <h2 className="text-4xl sm:text-5xl font-800 text-slate-100 mb-4">
            Built different.
          </h2>
          <p className="text-lg text-slate-500 max-w-xl mx-auto">
            Not just another social app. hnChat is a complete digital ecosystem.
          </p>
        </div>

        {/* Asymmetric bento grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-[180px]">
          {/* Large card - spans 2 cols, 2 rows */}
          <div
            className="col-span-2 row-span-2 rounded-3xl p-8 flex flex-col justify-end relative overflow-hidden group cursor-pointer transition-all duration-300 hover:scale-[1.02]"
            style={{
              background: 'linear-gradient(135deg, rgba(0,210,255,0.08) 0%, rgba(0,210,255,0.02) 100%)',
              border: '1px solid rgba(0,210,255,0.15)',
              boxShadow: '0 0 40px rgba(0,210,255,0.05)',
            }}
          >
            <div
              className="absolute top-8 right-8 w-24 h-24 rounded-3xl flex items-center justify-center"
              style={{ background: 'rgba(0,210,255,0.1)', border: '1px solid rgba(0,210,255,0.2)' }}
            >
              <Icon name="FilmIcon" size={48} style={{ color: '#00d2ff' }} />
            </div>
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{ background: 'radial-gradient(circle at 70% 30%, rgba(0,210,255,0.06) 0%, transparent 60%)' }}
            />
            <span
              className="text-xs font-700 px-3 py-1 rounded-full mb-4 w-fit"
              style={{ background: 'rgba(0,210,255,0.15)', color: '#00d2ff' }}
            >
              ALGORITHM-POWERED
            </span>
            <h3 className="text-2xl font-800 text-slate-100 mb-2">Short Videos</h3>
            <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
              TikTok-style feed with personalized algorithm — the more you watch, the smarter it gets.
            </p>
          </div>

          {/* Small cards */}
          {[
            { icon: 'ChatBubbleLeftRightIcon', title: 'Real-time Chat', color: '#9b59ff', span: '' },
            { icon: 'SparklesIcon', title: 'hn AI Hub', color: '#e879f9', span: '' },
            { icon: 'SignalIcon', title: 'Live Streaming', color: '#00d2ff', span: '' },
            { icon: 'MicrophoneIcon', title: 'Voice Rooms', color: '#9b59ff', span: '' },
          ].map(card => (
            <div
              key={card.title}
              className="rounded-3xl p-6 flex flex-col justify-between relative overflow-hidden group cursor-pointer transition-all duration-300 hover:scale-[1.03]"
              style={{
                background: `linear-gradient(135deg, ${card.color}08 0%, ${card.color}02 100%)`,
                border: `1px solid ${card.color}15`,
              }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: `${card.color}15`, border: `1px solid ${card.color}25` }}
              >
                <Icon name={card.icon as any} size={20} style={{ color: card.color }} />
              </div>
              <h3 className="text-sm font-700 text-slate-200">{card.title}</h3>
            </div>
          ))}

          {/* Medium card - spans 2 cols */}
          <div
            className="col-span-2 rounded-3xl p-6 flex items-center gap-6 relative overflow-hidden group cursor-pointer transition-all duration-300 hover:scale-[1.02]"
            style={{
              background: 'linear-gradient(135deg, rgba(155,89,255,0.08) 0%, rgba(232,121,249,0.04) 100%)',
              border: '1px solid rgba(155,89,255,0.15)',
            }}
          >
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(155,89,255,0.15)', border: '1px solid rgba(155,89,255,0.25)' }}
            >
              <Icon name="ShoppingBagIcon" size={32} style={{ color: '#9b59ff' }} />
            </div>
            <div>
              <span
                className="text-xs font-700 px-2 py-1 rounded-full mb-2 inline-block"
                style={{ background: 'rgba(155,89,255,0.15)', color: '#9b59ff' }}
              >
                MARKETPLACE
              </span>
              <h3 className="text-lg font-800 text-slate-100">Buy. Sell. Connect.</h3>
              <p className="text-sm text-slate-500">Commerce meets community — shop without leaving your feed.</p>
            </div>
          </div>

          {/* Crypto card - spans 2 cols */}
          <div
            className="col-span-2 rounded-3xl p-6 flex items-center gap-6 relative overflow-hidden group cursor-pointer transition-all duration-300 hover:scale-[1.02]"
            style={{
              background: 'linear-gradient(135deg, rgba(0,210,255,0.06) 0%, rgba(155,89,255,0.06) 100%)',
              border: '1px solid rgba(0,210,255,0.1)',
            }}
          >
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(0,210,255,0.1)', border: '1px solid rgba(0,210,255,0.2)' }}
            >
              <Icon name="CurrencyDollarIcon" size={32} style={{ color: '#00d2ff' }} />
            </div>
            <div>
              <span
                className="text-xs font-700 px-2 py-1 rounded-full mb-2 inline-block"
                style={{ background: 'rgba(0,210,255,0.15)', color: '#00d2ff' }}
              >
                CRYPTO
              </span>
              <h3 className="text-lg font-800 text-slate-100">hnTrade Crypto</h3>
              <p className="text-sm text-slate-500">Track and trade crypto without leaving the app.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="about" className="relative px-6 lg:px-12 py-24">
        <div
          className="max-w-4xl mx-auto rounded-3xl p-12 text-center relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(0,210,255,0.08) 0%, rgba(155,89,255,0.08) 50%, rgba(232,121,249,0.06) 100%)',
            border: '1px solid rgba(0,210,255,0.15)',
            boxShadow: '0 0 80px rgba(0,210,255,0.08), 0 0 160px rgba(155,89,255,0.05)',
          }}
        >
          {/* Diamond decoration */}
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rotate-45"
            style={{
              background: 'linear-gradient(135deg, #00d2ff, #9b59ff)',
              boxShadow: '0 0 40px rgba(0,210,255,0.5)',
            }}
          />
          <div className="absolute inset-0 rounded-3xl" style={{ background: 'radial-gradient(circle at 50% 0%, rgba(0,210,255,0.06) 0%, transparent 60%)' }} />

          <div className="relative">
            <div className="text-5xl mb-6">💎</div>
            <h2 className="text-4xl sm:text-5xl font-800 text-slate-100 mb-4">
              Ready to join?
            </h2>
            <p className="text-lg text-slate-400 mb-10 max-w-xl mx-auto">
              Join early users shaping the future of hnChat. Free forever. No credit card needed.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/sign-up-login"
                className="px-10 py-4 rounded-2xl text-lg font-700 text-ice-black transition-all duration-300 hover:scale-105"
                style={{
                  background: 'linear-gradient(135deg, #00d2ff, #9b59ff)',
                  boxShadow: '0 0 40px rgba(0,210,255,0.4)',
                }}
              >
                🔥 Join hnChat Now
              </Link>
            </div>
            <p className="text-sm text-slate-600 mt-6">Free to join · No credit card · Early access open</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 lg:px-12 py-12 border-t" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #00d2ff, #9b59ff)' }}
            >
              <AppLogo size={18} />
            </div>
            <span className="font-700 text-slate-300">hnChat</span>
          </div>
          <p className="text-sm text-slate-600">© 2026 hnChat. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/sign-up-login" className="text-sm text-slate-500 hover:text-slate-300 transition-colors">Sign Up</Link>
            <Link href="/home-feed" className="text-sm text-slate-500 hover:text-slate-300 transition-colors">App</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
