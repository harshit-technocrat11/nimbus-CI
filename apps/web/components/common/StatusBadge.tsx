'use client';

import React from 'react';
import {
  CheckCircle2,
  Clock,
  Loader2,
  XCircle,
  MinusCircle,
  Radio,
  PowerOff,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { WorkflowRunStatus, JobStatus, RunnerStatus } from '@/types/ci';

type StatusType = WorkflowRunStatus | JobStatus | RunnerStatus | string;

interface StatusBadgeProps {
  status: StatusType;
  size?: 'small' | 'medium';
  showLabel?: boolean;
  className?: string;
}

export function StatusBadge({
  status,
  size = 'small',
  showLabel = true,
  className,
}: StatusBadgeProps) {
  const normalized = (status || '').toUpperCase();

  const iconSize = size === 'small' ? 12 : 14;

  let badgeClasses = 'bg-slate-800/40 text-slate-400 border-slate-700/50';
  let label = normalized || 'UNKNOWN';
  let icon: React.ReactNode = <Clock size={iconSize} />;

  switch (normalized) {
    case 'SUCCESS':
      badgeClasses = 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
      icon = <CheckCircle2 size={iconSize} className="stroke-[2.5]" />;
      label = 'SUCCESS';
      break;

    case 'RUNNING':
      badgeClasses = 'bg-amber-500/15 text-amber-400 border-amber-500/30';
      icon = <Loader2 size={iconSize} className="animate-spin stroke-[2.5]" />;
      label = 'RUNNING';
      break;

    case 'FAILED':
      badgeClasses = 'bg-rose-500/15 text-rose-400 border-rose-500/30';
      icon = <XCircle size={iconSize} className="stroke-[2.5]" />;
      label = 'FAILED';
      break;

    case 'QUEUED':
      badgeClasses = 'bg-slate-800/60 text-slate-400 border-slate-700/60';
      icon = <Clock size={iconSize} />;
      label = 'QUEUED';
      break;

    case 'CANCELLED':
      badgeClasses = 'bg-purple-500/15 text-purple-400 border-purple-500/30';
      icon = <MinusCircle size={iconSize} />;
      label = 'CANCELLED';
      break;

    case 'ONLINE':
      badgeClasses = 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
      icon = <Radio size={iconSize} />;
      label = 'ONLINE';
      break;

    case 'BUSY':
      badgeClasses = 'bg-amber-500/15 text-amber-400 border-amber-500/30';
      icon = <Loader2 size={iconSize} className="animate-spin" />;
      label = 'BUSY';
      break;

    case 'OFFLINE':
      badgeClasses = 'bg-slate-800/40 text-slate-500 border-slate-700/40';
      icon = <PowerOff size={iconSize} />;
      label = 'OFFLINE';
      break;
  }

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md border font-mono font-medium select-none transition-colors',
        size === 'small' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs',
        badgeClasses,
        className
      )}
    >
      {icon}
      {showLabel && <span className="tracking-wide">{label}</span>}
    </div>
  );
}
