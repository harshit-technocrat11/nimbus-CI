'use client';

import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import LinearProgress from '@mui/material/LinearProgress';
import { Server, Cpu, Clock, Layers } from 'lucide-react';
import { Runner } from '../../types/ci';
import { StatusBadge } from '../common/StatusBadge';
import { formatRelativeTime } from '../../lib/utils';

interface RunnerCardProps {
  runner: Runner;
}

export function RunnerCard({ runner }: RunnerCardProps) {
  const utilization = Math.round((runner.activeJobs / Math.max(1, runner.capacity)) * 100);
  const isOnline = runner.status === 'ONLINE' || runner.status === 'BUSY';

  return (
    <Card
      sx={{
        p: 2.5,
        backgroundColor: '#0E1219',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: 2,
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        transition: 'all 0.15s ease',
        '&:hover': {
          borderColor: 'rgba(255, 255, 255, 0.18)',
        },
      }}
    >
      {/* Header: Name & Status */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: '6px',
              backgroundColor: isOnline ? 'rgba(59, 130, 246, 0.12)' : 'rgba(255, 255, 255, 0.04)',
              border: `1px solid ${isOnline ? 'rgba(59, 130, 246, 0.25)' : 'rgba(255, 255, 255, 0.08)'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: isOnline ? '#60A5FA' : '#64748B',
            }}
          >
            <Server size={16} />
          </Box>
          <Box>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 600,
                color: '#F8FAFC',
                fontFamily: 'var(--font-geist-mono), monospace',
              }}
            >
              {runner.name}
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748B' }}>
              Docker Worker Node
            </Typography>
          </Box>
        </Box>

        <StatusBadge status={runner.status} size="small" />
      </Box>

      {/* Capacity & Load Bar */}
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.75 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#94A3B8' }}>
            <Layers size={13} color="#64748B" />
            <Typography variant="caption" sx={{ fontWeight: 500 }}>
              Slot Utilization
            </Typography>
          </Box>
          <Typography
            variant="caption"
            sx={{
              fontFamily: 'var(--font-geist-mono), monospace',
              fontWeight: 600,
              color: runner.activeJobs > 0 ? '#60A5FA' : '#94A3B8',
            }}
          >
            {runner.activeJobs} / {runner.capacity} active
          </Typography>
        </Box>

        <LinearProgress
          variant="determinate"
          value={utilization}
          sx={{
            height: 6,
            borderRadius: 3,
            backgroundColor: 'rgba(255, 255, 255, 0.06)',
            '& .MuiLinearProgress-bar': {
              backgroundColor:
                utilization >= 100 ? '#F59E0B' : utilization > 0 ? '#3B82F6' : '#10B981',
              borderRadius: 3,
            },
          }}
        />
      </Box>

      {/* Footer Info */}
      <Box
        sx={{
          pt: 1.5,
          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#64748B' }}>
          <Clock size={12} />
          <Typography variant="caption" sx={{ fontSize: '0.6875rem' }}>
            Heartbeat: {formatRelativeTime(runner.lastHeartbeat)}
          </Typography>
        </Box>

        <Typography
          variant="caption"
          sx={{
            color: '#64748B',
            fontSize: '0.6875rem',
            fontFamily: 'var(--font-geist-mono), monospace',
          }}
        >
          x86_64 / Linux
        </Typography>
      </Box>
    </Card>
  );
}
