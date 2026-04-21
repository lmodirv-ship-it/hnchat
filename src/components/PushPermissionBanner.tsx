'use client';

import React, { useState } from 'react';
import Icon from '@/components/ui/AppIcon';
import { usePushNotifications } from '@/contexts/PushNotificationContext';

export default function PushPermissionBanner() {
  const { permission, requestPermission } = usePushNotifications();
  const [dismissed, setDismissed] = useState(false);

  // Only show if permission is 'default' (not yet asked) and not dismissed
  if (permission !== 'default' || dismissed) return null;

  return (
    <div
      className="flex items-center gap-3 px-4 py-3 mx-4 mt-3 rounded-2xl relative"
      style={{
        background: 'linear-gradient(135deg, rgba(0,210,255,0.08), rgba(155,89,255,0.08))',
        border: '1px solid rgba(0,210,255,0.18)',
        boxShadow: '0 4px 20px rgba(0,210,255,0.06)',
      }}
    >
      {/* Glow dot */}
      <div
        className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg, rgba(0,210,255,0.2), rgba(155,89,255,0.2))' }}
      >
        <Icon name="BellIcon" size={18} className="text-cyan-glow" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-600 text-slate-200">Enable Push Notifications</p>
        <p className="text-xs text-slate-500 mt-0.5">
          Get notified about likes, comments, follows & trending content 🔥
        </p>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={requestPermission}
          className="px-3 py-1.5 rounded-xl text-xs font-700 transition-all duration-150"
          style={{
            background: 'linear-gradient(135deg, #00d2ff, #9b59ff)',
            color: '#fff',
            boxShadow: '0 0 12px rgba(0,210,255,0.3)',
          }}
        >
          Enable
        </button>
        <button
          onClick={() => setDismissed(true)}
          className="p-1.5 rounded-xl hover:bg-white/08 transition-all duration-150"
        >
          <Icon name="XMarkIcon" size={14} className="text-slate-500" />
        </button>
      </div>
    </div>
  );
}
