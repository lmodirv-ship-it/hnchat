'use client';
import AppLayout from '@/components/AppLayout';
import GeoContentScreen from './components/GeoContentScreen';

export default function GeoContentPage() {
  return (
    <AppLayout activePath="/geo-content">
      <GeoContentScreen />
    </AppLayout>
  );
}
