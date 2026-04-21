'use client';
import AppLayout from '@/components/AppLayout';
import GamesHubScreen from './components/GamesHubScreen';

export default function GamesHubPage() {
  return (
    <AppLayout activePath="/games-hub">
      <GamesHubScreen />
    </AppLayout>
  );
}
