'use client';
import AppLayout from '@/components/AppLayout';
import PagesGroupsScreen from './components/PagesGroupsScreen';

export default function PagesGroupsPage() {
  return (
    <AppLayout activePath="/pages-groups">
      <PagesGroupsScreen />
    </AppLayout>
  );
}
