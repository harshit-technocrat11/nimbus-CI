'use client';

import React from 'react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="py-12 px-4 text-center border border-dashed border-border rounded-lg bg-card/20 flex flex-col items-center justify-center max-w-md mx-auto my-6">
      {icon && (
        <div className="text-muted-foreground mb-3 flex items-center justify-center p-3 rounded-full bg-secondary/40 border border-border">
          {icon}
        </div>
      )}
      <h3 className="text-sm font-semibold text-foreground mb-1">
        {title}
      </h3>
      {description && (
        <p className="text-xs text-muted-foreground max-w-sm mb-4">
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <Button size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
