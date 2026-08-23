'use client';

import React, { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import { Server, Activity, Cpu, ShieldCheck } from 'lucide-react';
import { Runner } from '../../types/ci';
import { api } from '../../lib/api';
import { RunnerCard } from '../../components/runners/RunnerCard';
import { CardSkeletonList } from '../../components/common/LoadingSkeleton';
import { ErrorState } from '../../components/common/ErrorState';

export default function RunnersPage() {
  const [runners, setRunners] = useState<Runner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRunners = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getRunners();
      setRunners(data);
      setIsLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load runners');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRunners();
  }, []);

  if (isLoading) {
    return (
      <Box sx={{ py: 3 }}>
        <CardSkeletonList count={3} />
      </Box>
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={fetchRunners} />;
  }

  const onlineRunners = runners.filter((r) => r.status === 'ONLINE' || r.status === 'BUSY');
  const totalCapacity = runners.reduce((acc, r) => acc + r.capacity, 0);
  const totalActiveJobs = runners.reduce((acc, r) => acc + r.activeJobs, 0);

  return (
    <Box>
      {/* Header Bar */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h1" sx={{ fontSize: '1.5rem', fontWeight: 700, mb: 0.5 }}>
          Runners & Cluster
        </Typography>
        <Typography variant="body2" sx={{ color: '#94A3B8' }}>
          Active execution runners and worker container nodes across the Nimbus CI distributed fleet.
        </Typography>
      </Box>

      {/* Cluster Overview Stats */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(3, 1fr)' },
          gap: 2,
          mb: 4,
        }}
      >
        <Card sx={{ p: 2.5, backgroundColor: '#0E1219' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 1 }}>
            <Server size={18} color="#3B82F6" />
            <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 600 }}>
              Fleet Availability
            </Typography>
          </Box>
          <Typography variant="h2" sx={{ fontSize: '1.5rem', fontWeight: 700 }}>
            {onlineRunners.length} / {runners.length}{' '}
            <span style={{ fontSize: '0.875rem', fontWeight: 400, color: '#10B981' }}>Online</span>
          </Typography>
        </Card>

        <Card sx={{ p: 2.5, backgroundColor: '#0E1219' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 1 }}>
            <Activity size={18} color="#F59E0B" />
            <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 600 }}>
              Active CI Executions
            </Typography>
          </Box>
          <Typography variant="h2" sx={{ fontSize: '1.5rem', fontWeight: 700 }}>
            {totalActiveJobs} / {totalCapacity}{' '}
            <span style={{ fontSize: '0.875rem', fontWeight: 400, color: '#94A3B8' }}>Slots in Use</span>
          </Typography>
        </Card>

        <Card sx={{ p: 2.5, backgroundColor: '#0E1219' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 1 }}>
            <ShieldCheck size={18} color="#10B981" />
            <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 600 }}>
              Execution Isolation
            </Typography>
          </Box>
          <Typography variant="h2" sx={{ fontSize: '1.5rem', fontWeight: 700 }}>
            Docker Engine{' '}
            <span style={{ fontSize: '0.875rem', fontWeight: 400, color: '#94A3B8' }}>cgroups v2</span>
          </Typography>
        </Card>
      </Box>

      {/* Runners Grid */}
      <Typography variant="h3" sx={{ fontSize: '1.05rem', fontWeight: 600, mb: 2 }}>
        Runner Nodes
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          gap: 2,
        }}
      >
        {runners.map((runner) => (
          <RunnerCard key={runner.id} runner={runner} />
        ))}
      </Box>
    </Box>
  );
}
