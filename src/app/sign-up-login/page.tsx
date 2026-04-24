import type { Metadata } from 'next';
import { Suspense } from 'react';
import AuthScreen from './components/AuthScreen';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export const metadata: Metadata = {
  title: 'Sign Up or Log In — Join hnChat',
  description: 'Create your free hnChat account or sign in. Join millions of users on the ultimate super app for social networking, videos, AI, and more.',
  keywords: ['hnChat sign up', 'hnChat login', 'create account', 'join hnChat', 'register'],
  openGraph: {
    title: 'Sign Up or Log In — Join hnChat',
    description: 'Create your free hnChat account and join the ultimate super app.',
    url: 'https://hnchat.net/sign-up-login',
  },
  alternates: { canonical: 'https://hnchat.net/sign-up-login' },
  robots: { index: true, follow: true },
};

export default function SignUpLoginPage() {
  return (
    <Suspense fallback={null}>
      <AuthScreen />
    </Suspense>
  );
}