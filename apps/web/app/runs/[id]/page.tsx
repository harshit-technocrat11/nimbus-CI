'use client';

import React, { useEffect, useState, use } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import { WorkflowRun, Job } from '../../../types/ci';
import { api } from '../../../lib/api';
import { RunHeader } from '../../../components/runs/RunHeader';
import { JobList } from '../../../components/runs/JobList';
import { LogViewer } from '../../../components/logs/LogViewer';
import { CardSkeletonList } from '../../../components/common/LoadingSkeleton';
import { ErrorState } from '../../../components/common/ErrorState';

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
        const runningOrFailed = data.jobs.find((j) => j.status === 'RUNNING' || j.status === 'FAILED');
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
      <Box sx={{ py: 3 }}>
        <CardSkeletonList count={2} />
      </Box>
    );
  }

  if (error || !run) {
    return <ErrorState message={error || 'Workflow run not found'} onRetry={fetchRun} />;
  }

  const jobs = run.jobs || [];

  return (
    <Box>
      {/* Top Run Summary Header */}
      <RunHeader run={run} onRefresh={fetchRun} />

      {/* Main Grid: Jobs list on top/left, Active Log Viewer underneath/right */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Jobs List */}
        <JobList
          jobs={jobs}
          selectedJobId={selectedJob?.id}
          onSelectJob={(job) => setSelectedJob(job)}
        />

        {/* Selected Job's Live Terminal Log Viewer */}
        {selectedJob && (
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
              <Typography variant="h3" sx={{ fontSize: '1rem', fontWeight: 600, color: '#F8FAFC' }}>
                Live Terminal & Logs
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748B', fontFamily: 'var(--font-geist-mono), monospace' }}>
                Job: {selectedJob.name}
              </Typography>
            </Box>

            <LogViewer
              key={selectedJob.id}
              jobId={selectedJob.id}
              initialLogs={selectedJob.logs}
              jobStatus={selectedJob.status}
              jobName={selectedJob.name}
              runnerName={selectedJob.runner?.name || selectedJob.runnerId || 'worker-01'}
              isLive={selectedJob.status === 'RUNNING' || run.status === 'RUNNING'}
            />
          </Box>
        )}
      </Box>
    </Box>
  );
}
