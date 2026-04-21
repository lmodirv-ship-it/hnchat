'use client';
import AppLayout from '@/components/AppLayout';
import LiveStreamScreen from './components/LiveStreamScreen';

export default function LiveStreamPage() {
  return (
    <AppLayout activePath="/live-stream">
      <LiveStreamScreen />
    </AppLayout>
  );
}
