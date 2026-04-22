import type { Metadata } from 'next';
import { Suspense } from 'react';
import LandingScreen from './components/LandingScreen';

export const metadata: Metadata = {
  title: 'hnChat — The Ultimate Super App',
  description: 'Join hnChat — the world\'s most advanced super app. Social networking, short videos, live streaming, AI assistant, marketplace, crypto trading, and more in one platform.',
  keywords: ['hnChat', 'super app', 'social media app', 'AI assistant', 'live streaming', 'marketplace', 'crypto trading'],
  openGraph: {
    title: 'hnChat — The Ultimate Super App',
    description: 'Join millions on hnChat — social, video, AI, marketplace and more in one app.',
    url: 'https://hnchat.net/landing',
  },
  alternates: { canonical: 'https://hnchat.net/landing' },
};

export default function LandingPage() {
  return (
    <Suspense fallback={null}>
      <LandingScreen />
    </Suspense>
  );
}
