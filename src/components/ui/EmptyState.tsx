import React from 'react';
import Icon from '@/components/ui/AppIcon';

interface EmptyStateProps {
  icon: string;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({ icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
        style={{ background: 'rgba(110,231,247,0.08)', border: '1px solid rgba(110,231,247,0.15)' }}
      >
        <Icon name={icon as any} size={28} className="text-cyan-glow" />
      </div>
      <h3 className="text-base font-600 text-slate-300 mb-2">{title}</h3>
      <p className="text-sm text-slate-500 max-w-xs mb-6">{description}</p>
      {actionLabel && onAction && (
        <button onClick={onAction} className="btn-primary text-sm">
          {actionLabel}
        </button>
      )}
    </div>
  );
}