'use client';
import React, { useState, useEffect, useRef } from 'react';
import Icon from '@/components/ui/AppIcon';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

interface LiveRoom {
  id: string;
  host: string;
  avatar: string;
  title: string;
  category: string;
  viewers: number;
  isLive: boolean;
  isGroup: boolean;
  groupName?: string;
  thumbnail: string;
  tags: string[];
  duration: string;
}

interface ChatMsg {
  id: number;
  user: string;
  text: string;
  color: string;
  gift?: string;
}

const GIFT_CONFIG: Record<string, {name: string;cost: number;}> = {
  '💎': { name: 'Diamond', cost: 50 },
  '🚀': { name: 'Rocket', cost: 30 },
  '🔥': { name: 'Fire', cost: 20 },
  '⭐': { name: 'Star', cost: 15 },
  '👑': { name: 'Crown', cost: 100 },
  '💰': { name: 'Money Bag', cost: 40 },
  '🎯': { name: 'Target', cost: 10 },
  '🌟': { name: 'Glowing Star', cost: 25 }
};

const liveRooms: LiveRoom[] = [
{ id: 'lr1', host: 'Nova_Star', avatar: 'NS', title: '🎵 Live DJ Set — Future Beats Vol.3', category: 'Music', viewers: 12840, isLive: true, isGroup: false, thumbnail: "https://img.rocket.new/generatedImages/rocket_gen_img_12b7d5410-1767677437942.png", tags: ['EDM', 'Live', 'DJ'], duration: '1:24:33' },
{ id: 'lr2', host: 'TechTalk Group', avatar: 'TT', title: '🤖 AI Revolution — Group Discussion', category: 'Tech', viewers: 8320, isLive: true, isGroup: true, groupName: 'Tech Innovators', thumbnail: "https://img.rocket.new/generatedImages/rocket_gen_img_198ad9e76-1766563899922.png", tags: ['AI', 'Tech', 'Group'], duration: '0:45:12' },
{ id: 'lr3', host: 'CryptoKing', avatar: 'CK', title: '💎 Diamond Hands — Crypto Analysis Live', category: 'Finance', viewers: 23100, isLive: true, isGroup: false, thumbnail: "https://images.unsplash.com/photo-1651044129930-e2aa0be74df2", tags: ['Crypto', 'Trading', 'Live'], duration: '2:10:05' },
{ id: 'lr4', host: 'ArtCollective', avatar: 'AC', title: '🎨 Digital Art Creation — Watch & Learn', category: 'Art', viewers: 4560, isLive: true, isGroup: true, groupName: 'Digital Artists', thumbnail: "https://img.rocket.new/generatedImages/rocket_gen_img_11502d10b-1767436448705.png", tags: ['Art', 'Design', 'Tutorial'], duration: '0:32:18' },
{ id: 'lr5', host: 'FitnessPro', avatar: 'FP', title: '💪 Morning Workout — Join Live!', category: 'Fitness', viewers: 6780, isLive: true, isGroup: false, thumbnail: "https://img.rocket.new/generatedImages/rocket_gen_img_104410f72-1773058542566.png", tags: ['Fitness', 'Health', 'Workout'], duration: '0:58:44' },
{ id: 'lr6', host: 'GamersUnite', avatar: 'GU', title: '🎮 Tournament Finals — Watch Party', category: 'Gaming', viewers: 45200, isLive: true, isGroup: true, groupName: 'Pro Gamers', thumbnail: "https://img.rocket.new/generatedImages/rocket_gen_img_13b568c04-1770510210068.png", tags: ['Gaming', 'Tournament', 'Esports'], duration: '3:02:11' }];

const initialChats: ChatMsg[] = [
{ id: 1, user: 'Alex_M', text: 'This is incredible! 🔥', color: '#00d2ff' },
{ id: 2, user: 'Sara_V', text: 'Love the energy tonight!', color: '#c084fc' },
{ id: 3, user: 'JohnDoe', text: 'First time watching, amazing!', color: '#34d399' },
{ id: 4, user: 'CryptoFan', text: '💎💎💎 Diamond hands!', color: '#fbbf24' },
{ id: 5, user: 'TechGuru', text: 'Can you explain the algorithm?', color: '#f87171' }];

const gifts = Object.keys(GIFT_CONFIG);

export default function LiveStreamScreen() {
  const { user } = useAuth();
  const supabase = createClient();
  const [activeTab, setActiveTab] = useState<'discover' | 'groups' | 'following' | 'schedule'>('discover');
  const [selectedRoom, setSelectedRoom] = useState<LiveRoom | null>(liveRooms[0]);
  const [chatMessages, setChatMessages] = useState<ChatMsg[]>(initialChats);
  const [chatInput, setChatInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [viewerCount, setViewerCount] = useState(liveRooms[0].viewers);
  const [showGifts, setShowGifts] = useState(false);
  const [filterCat, setFilterCat] = useState('All');
  const [userPoints, setUserPoints] = useState(0);
  const chatRef = useRef<HTMLDivElement>(null);

  const categories = ['All', 'Music', 'Tech', 'Finance', 'Art', 'Fitness', 'Gaming'];

  useEffect(() => {
    if (!user) return;
    supabase.
    from('user_points').
    select('balance').
    eq('user_id', user.id).
    single().
    then(({ data }) => {if (data) setUserPoints(data.balance);});
  }, [user]);

  useEffect(() => {
    const interval = setInterval(() => {
      setViewerCount((v) => v + Math.floor(Math.random() * 20 - 5));
      if (Math.random() > 0.6) {
        const names = ['User_' + Math.floor(Math.random() * 999), 'Viewer_' + Math.floor(Math.random() * 999)];
        const texts = ['Amazing! 🔥', 'Love this!', '💎 Diamond!', 'Keep going!', 'First time here!', '🚀🚀🚀'];
        const colors = ['#00d2ff', '#c084fc', '#34d399', '#fbbf24', '#f87171', '#a78bfa'];
        setChatMessages((prev) => [...prev.slice(-50), {
          id: Date.now(),
          user: names[Math.floor(Math.random() * names.length)],
          text: texts[Math.floor(Math.random() * texts.length)],
          color: colors[Math.floor(Math.random() * colors.length)]
        }]);
      }
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: 'smooth' });
  }, [chatMessages]);

  const sendChat = () => {
    if (!chatInput.trim()) return;
    setChatMessages((prev) => [...prev, { id: Date.now(), user: 'You', text: chatInput, color: '#00d2ff' }]);
    setChatInput('');
  };

  const sendGift = async (gift: string) => {
    if (!user) {toast.error('Sign in to send gifts');return;}
    const config = GIFT_CONFIG[gift];
    if (!config) return;

    if (userPoints < config.cost) {
      toast.error(`Not enough points! You need ${config.cost} points for ${config.name}`);
      setShowGifts(false);
      return;
    }

    // Optimistic UI update
    setChatMessages((prev) => [...prev, { id: Date.now(), user: 'You', text: `Sent a ${config.name} gift ${gift} (${config.cost} pts)`, color: '#fbbf24', gift }]);
    setShowGifts(false);
    setUserPoints((prev) => prev - config.cost);

    try {
      // Spend points from sender
      const { data: spent } = await supabase.rpc('spend_points', {
        p_user_id: user.id,
        p_amount: config.cost,
        p_type: 'gift_sent',
        p_reason: `Sent ${config.name} gift in live stream`,
        p_reference_id: selectedRoom?.id || null
      });

      if (!spent) {
        toast.error('Insufficient points');
        setUserPoints((prev) => prev + config.cost);
        return;
      }

      // Record gift transaction
      await supabase.from('live_stream_gifts').insert({
        sender_id: user.id,
        receiver_id: user.id, // In real app, use stream host's user_id
        stream_id: selectedRoom?.id,
        gift_emoji: gift,
        gift_name: config.name,
        points_cost: config.cost
      });

      toast.success(`${config.name} ${gift} sent! (-${config.cost} pts)`);
    } catch {
      toast.error('Failed to send gift');
      setUserPoints((prev) => prev + config.cost);
    }
  };

  const filteredRooms = filterCat === 'All' ? liveRooms : liveRooms.filter((r) => r.category === filterCat);

  return (
    <div className="flex h-full overflow-hidden">
      {/* Left: Room List */}
      <div className="w-80 flex-shrink-0 flex flex-col border-r" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        {/* Header */}
        <div className="p-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="font-700 text-slate-200 text-base flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                Live Now
              </h2>
              <p className="text-xs text-slate-500">{liveRooms.length} streams active</p>
            </div>
            <button
              onClick={() => setIsStreaming(!isStreaming)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-700 transition-all duration-200"
              style={isStreaming ?
              { background: 'rgba(239,68,68,0.2)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)' } :
              { background: 'linear-gradient(135deg, #00d2ff, #9b59ff)', color: '#050508' }}>
              
              <Icon name={isStreaming ? 'StopIcon' : 'VideoCameraIcon'} size={13} />
              {isStreaming ? 'Stop' : 'Go Live'}
            </button>
          </div>
          {/* Tabs */}
          <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }}>
            {(['discover', 'groups', 'following'] as const).map((t) =>
            <button key={t} onClick={() => setActiveTab(t)}
            className="flex-1 py-1.5 rounded-lg text-xs font-600 capitalize transition-all duration-200"
            style={activeTab === t ?
            { background: 'linear-gradient(135deg, #00d2ff, #9b59ff)', color: '#050508' } :
            { color: '#64748b' }}>
                {t}
              </button>
            )}
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex gap-1.5 px-3 py-2 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
          {categories.map((cat) =>
          <button key={cat} onClick={() => setFilterCat(cat)}
          className="flex-shrink-0 px-2.5 py-1 rounded-lg text-xs font-600 transition-all duration-150"
          style={filterCat === cat ?
          { background: 'rgba(0,210,255,0.2)', color: '#00d2ff', border: '1px solid rgba(0,210,255,0.3)' } :
          { background: 'rgba(255,255,255,0.04)', color: '#64748b' }}>
              {cat}
            </button>
          )}
        </div>

        {/* Room List */}
        <div className="flex-1 overflow-y-auto px-2 pb-4 space-y-2">
          {filteredRooms.map((room) =>
          <button key={room.id} onClick={() => {setSelectedRoom(room);setViewerCount(room.viewers);}}
          className="w-full text-left rounded-2xl overflow-hidden transition-all duration-200 group"
          style={{
            background: selectedRoom?.id === room.id ?
            'linear-gradient(135deg, rgba(0,210,255,0.12), rgba(155,89,255,0.08))' :
            'rgba(255,255,255,0.03)',
            border: selectedRoom?.id === room.id ?
            '1px solid rgba(0,210,255,0.3)' :
            '1px solid rgba(255,255,255,0.06)'
          }}>
              <div className="relative h-28 overflow-hidden">
                <img src={room.thumbnail} alt={room.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(5,5,8,0.9) 0%, transparent 60%)' }} />
                <div className="absolute top-2 left-2 flex items-center gap-1.5">
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-700"
                style={{ background: 'rgba(239,68,68,0.9)', color: 'white' }}>
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    LIVE
                  </span>
                  {room.isGroup &&
                <span className="px-2 py-0.5 rounded-full text-xs font-600"
                style={{ background: 'rgba(155,89,255,0.8)', color: 'white' }}>
                      GROUP
                    </span>
                }
                </div>
                <div className="absolute bottom-2 right-2 flex items-center gap-1 text-xs text-white font-600">
                  <Icon name="EyeIcon" size={12} />
                  {room.viewers.toLocaleString()}
                </div>
                <div className="absolute bottom-2 left-2 text-xs text-slate-300">{room.duration}</div>
              </div>
              <div className="p-2.5">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-700 flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #00d2ff, #9b59ff)', color: '#050508' }}>
                    {room.avatar}
                  </div>
                  <span className="text-xs font-600 text-slate-300 truncate">{room.host}</span>
                </div>
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{room.title}</p>
                <div className="flex gap-1 mt-1.5 flex-wrap">
                  {room.tags.slice(0, 2).map((tag) =>
                <span key={tag} className="text-xs px-1.5 py-0.5 rounded-md"
                style={{ background: 'rgba(0,210,255,0.1)', color: '#00d2ff' }}>
                      #{tag}
                    </span>
                )}
                </div>
              </div>
            </button>
          )}
        </div>
      </div>

      {/* Center: Video Player */}
      <div className="flex-1 flex flex-col min-w-0">
        {selectedRoom ?
        <>
            {/* Video Area */}
            <div className="relative flex-1 min-h-0 bg-black overflow-hidden">
              <img src={selectedRoom.thumbnail} alt={selectedRoom.title}
            className="w-full h-full object-cover opacity-60" />
              {/* Overlay gradient */}
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(5,5,8,0.95) 0%, rgba(5,5,8,0.2) 50%, transparent 100%)' }} />

              {/* Live badge */}
              <div className="absolute top-4 left-4 flex items-center gap-3">
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-700"
              style={{ background: 'rgba(239,68,68,0.9)', color: 'white', boxShadow: '0 0 20px rgba(239,68,68,0.5)' }}>
                  <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                  LIVE
                </span>
                {selectedRoom.isGroup &&
              <span className="px-3 py-1.5 rounded-full text-sm font-600"
              style={{ background: 'rgba(155,89,255,0.8)', color: 'white' }}>
                    👥 {selectedRoom.groupName}
                  </span>
              }
              </div>

              {/* Viewer count */}
              <div className="absolute top-4 right-4 flex items-center gap-2">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-600"
              style={{ background: 'rgba(0,0,0,0.6)', color: '#e2e8f0', backdropFilter: 'blur(8px)' }}>
                  <Icon name="EyeIcon" size={14} className="text-cyan-glow" />
                  {viewerCount.toLocaleString()} watching
                </div>
              </div>

              {/* Bottom info */}
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <div className="flex items-end justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-700"
                    style={{ background: 'linear-gradient(135deg, #00d2ff, #9b59ff)', color: '#050508' }}>
                        {selectedRoom.avatar}
                      </div>
                      <span className="font-700 text-white">{selectedRoom.host}</span>
                      <button className="px-3 py-1 rounded-full text-xs font-700"
                    style={{ background: 'linear-gradient(135deg, #00d2ff, #9b59ff)', color: '#050508' }}>
                        Follow
                      </button>
                    </div>
                    <h3 className="text-white font-600 text-sm">{selectedRoom.title}</h3>
                    <div className="flex gap-1.5 mt-1">
                      {selectedRoom.tags.map((tag) =>
                    <span key={tag} className="text-xs px-2 py-0.5 rounded-full"
                    style={{ background: 'rgba(255,255,255,0.15)', color: '#e2e8f0' }}>
                          #{tag}
                        </span>
                    )}
                    </div>
                  </div>
                  {/* Controls */}
                  <div className="flex items-center gap-2">
                    {[
                  { icon: 'HeartIcon', label: 'Like' },
                  { icon: 'ShareIcon', label: 'Share' },
                  { icon: 'BookmarkIcon', label: 'Save' }].
                  map((ctrl) =>
                  <button key={ctrl.label}
                  className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-150 hover:scale-110"
                  style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)' }}>
                        <Icon name={ctrl.icon as any} size={18} className="text-white" />
                      </button>
                  )}
                  </div>
                </div>
              </div>
            </div>

            {/* Go Live Banner */}
            {isStreaming &&
          <div className="px-4 py-3 flex items-center gap-3"
          style={{ background: 'linear-gradient(135deg, rgba(239,68,68,0.15), rgba(155,89,255,0.1))', borderTop: '1px solid rgba(239,68,68,0.3)' }}>
                <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                <span className="text-sm font-700 text-red-400">You are LIVE</span>
                <span className="text-xs text-slate-400">Streaming to your followers</span>
                <div className="ml-auto flex items-center gap-2">
                  <span className="text-xs text-slate-400">Duration: 00:00:00</span>
                  <button onClick={() => setIsStreaming(false)}
              className="px-3 py-1 rounded-lg text-xs font-700"
              style={{ background: 'rgba(239,68,68,0.2)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)' }}>
                    End Stream
                  </button>
                </div>
              </div>
          }
          </> :

        <div className="flex-1 flex items-center justify-center">
            <p className="text-slate-500">Select a live stream to watch</p>
          </div>
        }
      </div>

      {/* Right: Live Chat */}
      <div className="w-72 flex-shrink-0 flex flex-col border-l" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <div className="p-3 border-b flex items-center justify-between" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <span className="font-700 text-slate-200 text-sm flex items-center gap-2">
            <Icon name="ChatBubbleLeftRightIcon" size={15} className="text-cyan-glow" />
            Live Chat
          </span>
          {user &&
          <span className="text-xs font-600 px-2 py-1 rounded-lg" style={{ background: 'rgba(0,210,255,0.1)', color: '#6ee7f7' }}>
              💎 {userPoints} pts
            </span>
          }
        </div>

        {/* Messages */}
        <div ref={chatRef} className="flex-1 overflow-y-auto p-3 space-y-2">
          {chatMessages.map((msg) =>
          <div key={msg.id} className="flex items-start gap-2">
              <div className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-700 flex-shrink-0"
            style={{ background: msg.color, color: '#050508', fontSize: 8 }}>
                {msg.user[0]}
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-xs font-700 mr-1.5" style={{ color: msg.color }}>{msg.user}</span>
                <span className="text-xs text-slate-300">{msg.text}</span>
                {msg.gift && <span className="ml-1 text-base">{msg.gift}</span>}
              </div>
            </div>
          )}
        </div>

        {/* Gift selector */}
        {showGifts &&
        <div className="p-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <p className="text-xs text-slate-500 mb-2">Your points: <span className="text-cyan-400 font-600">{userPoints}</span></p>
          <div className="grid grid-cols-4 gap-2">
            {gifts.map((g) => {
              const cfg = GIFT_CONFIG[g];
              return (
                <button key={g} onClick={() => sendGift(g)}
                className="flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-150 hover:scale-110"
                style={{ background: 'rgba(255,255,255,0.05)' }}>
                  <span className="text-xl">{g}</span>
                  <span className="text-xs text-slate-500">{cfg.cost}pts</span>
                </button>);

            })}
          </div>
        </div>
        }

        {/* Chat Input */}
        <div className="p-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <div className="flex gap-2">
            <button onClick={() => setShowGifts(!showGifts)}
            className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-base transition-all duration-150"
            style={{ background: showGifts ? 'rgba(0,210,255,0.15)' : 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
              🎁
            </button>
            <input
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendChat()}
              placeholder="Say something..."
              className="flex-1 bg-transparent text-xs text-slate-300 placeholder-slate-600 outline-none px-3 py-2 rounded-xl"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }} />
            
            <button onClick={sendChat}
            className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-150"
            style={{ background: 'linear-gradient(135deg, #00d2ff, #9b59ff)' }}>
              <Icon name="PaperAirplaneIcon" size={14} className="text-ice-black" />
            </button>
          </div>
        </div>
      </div>
    </div>);

}