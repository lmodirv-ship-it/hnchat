'use client';
import { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // iOS detection
    const ua = navigator.userAgent;
    const iosDevice = /iphone|ipad|ipod/i.test(ua);
    const notInStandalone = !(navigator as any).standalone;
    if (iosDevice && notInStandalone) {
      const dismissed = localStorage.getItem('pwa-ios-dismissed');
      if (!dismissed) {
        setIsIOS(true);
        setTimeout(() => setShowBanner(true), 3000);
      }
      return;
    }

    // Android / Chrome
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      const dismissed = localStorage.getItem('pwa-dismissed');
      if (!dismissed) setTimeout(() => setShowBanner(true), 3000);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setIsInstalled(true);
    setShowBanner(false);
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem(isIOS ? 'pwa-ios-dismissed' : 'pwa-dismissed', '1');
  };

  if (!showBanner || isInstalled) return null;

  return (
    <div
      className="fixed bottom-4 left-4 right-4 z-50 max-w-sm mx-auto rounded-2xl p-4 shadow-2xl"
      style={{
        background: 'linear-gradient(135deg, rgba(0,210,255,0.12), rgba(155,89,255,0.12))',
        border: '1px solid rgba(0,210,255,0.3)',
        backdropFilter: 'blur(20px)',
      }}
    >
      <div className="flex items-start gap-3">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 text-2xl"
          style={{ background: 'linear-gradient(135deg, #00d2ff, #9b59ff)' }}
        >
          💎
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white font-700 text-sm">Install hnChat App</p>
          {isIOS ? (
            <p className="text-slate-400 text-xs mt-0.5 leading-relaxed">
              Tap <span className="text-cyan-400">Share</span> then{' '}
              <span className="text-cyan-400">&quot;Add to Home Screen&quot;</span> to install
            </p>
          ) : (
            <p className="text-slate-400 text-xs mt-0.5">
              Get the full app experience — works offline too!
            </p>
          )}
        </div>
        <button
          onClick={handleDismiss}
          className="text-slate-500 hover:text-slate-300 text-lg leading-none flex-shrink-0 mt-0.5"
        >
          ×
        </button>
      </div>
      {!isIOS && deferredPrompt && (
        <button
          onClick={handleInstall}
          className="w-full mt-3 py-2.5 rounded-xl text-sm font-700 transition-all hover:opacity-90"
          style={{ background: 'linear-gradient(135deg, #00d2ff, #9b59ff)', color: '#050508' }}
        >
          Install Now ✨
        </button>
      )}
    </div>
  );
}
