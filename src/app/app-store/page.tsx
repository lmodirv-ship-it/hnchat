'use client';
import AppLayout from '@/components/AppLayout';
import AppStoreScreen from './components/AppStoreScreen';

export default function AppStorePage() {
  return (
    <AppLayout activePath="/app-store">
      <AppStoreScreen />
    </AppLayout>
  );
}
