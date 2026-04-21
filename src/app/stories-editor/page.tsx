'use client';
import AppLayout from '@/components/AppLayout';
import StoriesEditorScreen from './components/StoriesEditorScreen';

export default function StoriesEditorPage() {
  return (
    <AppLayout activePath="/stories-editor">
      <StoriesEditorScreen />
    </AppLayout>
  );
}
