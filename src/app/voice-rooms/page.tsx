'use client';
import AppLayout from '@/components/AppLayout';
import VoiceRoomsScreen from './components/VoiceRoomsScreen';

export default function VoiceRoomsPage() {
  return (
    <AppLayout activePath="/voice-rooms">
      <VoiceRoomsScreen />
    </AppLayout>
  );
}
