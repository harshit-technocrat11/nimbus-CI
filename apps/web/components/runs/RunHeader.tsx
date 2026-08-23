'use client';

import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import {
  GitBranch,
  GitCommit,
  Copy,
  Check,
  Play,
  Calendar,
  Clock,
  ExternalLink,
  ChevronLeft,
} from 'lucide-react';
import Link from 'next/link';
import { WorkflowRun } from '../../types/ci';
import { StatusBadge } from '../common/StatusBadge';
import { TriggerBadge } from '../common/TriggerBadge';
import { formatDuration, formatFullDateTime, formatRelativeTime, formatShortSha, copyToClipboard } from '../../lib/utils';
import { RunCIDialog } from './RunCIDialog';

interface RunHeaderProps {
  run: WorkflowRun;
  onRefresh?: () => void;
}

export function RunHeader({ run, onRefresh }: RunHeaderProps) {
  const [copied, setCopied] = useState(false);
  const [reRunDialogOpen, setReRunDialogOpen] = useState(false);

  const repository = run.workflow?.repository;
  const runNumber = run.id.replace('run-', '#');

  const handleCopySha = async () => {
    if (!run.commitSha) return;
    const success = await copyToClipboard(run.commitSha);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Box sx={{ mb: 3 }}>
      {/* Back link */}
      {repository && (
        <Box sx={{ mb: 1.5 }}>
          <Link
            href={`/repositories/${repository.id}`}
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
            Back to {repository.name}
          </Link>
        </Box>
      )}

      {/* Main Run Summary Card */}
      <Card
        sx={{
          p: 3,
          backgroundColor: '#0F131C',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: 2,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', md: 'center' },
            gap: 2,
            mb: 2.5,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
            <Typography variant="h1" sx={{ fontSize: '1.5rem', fontWeight: 700 }}>
              Run {runNumber}
            </Typography>
            <StatusBadge status={run.status} size="medium" />
            <TriggerBadge type={run.triggerType} />
          </Box>

          {/* Quick Actions */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Button
              variant="outlined"
              size="small"
              onClick={() => setReRunDialogOpen(true)}
              startIcon={<Play size={13} fill="currentColor" />}
              sx={{ borderColor: 'rgba(255, 255, 255, 0.15)' }}
            >
              Re-run CI
            </Button>
            {repository?.url && (
              <Button
                variant="outlined"
                size="small"
                component="a"
                href={repository.url}
                target="_blank"
                rel="noopener noreferrer"
                endIcon={<ExternalLink size={13} />}
                sx={{ borderColor: 'rgba(255, 255, 255, 0.15)' }}
              >
                GitHub
              </Button>
            )}
          </Box>
        </Box>

        {/* Compact Metadata Rows */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' },
            gap: 2,
            pt: 2,
            borderTop: '1px solid rgba(255, 255, 255, 0.06)',
          }}
        >
          {/* Repository & Branch */}
          <Box>
            <Typography variant="caption" sx={{ color: '#64748B', display: 'block', mb: 0.25 }}>
              Repository / Branch
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <GitBranch size={13} color="#3B82F6" />
              <Typography
                variant="body2"
                sx={{
                  fontFamily: 'var(--font-geist-mono), monospace',
                  fontWeight: 600,
                  color: '#F8FAFC',
                }}
              >
                {repository?.name || 'repo'} / {run.branch}
              </Typography>
            </Box>
          </Box>

          {/* Commit SHA */}
          <Box>
            <Typography variant="caption" sx={{ color: '#64748B', display: 'block', mb: 0.25 }}>
              Commit
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <GitCommit size={13} color="#94A3B8" />
              <Typography
                variant="body2"
                sx={{
                  fontFamily: 'var(--font-geist-mono), monospace',
                  color: '#CBD5E1',
                  fontWeight: 500,
                }}
              >
                {formatShortSha(run.commitSha)}
              </Typography>
              {run.commitSha && (
                <Tooltip title={copied ? 'Copied SHA!' : 'Copy full SHA'}>
                  <IconButton size="small" onClick={handleCopySha} sx={{ p: 0.25, color: '#64748B' }}>
                    {copied ? <Check size={12} color="#10B981" /> : <Copy size={12} />}
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          </Box>

          {/* Duration */}
          <Box>
            <Typography variant="caption" sx={{ color: '#64748B', display: 'block', mb: 0.25 }}>
              Duration
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <Clock size={13} color="#94A3B8" />
              <Typography
                variant="body2"
                sx={{
                  fontFamily: 'var(--font-geist-mono), monospace',
                  fontWeight: 600,
                  color: '#F8FAFC',
                }}
              >
                {formatDuration(run.startedAt, run.completedAt, run.durationSeconds)}
              </Typography>
            </Box>
          </Box>

          {/* Timestamps */}
          <Box>
            <Typography variant="caption" sx={{ color: '#64748B', display: 'block', mb: 0.25 }}>
              Started
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <Calendar size={13} color="#94A3B8" />
              <Tooltip title={formatFullDateTime(run.createdAt)}>
                <Typography variant="body2" sx={{ color: '#CBD5E1' }}>
                  {formatRelativeTime(run.createdAt)}
                </Typography>
              </Tooltip>
            </Box>
          </Box>
        </Box>

        {/* Error message if run failed */}
        {run.errorMessage && (
          <Box
            sx={{
              mt: 2,
              p: 1.5,
              borderRadius: 1,
              backgroundColor: 'rgba(239, 68, 68, 0.08)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              color: '#FCA5A5',
              fontSize: '0.8125rem',
              fontFamily: 'var(--font-geist-mono), monospace',
            }}
          >
            {run.errorMessage}
          </Box>
        )}
      </Card>

      {/* Re-run CI Modal */}
      {reRunDialogOpen && repository && (
        <RunCIDialog
          open={reRunDialogOpen}
          onClose={() => setReRunDialogOpen(false)}
          repository={repository}
          workflows={run.workflow ? [run.workflow] : []}
        />
      )}
    </Box>
  );
}
