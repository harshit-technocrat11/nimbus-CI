'use client';

import React from 'react';
import { GitCommit, Play, Webhook } from 'lucide-react';
import { TriggerType } from '@/types/ci';
import { cn } from '@/lib/utils';

interface TriggerBadgeProps {
  type: TriggerType | string;
  size?: 'small' | 'medium';
  className?: string;
}

export function TriggerBadge({
  type,
  size = 'small',
  className,
}: TriggerBadgeProps) {
  const normalized = (type || '').toUpperCase();

  const isPush = normalized.includes('PUSH') || normalized.includes('GITHUB');
  const isManual = normalized.includes('MANUAL');

  const label = isPush ? 'Push' : isManual ? 'Manual' : 'Webhook';
  const icon = isPush ? (
    <GitCommit size={size === 'small' ? 12 : 14} />
  ) : isManual ? (
    <Play size={size === 'small' ? 11 : 13} />
  ) : (
    <Webhook size={size === 'small' ? 12 : 14} />
  );

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 text-muted-foreground font-mono',
        size === 'small' ? 'text-[11px]' : 'text-xs',
        className
      )}
    >
      <span className="text-muted-foreground/80">{icon}</span>
      <span>{label}</span>
    </span>
  );
}
