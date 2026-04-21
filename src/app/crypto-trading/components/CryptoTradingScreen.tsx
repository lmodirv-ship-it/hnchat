'use client';
import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import Icon from '@/components/ui/AppIcon';

interface Coin {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  volume: string;
  marketCap: string;
  emoji: string;
  color: string;
}

const generateChartData = (base: number, points = 30) =>
  Array.from({ length: points }, (_, i) => ({
    time: `${i}h`,
    price: base + (Math.random() - 0.48) * base * 0.05 * (i + 1),
    volume: Math.random() * 1000000,
  }));

const coins: Coin[] = [
  { id: 'hnc', symbol: 'HNC', name: 'hnCoin', price: 2.847, change24h: 12.4, volume: '$4.2M', marketCap: '$284M', emoji: '💎', color: '#00d2ff' },
  { id: 'btc', symbol: 'BTC', name: 'Bitcoin', price: 67420.5, change24h: 2.3, volume: '$28.4B', marketCap: '$1.32T', emoji: '₿', color: '#f7931a' },
  { id: 'eth', symbol: 'ETH', name: 'Ethereum', price: 3842.1, change24h: -1.2, volume: '$14.2B', marketCap: '$461B', emoji: 'Ξ', color: '#627eea' },
  { id: 'sol', symbol: 'SOL', name: 'Solana', price: 182.4, change24h: 5.8, volume: '$3.1B', marketCap: '$79B', emoji: '◎', color: '#9945ff' },
  { id: 'bnb', symbol: 'BNB', name: 'BNB', price: 412.8, change24h: 0.9, volume: '$1.8B', marketCap: '$63B', emoji: '⬡', color: '#f3ba2f' },
  { id: 'ada', symbol: 'ADA', name: 'Cardano', price: 0.624, change24h: -2.1, volume: '$890M', marketCap: '$22B', emoji: '₳', color: '#0033ad' },
  { id: 'dot', symbol: 'DOT', name: 'Polkadot', price: 8.92, change24h: 3.4, volume: '$420M', marketCap: '$11B', emoji: '●', color: '#e6007a' },
  { id: 'avax', symbol: 'AVAX', name: 'Avalanche', price: 38.7, change24h: 7.2, volume: '$680M', marketCap: '$15B', emoji: '▲', color: '#e84142' },
];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="px-3 py-2 rounded-xl text-xs"
        style={{ background: 'rgba(10,10,18,0.95)', border: '1px solid rgba(0,210,255,0.2)', backdropFilter: 'blur(12px)' }}>
        <p className="text-cyan-glow font-700">${payload[0].value.toFixed(2)}</p>
      </div>
    );
  }
  return null;
};

export default function CryptoTradingScreen() {
  const [selectedCoin, setSelectedCoin] = useState<Coin>(coins[0]);
  const [chartData, setChartData] = useState(generateChartData(coins[0].price));
  const [activeTab, setActiveTab] = useState<'market' | 'portfolio' | 'trade' | 'news'>('market');
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');
  const [amount, setAmount] = useState('');
  const [timeframe, setTimeframe] = useState('1D');
  const [prices, setPrices] = useState<Record<string, number>>(
    Object.fromEntries(coins.map(c => [c.id, c.price]))
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setPrices(prev => {
        const updated = { ...prev };
        coins.forEach(c => {
          updated[c.id] = prev[c.id] * (1 + (Math.random() - 0.499) * 0.002);
        });
        return updated;
      });
      setChartData(prev => {
        const last = prev[prev.length - 1];
        const newPoint = { time: 'now', price: last.price * (1 + (Math.random() - 0.499) * 0.003), volume: Math.random() * 1000000 };
        return [...prev.slice(1), newPoint];
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const selectCoin = (coin: Coin) => {
    setSelectedCoin(coin);
    setChartData(generateChartData(coin.price));
  };

  const portfolioItems = [
    { coin: coins[0], amount: 1250, value: 3558.75 },
    { coin: coins[1], amount: 0.05, value: 3371.03 },
    { coin: coins[2], amount: 1.2, value: 4610.52 },
    { coin: coins[3], amount: 45, value: 8208.0 },
  ];
  const totalPortfolio = portfolioItems.reduce((s, i) => s + i.value, 0);

  return (
    <div className="max-w-screen-2xl mx-auto px-4 lg:px-8 py-6 pb-24 lg:pb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-700 gradient-text">hnTrade</h1>
          <p className="text-sm text-slate-500 mt-0.5">Independent crypto trading — powered by hnChat</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-600"
            style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)', color: '#34d399' }}>
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            Markets Open
          </div>
          <button className="btn-glass flex items-center gap-2 text-xs">
            <Icon name="WalletIcon" size={14} />
            Connect Wallet
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 p-1 rounded-xl w-fit" style={{ background: 'rgba(255,255,255,0.04)' }}>
        {(['market', 'portfolio', 'trade', 'news'] as const).map(t => (
          <button key={t} onClick={() => setActiveTab(t)}
            className="px-5 py-2 rounded-lg text-sm font-600 capitalize transition-all duration-200"
            style={activeTab === t
              ? { background: 'linear-gradient(135deg, #00d2ff, #9b59ff)', color: '#050508' }
              : { color: '#64748b' }}>
            {t}
          </button>
        ))}
      </div>

      {activeTab === 'market' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Coin List */}
          <div className="lg:col-span-1 space-y-2">
            <h3 className="text-sm font-700 text-slate-400 mb-3 uppercase tracking-wider">All Markets</h3>
            {coins.map(coin => (
              <button key={coin.id} onClick={() => selectCoin(coin)}
                className="w-full flex items-center gap-3 p-3 rounded-2xl transition-all duration-200 text-left"
                style={{
                  background: selectedCoin.id === coin.id
                    ? 'linear-gradient(135deg, rgba(0,210,255,0.1), rgba(155,89,255,0.08))'
                    : 'rgba(255,255,255,0.03)',
                  border: selectedCoin.id === coin.id
                    ? '1px solid rgba(0,210,255,0.25)'
                    : '1px solid rgba(255,255,255,0.05)',
                }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg font-700 flex-shrink-0"
                  style={{ background: `${coin.color}22`, border: `1px solid ${coin.color}44` }}>
                  {coin.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-700 text-sm text-slate-200">{coin.symbol}</span>
                    <span className="font-700 text-sm text-slate-200">${prices[coin.id].toFixed(coin.price < 1 ? 4 : 2)}</span>
                  </div>
                  <div className="flex items-center justify-between mt-0.5">
                    <span className="text-xs text-slate-500">{coin.name}</span>
                    <span className={`text-xs font-700 ${coin.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {coin.change24h >= 0 ? '+' : ''}{coin.change24h}%
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Chart + Details */}
          <div className="lg:col-span-2 space-y-4">
            {/* Selected Coin Header */}
            <div className="glass-card p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
                    style={{ background: `${selectedCoin.color}22`, border: `1px solid ${selectedCoin.color}44` }}>
                    {selectedCoin.emoji}
                  </div>
                  <div>
                    <h2 className="font-800 text-xl text-slate-200">{selectedCoin.name}</h2>
                    <p className="text-sm text-slate-500">{selectedCoin.symbol}/USDT</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-800 gradient-text tabular-nums">
                    ${prices[selectedCoin.id].toFixed(selectedCoin.price < 1 ? 4 : 2)}
                  </p>
                  <p className={`text-sm font-700 ${selectedCoin.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {selectedCoin.change24h >= 0 ? '▲' : '▼'} {Math.abs(selectedCoin.change24h)}% (24h)
                  </p>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mb-4">
                {[
                  { label: 'Volume 24h', value: selectedCoin.volume },
                  { label: 'Market Cap', value: selectedCoin.marketCap },
                  { label: 'Rank', value: `#${coins.findIndex(c => c.id === selectedCoin.id) + 1}` },
                ].map(stat => (
                  <div key={stat.label} className="text-center p-3 rounded-xl"
                    style={{ background: 'rgba(255,255,255,0.04)' }}>
                    <p className="font-700 text-sm gradient-text-static">{stat.value}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{stat.label}</p>
                  </div>
                ))}
              </div>

              {/* Timeframe */}
              <div className="flex gap-1 mb-4">
                {['1H', '1D', '1W', '1M', '1Y'].map(tf => (
                  <button key={tf} onClick={() => setTimeframe(tf)}
                    className="px-3 py-1 rounded-lg text-xs font-600 transition-all duration-150"
                    style={timeframe === tf
                      ? { background: 'rgba(0,210,255,0.2)', color: '#00d2ff' }
                      : { color: '#64748b' }}>
                    {tf}
                  </button>
                ))}
              </div>

              {/* Chart */}
              <div style={{ height: 200 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="cryptoGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00d2ff" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#9b59ff" stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="time" hide />
                    <YAxis hide domain={['auto', 'auto']} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="price" stroke="#00d2ff" strokeWidth={2}
                      fill="url(#cryptoGrad)" dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Quick Trade */}
            <div className="glass-card p-5">
              <h3 className="font-700 text-slate-200 mb-4">Quick Trade</h3>
              <div className="flex gap-2 mb-4">
                {(['buy', 'sell'] as const).map(t => (
                  <button key={t} onClick={() => setTradeType(t)}
                    className="flex-1 py-2.5 rounded-xl text-sm font-700 capitalize transition-all duration-200"
                    style={tradeType === t
                      ? t === 'buy'
                        ? { background: 'rgba(52,211,153,0.2)', color: '#34d399', border: '1px solid rgba(52,211,153,0.3)' }
                        : { background: 'rgba(239,68,68,0.2)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)' }
                      : { background: 'rgba(255,255,255,0.04)', color: '#64748b' }}>
                    {t === 'buy' ? '▲ Buy' : '▼ Sell'} {selectedCoin.symbol}
                  </button>
                ))}
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-slate-400 mb-1.5 block">Amount (USDT)</label>
                  <input type="number" value={amount} onChange={e => setAmount(e.target.value)}
                    placeholder="0.00" className="input-glass text-sm" />
                </div>
                <div className="flex gap-2">
                  {['25%', '50%', '75%', '100%'].map(pct => (
                    <button key={pct} className="flex-1 py-1.5 rounded-lg text-xs font-600 transition-all duration-150"
                      style={{ background: 'rgba(255,255,255,0.05)', color: '#64748b' }}>
                      {pct}
                    </button>
                  ))}
                </div>
                <button className="w-full py-3 rounded-xl text-sm font-700 transition-all duration-200"
                  style={tradeType === 'buy'
                    ? { background: 'linear-gradient(135deg, #34d399, #059669)', color: 'white', boxShadow: '0 4px 20px rgba(52,211,153,0.3)' }
                    : { background: 'linear-gradient(135deg, #f87171, #dc2626)', color: 'white', boxShadow: '0 4px 20px rgba(239,68,68,0.3)' }}>
                  {tradeType === 'buy' ? `Buy ${selectedCoin.symbol}` : `Sell ${selectedCoin.symbol}`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'portfolio' && (
        <div className="max-w-2xl space-y-4">
          {/* Total Value */}
          <div className="glass-card p-6 text-center"
            style={{ background: 'linear-gradient(135deg, rgba(0,210,255,0.08), rgba(155,89,255,0.08))' }}>
            <p className="text-sm text-slate-400 mb-1">Total Portfolio Value</p>
            <p className="text-4xl font-800 gradient-text tabular-nums">${totalPortfolio.toFixed(2)}</p>
            <p className="text-sm text-green-400 font-600 mt-1">▲ +18.4% this month</p>
          </div>

          {/* Holdings */}
          <div className="space-y-3">
            {portfolioItems.map(item => (
              <div key={item.coin.id} className="glass-card p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                  style={{ background: `${item.coin.color}22` }}>
                  {item.coin.emoji}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-700 text-slate-200">{item.coin.symbol}</span>
                    <span className="font-700 gradient-text-static">${item.value.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">{item.amount} {item.coin.symbol}</span>
                    <span className={`text-xs font-600 ${item.coin.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {item.coin.change24h >= 0 ? '+' : ''}{item.coin.change24h}%
                    </span>
                  </div>
                  <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                    <div className="h-full rounded-full"
                      style={{ width: `${(item.value / totalPortfolio) * 100}%`, background: `linear-gradient(90deg, ${item.coin.color}, #9b59ff)` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'trade' && (
        <div className="max-w-lg">
          <div className="glass-card p-6 space-y-4">
            <h3 className="font-700 text-slate-200 text-lg">Advanced Trade</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Market Order', desc: 'Execute at current price', icon: '⚡' },
                { label: 'Limit Order', desc: 'Set your target price', icon: '🎯' },
                { label: 'Stop Loss', desc: 'Protect your position', icon: '🛡️' },
                { label: 'Take Profit', desc: 'Lock in your gains', icon: '💰' },
              ].map(order => (
                <button key={order.label} className="glass-card-hover p-4 text-left">
                  <span className="text-2xl mb-2 block">{order.icon}</span>
                  <p className="font-700 text-sm text-slate-200">{order.label}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{order.desc}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'news' && (
        <div className="max-w-2xl space-y-3">
          {[
            { title: 'hnCoin (HNC) surges 12% after major partnership announcement', time: '2 hours ago', source: 'hnChat News', tag: 'HNC', sentiment: 'bullish' },
            { title: 'Bitcoin breaks $68K resistance — analysts predict new ATH', time: '4 hours ago', source: 'CryptoDaily', tag: 'BTC', sentiment: 'bullish' },
            { title: 'Ethereum upgrade reduces gas fees by 40%', time: '6 hours ago', source: 'ETH Foundation', tag: 'ETH', sentiment: 'bullish' },
            { title: 'Global crypto market cap reaches $2.8 trillion', time: '8 hours ago', source: 'Bloomberg', tag: 'Market', sentiment: 'neutral' },
            { title: 'Solana DeFi ecosystem hits $15B TVL milestone', time: '12 hours ago', source: 'DeFi Pulse', tag: 'SOL', sentiment: 'bullish' },
          ].map((news, i) => (
            <div key={i} className="glass-card-hover p-4 flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-lg"
                style={{ background: news.sentiment === 'bullish' ? 'rgba(52,211,153,0.15)' : 'rgba(255,255,255,0.05)' }}>
                {news.sentiment === 'bullish' ? '📈' : '📊'}
              </div>
              <div className="flex-1">
                <p className="text-sm text-slate-300 font-500 leading-relaxed mb-2">{news.title}</p>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">{news.source}</span>
                  <span className="text-slate-700">·</span>
                  <span className="text-xs text-slate-500">{news.time}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full font-600"
                    style={{ background: 'rgba(0,210,255,0.1)', color: '#00d2ff' }}>
                    {news.tag}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
