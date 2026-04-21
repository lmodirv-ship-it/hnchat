'use client';
import React, { useState, useEffect, useCallback } from 'react';
import ConversationList from './ConversationList';
import ChatWindow from './ChatWindow';
import UserInfoPanel from './UserInfoPanel';
import { messageService } from '@/lib/services/hnChatService';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';

// Fallback static conversations for when DB has no data yet
const FALLBACK_CONVERSATIONS = [
  {
    id: 'conv-001',
    user: 'Sara Nova',
    username: 'saranvoa',
    avatar: 'https://i.pravatar.cc/80?img=47',
    lastMessage: 'Can you check the new artwork I sent? 🎨',
    time: '2m',
    unread: 3,
    online: true,
    verified: true,
    pinned: true,
    receiverId: null,
    conversationId: null,
  },
  {
    id: 'conv-002',
    user: 'James Orbit',
    username: 'jamesorbit',
    avatar: 'https://i.pravatar.cc/80?img=12',
    lastMessage: 'The PR is ready for review 🚀',
    time: '14m',
    unread: 1,
    online: true,
    verified: false,
    pinned: false,
    receiverId: null,
    conversationId: null,
  },
  {
    id: 'conv-003',
    user: 'hnChat Team',
    username: 'team',
    avatar: '',
    lastMessage: 'New features are live! Check the changelog.',
    time: '1h',
    unread: 0,
    online: false,
    verified: true,
    pinned: true,
    isGroup: true,
    receiverId: null,
    conversationId: null,
  },
];

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'now';
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
}

export default function MessagingLayout() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<any[]>(FALLBACK_CONVERSATIONS);
  const [activeConvId, setActiveConvId] = useState('conv-001');
  const [showInfo, setShowInfo] = useState(true);
  const [loadingConvs, setLoadingConvs] = useState(true);

  const loadConversations = useCallback(async () => {
    if (!user) {
      setLoadingConvs(false);
      return;
    }
    setLoadingConvs(true);
    try {
      const data = await messageService.getConversations();
      if (data && data.length > 0) {
        const mapped = data.map((msg: any) => {
          const isMe = msg.sender_id === user.id;
          const otherProfile = isMe ? msg.receiver : msg.sender;
          return {
            id: msg.conversation_id,
            user: otherProfile?.full_name || 'Unknown',
            username: otherProfile?.username || 'user',
            avatar: otherProfile?.avatar_url || '',
            lastMessage: msg.content,
            time: timeAgo(msg.created_at),
            unread: 0,
            online: false,
            verified: otherProfile?.is_verified || false,
            pinned: false,
            receiverId: isMe ? msg.receiver_id : msg.sender_id,
            conversationId: msg.conversation_id,
          };
        });
        setConversations(mapped);
        if (mapped.length > 0) {
          setActiveConvId(mapped[0].id);
        }
      }
    } catch (err: any) {
      console.log('Load conversations error:', err.message);
    } finally {
      setLoadingConvs(false);
    }
  }, [user]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // Real-time: update conversation list when new messages arrive
  useEffect(() => {
    if (!user) return;
    const supabase = createClient();
    const channel = supabase
      .channel('conversations_updates')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `receiver_id=eq.${user.id}`,
      }, () => {
        loadConversations();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user, loadConversations]);

  const activeConv = conversations?.find((c) => c?.id === activeConvId) || conversations?.[0];

  return (
    <div className="flex h-full" style={{ height: 'calc(100vh - 57px)' }}>
      {/* Conversation list */}
      <ConversationList
        conversations={conversations}
        activeId={activeConvId}
        onSelect={setActiveConvId}
      />
      {/* Chat window */}
      <ChatWindow
        conversation={activeConv}
        onToggleInfo={() => setShowInfo(!showInfo)}
        showInfo={showInfo}
      />
      {/* Info panel */}
      {showInfo && (
        <UserInfoPanel conversation={activeConv} onClose={() => setShowInfo(false)} />
      )}
    </div>
  );
}