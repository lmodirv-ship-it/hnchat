'use client';
import React, { useState, useRef, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';
import { useChat } from '@/lib/hooks/useChat';
import toast from 'react-hot-toast';

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
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, role: 'assistant', content: WELCOME_MSG, time: 'Now' }
  ]);
  const [input, setInput] = useState('');
  const [activeMode, setActiveMode] = useState<'chat' | 'image' | 'code'>('chat');
  const [conversationHistory, setConversationHistory] = useState<Array<{ role: string; content: string }>>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  const { response, isLoading, error, sendMessage } = useChat('OPEN_AI', 'gpt-4.1-mini', true);

  useEffect(() => {
    if (error) toast.error('AI service unavailable. Please try again.');
  }, [error]);

  // When streaming response updates, update the last assistant message
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

  // When streaming completes, finalize the message and update history
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
    }
  }, [isLoading]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const sendMsg = (text?: string) => {
    const msg = text || input;
    if (!msg.trim() || isLoading) return;

    const userMsg: Message = { id: Date.now(), role: 'user', content: msg, time: 'Now' };
    setMessages(prev => [...prev, userMsg, { id: -1, role: 'assistant', content: '...', time: 'Now' }]);
    setInput('');

    const newHistory = [...conversationHistory, { role: 'user', content: msg }];
    setConversationHistory(newHistory);

    const apiMessages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...newHistory,
    ];

    sendMessage(apiMessages, { max_completion_tokens: 1024 });
  };

  return (
    <div className="flex h-full bg-ice-black">
      {/* Left sidebar */}
      <div className="w-72 flex-shrink-0 border-r flex flex-col" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <div className="p-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl"
              style={{ background: 'linear-gradient(135deg, #00d2ff, #9b59ff)', boxShadow: '0 0 20px rgba(0,210,255,0.4)' }}>
              🤖
            </div>
            <div>
              <h2 className="font-700 gradient-text text-base">hnChat AI</h2>
              <p className="text-slate-500 text-xs">Diamond Intelligence</p>
            </div>
          </div>
          {/* Mode selector */}
          <div className="flex gap-1">
            {(['chat', 'image', 'code'] as const).map(mode => (
              <button key={mode} onClick={() => setActiveMode(mode)}
                className="flex-1 py-1.5 rounded-xl text-xs font-600 capitalize transition-all duration-200"
                style={activeMode === mode
                  ? { background: 'linear-gradient(135deg, #00d2ff, #9b59ff)', color: '#050508' }
                  : { background: 'rgba(255,255,255,0.05)', color: '#64748b' }}>
                {mode === 'chat' ? '💬' : mode === 'image' ? '🎨' : '💻'} {mode}
              </button>
            ))}
          </div>
        </div>

        {/* Suggestions */}
        <div className="p-3 flex-1 overflow-y-auto">
          <p className="text-xs font-600 uppercase tracking-widest mb-2" style={{ color: 'rgba(0,210,255,0.5)' }}>Quick Actions</p>
          <div className="space-y-1.5">
            {suggestions.map(s => (
              <button key={s} onClick={() => sendMsg(s)}
                disabled={isLoading}
                className="w-full text-left px-3 py-2.5 rounded-xl text-xs font-500 text-slate-400 transition-all duration-200 hover:text-slate-200 hover:bg-white/05 disabled:opacity-40"
                style={{ border: '1px solid rgba(255,255,255,0.05)' }}>
                {s}
              </button>
            ))}
          </div>

          {/* AI capabilities */}
          <p className="text-xs font-600 uppercase tracking-widest mt-4 mb-2" style={{ color: 'rgba(0,210,255,0.5)' }}>Capabilities</p>
          <div className="space-y-1.5">
            {[
              { icon: '✍️', label: 'Content Writing' },
              { icon: '📊', label: 'Data Analysis' },
              { icon: '🎨', label: 'Image Generation' },
              { icon: '💻', label: 'Code Assistant' },
              { icon: '🌐', label: 'Web Research' },
              { icon: '🎵', label: 'Music Suggestions' },
            ].map(cap => (
              <div key={cap.label} className="flex items-center gap-2 px-3 py-2 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.02)' }}>
                <span className="text-sm">{cap.icon}</span>
                <span className="text-slate-500 text-xs">{cap.label}</span>
                <span className="ml-auto text-xs px-1.5 py-0.5 rounded-full"
                  style={{ background: 'rgba(34,197,94,0.1)', color: '#22c55e' }}>Active</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Chat header */}
        <div className="p-4 border-b flex items-center gap-3" style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(5,5,8,0.8)' }}>
          <div className="w-8 h-8 rounded-xl flex items-center justify-center text-lg"
            style={{ background: 'linear-gradient(135deg, #00d2ff, #9b59ff)', boxShadow: '0 0 12px rgba(0,210,255,0.3)' }}>
            🤖
          </div>
          <div>
            <h3 className="font-700 text-slate-100 text-sm">hnChat AI Assistant</h3>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-slate-500 text-xs">
                {isLoading ? 'Thinking...' : 'Online · GPT-4.1 Mini'}
              </span>
            </div>
          </div>
          <div className="ml-auto flex gap-2">
            <button
              className="w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200 hover:bg-white/08"
              style={{ border: '1px solid rgba(255,255,255,0.08)' }}
              onClick={() => {
                setMessages([{ id: 1, role: 'assistant', content: WELCOME_MSG, time: 'Now' }]);
                setConversationHistory([]);
              }}>
              <Icon name="TrashIcon" size={14} className="text-slate-500" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map(msg => (
            <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm flex-shrink-0 ${msg.role === 'assistant' ? 'text-lg' : 'font-700'}`}
                style={msg.role === 'assistant'
                  ? { background: 'linear-gradient(135deg, #00d2ff, #9b59ff)', boxShadow: '0 0 10px rgba(0,210,255,0.3)' }
                  : { background: 'linear-gradient(135deg, #9b59ff, #e879f9)' }}>
                {msg.role === 'assistant' ? '🤖' : 'ME'}
              </div>
              <div className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${msg.role === 'user' ? 'rounded-tr-sm' : 'rounded-tl-sm'}`}
                style={msg.role === 'assistant'
                  ? { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#cbd5e1' }
                  : { background: 'linear-gradient(135deg, rgba(0,210,255,0.15), rgba(155,89,255,0.15))', border: '1px solid rgba(0,210,255,0.2)', color: '#e2e8f0' }}>
                {msg.id === -1 && msg.content === '...' ? (
                  <div className="flex items-center gap-1">
                    {[0, 1, 2].map(i => (
                      <span key={i} className="w-2 h-2 rounded-full animate-bounce"
                        style={{ background: '#00d2ff', animationDelay: `${i * 0.15}s` }} />
                    ))}
                  </div>
                ) : formatMessage(msg.content)}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(5,5,8,0.8)' }}>
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMsg()}
                placeholder="Ask hnChat AI anything..."
                disabled={isLoading}
                className="w-full px-4 py-3 pr-12 rounded-2xl text-sm text-slate-200 outline-none placeholder-slate-600 transition-all duration-200 disabled:opacity-60"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', boxShadow: input ? '0 0 0 2px rgba(0,210,255,0.15)' : 'none' }}
              />
              <button className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                <Icon name="MicrophoneIcon" size={16} />
              </button>
            </div>
            <button onClick={() => sendMsg()}
              disabled={!input.trim() || isLoading}
              className="w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-200 disabled:opacity-40 hover:scale-105"
              style={{ background: 'linear-gradient(135deg, #00d2ff, #9b59ff)', boxShadow: '0 0 16px rgba(0,210,255,0.3)' }}>
              {isLoading
                ? <Icon name="ArrowPathIcon" size={18} className="text-ice-black animate-spin" />
                : <Icon name="PaperAirplaneIcon" size={18} className="text-ice-black" />}
            </button>
          </div>
          <p className="text-center text-slate-600 text-xs mt-2">hnChat AI · Powered by GPT-4.1 Mini · Always learning ✨</p>
        </div>
      </div>
    </div>
  );
}
