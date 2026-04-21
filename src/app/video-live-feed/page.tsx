import React from 'react';
import AppLayout from '@/components/AppLayout';
import VideoFeedLayout from './components/VideoFeedLayout';

export default function VideoLiveFeedPage() {
  return (
    <AppLayout activePath="/video-live-feed">
      <VideoFeedLayout />
    </AppLayout>
  );
}