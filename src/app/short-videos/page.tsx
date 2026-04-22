import type { Metadata } from 'next';
import { Suspense } from 'react';
import ShortVideosScreen from './components/ShortVideosScreen';

export const metadata: Metadata = {
  title: 'Short Videos — Trending Reels & Clips',
  description: 'Watch and share short videos, trending reels, and viral clips on hnChat. Discover creators and go viral.',
  keywords: ['short videos', 'reels', 'viral clips', 'hnChat videos', 'trending videos', 'content creators'],
  openGraph: {
    title: 'Short Videos — Trending Reels & Clips on hnChat',
    description: 'Watch trending short videos and reels on hnChat.',
    url: 'https://hnchat.net/short-videos',
  },
  alternates: { canonical: 'https://hnchat.net/short-videos' },
};

export default function ShortVideosPage() {
  return (
    <Suspense fallback={null}>
      <ShortVideosScreen />
    </Suspense>
  );
}
