'use client';
import AppLayout from '@/components/AppLayout';
import ShortVideosScreen from './components/ShortVideosScreen';

export default function ShortVideosPage() {
  return (
    <AppLayout activePath="/short-videos">
      <ShortVideosScreen />
    </AppLayout>
  );
}
