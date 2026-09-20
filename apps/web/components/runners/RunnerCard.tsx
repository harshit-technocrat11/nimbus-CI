'use client';

import React from 'react';
import { Server, Layers, Cpu } from 'lucide-react';
import { Runner } from '@/types/ci';
import { StatusBadge } from '@/components/common/StatusBadge';
import { formatRelativeTime } from '@/lib/utils';
import { Card } from '@/components/ui/card';

interface RunnerCardProps {
  runner: Runner;
}

export function RunnerCard({ runner }: RunnerCardProps) {
  const utilization = Math.round(
    (runner.activeJobs / Math.max(1, runner.capacity)) * 100
  );
  const isOnline = runner.status === 'ONLINE' || runner.status === 'BUSY';

  return (
    <Card className="p-4 bg-white border-border shadow-2xs flex flex-col gap-3.5 transition-colors hover:border-border">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-8 h-8 rounded-md flex items-center justify-center border ${
              isOnline
                ? 'bg-primary/15 border-primary/30 text-primary'
                : 'bg-secondary/40 border-border text-muted-foreground'
            }`}
          >
            <Server size={16} />
          </div>
          <div>
            <p className="font-semibold text-xs text-foreground font-mono">
              {runner.name}
            </p>
            <p className="text-[11px] text-muted-foreground">
              Docker Worker Node
            </p>
          </div>
        </div>

        <StatusBadge status={runner.status} size="small" />
      </div>

      <div className="space-y-1.5">
        <div className="flex justify-between items-center text-xs">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Layers size={12} />
            <span className="text-[11px]">Execution Slots</span>
          </div>
          <span
            className={`font-mono text-[11px] font-medium ${
              runner.activeJobs > 0 ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            {runner.activeJobs} / {runner.capacity} active
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full h-1.5 rounded-full bg-secondary/80 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              utilization > 80
                ? 'bg-amber-400'
                : utilization > 0
                ? 'bg-primary'
                : 'bg-slate-700'
            }`}
            style={{ width: `${utilization}%` }}
          />
        </div>
      </div>

      {/* Footer Info */}
      <div className="pt-2 border-t border-border/60 flex items-center justify-between text-[11px] text-muted-foreground font-mono">
        <div className="flex items-center gap-1">
          <Cpu size={11} />
          <span>Linux / Docker</span>
        </div>
        <span>{formatRelativeTime(runner.lastHeartbeat)}</span>
      </div>
    </Card>
  );
}
