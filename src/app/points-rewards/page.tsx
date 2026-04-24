import type { Metadata } from 'next';
import React from 'react';
import AppLayout from '@/components/AppLayout';
import PointsRewardsScreen from '../invite/components/PointsRewardsScreen';

export const metadata: Metadata = {
  title: 'Points & Rewards — hnChat',
  description: 'Earn points by engaging with hnChat. Like posts, comment, share, invite friends, and redeem points for premium features and live gifts.',
  alternates: {
    canonical: 'https://hnchat.net/points-rewards',
    languages: {
      'en': 'https://hnchat.net/points-rewards',
      'ar': 'https://hnchat.net/ar/points-rewards',
      'fr': 'https://hnchat.net/fr/points-rewards',
    },
  },
};

export default function PointsRewardsPage() {
  return (
    <AppLayout activePath="/points-rewards">
      <PointsRewardsScreen />
    </AppLayout>
  );
}
