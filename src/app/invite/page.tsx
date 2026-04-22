import type { Metadata } from 'next';
import { Suspense } from 'react';
import InviteScreen from './components/InviteScreen';

export const metadata: Metadata = {
  title: 'Invite & Earn — hnChat Referral Program',
  description: 'Invite friends to hnChat and earn rewards. Unlock VIP status, earn bonuses, and grow your network with the hnChat referral program.',
  keywords: ['invite friends', 'referral program', 'earn rewards', 'hnChat invite', 'VIP status', 'referral bonus'],
  openGraph: {
    title: 'Invite & Earn — hnChat Referral Program',
    description: 'Invite friends and earn rewards with the hnChat referral program.',
    url: 'https://hnchat.net/invite',
  },
  alternates: { canonical: 'https://hnchat.net/invite' },
};

export default function InvitePage() {
  return (
    <Suspense fallback={null}>
      <InviteScreen />
    </Suspense>
  );
}
