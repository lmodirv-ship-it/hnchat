import React from 'react';

type BadgeVariant = 'live' | 'online' | 'new' | 'trending' | 'sale' | 'verified' | 'premium' | 'default';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  live: 'bg-red-500/20 text-red-400 border border-red-500/30 live-badge',
  online: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
  new: 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30',
  trending: 'bg-orange-500/20 text-orange-400 border border-orange-500/30',
  sale: 'bg-pink-500/20 text-pink-400 border border-pink-500/30',
  verified: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
  premium: 'bg-violet-500/20 text-violet-400 border border-violet-500/30',
  default: 'bg-white/10 text-slate-300 border border-white/10',
};

export default function Badge({ variant = 'default', children, className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-600 ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}