import type { Metadata } from 'next';
import { Suspense } from 'react';
import MarketplaceScreen from './components/MarketplaceScreen';

export const metadata: Metadata = {
  title: 'Marketplace — Buy & Sell on hnChat',
  description: 'Discover products, shop from creators, and sell your own items on the hnChat Marketplace. Secure payments, fast delivery.',
  keywords: ['hnChat marketplace', 'buy online', 'sell products', 'creator marketplace', 'social commerce'],
  openGraph: {
    title: 'Marketplace — Buy & Sell on hnChat',
    description: 'Discover products and shop from creators on hnChat Marketplace.',
    url: 'https://hnchat.net/marketplace',
  },
  alternates: { canonical: 'https://hnchat.net/marketplace' },
};

export default function MarketplacePage() {
  return (
    <Suspense fallback={null}>
      <MarketplaceScreen />
    </Suspense>
  );
}