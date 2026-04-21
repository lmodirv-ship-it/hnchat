'use client';
import AppLayout from '@/components/AppLayout';
import EcommerceScreen from './components/EcommerceScreen';

export default function EcommercePage() {
  return (
    <AppLayout activePath="/ecommerce">
      <EcommerceScreen />
    </AppLayout>
  );
}
