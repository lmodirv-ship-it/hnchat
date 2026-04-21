'use client';
import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import Icon from '@/components/ui/AppIcon';

interface AdCampaign {
  id: string;
  name: string;
  status: 'active' | 'paused' | 'completed' | 'draft';
  type: string;
  budget: number;
  spent: number;
  impressions: number;
  clicks: number;
  conversions: number;
  ctr: number;
  startDate: string;
  endDate: string;
  thumbnail: string;
  thumbnailAlt: string;
}

const campaigns: AdCampaign[] = [
{ id: 'c1', name: 'Diamond Summer Sale 2026', status: 'active', type: 'Video Ad', budget: 5000, spent: 2840, impressions: 1240000, clicks: 48600, conversions: 2340, ctr: 3.92, startDate: 'Apr 1', endDate: 'Apr 30', thumbnail: "https://img.rocket.new/generatedImages/rocket_gen_img_1807d1081-1772198622174.png", thumbnailAlt: 'Summer sale promotional banner with colorful products' },
{ id: 'c2', name: 'hnShop Product Launch', status: 'active', type: 'Banner Ad', budget: 3000, spent: 1920, impressions: 890000, clicks: 32100, conversions: 1560, ctr: 3.61, startDate: 'Apr 5', endDate: 'May 5', thumbnail: "https://img.rocket.new/generatedImages/rocket_gen_img_1d4804806-1772950389099.png", thumbnailAlt: 'Product launch advertisement with tech gadgets' },
{ id: 'c3', name: 'Crypto Trading Awareness', status: 'paused', type: 'Story Ad', budget: 2000, spent: 890, impressions: 420000, clicks: 18900, conversions: 780, ctr: 4.5, startDate: 'Mar 20', endDate: 'Apr 20', thumbnail: "https://img.rocket.new/generatedImages/rocket_gen_img_1b245e75a-1776339331285.png", thumbnailAlt: 'Cryptocurrency trading chart advertisement' },
{ id: 'c4', name: 'hnChat App Download', status: 'completed', type: 'Carousel Ad', budget: 8000, spent: 8000, impressions: 3200000, clicks: 128000, conversions: 45600, ctr: 4.0, startDate: 'Mar 1', endDate: 'Mar 31', thumbnail: "https://img.rocket.new/generatedImages/rocket_gen_img_111e56bd9-1769312987323.png", thumbnailAlt: 'Mobile app download advertisement' }];


const performanceData = [
{ day: 'Mon', impressions: 180000, clicks: 7200, conversions: 340 },
{ day: 'Tue', impressions: 220000, clicks: 8800, conversions: 420 },
{ day: 'Wed', impressions: 195000, clicks: 7800, conversions: 380 },
{ day: 'Thu', impressions: 260000, clicks: 10400, conversions: 510 },
{ day: 'Fri', impressions: 310000, clicks: 12400, conversions: 620 },
{ day: 'Sat', impressions: 280000, clicks: 11200, conversions: 560 },
{ day: 'Sun', impressions: 240000, clicks: 9600, conversions: 480 }];


const adFormats = [
{ id: 'video', icon: '🎬', name: 'Video Ad', desc: 'Up to 60 seconds, auto-play in feed', reach: '2.4M+', cpm: '$4.20' },
{ id: 'story', icon: '📱', name: 'Story Ad', desc: 'Full-screen immersive experience', reach: '1.8M+', cpm: '$3.80' },
{ id: 'banner', icon: '🖼️', name: 'Banner Ad', desc: 'Static or animated display ads', reach: '3.2M+', cpm: '$2.10' },
{ id: 'carousel', icon: '🎠', name: 'Carousel Ad', desc: 'Multiple products in one ad', reach: '1.5M+', cpm: '$5.40' },
{ id: 'sponsored', icon: '⭐', name: 'Sponsored Post', desc: 'Native content in user feed', reach: '4.1M+', cpm: '$6.80' },
{ id: 'live', icon: '🔴', name: 'Live Sponsorship', desc: 'Brand placement in live streams', reach: '890K+', cpm: '$12.00' }];


const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="px-3 py-2 rounded-xl text-xs space-y-1"
      style={{ background: 'rgba(10,10,18,0.95)', border: '1px solid rgba(0,210,255,0.2)', backdropFilter: 'blur(12px)' }}>
        <p className="font-700 text-slate-300">{label}</p>
        {payload.map((p: any) =>
        <p key={p.dataKey} style={{ color: p.color }}>{p.name}: {p.value.toLocaleString()}</p>
        )}
      </div>);

  }
  return null;
};

export default function AdsManagerScreen() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'campaigns' | 'create' | 'audience' | 'billing'>('dashboard');
  const [selectedCampaign, setSelectedCampaign] = useState<AdCampaign | null>(null);
  const [adObjective, setAdObjective] = useState('');
  const [adBudget, setAdBudget] = useState('');
  const [adFormat, setAdFormat] = useState('');

  const totalImpressions = campaigns.reduce((s, c) => s + c.impressions, 0);
  const totalClicks = campaigns.reduce((s, c) => s + c.clicks, 0);
  const totalSpent = campaigns.reduce((s, c) => s + c.spent, 0);
  const totalConversions = campaigns.reduce((s, c) => s + c.conversions, 0);

  const statusColor = (status: string) => {
    if (status === 'active') return { bg: 'rgba(52,211,153,0.15)', color: '#34d399' };
    if (status === 'paused') return { bg: 'rgba(251,191,36,0.15)', color: '#fbbf24' };
    if (status === 'completed') return { bg: 'rgba(100,116,139,0.15)', color: '#94a3b8' };
    return { bg: 'rgba(255,255,255,0.05)', color: '#64748b' };
  };

  return (
    <div className="max-w-screen-2xl mx-auto px-4 lg:px-8 py-6 pb-24 lg:pb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-700 gradient-text">Ads Manager</h1>
          <p className="text-sm text-slate-500 mt-0.5">Reach millions across hnChat's global network</p>
        </div>
        <button onClick={() => setActiveTab('create')} className="btn-primary flex items-center gap-2 text-sm">
          <Icon name="PlusIcon" size={16} />
          Create Campaign
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 p-1 rounded-xl w-fit overflow-x-auto" style={{ background: 'rgba(255,255,255,0.04)' }}>
        {(['dashboard', 'campaigns', 'create', 'audience', 'billing'] as const).map((t) =>
        <button key={t} onClick={() => setActiveTab(t)}
        className="px-4 py-2 rounded-lg text-sm font-600 capitalize transition-all duration-200 flex-shrink-0"
        style={activeTab === t ?
        { background: 'linear-gradient(135deg, #00d2ff, #9b59ff)', color: '#050508' } :
        { color: '#64748b' }}>
            {t}
          </button>
        )}
      </div>

      {activeTab === 'dashboard' &&
      <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
          { label: 'Total Impressions', value: (totalImpressions / 1000000).toFixed(1) + 'M', icon: '👁️', change: '+24%', color: '#00d2ff' },
          { label: 'Total Clicks', value: (totalClicks / 1000).toFixed(0) + 'K', icon: '🖱️', change: '+18%', color: '#c084fc' },
          { label: 'Total Spent', value: '$' + totalSpent.toLocaleString(), icon: '💰', change: '-8%', color: '#fbbf24' },
          { label: 'Conversions', value: totalConversions.toLocaleString(), icon: '🎯', change: '+31%', color: '#34d399' }].
          map((kpi) =>
          <div key={kpi.label} className="glass-card p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl">{kpi.icon}</span>
                  <span className="text-xs font-700 px-2 py-0.5 rounded-full"
              style={{
                background: kpi.change.startsWith('+') ? 'rgba(52,211,153,0.15)' : 'rgba(239,68,68,0.15)',
                color: kpi.change.startsWith('+') ? '#34d399' : '#f87171'
              }}>
                    {kpi.change}
                  </span>
                </div>
                <p className="text-2xl font-800 tabular-nums" style={{ color: kpi.color }}>{kpi.value}</p>
                <p className="text-xs text-slate-500 mt-1">{kpi.label}</p>
              </div>
          )}
          </div>

          {/* Performance Chart */}
          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-700 text-slate-200">Weekly Performance</h3>
              <div className="flex gap-3 text-xs">
                <span className="flex items-center gap-1.5"><span className="w-3 h-1 rounded-full bg-cyan-glow inline-block" />Impressions</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-1 rounded-full bg-violet-400 inline-block" />Clicks</span>
              </div>
            </div>
            <div style={{ height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={performanceData} barGap={4}>
                  <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="impressions" name="Impressions" fill="rgba(0,210,255,0.5)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="clicks" name="Clicks" fill="rgba(192,132,252,0.6)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Active Campaigns Summary */}
          <div className="glass-card p-5">
            <h3 className="font-700 text-slate-200 mb-4">Active Campaigns</h3>
            <div className="space-y-3">
              {campaigns.filter((c) => c.status === 'active').map((campaign) =>
            <div key={campaign.id} className="flex items-center gap-4 p-3 rounded-xl"
            style={{ background: 'rgba(255,255,255,0.03)' }}>
                  <img src={campaign.thumbnail} alt={campaign.thumbnailAlt}
              className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-600 text-slate-200 truncate">{campaign.name}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-slate-500">{campaign.type}</span>
                      <span className="text-xs text-cyan-glow">{campaign.impressions.toLocaleString()} impressions</span>
                    </div>
                    <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                      <div className="h-full rounded-full"
                  style={{ width: `${campaign.spent / campaign.budget * 100}%`, background: 'linear-gradient(90deg, #00d2ff, #9b59ff)' }} />
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-700 gradient-text-static">${campaign.spent.toLocaleString()}</p>
                    <p className="text-xs text-slate-500">of ${campaign.budget.toLocaleString()}</p>
                  </div>
                </div>
            )}
            </div>
          </div>
        </div>
      }

      {activeTab === 'campaigns' &&
      <div className="space-y-3">
          {campaigns.map((campaign) =>
        <div key={campaign.id} className="glass-card-hover p-4 flex items-center gap-4 cursor-pointer"
        onClick={() => setSelectedCampaign(selectedCampaign?.id === campaign.id ? null : campaign)}>
              <img src={campaign.thumbnail} alt={campaign.thumbnailAlt}
          className="w-16 h-16 rounded-2xl object-cover flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-700 text-slate-200 text-sm">{campaign.name}</h3>
                  <span className="text-xs px-2 py-0.5 rounded-full font-600 capitalize"
              style={statusColor(campaign.status)}>
                    {campaign.status}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mb-2">{campaign.type} · {campaign.startDate} – {campaign.endDate}</p>
                <div className="grid grid-cols-4 gap-3">
                  {[
              { label: 'Impressions', value: (campaign.impressions / 1000).toFixed(0) + 'K' },
              { label: 'Clicks', value: (campaign.clicks / 1000).toFixed(1) + 'K' },
              { label: 'CTR', value: campaign.ctr + '%' },
              { label: 'Conversions', value: campaign.conversions.toLocaleString() }].
              map((stat) =>
              <div key={stat.label}>
                      <p className="text-xs font-700 text-slate-300">{stat.value}</p>
                      <p className="text-xs text-slate-600">{stat.label}</p>
                    </div>
              )}
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="font-700 gradient-text-static">${campaign.spent.toLocaleString()}</p>
                <p className="text-xs text-slate-500">/ ${campaign.budget.toLocaleString()}</p>
                <div className="flex gap-2 mt-2">
                  <button className="p-1.5 rounded-lg transition-all duration-150 hover:bg-white/08">
                    <Icon name="PencilIcon" size={13} className="text-slate-500" />
                  </button>
                  <button className="p-1.5 rounded-lg transition-all duration-150 hover:bg-white/08">
                    <Icon name={campaign.status === 'active' ? 'PauseIcon' : 'PlayIcon'} size={13} className="text-slate-500" />
                  </button>
                </div>
              </div>
            </div>
        )}
        </div>
      }

      {activeTab === 'create' &&
      <div className="max-w-2xl space-y-6">
          <div className="glass-card p-6">
            <h3 className="font-700 text-slate-200 text-lg mb-4">Create New Campaign</h3>

            {/* Objective */}
            <div className="mb-5">
              <label className="text-sm font-600 text-slate-300 mb-3 block">Campaign Objective</label>
              <div className="grid grid-cols-3 gap-3">
                {[
              { id: 'awareness', icon: '👁️', label: 'Awareness' },
              { id: 'traffic', icon: '🚗', label: 'Traffic' },
              { id: 'conversions', icon: '🎯', label: 'Conversions' },
              { id: 'app_installs', icon: '📱', label: 'App Installs' },
              { id: 'engagement', icon: '💬', label: 'Engagement' },
              { id: 'sales', icon: '💰', label: 'Sales' }].
              map((obj) =>
              <button key={obj.id} onClick={() => setAdObjective(obj.id)}
              className="p-3 rounded-xl text-center transition-all duration-150"
              style={adObjective === obj.id ?
              { background: 'rgba(0,210,255,0.15)', border: '1px solid rgba(0,210,255,0.3)' } :
              { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div className="text-2xl mb-1">{obj.icon}</div>
                    <p className="text-xs font-600 text-slate-300">{obj.label}</p>
                  </button>
              )}
              </div>
            </div>

            {/* Ad Format */}
            <div className="mb-5">
              <label className="text-sm font-600 text-slate-300 mb-3 block">Ad Format</label>
              <div className="grid grid-cols-2 gap-3">
                {adFormats.map((fmt) =>
              <button key={fmt.id} onClick={() => setAdFormat(fmt.id)}
              className="p-3 rounded-xl text-left transition-all duration-150"
              style={adFormat === fmt.id ?
              { background: 'rgba(0,210,255,0.12)', border: '1px solid rgba(0,210,255,0.3)' } :
              { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xl">{fmt.icon}</span>
                      <span className="text-xs font-700 text-slate-200">{fmt.name}</span>
                    </div>
                    <p className="text-xs text-slate-500">{fmt.desc}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-cyan-glow">{fmt.reach} reach</span>
                      <span className="text-xs text-slate-500">CPM {fmt.cpm}</span>
                    </div>
                  </button>
              )}
              </div>
            </div>

            {/* Budget */}
            <div className="mb-5">
              <label className="text-sm font-600 text-slate-300 mb-2 block">Daily Budget (USD)</label>
              <input type="number" value={adBudget} onChange={(e) => setAdBudget(e.target.value)}
            placeholder="Enter daily budget..." className="input-glass text-sm" />
              <div className="flex gap-2 mt-2">
                {['$10', '$50', '$100', '$500'].map((b) =>
              <button key={b} onClick={() => setAdBudget(b.replace('$', ''))}
              className="px-3 py-1.5 rounded-lg text-xs font-600 transition-all duration-150"
              style={{ background: 'rgba(255,255,255,0.05)', color: '#64748b' }}>
                    {b}
                  </button>
              )}
              </div>
            </div>

            <button className="btn-primary w-full text-sm">
              Launch Campaign →
            </button>
          </div>
        </div>
      }

      {activeTab === 'audience' &&
      <div className="max-w-2xl space-y-4">
          <div className="glass-card p-5">
            <h3 className="font-700 text-slate-200 mb-4">Audience Targeting</h3>
            <div className="space-y-4">
              {[
            { label: 'Age Range', options: ['18-24', '25-34', '35-44', '45-54', '55+'] },
            { label: 'Gender', options: ['All', 'Male', 'Female', 'Non-binary'] },
            { label: 'Interests', options: ['Tech', 'Fashion', 'Gaming', 'Finance', 'Sports', 'Music', 'Travel'] },
            { label: 'Regions', options: ['Global', 'Middle East', 'Asia', 'Europe', 'Americas', 'Africa'] }].
            map((group) =>
            <div key={group.label}>
                  <label className="text-sm font-600 text-slate-400 mb-2 block">{group.label}</label>
                  <div className="flex flex-wrap gap-2">
                    {group.options.map((opt) =>
                <button key={opt} className="px-3 py-1.5 rounded-xl text-xs font-600 transition-all duration-150"
                style={{ background: 'rgba(255,255,255,0.05)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.08)' }}>
                        {opt}
                      </button>
                )}
                  </div>
                </div>
            )}
            </div>
          </div>
          <div className="glass-card p-5">
            <h3 className="font-700 text-slate-200 mb-3">Estimated Reach</h3>
            <div className="text-center py-4">
              <p className="text-5xl font-800 gradient-text tabular-nums">4.2M</p>
              <p className="text-sm text-slate-400 mt-1">Potential daily reach</p>
            </div>
          </div>
        </div>
      }

      {activeTab === 'billing' &&
      <div className="max-w-lg space-y-4">
          <div className="glass-card p-5">
            <h3 className="font-700 text-slate-200 mb-4">Billing Overview</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              {[
            { label: 'This Month', value: '$' + totalSpent.toLocaleString(), icon: '📅' },
            { label: 'Available Balance', value: '$12,500', icon: '💳' }].
            map((item) =>
            <div key={item.label} className="p-4 rounded-2xl text-center"
            style={{ background: 'rgba(255,255,255,0.04)' }}>
                  <div className="text-2xl mb-2">{item.icon}</div>
                  <p className="font-700 text-lg gradient-text-static">{item.value}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{item.label}</p>
                </div>
            )}
            </div>
            <button className="btn-primary w-full text-sm">Add Funds</button>
          </div>
          <div className="glass-card p-5">
            <h3 className="font-700 text-slate-200 mb-3">Payment Methods</h3>
            <div className="space-y-2">
              {[
            { name: 'Visa •••• 4242', icon: '💳', default: true },
            { name: 'hnCoin (HNC)', icon: '💎', default: false },
            { name: 'PayPal', icon: '🅿️', default: false }].
            map((pm) =>
            <div key={pm.name} className="flex items-center gap-3 p-3 rounded-xl"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <span className="text-xl">{pm.icon}</span>
                  <span className="text-sm text-slate-300 flex-1">{pm.name}</span>
                  {pm.default &&
              <span className="text-xs px-2 py-0.5 rounded-full font-600"
              style={{ background: 'rgba(0,210,255,0.15)', color: '#00d2ff' }}>
                      Default
                    </span>
              }
                </div>
            )}
            </div>
          </div>
        </div>
      }
    </div>);

}