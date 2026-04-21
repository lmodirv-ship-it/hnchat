'use client';
import React, { useState } from 'react';
import Icon from '@/components/ui/AppIcon';

interface Story {
  id: number;
  user: string;
  avatar: string;
  time: string;
  viewed: boolean;
  gradient: string;
  emoji: string;
}

const stories: Story[] = [
  { id: 1, user: 'Your Story', avatar: 'ME', time: 'Add story', viewed: false, gradient: 'from-cyan-500 to-violet-600', emoji: '➕' },
  { id: 2, user: 'Nova S.', avatar: 'NS', time: '2m ago', viewed: false, gradient: 'from-pink-500 to-rose-600', emoji: '🌟' },
  { id: 3, user: 'Zara F.', avatar: 'ZF', time: '15m ago', viewed: false, gradient: 'from-violet-500 to-purple-600', emoji: '💫' },
  { id: 4, user: 'Kai N.', avatar: 'KN', time: '1h ago', viewed: true, gradient: 'from-blue-500 to-cyan-600', emoji: '🔥' },
  { id: 5, user: 'Luna P.', avatar: 'LP', time: '2h ago', viewed: true, gradient: 'from-emerald-500 to-teal-600', emoji: '🎨' },
  { id: 6, user: 'Orion B.', avatar: 'OB', time: '3h ago', viewed: true, gradient: 'from-orange-500 to-amber-600', emoji: '⚡' },
];

const filters = ['None', 'Crystal', 'Neon', 'Vintage', 'Prism', 'Diamond', 'Aurora', 'Cyber'];
const stickers = ['💎', '🌟', '🔥', '💫', '⚡', '🎨', '🚀', '🌈', '❤️', '✨', '🎭', '🎪'];
const textStyles = ['Normal', 'Bold', 'Neon', 'Shadow', 'Outline', 'Rainbow'];

export default function StoriesEditorScreen() {
  const [activeStory, setActiveStory] = useState<Story | null>(null);
  const [activeTab, setActiveTab] = useState<'stories' | 'editor'>('stories');
  const [selectedFilter, setSelectedFilter] = useState('None');
  const [selectedSticker, setSelectedSticker] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [textStyle, setTextStyle] = useState('Normal');

  return (
    <div className="flex h-full bg-ice-black">
      {/* Left: Stories List */}
      <div className="w-80 flex-shrink-0 border-r flex flex-col" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        {/* Header */}
        <div className="p-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <h2 className="font-700 gradient-text text-lg">📸 Stories & Editor</h2>
          <p className="text-slate-500 text-xs mt-0.5">Create · Share · Discover</p>
        </div>

        {/* Tabs */}
        <div className="flex p-3 gap-2">
          {(['stories', 'editor'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className="flex-1 py-2 rounded-xl text-sm font-600 capitalize transition-all duration-200"
              style={activeTab === tab
                ? { background: 'linear-gradient(135deg, #00d2ff, #9b59ff)', color: '#050508' }
                : { background: 'rgba(255,255,255,0.05)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.08)' }}>
              {tab === 'stories' ? '📖 Stories' : '🎨 Editor'}
            </button>
          ))}
        </div>

        {activeTab === 'stories' ? (
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {stories.map(story => (
              <button key={story.id} onClick={() => setActiveStory(story)}
                className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all duration-200 text-left ${activeStory?.id === story.id ? 'glass-card' : 'hover:bg-white/04'}`}>
                <div className="relative flex-shrink-0">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-700 bg-gradient-to-br ${story.gradient}`}
                    style={!story.viewed ? { boxShadow: '0 0 0 2px #00d2ff, 0 0 12px rgba(0,210,255,0.4)' } : {}}>
                    {story.id === 1 ? '➕' : story.avatar}
                  </div>
                  {!story.viewed && story.id !== 1 && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full" style={{ background: '#00d2ff', boxShadow: '0 0 6px #00d2ff' }} />
                  )}
                </div>
                <div>
                  <p className="text-slate-200 text-sm font-600">{story.user}</p>
                  <p className="text-slate-500 text-xs">{story.time}</p>
                </div>
              </button>
            ))}
          </div>
        ) : (
          /* Editor Tools Panel */
          <div className="flex-1 overflow-y-auto p-3 space-y-4">
            {/* Filters */}
            <div>
              <p className="text-xs font-600 uppercase tracking-widest mb-2" style={{ color: 'rgba(0,210,255,0.6)' }}>Filters</p>
              <div className="grid grid-cols-4 gap-2">
                {filters.map(f => (
                  <button key={f} onClick={() => setSelectedFilter(f)}
                    className="py-2 rounded-xl text-xs font-500 transition-all duration-200"
                    style={selectedFilter === f
                      ? { background: 'linear-gradient(135deg, rgba(0,210,255,0.3), rgba(155,89,255,0.3))', color: '#00d2ff', border: '1px solid rgba(0,210,255,0.4)' }
                      : { background: 'rgba(255,255,255,0.04)', color: '#64748b', border: '1px solid rgba(255,255,255,0.06)' }}>
                    {f}
                  </button>
                ))}
              </div>
            </div>
            {/* Stickers */}
            <div>
              <p className="text-xs font-600 uppercase tracking-widest mb-2" style={{ color: 'rgba(0,210,255,0.6)' }}>Stickers</p>
              <div className="grid grid-cols-6 gap-2">
                {stickers.map(s => (
                  <button key={s} onClick={() => setSelectedSticker(s)}
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-lg transition-all duration-200 hover:scale-110"
                    style={selectedSticker === s
                      ? { background: 'rgba(0,210,255,0.2)', border: '1px solid rgba(0,210,255,0.4)' }
                      : { background: 'rgba(255,255,255,0.04)' }}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
            {/* Text Style */}
            <div>
              <p className="text-xs font-600 uppercase tracking-widest mb-2" style={{ color: 'rgba(0,210,255,0.6)' }}>Text Style</p>
              <div className="grid grid-cols-3 gap-2">
                {textStyles.map(ts => (
                  <button key={ts} onClick={() => setTextStyle(ts)}
                    className="py-2 rounded-xl text-xs font-500 transition-all duration-200"
                    style={textStyle === ts
                      ? { background: 'linear-gradient(135deg, rgba(155,89,255,0.3), rgba(0,210,255,0.3))', color: '#c084fc', border: '1px solid rgba(155,89,255,0.4)' }
                      : { background: 'rgba(255,255,255,0.04)', color: '#64748b', border: '1px solid rgba(255,255,255,0.06)' }}>
                    {ts}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Center: Story Preview / Editor Canvas */}
      <div className="flex-1 flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 30% 20%, rgba(0,210,255,0.05) 0%, transparent 60%), radial-gradient(ellipse at 70% 80%, rgba(155,89,255,0.05) 0%, transparent 60%)' }} />

        {activeStory ? (
          <div className="relative z-10 w-80 h-[560px] rounded-3xl overflow-hidden glass-card">
            {/* Story content */}
            <div className={`absolute inset-0 bg-gradient-to-br ${activeStory.gradient} opacity-40`} />
            <div className="absolute inset-0 flex flex-col">
              {/* Progress bar */}
              <div className="flex gap-1 p-3">
                {stories.slice(1).map((_, i) => (
                  <div key={i} className="flex-1 h-0.5 rounded-full" style={{ background: i === (activeStory.id - 2) ? '#00d2ff' : 'rgba(255,255,255,0.3)' }} />
                ))}
              </div>
              {/* User info */}
              <div className="flex items-center gap-2 px-4 py-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-700 bg-gradient-to-br ${activeStory.gradient}`}>
                  {activeStory.avatar}
                </div>
                <span className="text-white font-600 text-sm">{activeStory.user}</span>
                <span className="text-white/60 text-xs ml-auto">{activeStory.time}</span>
              </div>
              {/* Main content */}
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-4">{activeStory.emoji}</div>
                  <p className="text-white font-700 text-xl px-6 text-center" style={{ textShadow: '0 0 20px rgba(0,210,255,0.5)' }}>
                    {activeStory.user}&apos;s Story
                  </p>
                  {selectedSticker && (
                    <div className="text-4xl mt-4 animate-bounce">{selectedSticker}</div>
                  )}
                  {selectedFilter !== 'None' && (
                    <div className="mt-3 px-3 py-1 rounded-full text-xs font-600 inline-block"
                      style={{ background: 'rgba(0,210,255,0.2)', color: '#00d2ff', border: '1px solid rgba(0,210,255,0.3)' }}>
                      Filter: {selectedFilter}
                    </div>
                  )}
                </div>
              </div>
              {/* Caption input */}
              <div className="p-4">
                <input value={caption} onChange={e => setCaption(e.target.value)}
                  placeholder="Add a caption..."
                  className="w-full bg-transparent text-white text-sm text-center outline-none placeholder-white/40 border-b border-white/20 pb-2" />
              </div>
              {/* Reply bar */}
              <div className="flex items-center gap-2 px-4 pb-4">
                <div className="flex-1 px-3 py-2 rounded-full text-sm text-white/60"
                  style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' }}>
                  Reply to {activeStory.user}...
                </div>
                <button className="w-9 h-9 rounded-full flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #00d2ff, #9b59ff)' }}>
                  <Icon name="PaperAirplaneIcon" size={16} className="text-ice-black" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="relative z-10 text-center">
            <div className="w-24 h-24 rounded-3xl mx-auto mb-6 flex items-center justify-center text-4xl"
              style={{ background: 'linear-gradient(135deg, rgba(0,210,255,0.15), rgba(155,89,255,0.15))', border: '1px solid rgba(0,210,255,0.2)' }}>
              📸
            </div>
            <h3 className="text-xl font-700 gradient-text mb-2">Stories & Media Editor</h3>
            <p className="text-slate-500 text-sm">Select a story to view or use the Editor tab to create</p>
            <button className="btn-primary mt-6 flex items-center gap-2 mx-auto">
              <Icon name="PlusCircleIcon" size={18} />
              Create New Story
            </button>
          </div>
        )}
      </div>

      {/* Right: Story Actions */}
      <div className="hidden xl:flex flex-col w-64 border-l" style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(5,5,8,0.95)' }}>
        <div className="p-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <h3 className="font-600 text-slate-200 text-sm">Story Actions</h3>
        </div>
        <div className="p-3 space-y-2">
          {[
            { icon: 'CameraIcon', label: 'Take Photo', color: '#00d2ff' },
            { icon: 'VideoCameraIcon', label: 'Record Video', color: '#9b59ff' },
            { icon: 'PhotoIcon', label: 'Upload Media', color: '#e879f9' },
            { icon: 'SparklesIcon', label: 'AI Generate', color: '#f59e0b' },
            { icon: 'MusicalNoteIcon', label: 'Add Music', color: '#10b981' },
            { icon: 'MapPinIcon', label: 'Add Location', color: '#ef4444' },
          ].map(action => (
            <button key={action.label}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl transition-all duration-200 hover:bg-white/05 text-left"
              style={{ border: '1px solid rgba(255,255,255,0.05)' }}>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: `${action.color}20`, border: `1px solid ${action.color}30` }}>
                <Icon name={action.icon as any} size={16} style={{ color: action.color }} />
              </div>
              <span className="text-slate-300 text-sm font-500">{action.label}</span>
            </button>
          ))}
        </div>
        {/* Publish button */}
        <div className="mt-auto p-3">
          <button className="btn-primary w-full text-sm py-2.5 flex items-center justify-center gap-2">
            <Icon name="PaperAirplaneIcon" size={16} />
            Publish Story
          </button>
        </div>
      </div>
    </div>
  );
}
