'use client';
import AppLayout from '@/components/AppLayout';
import HnAIScreen from './components/HnAIScreen';

export default function HnAIPage() {
  return (
    <AppLayout activePath="/hn-ai">
      <HnAIScreen />
    </AppLayout>
  );
}
