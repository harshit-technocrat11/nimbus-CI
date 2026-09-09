'use client';

import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import {
  Search,
  Plus,
  GitBranch,
  ExternalLink,
  Play,
  FolderGit2,
  ChevronRight,
} from 'lucide-react';
import Link from 'next/link';
import { Repository } from '../../types/ci';
import { StatusBadge } from '../common/StatusBadge';
import { EmptyState } from '../common/EmptyState';
import { formatRelativeTime, formatShortSha, formatDuration } from '../../lib/utils';
import { RunCIDialog } from '../runs/RunCIDialog';

interface RepositoryListProps {
  repositories: Repository[];
  onOpenConnectModal?: () => void;
  onRefresh?: () => void;
}

export function RepositoryList({
  repositories,
  onOpenConnectModal,
  onRefresh,
}: RepositoryListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'SUCCESS' | 'RUNNING' | 'FAILED'>('ALL');
  const [selectedRepoForRun, setSelectedRepoForRun] = useState<Repository | null>(null);

  const filteredRepositories = repositories.filter((repo) => {
    const matchesSearch =
      repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      repo.owner.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (statusFilter === 'ALL') return true;

    const latestStatus = repo.latestRun?.status;
    return latestStatus === statusFilter;
  });

  return (
    <Box>
      {/* Header Bar */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          gap: 2,
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h1" sx={{ fontSize: '1.5rem', fontWeight: 700, mb: 0.5 }}>
            Repositories
          </Typography>
          <Typography variant="body2" sx={{ color: '#94A3B8' }}>
            Connected repositories and their latest continuous integration activity.
          </Typography>
        </Box>

        {onOpenConnectModal && (
          <Button
            variant="contained"
            color="primary"
            onClick={onOpenConnectModal}
            startIcon={<Plus size={16} />}
            sx={{ fontWeight: 600 }}
          >
            Connect Repository
          </Button>
        )}
      </Box>

      {/* Filter and Search Row */}
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
          placeholder="Filter repositories..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ minWidth: { xs: '100%', sm: 280 } }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search size={15} color="#64748B" />
              </InputAdornment>
            ),
          }}
        />

        <Box sx={{ display: 'flex', gap: 0.75, overflowX: 'auto', pb: { xs: 1, sm: 0 } }}>
          {(['ALL', 'SUCCESS', 'RUNNING', 'FAILED'] as const).map((filter) => {
            const isSelected = statusFilter === filter;
            return (
              <Chip
                key={filter}
                label={filter === 'ALL' ? 'All Repos' : filter}
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

      {/* Repositories Table / List */}
      {filteredRepositories.length === 0 ? (
        <EmptyState
          icon={<FolderGit2 size={32} />}
          title={searchQuery ? 'No matching repositories' : 'No repositories connected'}
          description={
            searchQuery
              ? 'No connected repositories match your search query.'
              : 'Connect a GitHub repository to start running automated CI pipelines with Nimbus.'
          }
          actionLabel={searchQuery ? undefined : 'Connect GitHub Repository'}
          onAction={onOpenConnectModal}
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
          <Table sx={{ minWidth: 650 }} aria-label="repositories table">
            <TableHead>
              <TableRow>
                <TableCell>Repository</TableCell>
                <TableCell>Latest Status</TableCell>
                <TableCell>Commit / Branch</TableCell>
                <TableCell>Duration / Time</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredRepositories.map((repo) => {
                const latestRun = repo.latestRun;
                return (
                  <TableRow
                    key={repo.id}
                    hover
                    sx={{
                      cursor: 'pointer',
                      '&:last-child td, &:last-child th': { border: 0 },
                    }}
                  >
                    {/* Repository Name & Owner */}
                    <TableCell>
                      <Link href={`/repositories/${repo.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                          <Box
                            sx={{
                              width: 28,
                              height: 28,
                              borderRadius: '4px',
                              backgroundColor: 'rgba(255, 255, 255, 0.04)',
                              border: '1px solid rgba(255, 255, 255, 0.08)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#94A3B8',
                            }}
                          >
                            <FolderGit2 size={14} />
                          </Box>
                          <Box>
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 600, color: '#F8FAFC', '&:hover': { color: '#60A5FA' } }}
                            >
                              {repo.name}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#64748B' }}>
                              {repo.owner}
                            </Typography>
                          </Box>
                        </Box>
                      </Link>
                    </TableCell>

                    {/* Status Badge */}
                    <TableCell>
                      <Link href={`/repositories/${repo.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                        {latestRun ? (
                          <StatusBadge status={latestRun.status} />
                        ) : (
                          <Typography
                            variant="caption"
                            sx={{
                              color: '#64748B',
                              fontFamily: 'var(--font-geist-mono), monospace',
                            }}
                          >
                            ○ NO RUNS
                          </Typography>
                        )}
                      </Link>
                    </TableCell>

                    {/* Commit & Branch */}
                    <TableCell>
                      <Link href={`/repositories/${repo.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#94A3B8' }}>
                            <GitBranch size={12} color="#64748B" />
                            <Typography
                              variant="caption"
                              sx={{ fontFamily: 'var(--font-geist-mono), monospace', fontWeight: 500 }}
                            >
                              {latestRun?.branch || repo.defaultBranch}
                            </Typography>
                          </Box>
                          {latestRun?.commitSha && (
                            <Typography
                              variant="caption"
                              sx={{
                                color: '#64748B',
                                fontFamily: 'var(--font-geist-mono), monospace',
                              }}
                            >
                              · {formatShortSha(latestRun.commitSha)}
                            </Typography>
                          )}
                        </Box>
                      </Link>
                    </TableCell>

                    {/* Duration & Relative Time */}
                    <TableCell>
                      <Link href={`/repositories/${repo.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                        {latestRun ? (
                          <Box>
                            <Typography
                              variant="caption"
                              sx={{
                                display: 'block',
                                color: '#94A3B8',
                                fontFamily: 'var(--font-geist-mono), monospace',
                              }}
                            >
                              {formatDuration(latestRun.startedAt, latestRun.completedAt, latestRun.durationSeconds)}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#64748B' }}>
                              {formatRelativeTime(latestRun.createdAt)}
                            </Typography>
                          </Box>
                        ) : (
                          <Typography variant="caption" sx={{ color: '#64748B' }}>
                            —
                          </Typography>
                        )}
                      </Link>
                    </TableCell>

                    {/* Action buttons */}
                    <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.75 }}>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedRepoForRun(repo);
                          }}
                          startIcon={<Play size={11} fill="currentColor" />}
                          sx={{
                            fontSize: '0.75rem',
                            py: 0.25,
                            px: 1,
                            borderColor: 'rgba(255, 255, 255, 0.1)',
                            color: '#E2E8F0',
                          }}
                        >
                          Run CI
                        </Button>

                        <Tooltip title="View on GitHub">
                          <IconButton
                            size="small"
                            component="a"
                            href={repo.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            sx={{ color: '#64748B', '&:hover': { color: '#94A3B8' } }}
                          >
                            <ExternalLink size={14} />
                          </IconButton>
                        </Tooltip>

                        <IconButton
                          size="small"
                          component={Link}
                          href={`/repositories/${repo.id}`}
                          sx={{ color: '#64748B', '&:hover': { color: '#60A5FA' } }}
                        >
                          <ChevronRight size={16} />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Run CI Modal */}
      {selectedRepoForRun && (
        <RunCIDialog
          open={Boolean(selectedRepoForRun)}
          onClose={() => setSelectedRepoForRun(null)}
          repository={selectedRepoForRun}
          workflows={selectedRepoForRun.workflows}
        />
      )}
    </Box>
  );
}
