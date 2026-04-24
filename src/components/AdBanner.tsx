'use client';
import React, { useEffect, useRef, useState } from 'react';

interface AdBannerProps {
  adSlot: string;
  adFormat?: string;
  className?: string;
  style?: React.CSSProperties;
}

declare global {
  interface Window {
    adsbygoogle: Array<Record<string, unknown>>;
  }
}

export default function AdBanner({ adSlot, adFormat = 'auto', className = '', style }: AdBannerProps) {
  const adRef = useRef<HTMLInsElement>(null);
  const [initialized, setInitialized] = useState(false);
  const adsenseId = process.env.NEXT_PUBLIC_ADSENSE_ID;

  useEffect(() => {
    if (!adsenseId || adsenseId === 'your-adsense-id-here') return;
    if (initialized) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      setInitialized(true);
    } catch (e) {
      // AdSense not ready
    }
  }, [adsenseId, initialized]);

  if (!adsenseId || adsenseId === 'your-adsense-id-here') {
    return (
      <div
        className={`flex items-center justify-center rounded-xl text-xs text-slate-600 ${className}`}
        style={{ minHeight: 90, background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.06)', ...style }}
      >
        Ad Space
      </div>
    );
  }

  return (
    <div className={`overflow-hidden ${className}`} style={style}>
      <ins
        ref={adRef}
        className="adsbygoogle block"
        style={{ display: 'block', minHeight: 90 }}
        data-ad-client={adsenseId}
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive="true"
      />
    </div>
  );
}
