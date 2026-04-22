'use client';
import React, { useState, useEffect, useCallback } from 'react';
import ConversationList from './ConversationList';
import ChatWindow from './ChatWindow';
import UserInfoPanel from './UserInfoPanel';
import { messageService } from '@/lib/services/hnChatService';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';
import Icon from '@/components/ui/AppIcon';

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
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
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
        if (!activeConvId && mapped.length > 0) {
          setActiveConvId(mapped[0].id);
        }
      } else {
        setConversations([]);
      }
    } catch (err: any) {
      console.log('Load conversations error:', err.message);
      setConversations([]);
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

  const activeConv = conversations.find((c) => c?.id === activeConvId) || conversations[0] || null;

  // Empty state when no conversations
  if (!loadingConvs && conversations.length === 0) {
    return (
      <div className="flex h-full items-center justify-center" style={{ height: 'calc(100vh - 57px)' }}>
        <div className="flex flex-col items-center gap-4 text-center px-6">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ background: 'rgba(0,210,255,0.08)', border: '1px solid rgba(0,210,255,0.15)' }}>
            <Icon name="ChatBubbleLeftRightIcon" size={28} className="text-cyan-400" />
          </div>
          <div>
            <p className="text-white font-semibold text-lg">No messages yet</p>
            <p className="text-slate-500 text-sm mt-1">Start a conversation by visiting someone&apos;s profile</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full" style={{ height: 'calc(100vh - 57px)' }}>
      {/* Conversation list */}
      <ConversationList
        conversations={conversations}
        activeId={activeConvId || ''}
        onSelect={setActiveConvId}
      />
      {/* Chat window */}
      {activeConv ? (
        <>
          <ChatWindow
            conversation={activeConv}
            onToggleInfo={() => setShowInfo(!showInfo)}
            showInfo={showInfo}
          />
          {/* Info panel */}
          {showInfo && (
            <UserInfoPanel conversation={activeConv} onClose={() => setShowInfo(false)} />
          )}
        </>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-7 h-7 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
        </div>
      )}
    </div>
  );
}