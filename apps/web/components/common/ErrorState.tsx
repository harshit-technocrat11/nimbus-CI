'use client';

import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = 'Unable to load data',
  message = 'An unexpected error occurred while communicating with the Nimbus CI service.',
  onRetry,
}: ErrorStateProps) {
  return (
    <Box
      sx={{
        py: 4,
        px: 3,
        textAlign: 'center',
        border: '1px solid rgba(239, 68, 68, 0.25)',
        borderRadius: 2,
        backgroundColor: 'rgba(239, 68, 68, 0.05)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        maxWidth: 540,
        mx: 'auto',
        my: 3,
      }}
    >
      <Box
        sx={{
          color: '#EF4444',
          mb: 1.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <AlertCircle size={28} />
      </Box>
      <Typography variant="h4" sx={{ color: '#F87171', fontWeight: 600, mb: 0.5 }}>
        {title}
      </Typography>
      <Typography variant="body2" sx={{ color: '#CBD5E1', mb: onRetry ? 2 : 0, maxWidth: 420 }}>
        {message}
      </Typography>
      {onRetry && (
        <Button
          variant="outlined"
          color="error"
          onClick={onRetry}
          size="small"
          startIcon={<RefreshCw size={14} />}
          sx={{ borderColor: 'rgba(239, 68, 68, 0.4)' }}
        >
          Retry
        </Button>
      )}
    </Box>
  );
}
