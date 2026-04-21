'use client';
import AppLayout from '@/components/AppLayout';
import SearchEngineScreen from './components/SearchEngineScreen';

export default function SearchEnginePage() {
  return (
    <AppLayout activePath="/search-engine">
      <SearchEngineScreen />
    </AppLayout>
  );
}
