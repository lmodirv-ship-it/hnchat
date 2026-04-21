'use client';
import React, { useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
};

export default function Modal({ open, onClose, title, children, size = 'md' }: ModalProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`w-full ${sizeClasses[size]} glass-card animate-scale-in`}
        style={{
          background: 'rgba(15,15,26,0.95)',
          border: '1px solid rgba(110,231,247,0.15)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.6), 0 0 40px rgba(110,231,247,0.05)',
        }}
      >
        {title && (
          <div className="flex items-center justify-between p-5 border-b border-white/08">
            <h3 className="text-base font-600 text-slate-200">{title}</h3>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-white/10 transition-all duration-150"
              aria-label="Close modal"
            >
              <Icon name="XMarkIcon" size={18} className="text-slate-400" />
            </button>
          </div>
        )}
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}