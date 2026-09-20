'use client';

import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export function TableSkeletonRows({ rows = 4, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="w-full space-y-2">
      {Array.from({ length: rows }).map((_, rIdx) => (
        <div
          key={rIdx}
          className="flex items-center justify-between p-3.5 rounded-lg border border-border/50 bg-card/40 gap-4"
        >
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-4 w-1/6" />
          <Skeleton className="h-4 w-1/5" />
          <Skeleton className="h-4 w-1/8" />
        </div>
      ))}
    </div>
  );
}

export function CardSkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-2.5">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="p-4 rounded-lg border border-border/60 bg-card/60 flex justify-between items-center"
        >
          <div className="w-3/5 space-y-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-6 w-20 rounded-md" />
        </div>
      ))}
    </div>
  );
}

export function LogSkeleton() {
  return (
    <div className="p-4 space-y-2 font-mono">
      {Array.from({ length: 8 }).map((_, idx) => (
        <div key={idx} className="flex gap-4">
          <Skeleton className="h-3 w-8" />
          <Skeleton className="h-3" style={{ width: `${30 + (idx * 7) % 50}%` }} />
        </div>
      ))}
    </div>
  );
}
