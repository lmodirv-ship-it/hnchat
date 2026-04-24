'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import AppLogo from '@/components/ui/AppLogo';
import Icon from '@/components/ui/AppIcon';
import AdBanner from '@/components/AdBanner';

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

const faqs = [
  {
    q: 'What is hnChat?',
    a: 'hnChat is a super app that combines social networking, short videos, live streaming, AI assistant (GPT-4, Claude, Gemini), marketplace, crypto trading, voice rooms, and games — all in one platform.',
  },
  {
    q: 'Is hnChat free?',
    a: 'Yes! hnChat has a free plan with full access to core features. Premium plans unlock advanced AI, analytics, and creator tools.',
  },
  {
    q: 'What AI models does hnChat support?',
    a: 'hnChat AI Hub supports GPT-4, Claude, and Gemini — all accessible from one unified interface without switching apps.',
  },
  {
    q: 'Can I sell products on hnChat?',
    a: 'Absolutely. hnChat has a built-in marketplace where you can list, sell, and buy products directly within your social feed.',
  },
  {
    q: 'Does hnChat support crypto trading?',
    a: 'Yes, hnChat includes hnTrade — a crypto tracking and trading feature so you never have to leave the app.',
  },
  {
    q: 'How do I earn money on hnChat?',
    a: 'You can earn through the Invite & Earn referral program, selling on the marketplace, running ads, and creator monetization tools.',
  },
];

export default function LandingScreen() {
  const [mounted, setMounted] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

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
          {['Features', 'FAQ', 'Community']?.map(item => (
            <a key={item} href={`#${item?.toLowerCase()}`} className="text-sm text-slate-400 hover:text-slate-200 transition-colors font-500">
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
            className="px-8 py-4 rounded-2xl text-base font-700 text-white transition-all duration-200 hover:scale-105 hover:shadow-2xl"
            style={{ background: 'linear-gradient(135deg, #00d2ff, #9b59ff)', boxShadow: '0 0 32px rgba(0,210,255,0.3)' }}
          >
            Get Started Free
          </Link>
          <a
            href="#features"
            className="px-8 py-4 rounded-2xl text-base font-600 text-slate-300 transition-all duration-200 hover:text-white"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            Explore Features
          </a>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-8 max-w-lg">
          {stats?.map((s) => (
            <div key={s?.label} className="text-center">
              <div className="text-2xl font-800 text-slate-100">{s?.value}</div>
              <div className="text-xs text-slate-500 mt-1">{s?.label}</div>
            </div>
          ))}
        </div>
      </section>
      {/* Ad Banner — between hero and features */}
      <div className="max-w-4xl mx-auto px-6 mb-8">
        <AdBanner adSlot="1234567890" adFormat="horizontal" className="rounded-xl" />
      </div>
      {/* Features */}
      <section id="features" className="relative px-6 lg:px-12 py-24 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-800 text-slate-100 mb-4">
            Everything in{' '}
            <span style={{ background: 'linear-gradient(135deg, #00d2ff, #9b59ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              One Place
            </span>
          </h2>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            Stop juggling 10 apps. hnChat brings your entire digital life together.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {features?.map((f) => (
            <div
              key={f?.title}
              className="p-5 rounded-2xl transition-all duration-200 hover:scale-105 cursor-pointer"
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
                backdropFilter: 'blur(12px)',
              }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                style={{ background: `${f?.color}18`, border: `1px solid ${f?.color}30` }}
              >
                <Icon name={f?.icon} size={20} style={{ color: f?.color }} />
              </div>
              <h3 className="font-700 text-slate-200 text-sm mb-1">{f?.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{f?.desc}</p>
            </div>
          ))}
        </div>
      </section>
      {/* Social Proof / Trust Section */}
      <section className="px-6 lg:px-12 py-16 max-w-4xl mx-auto text-center">
        <div
          className="rounded-3xl p-10"
          style={{ background: 'rgba(0,210,255,0.04)', border: '1px solid rgba(0,210,255,0.1)' }}
        >
          <h2 className="text-3xl font-800 text-slate-100 mb-4">
            Why Choose hnChat?
          </h2>
          <p className="text-slate-400 mb-8 max-w-2xl mx-auto">
            hnChat is the only platform where you can post, chat, go live, trade crypto, shop, play games, and use multiple AI models — without ever switching apps.
          </p>
          <div className="grid grid-cols-3 gap-6">
            {[
              { icon: '🚀', label: 'All-in-One', desc: '10+ features in one app' },
              { icon: '🤖', label: 'AI-Powered', desc: 'GPT-4, Claude & Gemini' },
              { icon: '💰', label: 'Earn & Trade', desc: 'Marketplace + Crypto' },
            ]?.map((item) => (
              <div key={item?.label} className="text-center">
                <div className="text-3xl mb-2">{item?.icon}</div>
                <div className="font-700 text-slate-200 text-sm">{item?.label}</div>
                <div className="text-xs text-slate-500 mt-1">{item?.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* FAQ Section — AEO Optimized */}
      <section id="faq" className="px-6 lg:px-12 py-20 max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-800 text-slate-100 mb-3">
            Frequently Asked Questions
          </h2>
          <p className="text-slate-400">Everything you need to know about hnChat</p>
        </div>
        <div className="space-y-3">
          {faqs?.map((faq, i) => (
            <div
              key={i}
              className="rounded-2xl overflow-hidden cursor-pointer transition-all duration-200"
              style={{
                background: openFaq === i ? 'rgba(0,210,255,0.06)' : 'rgba(255,255,255,0.03)',
                border: openFaq === i ? '1px solid rgba(0,210,255,0.2)' : '1px solid rgba(255,255,255,0.06)',
              }}
              onClick={() => setOpenFaq(openFaq === i ? null : i)}
            >
              <div className="flex items-center justify-between px-5 py-4">
                <h3 className="font-600 text-slate-200 text-sm">{faq?.q}</h3>
                <Icon
                  name={openFaq === i ? 'ChevronUpIcon' : 'ChevronDownIcon'}
                  size={16}
                  className="text-slate-500 flex-shrink-0 ml-3"
                />
              </div>
              {openFaq === i && (
                <div className="px-5 pb-4">
                  <p className="text-slate-400 text-sm leading-relaxed">{faq?.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
      {/* Ad Banner — before CTA */}
      <div className="max-w-4xl mx-auto px-6 mb-8">
        <AdBanner adSlot="0987654321" adFormat="auto" className="rounded-xl" />
      </div>
      {/* Final CTA */}
      <section id="community" className="px-6 py-24 text-center">
        <h2 className="text-4xl lg:text-5xl font-800 text-slate-100 mb-6">
          Ready to Join?
        </h2>
        <p className="text-slate-400 text-lg mb-10 max-w-xl mx-auto">
          Create your free account and experience the future of social media.
        </p>
        <Link
          href="/sign-up-login"
          className="inline-flex px-10 py-4 rounded-2xl text-base font-700 text-white transition-all duration-200 hover:scale-105"
          style={{ background: 'linear-gradient(135deg, #00d2ff, #9b59ff)', boxShadow: '0 0 40px rgba(0,210,255,0.3)' }}
        >
          Start for Free →
        </Link>
      </section>
      {/* Footer */}
      <footer className="px-6 lg:px-12 py-10 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #00d2ff, #9b59ff)' }}
            >
              <AppLogo size={16} />
            </div>
            <span className="font-700 text-slate-300">hnChat</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-slate-500">
            <Link href="/privacy-policy" className="hover:text-slate-300 transition-colors">Privacy</Link>
            <Link href="/terms-of-service" className="hover:text-slate-300 transition-colors">Terms</Link>
            <Link href="/sign-up-login" className="hover:text-slate-300 transition-colors">Sign Up</Link>
          </div>
          <p className="text-xs text-slate-600">© 2025 hnChat. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
