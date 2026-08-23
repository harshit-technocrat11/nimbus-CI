'use client';

import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { GitCommit, Play, Webhook } from 'lucide-react';
import { TriggerType } from '../../types/ci';

interface TriggerBadgeProps {
  type: TriggerType | string;
  size?: 'small' | 'medium';
}

export function TriggerBadge({ type, size = 'small' }: TriggerBadgeProps) {
  const normalized = (type || '').toUpperCase();

  const isPush = normalized.includes('PUSH') || normalized.includes('GITHUB');
  const isManual = normalized.includes('MANUAL');

  const label = isPush ? 'GitHub push' : isManual ? 'Manual' : 'Webhook';
  const icon = isPush ? (
    <GitCommit size={size === 'small' ? 12 : 14} />
  ) : isManual ? (
    <Play size={size === 'small' ? 11 : 13} />
  ) : (
    <Webhook size={size === 'small' ? 12 : 14} />
  );

  return (
    <Box
      component="span"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.6,
        color: '#94A3B8',
        fontSize: size === 'small' ? '0.75rem' : '0.8125rem',
        fontWeight: 400,
      }}
    >
      <Box component="span" sx={{ display: 'flex', alignItems: 'center', color: '#64748B' }}>
        {icon}
      </Box>
      <Typography
        component="span"
        sx={{
          fontSize: 'inherit',
          color: 'inherit',
          lineHeight: 1,
        }}
      >
        {label}
      </Typography>
    </Box>
  );
}
