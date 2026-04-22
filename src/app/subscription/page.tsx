import type { Metadata } from 'next';
import { Suspense } from 'react';
import SubscriptionScreen from './components/SubscriptionScreen';

export const metadata: Metadata = {
  title: 'Subscription Plans — hnChat Premium',
  description: 'Upgrade to hnChat Premium. Unlock advanced AI, analytics, creator tools, and more. Plans starting free. Pay via bank transfer or PayPal.',
  keywords: ['hnChat subscription', 'hnChat premium', 'social app subscription', 'creator tools', 'AI subscription'],
  openGraph: {
    title: 'Subscription Plans — hnChat Premium',
    description: 'Unlock advanced features with hnChat Premium. Start free, upgrade anytime.',
    url: 'https://hnchat.net/subscription',
  },
  alternates: { canonical: 'https://hnchat.net/subscription' },
};

export default function SubscriptionPage() {
  return (
    <Suspense fallback={null}>
      <SubscriptionScreen />
    </Suspense>
  );
}
