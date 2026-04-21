import React from 'react';
import AppLayout from '@/components/AppLayout';
import MessagingLayout from './components/MessagingLayout';

export default function ChatsMessagingPage() {
  return (
    <AppLayout activePath="/chats-messaging">
      <MessagingLayout />
    </AppLayout>
  );
}