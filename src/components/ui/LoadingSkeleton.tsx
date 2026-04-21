import React from 'react';

interface SkeletonProps {
  className?: string;
  rounded?: string;
}

export function Skeleton({ className = '', rounded = 'rounded-lg' }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse bg-white/05 ${rounded} ${className}`}
    />
  );
}

export function PostCardSkeleton() {
  return (
    <div className="glass-card p-4 space-y-3">
      <div className="flex items-center gap-3">
        <Skeleton className="w-10 h-10" rounded="rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3.5 w-1/3" />
          <Skeleton className="h-3 w-1/4" />
        </div>
      </div>
      <Skeleton className="h-3.5 w-full" />
      <Skeleton className="h-3.5 w-4/5" />
      <Skeleton className="h-48 w-full" rounded="rounded-xl" />
      <div className="flex gap-4">
        <Skeleton className="h-8 w-16" rounded="rounded-lg" />
        <Skeleton className="h-8 w-16" rounded="rounded-lg" />
        <Skeleton className="h-8 w-16" rounded="rounded-lg" />
      </div>
    </div>
  );
}

export function ConversationSkeleton() {
  return (
    <div className="flex items-center gap-3 p-3">
      <Skeleton className="w-11 h-11 flex-shrink-0" rounded="rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3.5 w-2/3" />
        <Skeleton className="h-3 w-1/2" />
      </div>
      <Skeleton className="h-3 w-10" />
    </div>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="glass-card overflow-hidden">
      <Skeleton className="h-48 w-full" rounded="rounded-none" />
      <div className="p-4 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3.5 w-1/2" />
        <Skeleton className="h-5 w-1/3" />
      </div>
    </div>
  );
}