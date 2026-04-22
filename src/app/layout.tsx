import React from 'react';
import type { Metadata, Viewport } from 'next';
import '../styles/tailwind.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { PushNotificationProvider } from '@/contexts/PushNotificationContext';
import { PushStrategyProvider } from '@/contexts/PushStrategyContext';
import { Suspense } from 'react';
import GoogleAnalytics from '@/components/GoogleAnalytics';
import AdSenseScript from '@/components/AdSenseScript';
import { organizationSchema, webApplicationSchema, faqSchema, softwareAppSchema } from '@/components/SchemaOrg';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL('https://hnchat.net'),
  title: {
    default: 'hnChat — Your World, One App',
    template: '%s | hnChat',
  },
  description: 'hnChat is the ultimate super app combining social networking, short video, live streaming, AI assistant, marketplace, crypto trading, and more — all in one platform.',
  keywords: [
    'hnChat', 'super app', 'social media', 'short videos', 'live streaming',
    'AI assistant', 'marketplace', 'crypto trading', 'messaging', 'voice rooms',
    'games hub', 'social network', 'content creator', 'hnchat.net',
    'تطبيق اجتماعي', 'شبكة اجتماعية', 'بث مباشر', 'تداول عملات رقمية',
  ],
  authors: [{ name: 'hnChat Team', url: 'https://hnchat.net' }],
  creator: 'hnChat',
  publisher: 'hnChat',
  category: 'social media',
  applicationName: 'hnChat',
  referrer: 'origin-when-cross-origin',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    alternateLocale: ['ar_MA', 'ar_SA', 'fr_FR'],
    url: 'https://hnchat.net',
    siteName: 'hnChat',
    title: 'hnChat — Your World, One App',
    description: 'The ultimate super app: social networking, short videos, live streaming, AI, marketplace, crypto, and more.',
    images: [
      {
        url: '/assets/images/app_logo.png',
        width: 1200,
        height: 630,
        alt: 'hnChat — Your World, One App',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@hnchat',
    creator: '@hnchat',
    title: 'hnChat — Your World, One App',
    description: 'The ultimate super app: social networking, short videos, live streaming, AI, marketplace, crypto, and more.',
    images: ['/assets/images/app_logo.png'],
  },
  icons: {
    icon: [{ url: '/favicon.ico', type: 'image/x-icon' }],
    apple: [{ url: '/favicon.ico' }],
  },
  manifest: '/manifest.json',
  alternates: {
    canonical: 'https://hnchat.net',
    languages: {
      'en': 'https://hnchat.net',
      'ar': 'https://hnchat.net',
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || '',
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        {/* Primary structured data: WebApplication */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(webApplicationSchema) }}
        />
        {/* Organization schema for brand authority */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        {/* SoftwareApplication with ratings for rich snippets */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppSchema) }}
        />
        {/* FAQ schema for AEO — answer engine optimization */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
        {/* AdSense */}
        <AdSenseScript />
      
      <script type="module" async src="https://static.rocket.new/rocket-web.js?_cfg=https%3A%2F%2Fhnchat7959back.builtwithrocket.new&_be=https%3A%2F%2Fappanalytics.rocket.new&_v=0.1.18" />
      <script type="module" defer src="https://static.rocket.new/rocket-shot.js?v=0.0.2" /></head>
      <body>
        <Suspense fallback={null}>
          <GoogleAnalytics />
        </Suspense>
        <AuthProvider>
          <PushNotificationProvider>
            <PushStrategyProvider>
              {children}
            </PushStrategyProvider>
          </PushNotificationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}