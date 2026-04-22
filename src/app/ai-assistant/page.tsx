import type { Metadata } from 'next';
import { Suspense } from 'react';
import AIAssistantScreen from './components/AIAssistantScreen';

export const metadata: Metadata = {
  title: 'AI Assistant — hnChat',
  description: 'Chat with GPT-4, Claude, and Gemini all in one place. hnChat AI Assistant gives you access to the world\'s best AI models without switching apps.',
  keywords: ['AI assistant', 'GPT-4', 'Claude', 'Gemini', 'AI chat', 'hnChat AI', 'artificial intelligence'],
  openGraph: {
    title: 'AI Assistant — hnChat',
    description: 'Access GPT-4, Claude, and Gemini in one unified AI assistant.',
    url: 'https://hnchat.net/ai-assistant',
  },
  alternates: { canonical: 'https://hnchat.net/ai-assistant' },
};

export default function AIAssistantPage() {
  return (
    <Suspense fallback={null}>
      <AIAssistantScreen />
    </Suspense>
  );
}
