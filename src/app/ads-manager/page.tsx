'use client';
import AppLayout from '@/components/AppLayout';
import AdsManagerScreen from './components/AdsManagerScreen';

export default function AdsManagerPage() {
  return (
    <AppLayout activePath="/ads-manager">
      <AdsManagerScreen />
    </AppLayout>
  );
}
