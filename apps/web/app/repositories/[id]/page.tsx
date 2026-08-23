'use client';

import React, { useEffect, useState, use } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import {
  FolderGit2,
  GitBranch,
  ExternalLink,
  Play,
  ChevronLeft,
  Clock,
  Layers,
  CheckCircle2,
} from 'lucide-react';
import Link from 'next/link';
import { Repository, WorkflowRun, Workflow } from '../../../types/ci';
import { api } from '../../../lib/api';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { TriggerBadge } from '../../../components/common/TriggerBadge';
import { RunList } from '../../../components/runs/RunList';
import { RunCIDialog } from '../../../components/runs/RunCIDialog';
import { CardSkeletonList } from '../../../components/common/LoadingSkeleton';
import { ErrorState } from '../../../components/common/ErrorState';
import { formatDuration, formatRelativeTime, formatShortSha } from '../../../lib/utils';

export default function RepositoryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const repoId = resolvedParams.id;

  const [repository, setRepository] = useState<Repository | null>(null);
  const [runs, setRuns] = useState<WorkflowRun[]>([]);
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [runModalOpen, setRunModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  const fetchRepoData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const repo = await api.getRepository(repoId);
      if (!repo) throw new Error('Repository not found');
      setRepository(repo);

      const allRuns = await api.getAllRuns();
      const repoWorkflows = repo.workflows || (await api.getWorkflows(repoId));
      setWorkflows(repoWorkflows);

      const repoWfIds = repoWorkflows.map((w) => w.id);
      const repoRuns = allRuns.filter((r) => repoWfIds.includes(r.workflowId));
      setRuns(repoRuns);

      setIsLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load repository details');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRepoData();
  }, [repoId]);

  if (isLoading) {
    return (
      <Box sx={{ py: 3 }}>
        <CardSkeletonList count={3} />
      </Box>
    );
  }

  if (error || !repository) {
    return <ErrorState message={error || 'Repository not found'} onRetry={fetchRepoData} />;
  }

  const latestRun = repository.latestRun || runs[0];

  return (
    <Box>
      {/* Back to repositories link */}
      <Box sx={{ mb: 2 }}>
        <Link
          href="/repositories"
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
          Repositories
        </Link>
      </Box>

      {/* Header Profile Bar */}
      <Card
        sx={{
          p: 3,
          backgroundColor: '#0F131C',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: 2,
          mb: 3,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', sm: 'center' },
            gap: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.75 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: '8px',
                backgroundColor: 'rgba(59, 130, 246, 0.12)',
                border: '1px solid rgba(59, 130, 246, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#60A5FA',
              }}
            >
              <FolderGit2 size={22} />
            </Box>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="h1" sx={{ fontSize: '1.35rem', fontWeight: 700 }}>
                  {repository.name}
                </Typography>
                <Chip
                  label={repository.defaultBranch}
                  size="small"
                  icon={<GitBranch size={11} />}
                  sx={{
                    fontFamily: 'var(--font-geist-mono), monospace',
                    height: 22,
                    fontSize: '0.6875rem',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    color: '#CBD5E1',
                  }}
                />
              </Box>
              <Typography variant="body2" sx={{ color: '#64748B' }}>
                {repository.owner} · {repository.url}
              </Typography>
            </Box>
          </Box>

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={() => setRunModalOpen(true)}
              startIcon={<Play size={14} fill="currentColor" />}
            >
              Run CI
            </Button>
            <Button
              variant="outlined"
              component="a"
              href={repository.url}
              target="_blank"
              rel="noopener noreferrer"
              endIcon={<ExternalLink size={13} />}
              sx={{ borderColor: 'rgba(255, 255, 255, 0.15)' }}
            >
              GitHub
            </Button>
          </Box>
        </Box>
      </Card>

      {/* Latest Run Spotlight */}
      {latestRun && (
        <Card
          sx={{
            p: 2.5,
            backgroundColor: '#0B0F17',
            border: '1px solid rgba(59, 130, 246, 0.25)',
            borderRadius: 2,
            mb: 4,
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
            <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Latest CI Run
            </Typography>
            <Link
              href={`/runs/${latestRun.id}`}
              style={{ fontSize: '0.75rem', color: '#60A5FA', textDecoration: 'none', fontWeight: 500 }}
            >
              Inspect Run #{latestRun.id.replace('run-', '')} →
            </Link>
          </Box>

          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              justifyContent: 'space-between',
              alignItems: { xs: 'flex-start', sm: 'center' },
              gap: 2,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <StatusBadge status={latestRun.status} size="medium" />
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#F8FAFC' }}>
                  Run #{latestRun.id.replace('run-', '')} on {latestRun.branch}
                </Typography>
                <Typography variant="caption" sx={{ color: '#94A3B8', fontFamily: 'var(--font-geist-mono), monospace' }}>
                  Commit {formatShortSha(latestRun.commitSha)} · <TriggerBadge type={latestRun.triggerType} />
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="caption" sx={{ color: '#94A3B8', fontFamily: 'var(--font-geist-mono), monospace' }}>
                Duration: {formatDuration(latestRun.startedAt, latestRun.completedAt, latestRun.durationSeconds)}
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748B' }}>
                {formatRelativeTime(latestRun.createdAt)}
              </Typography>
            </Box>
          </Box>
        </Card>
      )}

      {/* Tabs: Recent Runs vs Workflows */}
      <Box sx={{ mb: 2.5 }}>
        <Tabs value={activeTab} onChange={(_, val) => setActiveTab(val)}>
          <Tab label={`Recent Runs (${runs.length})`} />
          <Tab label={`Configured Workflows (${workflows.length})`} />
        </Tabs>
      </Box>

      {/* Tab 0: Recent Runs Table */}
      {activeTab === 0 && (
        <RunList runs={runs} showRepoColumn={false} />
      )}

      {/* Tab 1: Workflows List */}
      {activeTab === 1 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {workflows.map((wf) => (
            <Card
              key={wf.id}
              sx={{
                p: 2.5,
                backgroundColor: '#0E1219',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: 2,
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Layers size={16} color="#3B82F6" />
                  <Typography variant="body1" sx={{ fontWeight: 600, color: '#F8FAFC' }}>
                    {wf.name}
                  </Typography>
                </Box>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => setRunModalOpen(true)}
                  startIcon={<Play size={12} fill="currentColor" />}
                  sx={{ fontSize: '0.75rem', py: 0.25 }}
                >
                  Run Workflow
                </Button>
              </Box>

              <Typography variant="caption" sx={{ color: '#64748B', display: 'block', mb: 1.5 }}>
                Jobs Definition ({wf.definition?.length || 0} stages)
              </Typography>

              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {(wf.definition || []).map((jobDef, jIdx) => (
                  <Box
                    key={jIdx}
                    sx={{
                      p: 1.25,
                      borderRadius: 1,
                      backgroundColor: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.06)',
                      minWidth: 160,
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: 600,
                        color: '#60A5FA',
                        fontFamily: 'var(--font-geist-mono), monospace',
                        display: 'block',
                      }}
                    >
                      {jobDef.name}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        color: '#94A3B8',
                        fontSize: '0.6875rem',
                        fontFamily: 'var(--font-geist-mono), monospace',
                      }}
                    >
                      {jobDef.commands.join(' && ')}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Card>
          ))}
        </Box>
      )}

      {/* Trigger CI Dialog */}
      <RunCIDialog
        open={runModalOpen}
        onClose={() => setRunModalOpen(false)}
        repository={repository}
        workflows={workflows}
      />
    </Box>
  );
}
