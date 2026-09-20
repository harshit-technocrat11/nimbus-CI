'use client';

import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="py-8 px-4 text-center border border-rose-500/25 rounded-lg bg-rose-950/10 flex flex-col items-center justify-center max-w-md mx-auto my-6">
      <div className="text-rose-400 mb-2 p-2 rounded-full bg-rose-500/10 border border-rose-500/20">
        <AlertCircle size={20} />
      </div>
      <h3 className="text-sm font-semibold text-foreground mb-1">
        Failed to load
      </h3>
      <p className="text-xs text-rose-300/80 mb-4 max-w-xs font-mono">
        {message}
      </p>
      {onRetry && (
        <Button
          size="sm"
          variant="outline"
          onClick={onRetry}
          className="gap-1.5 border-rose-500/30 text-rose-300 hover:bg-rose-500/15"
        >
          <RotateCcw size={13} />
          <span>Retry</span>
        </Button>
      )}
    </div>
  );
}
