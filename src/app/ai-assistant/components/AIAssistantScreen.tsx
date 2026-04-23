'use client';
import React, { useState, useEffect, useRef } from 'react';
import Icon from '@/components/ui/AppIcon';
import { useChat } from '@/lib/hooks/useChat';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { toast } from 'sonner';

interface Message {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  time: string;
}

const suggestions = [
  '✨ Generate a diamond-themed post',
  '🎨 Create a social media caption',
  '📊 Analyze my profile performance',
  '🚀 Write a product description',
  '🎵 Suggest trending music for my story',
  '💡 Give me content ideas for today',
];

const SYSTEM_PROMPT = `You are hnChat AI — a diamond-grade intelligent assistant for the hnChat social platform. 
You help users create content, write captions, generate post ideas, analyze trends, and grow their social presence.
Be creative, concise, and use emojis where appropriate. Respond in the same language the user writes in (Arabic or English).`;

const WELCOME_MSG = "I'm **hnChat AI** — your diamond-grade intelligent assistant! I can help you create content, analyze trends, generate ideas, write captions, and much more. What would you like to explore today? ✨";

function formatMessage(text: string) {
  return text.split('\n').map((line, i) => {
    const formatted = line
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/^• /, '• ');
    return <p key={i} className="mb-1 last:mb-0" dangerouslySetInnerHTML={{ __html: formatted }} />;
  });
}

export default function AIAssistantScreen() {
  const { user } = useAuth();
  const supabase = createClient();
  const [isPremium, setIsPremium] = useState(false);
  const [checkingPremium, setCheckingPremium] = useState(true);
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, role: 'assistant', content: WELCOME_MSG, time: 'Now' }
  ]);
  const [input, setInput] = useState('');
  const [activeMode, setActiveMode] = useState<'chat' | 'image' | 'code'>('chat');
  const [conversationHistory, setConversationHistory] = useState<Array<{ role: string; content: string }>>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  const { response, isLoading, error, sendMessage } = useChat('OPEN_AI', 'gpt-4.1-mini', true);

  // Check premium subscription
  useEffect(() => {
    if (!user) { setCheckingPremium(false); return; }
    supabase
      .from('subscriptions')
      .select('plan_name, status, expires_at')
      .eq('user_id', user.id)
      .eq('status', 'approved')
      .in('plan_name', ['pro', 'business'])
      .gt('expires_at', new Date().toISOString())
      .limit(1)
      .then(({ data }) => {
        setIsPremium(!!(data && data.length > 0));
        setCheckingPremium(false);
      });
  }, [user]);

  useEffect(() => {
    if (error) toast.error('AI service unavailable. Please try again.');
  }, [error]);

  useEffect(() => {
    if (response && isLoading) {
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last?.role === 'assistant' && last.id === -1) {
          return [...prev.slice(0, -1), { ...last, content: response }];
        }
        return prev;
      });
    }
  }, [response, isLoading]);

  useEffect(() => {
    if (response && !isLoading) {
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last?.role === 'assistant' && last.id === -1) {
          const finalMsg = { ...last, id: Date.now(), content: response };
          return [...prev.slice(0, -1), finalMsg];
        }
        return prev;
      });
      setConversationHistory(prev => [...prev, { role: 'assistant', content: response }]);

      // Track AI usage
      if (user) {
        supabase.from('ai_premium_usage').insert({
          user_id: user.id,
          model: 'gpt-4.1-mini',
          tokens_used: response.length,
          is_premium_request: isPremium,
        }).then(() => {});
      }
    }
  }, [isLoading]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    if (!user) { toast.error('Sign in to use AI Assistant'); return; }

    // Free users: limit to 5 messages per session
    const userMessages = messages.filter(m => m.role === 'user').length;
    if (!isPremium && userMessages >= 5) {
      toast.error('Free limit reached. Upgrade to Pro for unlimited AI access!');
      return;
    }

    const userMsg: Message = { id: Date.now(), role: 'user', content: input.trim(), time: 'Now' };
    const newHistory = [...conversationHistory, { role: 'user', content: input.trim() }];
    setConversationHistory(newHistory);
    setMessages(prev => [...prev, userMsg, { id: -1, role: 'assistant', content: '...', time: 'Now' }]);
    setInput('');

    await sendMessage(input.trim(), SYSTEM_PROMPT, newHistory.slice(-10));
  };

  // Premium paywall UI
  const userMsgCount = messages.filter(m => m.role === 'user').length;
  if (!checkingPremium && !isPremium && userMsgCount >= 5) {
    return (
      <div className="flex flex-col h-full items-center justify-center p-8 text-center space-y-6">
        <div
          className="w-20 h-20 rounded-3xl flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #00d2ff, #9b59ff)', boxShadow: '0 0 40px rgba(0,210,255,0.4)' }}
        >
          <Icon name="SparklesIcon" size={36} className="text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-700 gradient-text mb-2">Upgrade to AI Premium</h2>
          <p className="text-slate-400 text-sm max-w-sm">
            You have used your 5 free AI messages. Upgrade to Pro or Business for unlimited AI conversations, advanced models, and more.
          </p>
        </div>
        <div className="space-y-3 w-full max-w-xs">
          <Link href="/subscription"
            className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl font-700 text-sm transition-all duration-200"
            style={{ background: 'linear-gradient(135deg, #00d2ff, #9b59ff)', color: '#050508' }}>
            <Icon name="StarIcon" size={16} />
            Upgrade to Pro
          </Link>
          <button
            onClick={() => setMessages([{ id: 1, role: 'assistant', content: WELCOME_MSG, time: 'Now' }])}
            className="w-full py-3 rounded-2xl font-600 text-sm text-slate-400 transition-all duration-200"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
            Start New Session (5 free messages)
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #00d2ff, #9b59ff)', boxShadow: '0 0 20px rgba(0,210,255,0.3)' }}
          >
            <Icon name="SparklesIcon" size={20} className="text-white" />
          </div>
          <div>
            <h2 className="font-700 text-slate-200 text-sm">hnChat AI</h2>
            <p className="text-xs text-slate-500">Diamond-grade assistant</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isPremium ? (
            <span className="text-xs font-600 px-2 py-1 rounded-lg" style={{ background: 'rgba(0,210,255,0.1)', color: '#6ee7f7' }}>
              ✨ Premium
            </span>
          ) : (
            <Link href="/subscription"
              className="text-xs font-600 px-2 py-1 rounded-lg transition-all"
              style={{ background: 'rgba(155,89,255,0.1)', color: '#c084fc', border: '1px solid rgba(155,89,255,0.2)' }}>
              Upgrade
            </Link>
          )}
          {/* Mode tabs */}
          <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }}>
            {(['chat', 'image', 'code'] as const).map((m) => (
              <button key={m} onClick={() => setActiveMode(m)}
                className="px-3 py-1 rounded-lg text-xs font-600 capitalize transition-all duration-200"
                style={activeMode === m
                  ? { background: 'linear-gradient(135deg, #00d2ff, #9b59ff)', color: '#050508' }
                  : { color: '#64748b' }}>
                {m}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div
              className="w-8 h-8 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={msg.role === 'assistant'
                ? { background: 'linear-gradient(135deg, #00d2ff, #9b59ff)' }
                : { background: 'rgba(255,255,255,0.1)' }}
            >
              {msg.role === 'assistant'
                ? <Icon name="SparklesIcon" size={14} className="text-white" />
                : <span className="text-xs font-700 text-slate-300">{user?.email?.[0]?.toUpperCase() || 'U'}</span>
              }
            </div>
            <div
              className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${msg.id === -1 ? 'animate-pulse' : ''}`}
              style={msg.role === 'assistant'
                ? { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#e2e8f0' }
                : { background: 'linear-gradient(135deg, rgba(0,210,255,0.15), rgba(155,89,255,0.1))', border: '1px solid rgba(0,210,255,0.2)', color: '#e2e8f0' }}
            >
              {formatMessage(msg.content)}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Free usage indicator */}
      {!isPremium && (
        <div className="px-4 py-2 flex items-center justify-between" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
          <span className="text-xs text-slate-600">
            {userMsgCount}/5 free messages
          </span>
          <Link href="/subscription" className="text-xs text-purple-400 hover:text-purple-300 transition-colors">
            Get unlimited →
          </Link>
        </div>
      )}

      {/* Suggestions */}
      {messages.length <= 2 && (
        <div className="px-4 pb-3 flex gap-2 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => setInput(s.replace(/^[^\s]+ /, ''))}
              className="flex-shrink-0 px-3 py-2 rounded-xl text-xs font-500 text-slate-400 hover:text-slate-200 transition-all duration-150"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', whiteSpace: 'nowrap' }}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <div className="flex gap-3 items-end">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            placeholder={user ? "Ask me anything..." : "Sign in to use AI Assistant"}
            disabled={!user || isLoading}
            rows={1}
            className="input-glass flex-1 resize-none text-sm"
            style={{ borderRadius: 14, minHeight: 44, maxHeight: 120 }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading || !user}
            className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all duration-200 disabled:opacity-40 active:scale-95"
            style={{ background: 'linear-gradient(135deg, #00d2ff, #9b59ff)' }}
          >
            {isLoading
              ? <div className="w-4 h-4 rounded-full border-2 border-black border-t-transparent animate-spin" />
              : <Icon name="PaperAirplaneIcon" size={16} className="text-black" />
            }
          </button>
        </div>
      </div>
    </div>
  );
}
