'use client';

import React, { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import { WorkflowRun } from '../../types/ci';
import { api } from '../../lib/api';
import { RunList } from '../../components/runs/RunList';
import { TableSkeletonRows } from '../../components/common/LoadingSkeleton';
import { ErrorState } from '../../components/common/ErrorState';

export default function RunsPage() {
  const [runs, setRuns] = useState<WorkflowRun[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRuns = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getAllRuns();
      setRuns(data);
      setIsLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load workflow runs');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRuns();
  }, []);

  if (isLoading) {
    return (
      <Box sx={{ py: 3 }}>
        <TableSkeletonRows rows={6} cols={6} />
      </Box>
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={fetchRuns} />;
  }

  return (
    <Box>
      <RunList
        runs={runs}
        showRepoColumn={true}
        title="Workflow Runs"
        subtitle="Global history of continuous integration pipeline executions across all repositories."
      />
    </Box>
  );
}
