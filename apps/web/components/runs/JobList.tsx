'use client';

import React from 'react';
import { Server, ChevronRight, Terminal } from 'lucide-react';
import { Job } from '@/types/ci';
import { StatusBadge } from '@/components/common/StatusBadge';
import { formatDuration } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface JobListProps {
  jobs: Job[];
  selectedJobId?: string | null;
  onSelectJob?: (job: Job) => void;
}

export function JobList({ jobs, selectedJobId, onSelectJob }: JobListProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold tracking-tight text-foreground flex items-center gap-2">
          <span>Jobs</span>
          <Badge variant="secondary" className="text-[10px] font-mono">
            {jobs.length}
          </Badge>
        </h2>
        <span className="text-xs text-muted-foreground">
          Select a job to view terminal logs
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {jobs.map((job) => {
          const isSelected = selectedJobId === job.id;
          const runnerName = job.runner?.name || (job.runnerId ? 'worker-01' : 'docker-runner');

          return (
            <Card
              key={job.id}
              onClick={() => onSelectJob?.(job)}
              className={`p-3 cursor-pointer transition-all duration-150 flex items-center justify-between gap-3 select-none ${
                isSelected
                  ? 'bg-primary/10 border-primary/50 shadow-xs'
                  : 'bg-card/50 border-border/80 hover:bg-secondary/40 hover:border-border'
              }`}
            >
              {/* Status & Name */}
              <div className="flex items-center gap-2.5 min-w-0">
                <StatusBadge status={job.status} size="small" showLabel={false} />
                <div className="min-w-0">
                  <p
                    className={`text-xs font-mono font-semibold truncate ${
                      isSelected ? 'text-primary' : 'text-foreground'
                    }`}
                  >
                    {job.name}
                  </p>
                  <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mt-0.5">
                    <Server size={10} className="shrink-0" />
                    <span className="truncate font-mono">{runnerName}</span>
                  </div>
                </div>
              </div>

              {/* Duration & Arrow */}
              <div className="flex items-center gap-2 shrink-0">
                <span className="font-mono text-[11px] text-muted-foreground">
                  {formatDuration(job.startedAt, job.completedAt)}
                </span>
                <ChevronRight
                  size={14}
                  className={`transition-transform ${
                    isSelected ? 'text-primary translate-x-0.5' : 'text-muted-foreground/50'
                  }`}
                />
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
