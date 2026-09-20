'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import {
  ChevronLeft,
  CheckCircle2,
  XCircle,
  Loader2,
  Circle,
  RotateCcw,
  MoreHorizontal,
  FileCode,
  Clock,
  GitBranch,
  GitCommit,
  LayoutList,
  Terminal,
} from 'lucide-react';
import { WorkflowRun, Job } from '@/types/ci';
import { api } from '@/lib/api';
import { LogViewer } from '@/components/logs/LogViewer';
import { CardSkeletonList } from '@/components/common/LoadingSkeleton';
import { ErrorState } from '@/components/common/ErrorState';
import { formatDuration, formatRelativeTime, formatShortSha } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RunCIDialog } from '@/components/runs/RunCIDialog';

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
  const [reRunDialogOpen, setReRunDialogOpen] = useState(false);

  const fetchRun = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getWorkflowRun(runId);
      if (!data) throw new Error('Workflow run not found');
      setRun(data);

      if (data.jobs && data.jobs.length > 0) {
        // Auto-select running or failed job first, else first job
        setSelectedJob((prev) => {
          if (prev) {
            const updated = data.jobs?.find((j) => j.id === prev.id);
            if (updated) return updated;
          }
          const runningOrFailed = data.jobs?.find(
            (j) => j.status === 'RUNNING' || j.status === 'FAILED'
          );
          return runningOrFailed || data.jobs?.[0] || null;
        });
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
        <div className="h-14 rounded-md bg-[#161B22] animate-pulse border border-[#30363D]" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="h-64 rounded-md bg-[#161B22] animate-pulse border border-[#30363D]" />
          <div className="md:col-span-3 h-96 rounded-md bg-[#161B22] animate-pulse border border-[#30363D]" />
        </div>
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
  const repo = run.workflow?.repository;
  const runDisplayNumber = run.id.replace('run-', '');
  const runTitle = run.workflow?.name
    ? `${run.workflow.name} #${runDisplayNumber}`
    : `Run #${runDisplayNumber}`;

  return (
    <div className="space-y-4">
      {/* Top Breadcrumb & GitHub Actions Run Title Header */}
      <div className="border-b border-[#30363D] pb-3">
        {/* Back Link */}
        <div className="mb-2">
          {repo ? (
            <Link
              href={`/repositories/${repo.id}`}
              className="inline-flex items-center gap-1.5 text-xs text-[#8B949E] hover:text-[#58A6FF] transition-colors"
            >
              <ChevronLeft size={14} />
              <span>{run.workflow?.name || repo.name}</span>
            </Link>
          ) : (
            <Link
              href="/runs"
              className="inline-flex items-center gap-1.5 text-xs text-[#8B949E] hover:text-[#58A6FF] transition-colors"
            >
              <ChevronLeft size={14} />
              <span>All workflows</span>
            </Link>
          )}
        </div>

        {/* Title Row with Status Mark & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            {run.status === 'SUCCESS' ? (
              <CheckCircle2 size={20} className="text-[#3FB950] shrink-0 fill-[#3FB950]/15" />
            ) : run.status === 'FAILED' ? (
              <XCircle size={20} className="text-[#F85149] shrink-0 fill-[#F85149]/15" />
            ) : run.status === 'RUNNING' ? (
              <Loader2 size={20} className="text-[#58A6FF] shrink-0 animate-spin" />
            ) : (
              <Circle size={20} className="text-[#8B949E] shrink-0" />
            )}

            <h1 className="text-base sm:text-lg font-bold text-[#F0F6FC] truncate">
              {runTitle}
            </h1>

            {run.branch && (
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded-full bg-[#161B22] border border-[#30363D] text-[#8B949E]">
                <GitBranch size={11} className="text-[#58A6FF]" />
                {run.branch}
              </span>
            )}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setReRunDialogOpen(true)}
              className="h-8 gap-1.5 text-xs bg-[#21262D] border-[#30363D] text-[#F0F6FC] hover:bg-[#30363D]"
            >
              <RotateCcw size={13} />
              <span>Re-run all jobs</span>
            </Button>

            <Button
              variant="outline"
              size="icon-sm"
              onClick={fetchRun}
              title="Refresh run state"
              className="h-8 w-8 bg-[#21262D] border-[#30363D] text-[#8B949E] hover:text-[#F0F6FC] hover:bg-[#30363D]"
            >
              <MoreHorizontal size={14} />
            </Button>
          </div>
        </div>
      </div>

      {/* Two-Column GitHub Actions Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: All Jobs List & Run Details */}
        <aside className="lg:col-span-3 space-y-4 bg-[#0D1117]">
          {/* Jobs List Section */}
          <div className="space-y-1">
            <div className="px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-[#8B949E] flex items-center justify-between">
              <span>All jobs</span>
              <span className="font-mono">{jobs.length}</span>
            </div>

            <div className="space-y-0.5">
              {jobs.map((job) => {
                const isSelected = selectedJob?.id === job.id;
                return (
                  <button
                    key={job.id}
                    type="button"
                    onClick={() => setSelectedJob(job)}
                    className={`w-full flex items-center justify-between px-3 py-2 text-left text-xs rounded-r-md transition-colors select-none ${
                      isSelected
                        ? 'border-l-2 border-[#58A6FF] bg-[#161B22] text-[#F0F6FC] font-semibold'
                        : 'border-l-2 border-transparent text-[#8B949E] hover:text-[#F0F6FC] hover:bg-[#161B22]/50'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0 pr-2">
                      {job.status === 'SUCCESS' ? (
                        <CheckCircle2 size={14} className="text-[#3FB950] shrink-0" />
                      ) : job.status === 'FAILED' ? (
                        <XCircle size={14} className="text-[#F85149] shrink-0" />
                      ) : job.status === 'RUNNING' ? (
                        <Loader2 size={14} className="text-[#58A6FF] shrink-0 animate-spin" />
                      ) : (
                        <Circle size={14} className="text-[#8B949E]/50 shrink-0" />
                      )}
                      <span className="truncate">{job.name}</span>
                    </div>

                    <span className="text-[11px] font-mono text-[#8B949E] shrink-0">
                      {job.durationSeconds ? formatDuration(job.durationSeconds) : ''}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Run Details Section */}
          <div className="pt-3 border-t border-[#30363D] space-y-2">
            <p className="px-2.5 text-[11px] font-bold uppercase tracking-wider text-[#8B949E]">
              Run details
            </p>

            <div className="px-2.5 space-y-2 text-xs text-[#8B949E]">
              {/* Commit info */}
              {run.commitSha && (
                <div className="flex items-center gap-2">
                  <GitCommit size={13} className="text-[#8B949E] shrink-0" />
                  <span className="font-mono text-[11px] text-[#F0F6FC]">
                    {formatShortSha(run.commitSha)}
                  </span>
                </div>
              )}

              {/* Branch */}
              {run.branch && (
                <div className="flex items-center gap-2">
                  <GitBranch size={13} className="text-[#58A6FF] shrink-0" />
                  <span className="font-mono text-[11px] text-[#C9D1D9]">
                    {run.branch}
                  </span>
                </div>
              )}

              {/* Duration / Timing */}
              <div className="flex items-center gap-2">
                <Clock size={13} className="text-[#8B949E] shrink-0" />
                <span>
                  {run.durationSeconds ? formatDuration(run.durationSeconds) : 'Queued'}
                  {run.queuedAt ? ` • ${formatRelativeTime(run.queuedAt)}` : ''}
                </span>
              </div>

              {/* Workflow config link */}
              {repo && (
                <Link
                  href={`/repositories/${repo.id}`}
                  className="flex items-center gap-2 text-[#58A6FF] hover:underline pt-1"
                >
                  <FileCode size={13} />
                  <span>Workflow file</span>
                </Link>
              )}
            </div>
          </div>
        </aside>

        {/* Right Column: Selected Job Title & Dynamic Step Dropdowns */}
        <main className="lg:col-span-9 min-w-0 space-y-3">
          {selectedJob ? (
            <div>
              {/* Job Title & Subtitle Banner */}
              <div className="mb-3">
                <h2 className="text-base font-semibold text-[#F0F6FC] flex items-center gap-2">
                  <span>{selectedJob.name}</span>
                </h2>
                <p className="text-xs text-[#8B949E] mt-0.5">
                  {selectedJob.status === 'SUCCESS'
                    ? `Succeeded in ${formatDuration(selectedJob.durationSeconds || 0)}`
                    : selectedJob.status === 'FAILED'
                    ? `Failed in ${formatDuration(selectedJob.durationSeconds || 0)}`
                    : selectedJob.status === 'RUNNING'
                    ? 'In progress...'
                    : 'Queued to run'}
                </p>
              </div>

              {/* LogViewer with Step Dropdowns */}
              <LogViewer
                key={selectedJob.id}
                jobId={selectedJob.id}
                job={selectedJob}
                initialLogs={selectedJob.logs}
                jobStatus={selectedJob.status}
                jobName={selectedJob.name}
                runnerName={selectedJob.runner?.name || selectedJob.runnerId || 'docker-runner'}
                isLive={selectedJob.status === 'RUNNING' || run.status === 'RUNNING'}
              />
            </div>
          ) : (
            <div className="rounded-md border border-[#30363D] bg-[#161B22] p-8 text-center text-[#8B949E]">
              Select a job on the left to inspect its execution steps and logs.
            </div>
          )}
        </main>
      </div>

      {/* Manual Re-Run Dispatch Dialog */}
      {repo && (
        <RunCIDialog
          repository={repo}
          open={reRunDialogOpen}
          onOpenChange={setReRunDialogOpen}
          onRunTriggered={() => {
            setReRunDialogOpen(false);
            fetchRun();
          }}
        />
      )}
    </div>
  );
}
