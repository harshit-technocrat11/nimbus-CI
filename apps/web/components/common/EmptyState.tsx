'use client';

import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <Box
      sx={{
        py: 8,
        px: 3,
        textAlign: 'center',
        border: '1px dashed rgba(255, 255, 255, 0.12)',
        borderRadius: 2,
        backgroundColor: 'rgba(255, 255, 255, 0.01)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        maxWidth: 500,
        mx: 'auto',
        my: 4,
      }}
    >
      {icon && (
        <Box
          sx={{
            color: '#64748B',
            mb: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 1.5,
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
          }}
        >
          {icon}
        </Box>
      )}
      <Typography variant="h3" sx={{ fontSize: '1.05rem', fontWeight: 600, mb: 0.75 }}>
        {title}
      </Typography>
      {description && (
        <Typography variant="body2" sx={{ color: '#94A3B8', mb: actionLabel ? 2.5 : 0, maxWidth: 360 }}>
          {description}
        </Typography>
      )}
      {actionLabel && onAction && (
        <Button variant="contained" color="primary" onClick={onAction} size="small">
          {actionLabel}
        </Button>
      )}
    </Box>
  );
}
