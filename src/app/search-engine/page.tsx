import type { Metadata } from 'next';
import { Suspense } from 'react';
import SearchEngineScreen from './components/SearchEngineScreen';

export const metadata: Metadata = {
  title: 'hnSearch — AI-Powered Search Engine',
  description: 'Search the web with hnSearch — AI-powered results, trending topics, news, images, videos, and people discovery on hnChat.',
  keywords: ['hnSearch', 'AI search', 'web search', 'search engine', 'hnChat search'],
  openGraph: {
    title: 'hnSearch — AI-Powered Search Engine',
    description: 'Search the web with AI-powered results on hnChat.',
    url: 'https://hnchat.net/search-engine',
  },
  alternates: { canonical: 'https://hnchat.net/search-engine' },
};

export default function SearchEnginePage() {
  return (
    <Suspense fallback={null}>
      <SearchEngineScreen />
    </Suspense>
  );
}
