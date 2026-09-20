'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { ChevronLeft, Server, Clock, Terminal } from 'lucide-react';
import { Job, WorkflowRun } from '@/types/ci';
import { api } from '@/lib/api';
import { StatusBadge } from '@/components/common/StatusBadge';
import { LogViewer } from '@/components/logs/LogViewer';
import { CardSkeletonList } from '@/components/common/LoadingSkeleton';
import { ErrorState } from '@/components/common/ErrorState';
import { formatDuration, formatRelativeTime } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string; jobId: string }>;
}) {
  const resolvedParams = use(params);
  const runId = resolvedParams.id;
  const jobId = resolvedParams.jobId;

  const [run, setRun] = useState<WorkflowRun | null>(null);
  const [job, setJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchJobData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const runData = await api.getWorkflowRun(runId);
      if (!runData) throw new Error('Workflow run not found');
      setRun(runData);

      const targetJob = runData.jobs?.find((j) => j.id === jobId);
      if (!targetJob) throw new Error('Job not found in this workflow run');
      setJob(targetJob);

      setIsLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load job details');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobData();
  }, [runId, jobId]);

  if (isLoading) {
    return (
      <div className="py-4 space-y-4">
        <div className="h-6 w-32 bg-secondary/40 rounded animate-pulse" />
        <CardSkeletonList count={2} />
      </div>
    );
  }

  if (error || !run || !job) {
    return (
      <ErrorState
        message={error || 'Job not found'}
        onRetry={fetchJobData}
      />
    );
  }

  const runnerName = job.runner?.name || job.runnerId || 'docker-runner';

  return (
    <div className="space-y-5">
      {/* Back Link to Run */}
      <Link
        href={`/runs/${runId}`}
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors group"
      >
        <ChevronLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
        <span>Back to Run #{runId.replace('run-', '')}</span>
      </Link>

      {/* Job Header Card */}
      <Card className="p-5 bg-card/60 border-border/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <Terminal size={18} className="text-primary" />
              <h1 className="text-base font-semibold text-foreground font-mono">
                {job.name}
              </h1>
              <StatusBadge status={job.status} size="small" />
            </div>

            <div className="flex items-center gap-3 text-xs text-muted-foreground font-mono">
              <div className="flex items-center gap-1">
                <Server size={12} className="text-muted-foreground" />
                <span>{runnerName}</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1">
                <Clock size={12} className="text-muted-foreground" />
                <span>Duration: {formatDuration(job.startedAt, job.completedAt)}</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Terminal Log Viewer */}
      <div className="space-y-2">
        <h2 className="text-sm font-semibold tracking-tight text-foreground">
          Live Terminal Output
        </h2>
        <LogViewer
          jobId={job.id}
          initialLogs={job.logs}
          jobStatus={job.status}
          jobName={job.name}
          runnerName={runnerName}
          isLive={job.status === 'RUNNING' || run.status === 'RUNNING'}
        />
      </div>
    </div>
  );
}
