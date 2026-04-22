import type { Metadata } from 'next';
import { Suspense } from 'react';
import GamesHubScreen from './components/GamesHubScreen';

export const metadata: Metadata = {
  title: 'Games Hub — Play on hnChat',
  description: 'Play games, compete with friends, and win rewards on hnChat Games Hub. Casual games, tournaments, and leaderboards — all inside your social app.',
  keywords: ['games hub', 'social games', 'play games online', 'hnChat games', 'casual games', 'gaming community'],
  openGraph: {
    title: 'Games Hub — Play on hnChat',
    description: 'Play games and compete with friends on hnChat Games Hub.',
    url: 'https://hnchat.net/games-hub',
  },
  alternates: { canonical: 'https://hnchat.net/games-hub' },
};

export default function GamesHubPage() {
  return (
    <Suspense fallback={null}>
      <GamesHubScreen />
    </Suspense>
  );
}
