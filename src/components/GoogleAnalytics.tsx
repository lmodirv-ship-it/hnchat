'use client';
import { Suspense } from 'react';
import { useGoogleAnalytics } from '@/lib/hooks/useAnalytics';

function GoogleAnalyticsInner() {
  useGoogleAnalytics();
  return null;
}

export default function GoogleAnalytics() {
  return (
    <Suspense fallback={null}>
      <GoogleAnalyticsInner />
    </Suspense>
  );
}
