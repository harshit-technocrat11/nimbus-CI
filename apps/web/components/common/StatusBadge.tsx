'use client';

import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import {
  CheckCircle2,
  Clock,
  Loader2,
  XCircle,
  MinusCircle,
  Radio,
  Activity,
  PowerOff,
} from 'lucide-react';
import { WorkflowRunStatus, JobStatus, RunnerStatus } from '../../types/ci';

type StatusType = WorkflowRunStatus | JobStatus | RunnerStatus | string;

interface StatusBadgeProps {
  status: StatusType;
  size?: 'small' | 'medium';
  showLabel?: boolean;
}

interface StatusConfig {
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  icon: React.ReactNode;
  pulse?: boolean;
}

export function StatusBadge({ status, size = 'small', showLabel = true }: StatusBadgeProps) {
  const normalized = (status || '').toUpperCase();

  const getConfig = (): StatusConfig => {
    switch (normalized) {
      case 'SUCCESS':
        return {
          label: 'SUCCESS',
          color: '#10B981',
          bgColor: 'rgba(16, 185, 129, 0.12)',
          borderColor: 'rgba(16, 185, 129, 0.25)',
          icon: <CheckCircle2 size={size === 'small' ? 12 : 14} strokeWidth={2.5} />,
        };
      case 'RUNNING':
        return {
          label: 'RUNNING',
          color: '#3B82F6',
          bgColor: 'rgba(59, 130, 246, 0.12)',
          borderColor: 'rgba(59, 130, 246, 0.3)',
          icon: (
            <Loader2
              size={size === 'small' ? 12 : 14}
              strokeWidth={2.5}
              className="animate-spin"
              style={{ animation: 'spin 1.5s linear infinite' }}
            />
          ),
          pulse: true,
        };
      case 'QUEUED':
        return {
          label: 'QUEUED',
          color: '#94A3B8',
          bgColor: 'rgba(148, 163, 184, 0.1)',
          borderColor: 'rgba(148, 163, 184, 0.2)',
          icon: <Clock size={size === 'small' ? 12 : 14} strokeWidth={2} />,
        };
      case 'FAILED':
        return {
          label: 'FAILED',
          color: '#EF4444',
          bgColor: 'rgba(239, 68, 68, 0.12)',
          borderColor: 'rgba(239, 68, 68, 0.28)',
          icon: <XCircle size={size === 'small' ? 12 : 14} strokeWidth={2.5} />,
        };
      case 'CANCELLED':
        return {
          label: 'CANCELLED',
          color: '#64748B',
          bgColor: 'rgba(100, 116, 139, 0.1)',
          borderColor: 'rgba(100, 116, 139, 0.2)',
          icon: <MinusCircle size={size === 'small' ? 12 : 14} strokeWidth={2} />,
        };
      case 'ONLINE':
        return {
          label: 'ONLINE',
          color: '#10B981',
          bgColor: 'rgba(16, 185, 129, 0.12)',
          borderColor: 'rgba(16, 185, 129, 0.25)',
          icon: <Radio size={size === 'small' ? 12 : 14} strokeWidth={2.5} />,
        };
      case 'BUSY':
        return {
          label: 'BUSY',
          color: '#F59E0B',
          bgColor: 'rgba(245, 158, 11, 0.12)',
          borderColor: 'rgba(245, 158, 11, 0.28)',
          icon: <Activity size={size === 'small' ? 12 : 14} strokeWidth={2.5} />,
          pulse: true,
        };
      case 'OFFLINE':
      case 'DRAINING':
        return {
          label: normalized,
          color: '#64748B',
          bgColor: 'rgba(100, 116, 139, 0.1)',
          borderColor: 'rgba(100, 116, 139, 0.2)',
          icon: <PowerOff size={size === 'small' ? 12 : 14} strokeWidth={2} />,
        };
      default:
        return {
          label: normalized || 'UNKNOWN',
          color: '#94A3B8',
          bgColor: 'rgba(148, 163, 184, 0.1)',
          borderColor: 'rgba(148, 163, 184, 0.2)',
          icon: <Clock size={size === 'small' ? 12 : 14} strokeWidth={2} />,
        };
    }
  };

  const config = getConfig();

  return (
    <Box
      component="span"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.75,
        px: size === 'small' ? 1 : 1.25,
        py: size === 'small' ? 0.35 : 0.5,
        borderRadius: '4px',
        backgroundColor: config.bgColor,
        border: `1px solid ${config.borderColor}`,
        color: config.color,
        fontSize: size === 'small' ? '0.6875rem' : '0.75rem',
        fontWeight: 600,
        letterSpacing: '0.04em',
        fontFamily: 'var(--font-geist-mono), monospace',
        whiteSpace: 'nowrap',
        userSelect: 'none',
      }}
    >
      <Box component="span" sx={{ display: 'flex', alignItems: 'center' }}>
        {config.icon}
      </Box>
      {showLabel && (
        <Typography
          component="span"
          sx={{
            fontSize: 'inherit',
            fontWeight: 'inherit',
            color: 'inherit',
            fontFamily: 'inherit',
            lineHeight: 1,
          }}
        >
          {config.label}
        </Typography>
      )}
    </Box>
  );
}
