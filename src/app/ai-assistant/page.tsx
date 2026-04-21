'use client';
import AppLayout from '@/components/AppLayout';
import AIAssistantScreen from './components/AIAssistantScreen';

export default function AIAssistantPage() {
  return (
    <AppLayout activePath="/ai-assistant">
      <AIAssistantScreen />
    </AppLayout>
  );
}
