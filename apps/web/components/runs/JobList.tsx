'use client';

import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import { Server, ChevronRight, Terminal } from 'lucide-react';
import { Job } from '../../types/ci';
import { StatusBadge } from '../common/StatusBadge';
import { formatDuration } from '../../lib/utils';

interface JobListProps {
  jobs: Job[];
  selectedJobId?: string | null;
  onSelectJob?: (job: Job) => void;
}

export function JobList({ jobs, selectedJobId, onSelectJob }: JobListProps) {
  return (
    <Box sx={{ mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
        <Typography variant="h3" sx={{ fontSize: '1rem', fontWeight: 600, color: '#F8FAFC' }}>
          Jobs ({jobs.length})
        </Typography>
        <Typography variant="caption" sx={{ color: '#64748B' }}>
          Click a job to inspect live execution logs
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {jobs.map((job) => {
          const isSelected = selectedJobId === job.id;
          const runnerName = job.runner?.name || (job.runnerId ? 'worker-01' : 'unassigned');

          return (
            <Card
              key={job.id}
              onClick={() => onSelectJob && onSelectJob(job)}
              sx={{
                p: 1.75,
                cursor: 'pointer',
                backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.08)' : '#0E1219',
                borderColor: isSelected ? 'rgba(59, 130, 246, 0.4)' : 'rgba(255, 255, 255, 0.08)',
                transition: 'all 0.12s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 2,
                '&:hover': {
                  borderColor: isSelected ? 'rgba(59, 130, 246, 0.5)' : 'rgba(255, 255, 255, 0.2)',
                  backgroundColor: isSelected
                    ? 'rgba(59, 130, 246, 0.12)'
                    : 'rgba(255, 255, 255, 0.02)',
                },
              }}
            >
              {/* Left: Status & Job name */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <StatusBadge status={job.status} size="small" />
                <Box>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 600,
                      color: isSelected ? '#60A5FA' : '#F8FAFC',
                      fontFamily: 'var(--font-geist-mono), monospace',
                    }}
                  >
                    {job.name}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.25 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4, color: '#64748B' }}>
                      <Server size={11} />
                      <Typography
                        variant="caption"
                        sx={{ fontSize: '0.6875rem', fontFamily: 'var(--font-geist-mono), monospace' }}
                      >
                        {runnerName}
                      </Typography>
                    </Box>
                    {job.commands && (
                      <Typography variant="caption" sx={{ color: '#4B5563', fontSize: '0.6875rem' }}>
                        · {job.commands.length} command{job.commands.length > 1 ? 's' : ''}
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Box>

              {/* Right: Duration & Action indicator */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography
                  variant="caption"
                  sx={{
                    fontFamily: 'var(--font-geist-mono), monospace',
                    color: '#94A3B8',
                    fontWeight: 500,
                  }}
                >
                  {formatDuration(job.startedAt, job.completedAt, job.durationSeconds)}
                </Typography>

                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    color: isSelected ? '#60A5FA' : '#64748B',
                  }}
                >
                  <Terminal size={14} />
                  <ChevronRight size={14} />
                </Box>
              </Box>
            </Card>
          );
        })}
      </Box>
    </Box>
  );
}
