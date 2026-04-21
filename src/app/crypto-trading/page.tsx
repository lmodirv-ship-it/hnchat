'use client';
import AppLayout from '@/components/AppLayout';
import CryptoTradingScreen from './components/CryptoTradingScreen';

export default function CryptoTradingPage() {
  return (
    <AppLayout activePath="/crypto-trading">
      <CryptoTradingScreen />
    </AppLayout>
  );
}
