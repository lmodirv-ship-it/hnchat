import React from 'react';
import AppLayout from '@/components/AppLayout';
import ProfileScreen from './components/ProfileScreen';

export default function ProfilePage() {
  return (
    <AppLayout activePath="/profile">
      <ProfileScreen />
    </AppLayout>
  );
}