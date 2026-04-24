import type { Metadata } from 'next';
import React from 'react';
import AppLayout from '@/components/AppLayout';
import InviteScreen from './components/InviteScreen';

export const metadata: Metadata = {
  title: 'Invite Friends & Earn Rewards — hnChat',
  description: 'Invite your friends to hnChat and earn points, premium access, and exclusive rewards. Share your unique invite link on WhatsApp, Twitter, and Telegram.',
  alternates: {
    canonical: 'https://hnchat.net/invite',
    languages: {
      'en': 'https://hnchat.net/invite',
      'ar': 'https://hnchat.net/ar/invite',
      'fr': 'https://hnchat.net/fr/invite',
      'es': 'https://hnchat.net/es/invite',
    },
  },
  openGraph: {
    title: 'Invite Friends & Earn Rewards — hnChat',
    description: 'Invite friends and earn points, premium access, and exclusive rewards on hnChat.',
    url: 'https://hnchat.net/invite',
    locale: 'en_US',
    alternateLocale: ['ar_MA', 'fr_FR', 'es_ES'],
  },
};

export default function InvitePage() {
  return (
    <AppLayout activePath="/invite">
      <InviteScreen />
    </AppLayout>
  );
}
