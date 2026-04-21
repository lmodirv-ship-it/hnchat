import React from 'react';
import type { Metadata, Viewport } from 'next';
import '../styles/tailwind.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { PushNotificationProvider } from '@/contexts/PushNotificationContext';
import { PushStrategyProvider } from '@/contexts/PushStrategyContext';
import { Suspense } from 'react';
import GoogleAnalytics from '@/components/GoogleAnalytics';
import ErrorBoundary from '@/components/ErrorBoundary';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: 'hnChat — Your World, One App',
  description: 'hnChat is the ultimate super app combining social networking, short video, live streaming, messaging, marketplace, and productivity tools for everyone worldwide.',
  icons: {
    icon: [{ url: '/favicon.ico', type: 'image/x-icon' }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <Suspense fallback={null}>
          <GoogleAnalytics />
        </Suspense>
        <ErrorBoundary>
          <AuthProvider>
            <PushNotificationProvider>
              <PushStrategyProvider>
                {children}
              </PushStrategyProvider>
            </PushNotificationProvider>
          </AuthProvider>
        </ErrorBoundary>

        <script type="module" async src="https://static.rocket.new/rocket-web.js?_cfg=https%3A%2F%2Fhnchat7959back.builtwithrocket.new&_be=https%3A%2F%2Fappanalytics.rocket.new&_v=0.1.18" />
        <script type="module" defer src="https://static.rocket.new/rocket-shot.js?v=0.0.2" /></body>
    </html>
  );
}