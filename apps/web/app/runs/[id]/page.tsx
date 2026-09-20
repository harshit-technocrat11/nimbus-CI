'use client';

import React, { useEffect, useState, use } from 'react';
import { WorkflowRun, Job } from '@/types/ci';
import { api } from '@/lib/api';
import { RunHeader } from '@/components/runs/RunHeader';
import { JobList } from '@/components/runs/JobList';
import { LogViewer } from '@/components/logs/LogViewer';
import { CardSkeletonList } from '@/components/common/LoadingSkeleton';
import { ErrorState } from '@/components/common/ErrorState';

export default function WorkflowRunDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const runId = resolvedParams.id;

  const [run, setRun] = useState<WorkflowRun | null>(null);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRun = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getWorkflowRun(runId);
      if (!data) throw new Error('Workflow run not found');
      setRun(data);

      if (data.jobs && data.jobs.length > 0) {
        // Auto-select running or failed job first, else first job
        const runningOrFailed = data.jobs.find(
          (j) => j.status === 'RUNNING' || j.status === 'FAILED'
        );
        setSelectedJob(runningOrFailed || data.jobs[0] || null);
      }
      setIsLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load workflow run');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRun();
  }, [runId]);

  if (isLoading) {
    return (
      <div className="py-4 space-y-4">
        <div className="h-28 rounded-lg bg-secondary/30 animate-pulse" />
        <CardSkeletonList count={2} />
      </div>
    );
  }

  if (error || !run) {
    return (
      <ErrorState
        message={error || 'Workflow run not found'}
        onRetry={fetchRun}
      />
    );
  }

  const jobs = run.jobs || [];

  return (
    <div className="space-y-6">
      {/* Top Run Summary Header */}
      <RunHeader run={run} onRefresh={fetchRun} />

      {/* Jobs Selection Grid */}
      <JobList
        jobs={jobs}
        selectedJobId={selectedJob?.id}
        onSelectJob={(job) => setSelectedJob(job)}
      />

      {/* Selected Job's Live Terminal Log Viewer */}
      {selectedJob && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold tracking-tight text-foreground">
              Execution Logs
            </h2>
            <span className="text-xs text-muted-foreground font-mono">
              Job: {selectedJob.name}
            </span>
          </div>

          <LogViewer
            key={selectedJob.id}
            jobId={selectedJob.id}
            initialLogs={selectedJob.logs}
            jobStatus={selectedJob.status}
            jobName={selectedJob.name}
            runnerName={selectedJob.runner?.name || selectedJob.runnerId || 'docker-runner'}
            isLive={selectedJob.status === 'RUNNING' || run.status === 'RUNNING'}
          />
        </div>
      )}
    </div>
  );
}
