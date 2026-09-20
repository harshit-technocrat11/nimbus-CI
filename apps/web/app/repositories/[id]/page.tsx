'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import {
  FolderGit2,
  GitBranch,
  ExternalLink,
  Play,
  ChevronLeft,
  RefreshCw,
  Layers,
  Clock,
} from 'lucide-react';
import { Repository, WorkflowRun, Workflow } from '@/types/ci';
import { api } from '@/lib/api';
import { StatusBadge } from '@/components/common/StatusBadge';
import { RunList } from '@/components/runs/RunList';
import { RunCIDialog } from '@/components/runs/RunCIDialog';
import { CardSkeletonList } from '@/components/common/LoadingSkeleton';
import { ErrorState } from '@/components/common/ErrorState';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { formatRelativeTime, formatDuration } from '@/lib/utils';

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
  const [activeTab, setActiveTab] = useState<'runs' | 'workflows'>('runs');

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
      <div className="py-4 space-y-4">
        <div className="h-6 w-36 bg-secondary/40 rounded animate-pulse" />
        <CardSkeletonList count={3} />
      </div>
    );
  }

  if (error || !repository) {
    return (
      <ErrorState
        message={error || 'Repository not found'}
        onRetry={fetchRepoData}
      />
    );
  }

  const latestRun = repository.latestRun || runs[0];

  return (
    <div className="space-y-5">
      {/* Back Link */}
      <Link
        href="/repositories"
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors group"
      >
        <ChevronLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
        <span>Back to Repositories</span>
      </Link>

      {/* Repository Header Card */}
      <Card className="p-5 bg-card/60 border-border/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <FolderGit2 className="text-primary" size={20} />
              <h1 className="text-base sm:text-lg font-semibold text-foreground tracking-tight flex items-center gap-1.5">
                <span className="text-muted-foreground font-normal">{repository.owner} /</span>
                <span>{repository.name}</span>
              </h1>
              {repository.url && (
                <a
                  href={repository.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors p-1"
                  title="View repository on GitHub"
                >
                  <ExternalLink size={13} />
                </a>
              )}
            </div>

            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1 font-mono text-[11px] bg-secondary/70 px-2 py-0.5 rounded border border-border/60">
                <GitBranch size={11} className="text-primary" />
                <span>{repository.defaultBranch}</span>
              </span>
              <span>•</span>
              <span className="text-[11px]">
                Created {formatRelativeTime(repository.createdAt)}
              </span>
              {latestRun && (
                <>
                  <span>•</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px]">Latest:</span>
                    <StatusBadge status={latestRun.status} size="small" />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchRepoData}
              title="Refresh status"
              className="gap-1.5 h-8 text-xs"
            >
              <RefreshCw size={13} />
              <span className="hidden sm:inline">Refresh</span>
            </Button>

            <Button
              size="sm"
              onClick={() => setRunModalOpen(true)}
              className="gap-1.5 h-8 text-xs font-medium"
            >
              <Play size={12} className="fill-current" />
              <span>Run workflow</span>
            </Button>
          </div>
        </div>
      </Card>

      {/* Tabs: Runs & Workflows */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-border/60 pb-2">
          <button
            onClick={() => setActiveTab('runs')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              activeTab === 'runs'
                ? 'bg-secondary text-foreground border border-border'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Run History ({runs.length})
          </button>
          <button
            onClick={() => setActiveTab('workflows')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              activeTab === 'workflows'
                ? 'bg-secondary text-foreground border border-border'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Workflows ({workflows.length})
          </button>
        </div>

        {/* Tab 1: Run History */}
        {activeTab === 'runs' && (
          <RunList runs={runs} showRepoColumn={false} />
        )}

        {/* Tab 2: Workflows Definition */}
        {activeTab === 'workflows' && (
          <div className="space-y-3">
            {workflows.map((wf) => {
              const wfRuns = runs.filter((r) => r.workflowId === wf.id);
              const lastWfRun = wfRuns[0];

              return (
                <Card
                  key={wf.id}
                  className="p-4 bg-card/40 border-border/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Layers size={15} className="text-primary" />
                      <span className="font-semibold text-xs text-foreground font-mono">
                        {wf.name}
                      </span>
                      <Badge variant="secondary" className="text-[10px] font-mono">
                        v{wf.configVersion}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{wfRuns.length} runs executed</span>
                      {lastWfRun && (
                        <>
                          <span>•</span>
                          <span>Last run {formatRelativeTime(lastWfRun.createdAt)}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {lastWfRun && (
                      <StatusBadge status={lastWfRun.status} size="small" />
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setRunModalOpen(true)}
                      className="gap-1.5 h-7 text-xs"
                    >
                      <Play size={11} className="fill-current" />
                      <span>Run</span>
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Manual Run Dialog */}
      <RunCIDialog
        open={runModalOpen}
        onClose={() => setRunModalOpen(false)}
        repository={repository}
        workflows={workflows}
        onTriggered={() => {
          fetchRepoData();
        }}
      />
    </div>
  );
}
