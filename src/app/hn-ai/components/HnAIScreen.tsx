'use client';
import React, { useState, useRef, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';

interface Message {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  time: string;
  model?: string;
}

interface AIModel {
  id: string;
  name: string;
  provider: string;
  description: string;
  icon: string;
  color: string;
  capabilities: string[];
  free: boolean;
}

const aiModels: AIModel[] = [
  { id: 'hn-diamond', name: 'hn Diamond AI', provider: 'hnChat', description: 'Our flagship model — combines best of open source', icon: '💎', color: '#00d2ff', capabilities: ['Chat', 'Analysis', 'Code', 'Creative'], free: true },
  { id: 'gemini-pro', name: 'Gemini Pro', provider: 'Google', description: 'Powerful multimodal AI from Google', icon: '✨', color: '#4285f4', capabilities: ['Chat', 'Vision', 'Code', 'Analysis'], free: true },
  { id: 'llama3', name: 'LLaMA 3', provider: 'Meta (Open Source)', description: 'Meta\'s open-source language model', icon: '🦙', color: '#0668e1', capabilities: ['Chat', 'Code', 'Analysis'], free: true },
  { id: 'mistral', name: 'Mistral 7B', provider: 'Mistral AI', description: 'Fast, efficient open-source model', icon: '🌪️', color: '#ff7000', capabilities: ['Chat', 'Code', 'Fast'], free: true },
  { id: 'deepseek', name: 'DeepSeek R1', provider: 'DeepSeek', description: 'Advanced reasoning open-source model', icon: '🔍', color: '#1a73e8', capabilities: ['Reasoning', 'Math', 'Code'], free: true },
  { id: 'phi3', name: 'Phi-3 Mini', provider: 'Microsoft', description: 'Small but powerful open-source model', icon: '⚡', color: '#00a4ef', capabilities: ['Chat', 'Fast', 'Efficient'], free: true },
];

const aiCapabilities = [
  { id: 'chat', icon: '💬', label: 'Smart Chat', desc: 'Natural conversations in any language' },
  { id: 'code', icon: '💻', label: 'Code Assistant', desc: 'Write, debug & explain code' },
  { id: 'image', icon: '🎨', label: 'Image Analysis', desc: 'Understand and describe images' },
  { id: 'translate', icon: '🌐', label: 'Translation', desc: 'Translate between 100+ languages' },
  { id: 'summarize', icon: '📝', label: 'Summarize', desc: 'Condense long content instantly' },
  { id: 'creative', icon: '✍️', label: 'Creative Writing', desc: 'Stories, posts, captions & more' },
];

const suggestions = [
  '💎 اشرح لي كيف يعمل الذكاء الاصطناعي',
  '🚀 Write a viral social media post',
  '💻 Debug this JavaScript code',
  '🌍 Translate to Arabic: Hello World',
  '📊 Analyze market trends for 2026',
  '🎨 Generate a creative story about hnChat',
];

function getSmartResponse(input: string, model: AIModel): string {
  const lower = input.toLowerCase();
  const modelPrefix = `**[${model.name}]** `;

  if (lower.includes('كيف') || lower.includes('اشرح') || lower.includes('ما هو')) {
    return `${modelPrefix}\n\nأهلاً! سأشرح لك بكل سرور 🌟\n\n**${input}**\n\nالذكاء الاصطناعي هو تقنية تمكن الحواسيب من محاكاة التفكير البشري. يعمل من خلال:\n\n1. **التعلم الآلي** — يتعلم من البيانات الضخمة\n2. **الشبكات العصبية** — تحاكي دماغ الإنسان\n3. **معالجة اللغة الطبيعية** — يفهم ويولد النصوص\n\nهل تريد مزيداً من التفاصيل؟ 💎`;
  }
  if (lower.includes('code') || lower.includes('debug') || lower.includes('javascript') || lower.includes('python')) {
    return `${modelPrefix}\n\nHere's the solution for your code request:\n\n\`\`\`javascript\n// Diamond-grade solution ✨\nconst hnChatAI = {\n  name: "hn Diamond AI",\n  version: "2.0",\n  capabilities: ["chat", "code", "analysis"],\n  \n  async process(input) {\n    const response = await this.analyze(input);\n    return this.format(response);\n  }\n};\n\nconsole.log("hnChat AI is ready! 💎");\n\`\`\`\n\nThis code is optimized for performance and follows best practices. Need any modifications?`;
  }
  if (lower.includes('translate') || lower.includes('arabic') || lower.includes('ترجم')) {
    return `${modelPrefix}\n\n**Translation Result:**\n\n🇬🇧 English: "Hello World"\n🇸🇦 Arabic: "مرحباً بالعالم"\n🇫🇷 French: "Bonjour le Monde"\n🇪🇸 Spanish: "Hola Mundo"\n🇨🇳 Chinese: "你好世界"\n🇯🇵 Japanese: "こんにちは世界"\n\nI support 100+ languages! Which language do you need? 🌍`;
  }
  if (lower.includes('post') || lower.includes('caption') || lower.includes('viral') || lower.includes('social')) {
    return `${modelPrefix}\n\n**🚀 Viral Post Ideas:**\n\n**Option 1 (Inspirational):**\n"💎 In a world full of ordinary, dare to be diamond. Your story is unique — share it with the world. #hnChat #DiamondMindset"\n\n**Option 2 (Engaging):**\n"What if one app could replace ALL your apps? 🤯 Meet hnChat — the super app that does everything. Drop a 💎 if you're in!"\n\n**Option 3 (Arabic):**\n"عندما يجتمع الإبداع والتقنية، تولد المعجزات 💎 #hnChat #المستقبل_هنا"\n\nWhich style fits your brand?`;
  }
  if (lower.includes('market') || lower.includes('trend') || lower.includes('analyz')) {
    return `${modelPrefix}\n\n**📊 Market Analysis 2026:**\n\n**Top Trends:**\n• 🤖 AI Integration: +340% growth\n• 💎 Crypto Markets: Bullish cycle\n• 📱 Super Apps: Dominating mobile\n• 🌍 Emerging Markets: Fastest growth\n\n**hnChat Opportunity:**\n• TAM: $2.8 Trillion\n• User Growth: +180% YoY\n• Revenue Potential: $4.2B by 2027\n\n**Recommendation:** Focus on MENA + Asia markets for maximum growth 🚀`;
  }
  return `${modelPrefix}\n\nGreat question! Here's my analysis of **"${input}"**:\n\nAs your diamond-grade AI assistant powered by open-source models, I've processed your request and here's what I found:\n\n✅ **Key Insights:**\n• The topic is highly relevant in today's context\n• Multiple perspectives should be considered\n• Data-driven decisions lead to better outcomes\n\n💡 **My Recommendation:**\nApproach this systematically — define your goal, gather data, analyze patterns, and act decisively.\n\nWould you like me to dive deeper into any specific aspect? I'm here 24/7! 💎`;
}

export default function HnAIScreen() {
  const [selectedModel, setSelectedModel] = useState<AIModel>(aiModels[0]);
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, role: 'assistant', content: '**مرحباً! أنا hn Diamond AI** 💎\n\nأنا نظام الذكاء الاصطناعي المدمج في hnChat، مبني من أفضل النماذج مفتوحة المصدر.\n\nيمكنني مساعدتك في:\n• 💬 المحادثة بأي لغة\n• 💻 كتابة وتصحيح الكود\n• 🎨 إنشاء المحتوى الإبداعي\n• 📊 تحليل البيانات والأسواق\n• 🌍 الترجمة الفورية\n\nكيف يمكنني مساعدتك اليوم؟', time: 'Now', model: 'hn Diamond AI' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'models' | 'capabilities' | 'history'>('chat');
  const [showModelPicker, setShowModelPicker] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const sendMessage = (text?: string) => {
    const msg = text || input;
    if (!msg.trim()) return;
    const userMsg: Message = { id: Date.now(), role: 'user', content: msg, time: 'Now' };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);
    const delay = 800 + Math.random() * 800;
    setTimeout(() => {
      const aiMsg: Message = {
        id: Date.now() + 1,
        role: 'assistant',
        content: getSmartResponse(msg, selectedModel),
        time: 'Now',
        model: selectedModel.name,
      };
      setMessages(prev => [...prev, aiMsg]);
      setIsTyping(false);
    }, delay);
  };

  const formatContent = (text: string) => {
    return text.split('\n').map((line, i) => {
      const formatted = line
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/`(.*?)`/g, '<code style="background:rgba(0,210,255,0.1);padding:1px 6px;border-radius:4px;font-family:monospace;font-size:11px">$1</code>');
      return <p key={i} className="mb-0.5 last:mb-0" dangerouslySetInnerHTML={{ __html: formatted }} />;
    });
  };

  return (
    <div className="flex h-full overflow-hidden">
      {/* Left Sidebar */}
      <div className="w-72 flex-shrink-0 flex flex-col border-r" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <div className="p-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-2xl"
              style={{ background: 'linear-gradient(135deg, #00d2ff, #9b59ff)', boxShadow: '0 0 24px rgba(0,210,255,0.4)' }}>
              💎
            </div>
            <div>
              <h2 className="font-700 gradient-text text-base">hn AI Hub</h2>
              <p className="text-xs text-slate-500">Open Source Intelligence</p>
            </div>
          </div>
          {/* Tabs */}
          <div className="grid grid-cols-2 gap-1">
            {(['chat', 'models', 'capabilities', 'history'] as const).map(t => (
              <button key={t} onClick={() => setActiveTab(t)}
                className="py-1.5 rounded-xl text-xs font-600 capitalize transition-all duration-200"
                style={activeTab === t
                  ? { background: 'linear-gradient(135deg, #00d2ff, #9b59ff)', color: '#050508' }
                  : { background: 'rgba(255,255,255,0.05)', color: '#64748b' }}>
                {t}
              </button>
            ))}
          </div>
        </div>

        {activeTab === 'chat' && (
          <>
            {/* Active Model */}
            <div className="p-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
              <p className="text-xs text-slate-500 mb-2">Active Model</p>
              <button onClick={() => setShowModelPicker(!showModelPicker)}
                className="w-full flex items-center gap-2 p-2.5 rounded-xl transition-all duration-150"
                style={{ background: `${selectedModel.color}15`, border: `1px solid ${selectedModel.color}33` }}>
                <span className="text-xl">{selectedModel.icon}</span>
                <div className="flex-1 text-left">
                  <p className="text-xs font-700 text-slate-200">{selectedModel.name}</p>
                  <p className="text-xs text-slate-500">{selectedModel.provider}</p>
                </div>
                <Icon name="ChevronDownIcon" size={13} className="text-slate-500" />
              </button>
              {showModelPicker && (
                <div className="mt-2 space-y-1">
                  {aiModels.map(m => (
                    <button key={m.id} onClick={() => { setSelectedModel(m); setShowModelPicker(false); }}
                      className="w-full flex items-center gap-2 p-2 rounded-xl transition-all duration-150 text-left"
                      style={selectedModel.id === m.id
                        ? { background: `${m.color}20`, border: `1px solid ${m.color}40` }
                        : { background: 'rgba(255,255,255,0.03)' }}>
                      <span className="text-base">{m.icon}</span>
                      <div>
                        <p className="text-xs font-600 text-slate-300">{m.name}</p>
                        <p className="text-xs text-slate-600">{m.provider}</p>
                      </div>
                      {m.free && (
                        <span className="ml-auto text-xs px-1.5 py-0.5 rounded-md font-700"
                          style={{ background: 'rgba(52,211,153,0.15)', color: '#34d399' }}>
                          FREE
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Suggestions */}
            <div className="flex-1 overflow-y-auto p-3">
              <p className="text-xs text-slate-500 mb-2">Quick Prompts</p>
              <div className="space-y-1.5">
                {suggestions.map((s, i) => (
                  <button key={i} onClick={() => sendMessage(s)}
                    className="w-full text-left text-xs text-slate-400 p-2.5 rounded-xl transition-all duration-150 hover:text-slate-200"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {activeTab === 'models' && (
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {aiModels.map(model => (
              <div key={model.id} className="p-3 rounded-2xl"
                style={{ background: `${model.color}10`, border: `1px solid ${model.color}25` }}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">{model.icon}</span>
                  <div>
                    <p className="text-xs font-700 text-slate-200">{model.name}</p>
                    <p className="text-xs text-slate-500">{model.provider}</p>
                  </div>
                  {model.free && (
                    <span className="ml-auto text-xs px-1.5 py-0.5 rounded-md font-700"
                      style={{ background: 'rgba(52,211,153,0.15)', color: '#34d399' }}>
                      FREE
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mb-2">{model.description}</p>
                <div className="flex flex-wrap gap-1">
                  {model.capabilities.map(cap => (
                    <span key={cap} className="text-xs px-1.5 py-0.5 rounded-md"
                      style={{ background: `${model.color}20`, color: model.color }}>
                      {cap}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'capabilities' && (
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {aiCapabilities.map(cap => (
              <div key={cap.id} className="p-3 rounded-2xl glass-card-hover cursor-pointer">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{cap.icon}</span>
                  <div>
                    <p className="text-xs font-700 text-slate-200">{cap.label}</p>
                    <p className="text-xs text-slate-500">{cap.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {['Diamond AI Analysis', 'Code Review Session', 'Arabic Translation', 'Market Research', 'Creative Writing'].map((h, i) => (
              <button key={i} className="w-full text-left p-3 rounded-xl transition-all duration-150"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <p className="text-xs font-600 text-slate-300">{h}</p>
                <p className="text-xs text-slate-600 mt-0.5">{i + 1} day{i > 0 ? 's' : ''} ago</p>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Chat Header */}
        <div className="px-5 py-3 border-b flex items-center justify-between" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center text-base"
              style={{ background: `${selectedModel.color}20`, border: `1px solid ${selectedModel.color}40` }}>
              {selectedModel.icon}
            </div>
            <div>
              <p className="text-sm font-700 text-slate-200">{selectedModel.name}</p>
              <p className="text-xs text-slate-500">{selectedModel.provider} · Free Open Source</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-xl transition-all duration-150 hover:bg-white/05">
              <Icon name="TrashIcon" size={15} className="text-slate-500" />
            </button>
            <button className="p-2 rounded-xl transition-all duration-150 hover:bg-white/05">
              <Icon name="ShareIcon" size={15} className="text-slate-500" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.map(msg => (
            <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center text-sm flex-shrink-0"
                style={msg.role === 'assistant'
                  ? { background: 'linear-gradient(135deg, #00d2ff, #9b59ff)', color: '#050508' }
                  : { background: 'rgba(255,255,255,0.1)', color: '#e2e8f0' }}>
                {msg.role === 'assistant' ? '💎' : '👤'}
              </div>
              <div className={`max-w-[75%] ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col`}>
                {msg.model && (
                  <p className="text-xs text-slate-600 mb-1 px-1">{msg.model}</p>
                )}
                <div className="px-4 py-3 rounded-2xl text-sm leading-relaxed"
                  style={msg.role === 'assistant'
                    ? { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#cbd5e1' }
                    : { background: 'linear-gradient(135deg, rgba(0,210,255,0.2), rgba(155,89,255,0.15))', border: '1px solid rgba(0,210,255,0.2)', color: '#e2e8f0' }}>
                  {formatContent(msg.content)}
                </div>
                <p className="text-xs text-slate-600 mt-1 px-1">{msg.time}</p>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center text-sm"
                style={{ background: 'linear-gradient(135deg, #00d2ff, #9b59ff)', color: '#050508' }}>
                💎
              </div>
              <div className="px-4 py-3 rounded-2xl flex items-center gap-1"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                {[0, 1, 2].map(i => (
                  <span key={i} className="w-2 h-2 rounded-full bg-cyan-glow animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <div className="flex gap-3 items-end">
            <div className="flex-1 relative">
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                placeholder={`Ask ${selectedModel.name} anything...`}
                rows={1}
                className="w-full bg-transparent text-sm text-slate-300 placeholder-slate-600 outline-none px-4 py-3 rounded-2xl resize-none"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', maxHeight: 120 }}
              />
            </div>
            <button onClick={() => sendMessage()}
              disabled={!input.trim() || isTyping}
              className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all duration-200 disabled:opacity-40"
              style={{ background: 'linear-gradient(135deg, #00d2ff, #9b59ff)', boxShadow: '0 4px 16px rgba(0,210,255,0.3)' }}>
              <Icon name="PaperAirplaneIcon" size={18} className="text-ice-black" />
            </button>
          </div>
          <p className="text-xs text-slate-600 text-center mt-2">
            Powered by open-source AI models · Free forever · No data stored
          </p>
        </div>
      </div>
    </div>
  );
}
