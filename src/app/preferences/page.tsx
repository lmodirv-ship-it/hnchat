'use client';
import AppLayout from '@/components/AppLayout';
import PreferencesScreen from './components/PreferencesScreen';

export default function PreferencesPage() {
  return (
    <AppLayout activePath="/preferences">
      <PreferencesScreen />
    </AppLayout>
  );
}
