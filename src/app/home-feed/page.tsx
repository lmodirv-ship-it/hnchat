import type { Metadata } from 'next';
import React from 'react';
import AppLayout from '@/components/AppLayout';
import StoriesBar from './components/StoriesBar';
import PostFeed from './components/PostFeed';
import TrendingSidebar from './components/TrendingSidebar';
import AdBanner from '@/components/AdBanner';

export const metadata: Metadata = {
  title: 'Home Feed — hnChat',
  description: 'Your personalized social feed on hnChat. Discover posts, stories, trending content, and connect with creators worldwide.',
  alternates: { canonical: 'https://hnchat.net/home-feed' },
  openGraph: {
    title: 'Home Feed — hnChat',
    description: 'Your personalized social feed. Discover posts, stories, and trending content.',
    url: 'https://hnchat.net/home-feed',
  },
};

export default function HomeFeedPage() {
  return (
    <AppLayout activePath="/home-feed">
      <div className="max-w-screen-2xl mx-auto px-3 sm:px-4 lg:px-8 xl:px-10 py-4 lg:py-6">
        <div className="flex gap-4 lg:gap-6">
          {/* Main content */}
          <div className="flex-1 min-w-0 space-y-3 lg:space-y-4">
            <StoriesBar />
            {/* Ad banner between stories and feed */}
            <AdBanner adSlot="1122334455" adFormat="horizontal" className="rounded-xl" />
            <PostFeed />
          </div>
          {/* Right sidebar — hidden on mobile */}
          <div className="hidden xl:block w-80 flex-shrink-0">
            <TrendingSidebar />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}