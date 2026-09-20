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

  let badgeClasses = 'bg-[#21262D] text-[#8B949E] border-[#30363D]';
  let label = normalized || 'UNKNOWN';
  let icon: React.ReactNode = <Clock size={iconSize} />;

  switch (normalized) {
    case 'SUCCESS':
      badgeClasses = 'bg-[#238636]/15 text-[#3FB950] border-[#238636]/40';
      icon = <CheckCircle2 size={iconSize} className="stroke-[2.5]" />;
      label = 'SUCCESS';
      break;

    case 'RUNNING':
      badgeClasses = 'bg-[#1f6feb]/15 text-[#58A6FF] border-[#1f6feb]/40';
      icon = <Loader2 size={iconSize} className="animate-spin stroke-[2.5]" />;
      label = 'RUNNING';
      break;

    case 'FAILED':
      badgeClasses = 'bg-[#da3633]/15 text-[#F85149] border-[#da3633]/40';
      icon = <XCircle size={iconSize} className="stroke-[2.5]" />;
      label = 'FAILED';
      break;

    case 'QUEUED':
      badgeClasses = 'bg-[#21262D] text-[#8B949E] border-[#30363D]';
      icon = <Clock size={iconSize} />;
      label = 'QUEUED';
      break;

    case 'CANCELLED':
      badgeClasses = 'bg-[#8957e5]/15 text-[#bc8cff] border-[#8957e5]/40';
      icon = <MinusCircle size={iconSize} />;
      label = 'CANCELLED';
      break;

    case 'ONLINE':
      badgeClasses = 'bg-[#238636]/15 text-[#3FB950] border-[#238636]/40';
      icon = <Radio size={iconSize} />;
      label = 'ONLINE';
      break;

    case 'BUSY':
      badgeClasses = 'bg-[#d29922]/15 text-[#e3b341] border-[#d29922]/40';
      icon = <Loader2 size={iconSize} className="animate-spin" />;
      label = 'BUSY';
      break;

    case 'OFFLINE':
      badgeClasses = 'bg-[#21262D] text-[#8B949E] border-[#30363D]';
      icon = <PowerOff size={iconSize} />;
      label = 'OFFLINE';
      break;
  }

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md border font-mono font-medium select-none transition-colors shadow-2xs',
        size === 'small' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs',
        badgeClasses,
        className
      )}
    >
      {icon}
      {showLabel && <span className="tracking-wide font-semibold">{label}</span>}
    </div>
  );
}
