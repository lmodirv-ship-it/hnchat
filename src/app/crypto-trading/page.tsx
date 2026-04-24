import type { Metadata } from 'next';
import { Suspense } from 'react';
import CryptoTradingScreen from './components/CryptoTradingScreen';

export const metadata: Metadata = {
  title: 'Crypto Trading — hnTrade on hnChat',
  description: 'Track and trade cryptocurrencies on hnChat. Real-time prices, portfolio management, and crypto news — all without leaving your social app.',
  keywords: ['crypto trading', 'cryptocurrency', 'hnTrade', 'Bitcoin', 'Ethereum', 'crypto portfolio', 'hnChat crypto'],
  openGraph: {
    title: 'Crypto Trading — hnTrade on hnChat',
    description: 'Track and trade crypto without leaving your social app.',
    url: 'https://hnchat.net/crypto-trading',
  },
  alternates: { canonical: 'https://hnchat.net/crypto-trading' },
};

export default function CryptoTradingPage() {
  return (
    <Suspense fallback={null}>
      <CryptoTradingScreen />
    </Suspense>
  );
}
