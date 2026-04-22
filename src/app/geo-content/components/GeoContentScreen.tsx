'use client';
import React, { useState } from 'react';
import Icon from '@/components/ui/AppIcon';

interface Region {
  id: string;
  name: string;
  flag: string;
  language: string;
  timezone: string;
  trending: string[];
  news: NewsItem[];
  services: Service[];
  weather: {temp: number;condition: string;icon: string;};
}

interface NewsItem {
  id: string;
  title: string;
  source: string;
  time: string;
  category: string;
  image: string;
  imageAlt: string;
}

interface Service {
  id: string;
  name: string;
  category: string;
  icon: string;
  rating: number;
  available: boolean;
}

const regions: Region[] = [
{
  id: 'me', name: 'Middle East', flag: '🌙', language: 'Arabic / English', timezone: 'GMT+3',
  trending: ['#رمضان_كريم', '#Dubai_Expo', '#hnChat_Arabia', '#تقنية', '#ريادة_الأعمال'],
  weather: { temp: 38, condition: 'Sunny', icon: '☀️' },
  news: [
  { id: 'n1', title: 'دبي تطلق مبادرة الذكاء الاصطناعي للمدن الذكية', source: 'Gulf News', time: '2h ago', category: 'Tech', image: "https://images.unsplash.com/photo-1708361089093-beef4c4584e7", imageAlt: 'Dubai skyline at night with smart city lights' },
  { id: 'n2', title: 'Saudi Vision 2030: New tech hub opens in Riyadh', source: 'Arab News', time: '4h ago', category: 'Business', image: "https://img.rocket.new/generatedImages/rocket_gen_img_137c389ff-1776859195677.png", imageAlt: 'Modern business district in Riyadh' },
  { id: 'n3', title: 'hnChat يتصدر قائمة أفضل التطبيقات في المنطقة', source: 'hnChat News', time: '6h ago', category: 'Apps', image: "https://img.rocket.new/generatedImages/rocket_gen_img_19812e607-1768895508683.png", imageAlt: 'Mobile app interface on smartphone' }],

  services: [
  { id: 's1', name: 'Careem', category: 'Transport', icon: '🚗', rating: 4.8, available: true },
  { id: 's2', name: 'Noon', category: 'Shopping', icon: '🛍️', rating: 4.6, available: true },
  { id: 's3', name: 'Talabat', category: 'Food', icon: '🍔', rating: 4.7, available: true },
  { id: 's4', name: 'STC Pay', category: 'Finance', icon: '💳', rating: 4.5, available: true }]

},
{
  id: 'asia', name: 'Asia Pacific', flag: '🌏', language: 'Multi-language', timezone: 'GMT+8',
  trending: ['#Tokyo2026', '#KPop', '#TechAsia', '#Singapore', '#Anime'],
  weather: { temp: 28, condition: 'Partly Cloudy', icon: '⛅' },
  news: [
  { id: 'n4', title: 'Japan launches world\'s first quantum internet network', source: 'NHK World', time: '1h ago', category: 'Tech', image: "https://images.unsplash.com/photo-1606291121612-52a61ff40095", imageAlt: 'Tokyo city skyline at night' },
  { id: 'n5', title: 'South Korea\'s K-Pop industry reaches $10B valuation', source: 'Korea Herald', time: '3h ago', category: 'Entertainment', image: "https://img.rocket.new/generatedImages/rocket_gen_img_109e4c623-1772207010641.png", imageAlt: 'K-Pop concert with colorful lights' },
  { id: 'n6', title: 'Singapore becomes Asia\'s top crypto hub', source: 'Straits Times', time: '5h ago', category: 'Finance', image: "https://images.unsplash.com/photo-1609220003033-bd006303936a", imageAlt: 'Singapore financial district skyline' }],

  services: [
  { id: 's5', name: 'Grab', category: 'Transport', icon: '🚗', rating: 4.9, available: true },
  { id: 's6', name: 'Lazada', category: 'Shopping', icon: '🛒', rating: 4.5, available: true },
  { id: 's7', name: 'WeChat Pay', category: 'Finance', icon: '💰', rating: 4.8, available: true },
  { id: 's8', name: 'FoodPanda', category: 'Food', icon: '🐼', rating: 4.4, available: true }]

},
{
  id: 'eu', name: 'Europe', flag: '🇪🇺', language: 'Multi-language', timezone: 'GMT+1',
  trending: ['#EuroTech', '#ClimateAction', '#UEFA2026', '#Berlin', '#Paris'],
  weather: { temp: 18, condition: 'Cloudy', icon: '🌥️' },
  news: [
  { id: 'n7', title: 'EU passes landmark AI regulation framework', source: 'Euronews', time: '2h ago', category: 'Policy', image: "https://img.rocket.new/generatedImages/rocket_gen_img_14388754d-1772075976784.png", imageAlt: 'European Parliament building in Brussels' },
  { id: 'n8', title: 'Berlin becomes Europe\'s top startup ecosystem', source: 'TechCrunch EU', time: '5h ago', category: 'Business', image: "https://images.unsplash.com/photo-1586076020047-2ae9506fd8e1", imageAlt: 'Berlin city skyline with TV tower' },
  { id: 'n9', title: 'Paris Fashion Week goes fully digital with AR', source: 'Vogue France', time: '8h ago', category: 'Fashion', image: "https://images.unsplash.com/photo-1647201807036-47eca70336f2", imageAlt: 'Paris Eiffel Tower at dusk' }],

  services: [
  { id: 's9', name: 'Bolt', category: 'Transport', icon: '⚡', rating: 4.6, available: true },
  { id: 's10', name: 'Zalando', category: 'Shopping', icon: '👗', rating: 4.7, available: true },
  { id: 's11', name: 'Revolut', category: 'Finance', icon: '💳', rating: 4.8, available: true },
  { id: 's12', name: 'Deliveroo', category: 'Food', icon: '🦘', rating: 4.5, available: true }]

},
{
  id: 'us', name: 'Americas', flag: '🌎', language: 'English / Spanish', timezone: 'GMT-5',
  trending: ['#TechTuesday', '#NBA2026', '#SiliconValley', '#LatinTech', '#Innovation'],
  weather: { temp: 22, condition: 'Clear', icon: '🌤️' },
  news: [
  { id: 'n10', title: 'Silicon Valley\'s AI boom creates 500K new jobs', source: 'TechCrunch', time: '1h ago', category: 'Tech', image: "https://images.unsplash.com/photo-1472519275417-3f56f929bcd7", imageAlt: 'New York City skyline at sunset' },
  { id: 'n11', title: 'Brazil\'s fintech sector surpasses $50B in funding', source: 'Bloomberg', time: '4h ago', category: 'Finance', image: "https://images.unsplash.com/photo-1691362993953-0db83df599c0", imageAlt: 'Rio de Janeiro cityscape with Christ the Redeemer' },
  { id: 'n12', title: 'SpaceX launches first commercial moon mission', source: 'NASA', time: '7h ago', category: 'Space', image: "https://images.unsplash.com/photo-1457364983758-510f8afa9f5f", imageAlt: 'Rocket launch with fire and smoke' }],

  services: [
  { id: 's13', name: 'Uber', category: 'Transport', icon: '🚗', rating: 4.7, available: true },
  { id: 's14', name: 'Amazon', category: 'Shopping', icon: '📦', rating: 4.8, available: true },
  { id: 's15', name: 'Venmo', category: 'Finance', icon: '💸', rating: 4.6, available: true },
  { id: 's16', name: 'DoorDash', category: 'Food', icon: '🚪', rating: 4.5, available: true }]

}];


export default function GeoContentScreen() {
  const [selectedRegion, setSelectedRegion] = useState<Region>(regions[0]);
  const [activeTab, setActiveTab] = useState<'news' | 'services' | 'trending' | 'weather'>('news');
  const [contentLang, setContentLang] = useState<'local' | 'english'>('local');

  return (
    <div className="max-w-screen-2xl mx-auto px-4 lg:px-8 py-6 pb-24 lg:pb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-700 gradient-text">GeoContent</h1>
          <p className="text-sm text-slate-500 mt-0.5">Smart regional content — news, services & trends by location</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-600"
          style={{ background: 'rgba(0,210,255,0.1)', border: '1px solid rgba(0,210,255,0.2)', color: '#00d2ff' }}>
            <Icon name="MapPinIcon" size={13} />
            Auto-detecting location
          </div>
          <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }}>
            {(['local', 'english'] as const).map((lang) =>
            <button key={lang} onClick={() => setContentLang(lang)}
            className="px-3 py-1.5 rounded-lg text-xs font-600 capitalize transition-all duration-200"
            style={contentLang === lang ?
            { background: 'linear-gradient(135deg, #00d2ff, #9b59ff)', color: '#050508' } :
            { color: '#64748b' }}>
                {lang === 'local' ? '🌐 Local' : '🇬🇧 English'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Region Selector */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {regions.map((region) =>
        <button key={region.id} onClick={() => setSelectedRegion(region)}
        className="p-4 rounded-2xl text-left transition-all duration-200"
        style={{
          background: selectedRegion.id === region.id ?
          'linear-gradient(135deg, rgba(0,210,255,0.15), rgba(155,89,255,0.1))' :
          'rgba(255,255,255,0.03)',
          border: selectedRegion.id === region.id ?
          '1px solid rgba(0,210,255,0.3)' :
          '1px solid rgba(255,255,255,0.06)'
        }}>
            <div className="text-3xl mb-2">{region.flag}</div>
            <p className="font-700 text-sm text-slate-200">{region.name}</p>
            <p className="text-xs text-slate-500 mt-0.5">{region.timezone}</p>
            <div className="flex items-center gap-1 mt-2">
              <span className="text-xs">{region.weather.icon}</span>
              <span className="text-xs text-slate-400">{region.weather.temp}°C</span>
            </div>
          </button>
        )}
      </div>

      {/* Region Header */}
      <div className="glass-card p-5 mb-5 flex items-center justify-between"
      style={{ background: 'linear-gradient(135deg, rgba(0,210,255,0.08), rgba(155,89,255,0.06))' }}>
        <div className="flex items-center gap-4">
          <span className="text-5xl">{selectedRegion.flag}</span>
          <div>
            <h2 className="text-xl font-800 text-slate-200">{selectedRegion.name}</h2>
            <p className="text-sm text-slate-400">{selectedRegion.language} · {selectedRegion.timezone}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-4xl mb-1">{selectedRegion.weather.icon}</div>
          <p className="font-700 text-2xl gradient-text-static">{selectedRegion.weather.temp}°C</p>
          <p className="text-xs text-slate-400">{selectedRegion.weather.condition}</p>
        </div>
      </div>

      {/* Content Tabs */}
      <div className="flex gap-1 mb-5 p-1 rounded-xl w-fit" style={{ background: 'rgba(255,255,255,0.04)' }}>
        {(['news', 'services', 'trending', 'weather'] as const).map((t) =>
        <button key={t} onClick={() => setActiveTab(t)}
        className="px-5 py-2 rounded-lg text-sm font-600 capitalize transition-all duration-200"
        style={activeTab === t ?
        { background: 'linear-gradient(135deg, #00d2ff, #9b59ff)', color: '#050508' } :
        { color: '#64748b' }}>
            {t}
          </button>
        )}
      </div>

      {activeTab === 'news' &&
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {selectedRegion.news.map((item) =>
        <div key={item.id} className="glass-card-hover overflow-hidden group cursor-pointer">
              <div className="relative h-40 overflow-hidden">
                <img src={item.image} alt={item.imageAlt}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(5,5,8,0.8) 0%, transparent 60%)' }} />
                <span className="absolute top-2 left-2 px-2 py-0.5 rounded-lg text-xs font-700"
            style={{ background: 'rgba(0,210,255,0.8)', color: '#050508' }}>
                  {item.category}
                </span>
              </div>
              <div className="p-4">
                <p className="text-sm text-slate-300 font-500 leading-relaxed mb-2">{item.title}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">{item.source}</span>
                  <span className="text-xs text-slate-600">{item.time}</span>
                </div>
              </div>
            </div>
        )}
        </div>
      }

      {activeTab === 'services' &&
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {selectedRegion.services.map((service) =>
        <div key={service.id} className="glass-card p-5 text-center">
              <div className="text-4xl mb-3">{service.icon}</div>
              <h3 className="font-700 text-slate-200 text-sm mb-1">{service.name}</h3>
              <p className="text-xs text-slate-500 mb-2">{service.category}</p>
              <div className="flex items-center justify-center gap-1 mb-3">
                <span className="text-yellow-400 text-xs">★</span>
                <span className="text-xs font-600 text-slate-300">{service.rating}</span>
              </div>
              <button className="w-full py-2 rounded-xl text-xs font-700"
          style={{ background: 'linear-gradient(135deg, #00d2ff, #9b59ff)', color: '#050508' }}>
                Open App
              </button>
            </div>
        )}
        </div>
      }

      {activeTab === 'trending' &&
      <div className="max-w-lg space-y-3">
          {selectedRegion.trending.map((tag, i) =>
        <div key={tag} className="glass-card-hover p-4 flex items-center gap-4 cursor-pointer">
              <span className="text-2xl font-800 gradient-text-static tabular-nums w-8">#{i + 1}</span>
              <div className="flex-1">
                <p className="font-700 text-slate-200">{tag}</p>
                <p className="text-xs text-slate-500 mt-0.5">{Math.floor(Math.random() * 50 + 10)}K posts today</p>
              </div>
              <Icon name="FireIcon" size={18} className="text-orange-400" />
            </div>
        )}
        </div>
      }

      {activeTab === 'weather' &&
      <div className="max-w-md">
          <div className="glass-card p-6 text-center mb-4"
        style={{ background: 'linear-gradient(135deg, rgba(0,210,255,0.1), rgba(155,89,255,0.08))' }}>
            <div className="text-7xl mb-4">{selectedRegion.weather.icon}</div>
            <p className="text-6xl font-800 gradient-text tabular-nums">{selectedRegion.weather.temp}°C</p>
            <p className="text-xl text-slate-300 mt-2">{selectedRegion.weather.condition}</p>
            <p className="text-sm text-slate-500 mt-1">{selectedRegion.name} · {selectedRegion.timezone}</p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
          { label: 'Humidity', value: '65%', icon: '💧' },
          { label: 'Wind', value: '12 km/h', icon: '💨' },
          { label: 'UV Index', value: 'High', icon: '☀️' }].
          map((stat) =>
          <div key={stat.label} className="glass-card p-4 text-center">
                <div className="text-2xl mb-2">{stat.icon}</div>
                <p className="font-700 text-sm gradient-text-static">{stat.value}</p>
                <p className="text-xs text-slate-500 mt-0.5">{stat.label}</p>
              </div>
          )}
          </div>
        </div>
      }
    </div>);

}