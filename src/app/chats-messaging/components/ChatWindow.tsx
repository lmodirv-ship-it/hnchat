'use client';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import AppImage from '@/components/ui/AppImage';
import Icon from '@/components/ui/AppIcon';
import { Toaster, toast } from 'sonner';
import { messageService } from '@/lib/services/hnChatService';
import { useAuth } from '@/contexts/AuthContext';

interface Conversation {
  id: string;
  user: string;
  username: string;
  avatar: string;
  online: boolean;
  verified: boolean;
  isGroup?: boolean;
  receiverId?: string;
  conversationId?: string;
}

interface ChatWindowProps {
  conversation: Conversation;
  onToggleInfo: () => void;
  showInfo: boolean;
}

export default function ChatWindow({ conversation, onToggleInfo, showInfo }: ChatWindowProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const loadMessages = useCallback(async () => {
    if (!conversation?.conversationId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await messageService.getMessages(conversation.conversationId);
      setMessages(data);
    } catch (err: any) {
      console.log('Load messages error:', err.message);
    } finally {
      setLoading(false);
    }
  }, [conversation?.conversationId]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  // Real-time subscription
  useEffect(() => {
    if (!conversation?.conversationId) return;

    const unsubscribe = messageService.subscribeToConversation(
      conversation.conversationId,
      async (newMsg) => {
        // Fetch full message with sender profile
        const { createClient } = await import('@/lib/supabase/client');
        const supabase = createClient();
        const { data } = await supabase
          .from('messages')
          .select(`*, sender:user_profiles!messages_sender_id_fkey(id, username, full_name, avatar_url)`)
          .eq('id', newMsg.id)
          .single();

        if (data) {
          setMessages((prev) => {
            // Avoid duplicates
            if (prev.some((m) => m.id === data.id)) return prev;
            return [...prev, data];
          });

          // 🔔 Brevo: trigger message received email for the recipient (not the sender)
          // Only notify if the message was sent by someone else (not the current user)
          if (data.sender_id !== user?.id && user?.email) {
            fetch('/api/email/message-received', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                email: user.email,
                name: user.user_metadata?.full_name || user.email?.split('@')[0] || '',
                senderName:
                  data.sender?.full_name ||
                  data.sender?.username ||
                  conversation?.user ||
                  'Someone',
                messagePreview: data.content || '',
              }),
            }).catch(() => {});
          }
        }
      }
    );

    return () => { unsubscribe(); };
  }, [conversation?.conversationId, user?.id, user?.email, user?.user_metadata, conversation?.user]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || !conversation?.receiverId) return;
    if (!user) { toast.error('Sign in to send messages'); return; }

    setSending(true);
    const content = input.trim();
    setInput('');

    try {
      const sent = await messageService.sendMessage(conversation.receiverId, content);
      if (sent) {
        // Optimistically add if not already added by subscription
        setMessages((prev) => {
          if (prev.some((m) => m.id === sent.id)) return prev;
          return [...prev, sent];
        });
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to send message');
      setInput(content);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const isMyMessage = (msg: any) => msg.sender_id === user?.id;

  return (
    <>
      <Toaster position="bottom-right" theme="dark" />
      <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
        {/* Chat header */}
        <div
          className="flex items-center justify-between px-5 py-3.5 border-b border-white/06 flex-shrink-0"
          style={{ background: 'rgba(10,10,15,0.7)', backdropFilter: 'blur(20px)' }}
        >
          <div className="flex items-center gap-3">
            <div className="relative">
              {conversation?.avatar ? (
                <div className="w-9 h-9 rounded-full overflow-hidden">
                  <AppImage
                    src={conversation.avatar}
                    alt={`${conversation.user} active chat partner profile`}
                    width={36}
                    height={36}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-700 text-ice-black"
                  style={{ background: 'linear-gradient(135deg, #a78bfa, #6ee7f7)' }}
                >
                  {conversation?.isGroup ? <Icon name="UserGroupIcon" size={18} className="text-ice-black" /> : conversation?.user?.[0]}
                </div>
              )}
              {conversation?.online && (
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full status-online border-2 border-ice-black" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-600 text-slate-200">{conversation?.user}</span>
                {conversation?.verified && <Icon name="CheckBadgeIcon" size={14} className="text-cyan-glow" />}
              </div>
              <p className="text-xs text-slate-500">
                {conversation?.online ? (
                  <span className="text-emerald-400">● Active now</span>
                ) : (
                  'Last seen recently'
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {[
              { icon: 'PhoneIcon', label: 'Voice call' },
              { icon: 'VideoCameraIcon', label: 'Video call' },
              { icon: 'MagnifyingGlassIcon', label: 'Search in chat' },
            ].map((a) => (
              <button
                key={`chat-action-${a.label}`}
                title={a.label}
                className="p-2 rounded-xl hover:bg-white/08 transition-all duration-150"
              >
                <Icon name={a.icon as any} size={18} className="text-slate-400" />
              </button>
            ))}
            <button
              onClick={onToggleInfo}
              title="Toggle info panel"
              className={`p-2 rounded-xl transition-all duration-150 ${showInfo ? 'bg-cyan-glow/10 text-cyan-glow' : 'hover:bg-white/08 text-slate-400'}`}
            >
              <Icon name="InformationCircleIcon" size={18} />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {/* Date divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-white/06" />
            <span className="text-xs text-slate-600 font-500">Today</span>
            <div className="flex-1 h-px bg-white/06" />
          </div>

          {loading && (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={`mskel-${i}`} className={`flex items-end gap-2 ${i % 2 === 0 ? 'flex-row-reverse' : ''}`}>
                  <div className="w-7 h-7 rounded-full bg-white/08 animate-pulse flex-shrink-0" />
                  <div className="h-10 bg-white/06 rounded-2xl animate-pulse" style={{ width: `${120 + i * 40}px` }} />
                </div>
              ))}
            </div>
          )}

          {!loading && messages.map((msg) => {
            const isMe = isMyMessage(msg);
            const senderProfile = msg.sender;

            return (
              <div key={msg.id} className={`flex items-end gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                {!isMe && (
                  <div className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0 mb-1">
                    {senderProfile?.avatar_url ? (
                      <AppImage
                        src={senderProfile.avatar_url}
                        alt={`${senderProfile.full_name} message avatar`}
                        width={28}
                        height={28}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div
                        className="w-full h-full flex items-center justify-center text-xs font-700 text-ice-black"
                        style={{ background: 'linear-gradient(135deg, #a78bfa, #6ee7f7)' }}
                      >
                        {senderProfile?.full_name?.[0] || conversation?.user?.[0] || 'U'}
                      </div>
                    )}
                  </div>
                )}
                <div className={`max-w-xs lg:max-w-md space-y-1 ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                  {msg.image_url && (
                    <div className="rounded-xl overflow-hidden mb-1">
                      <AppImage
                        src={msg.image_url}
                        alt="Message image"
                        width={280}
                        height={186}
                        className="w-full object-cover"
                      />
                    </div>
                  )}
                  <div
                    className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      isMe ? 'text-ice-black rounded-br-sm' : 'text-slate-200 rounded-bl-sm'
                    }`}
                    style={
                      isMe
                        ? { background: 'linear-gradient(135deg, #6ee7f7, #a78bfa)' }
                        : { background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.08)' }
                    }
                  >
                    {msg.content}
                  </div>
                  <div className={`flex items-center gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                    <span className="text-xs text-slate-600">
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {isMe && <Icon name="CheckIcon" size={12} className="text-cyan-glow" />}
                  </div>
                </div>
              </div>
            );
          })}

          {!loading && messages.length === 0 && (
            <div className="text-center py-8">
              <Icon name="ChatBubbleLeftRightIcon" size={32} className="text-slate-600 mx-auto mb-2" />
              <p className="text-slate-500 text-sm">No messages yet. Say hello! 👋</p>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input area */}
        <div
          className="px-5 py-3.5 border-t border-white/06 flex-shrink-0"
          style={{ background: 'rgba(10,10,15,0.7)', backdropFilter: 'blur(20px)' }}
        >
          <div className="flex items-end gap-3">
            <div className="flex gap-1">
              {[
                { icon: 'PlusCircleIcon', label: 'Attach' },
                { icon: 'PhotoIcon', label: 'Image' },
                { icon: 'FaceSmileIcon', label: 'Emoji' },
              ].map((a) => (
                <button
                  key={`input-action-${a.label}`}
                  title={a.label}
                  className="p-2 rounded-xl hover:bg-white/08 transition-all duration-150"
                >
                  <Icon name={a.icon as any} size={18} className="text-slate-500 hover:text-slate-300" />
                </button>
              ))}
            </div>
            <div className="flex-1 relative">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message..."
                rows={1}
                className="input-glass w-full resize-none text-sm pr-12"
                style={{ borderRadius: 14, minHeight: 44, maxHeight: 120 }}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || sending}
                className="absolute right-2 bottom-2 p-2 rounded-xl transition-all duration-150 disabled:opacity-30"
                style={{ background: input.trim() ? 'linear-gradient(135deg, #6ee7f7, #a78bfa)' : 'transparent' }}
              >
                {sending ? (
                  <Icon name="ArrowPathIcon" size={16} className="text-ice-black animate-spin" />
                ) : (
                  <Icon name="PaperAirplaneIcon" size={16} className={input.trim() ? 'text-ice-black' : 'text-slate-600'} />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}