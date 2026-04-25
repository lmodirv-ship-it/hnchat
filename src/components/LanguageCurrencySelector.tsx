'use client';
import React, { useState, useRef, useEffect } from 'react';
import { useI18n } from '@/contexts/I18nContext';
import { SUPPORTED_LANGUAGES } from '@/lib/i18n';
import { SUPPORTED_CURRENCIES } from '@/lib/currencies';
import Icon from '@/components/ui/AppIcon';

interface LanguageCurrencySelectorProps {
  compact?: boolean;
}

export default function LanguageCurrencySelector({ compact = false }: LanguageCurrencySelectorProps) {
  const { language, setLanguage, currency, setCurrency } = useI18n();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<'lang' | 'currency'>('lang');
  const ref = useRef<HTMLDivElement>(null);

  const currentLang = SUPPORTED_LANGUAGES.find((l) => l.code === language);
  const currentCurrency = SUPPORTED_CURRENCIES.find((c) => c.code === currency);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl transition-all duration-200 hover:bg-white/05 group"
        style={{ border: '1px solid transparent' }}
        onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'rgba(0,210,255,0.15)')}
        onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'transparent')}
        title="Language & Currency"
      >
        <span className="text-base leading-none">{currentLang?.flag}</span>
        {!compact && (
          <>
            <span className="text-xs font-600 text-slate-400 group-hover:text-slate-200 transition-colors">
              {currentLang?.code.toUpperCase()}
            </span>
            <span className="text-xs text-slate-600">·</span>
            <span className="text-xs font-600 text-slate-400 group-hover:text-slate-200 transition-colors">
              {currentCurrency?.code}
            </span>
          </>
        )}
        <Icon name="ChevronDownIcon" size={12} className="text-slate-600" />
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-2 w-64 rounded-2xl overflow-hidden z-50"
          style={{
            background: 'rgba(10,10,18,0.98)',
            border: '1px solid rgba(255,255,255,0.08)',
            backdropFilter: 'blur(32px)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
          }}
        >
          {/* Tabs */}
          <div className="flex border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            {(['lang', 'currency'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className="flex-1 py-2.5 text-xs font-600 transition-all duration-150"
                style={{
                  color: tab === t ? '#00d2ff' : '#64748b',
                  borderBottom: tab === t ? '2px solid #00d2ff' : '2px solid transparent',
                }}
              >
                {t === 'lang' ? '🌐 Language' : '💱 Currency'}
              </button>
            ))}
          </div>

          {/* Language list */}
          {tab === 'lang' && (
            <div className="py-1 max-h-56 overflow-y-auto">
              {SUPPORTED_LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => { setLanguage(lang.code); setOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-all duration-150 hover:bg-white/04"
                  style={{ color: language === lang.code ? '#00d2ff' : '#94a3b8' }}
                >
                  <span className="text-lg leading-none">{lang.flag}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-600">{lang.nativeLabel}</div>
                    <div className="text-xs opacity-60">{lang.label}</div>
                  </div>
                  {language === lang.code && (
                    <Icon name="CheckIcon" size={14} className="text-cyan-400 flex-shrink-0" />
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Currency list */}
          {tab === 'currency' && (
            <div className="py-1 max-h-56 overflow-y-auto">
              {SUPPORTED_CURRENCIES.map((cur) => (
                <button
                  key={cur.code}
                  onClick={() => { setCurrency(cur.code); setOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-all duration-150 hover:bg-white/04"
                  style={{ color: currency === cur.code ? '#00d2ff' : '#94a3b8' }}
                >
                  <span className="text-lg leading-none">{cur.flag}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-600">{cur.code} <span className="opacity-60">{cur.symbol}</span></div>
                    <div className="text-xs opacity-60">{cur.label}</div>
                  </div>
                  {currency === cur.code && (
                    <Icon name="CheckIcon" size={14} className="text-cyan-400 flex-shrink-0" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
