'use client';

import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import { Search, GitBranch, PlaySquare, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { WorkflowRun } from '../../types/ci';
import { StatusBadge } from '../common/StatusBadge';
import { TriggerBadge } from '../common/TriggerBadge';
import { EmptyState } from '../common/EmptyState';
import { formatDuration, formatRelativeTime, formatShortSha } from '../../lib/utils';

interface RunListProps {
  runs: WorkflowRun[];
  showRepoColumn?: boolean;
  title?: string;
  subtitle?: string;
}

export function RunList({
  runs,
  showRepoColumn = true,
  title,
  subtitle,
}: RunListProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'SUCCESS' | 'RUNNING' | 'FAILED' | 'QUEUED'>('ALL');

  const filteredRuns = runs.filter((run) => {
    const repoName = run.workflow?.repository?.name || '';
    const branch = run.branch || '';
    const commit = run.commitSha || '';

    const matchesSearch =
      repoName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      branch.toLowerCase().includes(searchQuery.toLowerCase()) ||
      commit.toLowerCase().includes(searchQuery.toLowerCase()) ||
      run.id.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (statusFilter === 'ALL') return true;
    return run.status === statusFilter;
  });

  return (
    <Box>
      {title && (
        <Box sx={{ mb: 2.5 }}>
          <Typography variant="h1" sx={{ fontSize: '1.5rem', fontWeight: 700, mb: 0.5 }}>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body2" sx={{ color: '#94A3B8' }}>
              {subtitle}
            </Typography>
          )}
        </Box>
      )}

      {/* Filter Row */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'stretch', sm: 'center' },
          gap: 1.5,
          mb: 2,
        }}
      >
        <TextField
          size="small"
          placeholder="Filter by run, branch, or commit..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ minWidth: { xs: '100%', sm: 300 } }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search size={15} color="#64748B" />
              </InputAdornment>
            ),
          }}
        />

        <Box sx={{ display: 'flex', gap: 0.75, overflowX: 'auto', pb: { xs: 1, sm: 0 } }}>
          {(['ALL', 'SUCCESS', 'RUNNING', 'FAILED', 'QUEUED'] as const).map((filter) => {
            const isSelected = statusFilter === filter;
            return (
              <Chip
                key={filter}
                label={filter === 'ALL' ? 'All Runs' : filter}
                size="small"
                onClick={() => setStatusFilter(filter)}
                sx={{
                  cursor: 'pointer',
                  backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                  borderColor: isSelected ? 'rgba(59, 130, 246, 0.35)' : 'rgba(255, 255, 255, 0.08)',
                  borderWidth: 1,
                  borderStyle: 'solid',
                  color: isSelected ? '#60A5FA' : '#94A3B8',
                  fontSize: '0.75rem',
                  fontWeight: isSelected ? 600 : 400,
                  '&:hover': {
                    backgroundColor: isSelected
                      ? 'rgba(59, 130, 246, 0.25)'
                      : 'rgba(255, 255, 255, 0.06)',
                  },
                }}
              />
            );
          })}
        </Box>
      </Box>

      {/* Runs Table */}
      {filteredRuns.length === 0 ? (
        <EmptyState
          icon={<PlaySquare size={32} />}
          title={searchQuery ? 'No matching runs' : 'No workflow runs yet'}
          description={
            searchQuery
              ? 'No workflow runs match your search filters.'
              : 'Trigger a workflow run from the repository page to start tracking CI activity.'
          }
        />
      ) : (
        <TableContainer
          component={Paper}
          sx={{
            borderRadius: 2,
            border: '1px solid rgba(255, 255, 255, 0.08)',
            backgroundColor: '#0E1219',
          }}
        >
          <Table sx={{ minWidth: 650 }} aria-label="workflow runs table">
            <TableHead>
              <TableRow>
                <TableCell>Status</TableCell>
                <TableCell>Run</TableCell>
                {showRepoColumn && <TableCell>Repository</TableCell>}
                <TableCell>Branch / Commit</TableCell>
                <TableCell>Trigger</TableCell>
                <TableCell>Duration</TableCell>
                <TableCell>Created</TableCell>
                <TableCell align="right"></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredRuns.map((run) => {
                const repo = run.workflow?.repository;
                const runNumber = run.id.replace('run-', '#');

                return (
                  <TableRow
                    key={run.id}
                    hover
                    onClick={() => router.push(`/runs/${run.id}`)}
                    sx={{
                      cursor: 'pointer',
                      '&:last-child td, &:last-child th': { border: 0 },
                    }}
                  >
                    {/* Status */}
                    <TableCell>
                      <StatusBadge status={run.status} size="small" />
                    </TableCell>

                    {/* Run Number */}
                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 600,
                          fontFamily: 'var(--font-geist-mono), monospace',
                          color: '#F8FAFC',
                        }}
                      >
                        {runNumber}
                      </Typography>
                    </TableCell>

                    {/* Repository */}
                    {showRepoColumn && (
                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{
                            color: '#CBD5E1',
                            fontWeight: 500,
                          }}
                        >
                          {repo?.name || 'nimbus-ci'}
                        </Typography>
                      </TableCell>
                    )}

                    {/* Branch / Commit */}
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                        <GitBranch size={12} color="#3B82F6" />
                        <Typography
                          variant="caption"
                          sx={{
                            fontFamily: 'var(--font-geist-mono), monospace',
                            fontWeight: 500,
                            color: '#F8FAFC',
                          }}
                        >
                          {run.branch}
                        </Typography>
                        {run.commitSha && (
                          <Typography
                            variant="caption"
                            sx={{
                              color: '#64748B',
                              fontFamily: 'var(--font-geist-mono), monospace',
                            }}
                          >
                            · {formatShortSha(run.commitSha)}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>

                    {/* Trigger */}
                    <TableCell>
                      <TriggerBadge type={run.triggerType} size="small" />
                    </TableCell>

                    {/* Duration */}
                    <TableCell>
                      <Typography
                        variant="caption"
                        sx={{
                          fontFamily: 'var(--font-geist-mono), monospace',
                          color: '#94A3B8',
                        }}
                      >
                        {formatDuration(run.startedAt, run.completedAt, run.durationSeconds)}
                      </Typography>
                    </TableCell>

                    {/* Created relative time */}
                    <TableCell>
                      <Typography variant="caption" sx={{ color: '#64748B' }}>
                        {formatRelativeTime(run.createdAt)}
                      </Typography>
                    </TableCell>

                    {/* Arrow */}
                    <TableCell align="right">
                      <IconButton size="small" sx={{ color: '#64748B' }}>
                        <ChevronRight size={14} />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
