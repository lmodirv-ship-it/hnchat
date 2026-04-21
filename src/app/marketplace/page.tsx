import React from 'react';
import AppLayout from '@/components/AppLayout';
import MarketplaceScreen from './components/MarketplaceScreen';

export default function MarketplacePage() {
  return (
    <AppLayout activePath="/marketplace">
      <MarketplaceScreen />
    </AppLayout>
  );
}