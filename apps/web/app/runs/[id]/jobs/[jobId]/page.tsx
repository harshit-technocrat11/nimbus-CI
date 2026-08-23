'use client';

import React, { useEffect, useState, use } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import { ChevronLeft, Server, Play, Clock, Terminal } from 'lucide-react';
import Link from 'next/link';
import { Job, WorkflowRun } from '../../../../../types/ci';
import { api } from '../../../../../lib/api';
import { StatusBadge } from '../../../../../components/common/StatusBadge';
import { LogViewer } from '../../../../../components/logs/LogViewer';
import { CardSkeletonList } from '../../../../../components/common/LoadingSkeleton';
import { ErrorState } from '../../../../../components/common/ErrorState';
import { formatDuration, formatRelativeTime } from '../../../../../lib/utils';

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
      <Box sx={{ py: 3 }}>
        <CardSkeletonList count={2} />
      </Box>
    );
  }

  if (error || !job) {
    return <ErrorState message={error || 'Job not found'} onRetry={fetchJobData} />;
  }

  const runnerName = job.runner?.name || job.runnerId || 'worker-01';

  return (
    <Box>
      {/* Back to Run link */}
      <Box sx={{ mb: 2 }}>
        <Link
          href={`/runs/${runId}`}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            textDecoration: 'none',
            color: '#94A3B8',
            fontSize: '0.8125rem',
          }}
        >
          <ChevronLeft size={14} />
          Back to Run #{runId.replace('run-', '')}
        </Link>
      </Box>

      {/* Job Header Profile */}
      <Card
        sx={{
          p: 3,
          backgroundColor: '#0F131C',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: 2,
          mb: 3,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', sm: 'center' },
            gap: 2,
            mb: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Typography
              variant="h1"
              sx={{
                fontSize: '1.35rem',
                fontWeight: 700,
                fontFamily: 'var(--font-geist-mono), monospace',
              }}
            >
              {job.name}
            </Typography>
            <StatusBadge status={job.status} size="medium" />
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#94A3B8' }}>
              <Server size={13} color="#64748B" />
              <Typography
                variant="caption"
                sx={{ fontFamily: 'var(--font-geist-mono), monospace', color: '#CBD5E1' }}
              >
                {runnerName}
              </Typography>
            </Box>

            <Typography
              variant="caption"
              sx={{
                fontFamily: 'var(--font-geist-mono), monospace',
                color: '#94A3B8',
                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                px: 1,
                py: 0.3,
                borderRadius: '4px',
                border: '1px solid rgba(255, 255, 255, 0.06)',
              }}
            >
              Duration: {formatDuration(job.startedAt, job.completedAt, job.durationSeconds)}
            </Typography>
          </Box>
        </Box>

        {/* Commands executed */}
        {job.commands && job.commands.length > 0 && (
          <Box
            sx={{
              pt: 2,
              borderTop: '1px solid rgba(255, 255, 255, 0.06)',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              flexWrap: 'wrap',
            }}
          >
            <Typography variant="caption" sx={{ color: '#64748B' }}>
              Commands:
            </Typography>
            {job.commands.map((cmd, idx) => (
              <Chip
                key={idx}
                label={cmd}
                size="small"
                sx={{
                  fontFamily: 'var(--font-geist-mono), monospace',
                  fontSize: '0.6875rem',
                  backgroundColor: 'rgba(255, 255, 255, 0.03)',
                  color: '#94A3B8',
                }}
              />
            ))}
          </Box>
        )}
      </Card>

      {/* Terminal Log Viewer */}
      <LogViewer
        jobId={job.id}
        initialLogs={job.logs}
        jobStatus={job.status}
        jobName={job.name}
        runnerName={runnerName}
        isLive={job.status === 'RUNNING' || run?.status === 'RUNNING'}
      />
    </Box>
  );
}
