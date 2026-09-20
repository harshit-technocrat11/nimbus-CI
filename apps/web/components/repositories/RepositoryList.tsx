'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Search,
  GitBranch,
  ExternalLink,
  Play,
  FolderGit2,
  ChevronRight,
  GitFork,
} from 'lucide-react';
import { Repository } from '@/types/ci';
import { StatusBadge } from '@/components/common/StatusBadge';
import { EmptyState } from '@/components/common/EmptyState';
import { formatRelativeTime, formatShortSha, formatDuration } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { RunCIDialog } from '@/components/runs/RunCIDialog';

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
    <div className="space-y-4">
      {/* Top Header & Search Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-2">
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-foreground flex items-center gap-2">
            <span>Repositories</span>
            <Badge variant="secondary" className="text-[11px] font-mono font-normal">
              {repositories.length}
            </Badge>
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Monitored GitHub repositories configured for automated CI workflows
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search
              size={14}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
            />
            <Input
              placeholder="Filter repositories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-8 text-xs bg-secondary/30"
            />
          </div>

          <Button
            size="sm"
            onClick={onOpenConnectModal}
            className="gap-1.5 h-8 text-xs shrink-0"
          >
            <GitFork size={13} />
            <span>Connect</span>
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 border-b border-border/60 pb-2.5 text-xs">
        {(['ALL', 'SUCCESS', 'RUNNING', 'FAILED'] as const).map((filter) => (
          <button
            key={filter}
            onClick={() => setStatusFilter(filter)}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
              statusFilter === filter
                ? 'bg-secondary text-foreground border border-border'
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary/40'
            }`}
          >
            {filter === 'ALL' ? 'All Repositories' : filter}
          </button>
        ))}
      </div>

      {/* Table Container */}
      {filteredRepositories.length === 0 ? (
        <EmptyState
          icon={<FolderGit2 size={24} />}
          title={searchQuery ? 'No repositories match filter' : 'No repositories connected'}
          description={
            searchQuery
              ? 'Try changing your search term or status filter'
              : 'Connect a GitHub repository to trigger CI builds on push and pull requests'
          }
          actionLabel={searchQuery ? 'Clear filter' : 'Connect Repository'}
          onAction={() => {
            if (searchQuery) {
              setSearchQuery('');
              setStatusFilter('ALL');
            } else {
              onOpenConnectModal?.();
            }
          }}
        />
      ) : (
        <div className="rounded-lg border border-border bg-card/40 overflow-hidden shadow-xs">
          <Table>
            <TableHeader className="bg-secondary/20">
              <TableRow>
                <TableHead className="w-[38%]">Repository</TableHead>
                <TableHead className="w-[24%]">Latest Run</TableHead>
                <TableHead className="w-[18%]">Commit / Branch</TableHead>
                <TableHead className="w-[12%]">Activity</TableHead>
                <TableHead className="w-[8%] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRepositories.map((repo) => {
                const latestRun = repo.latestRun;
                return (
                  <TableRow key={repo.id} className="group hover:bg-secondary/30">
                    {/* Repository Name & Branch */}
                    <TableCell>
                      <div className="flex items-start gap-2.5">
                        <FolderGit2
                          size={16}
                          className="text-primary mt-0.5 shrink-0 group-hover:scale-105 transition-transform"
                        />
                        <div className="min-w-0">
                          <Link
                            href={`/repositories/${repo.id}`}
                            className="font-semibold text-xs text-foreground hover:text-primary transition-colors flex items-center gap-1.5"
                          >
                            <span className="text-muted-foreground font-normal">{repo.owner}/</span>
                            <span>{repo.name}</span>
                          </Link>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="inline-flex items-center gap-1 text-[11px] font-mono text-muted-foreground">
                              <GitBranch size={11} />
                              <span>{repo.defaultBranch}</span>
                            </span>
                            {repo.url && (
                              <a
                                href={repo.url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-muted-foreground/60 hover:text-muted-foreground transition-colors"
                                title="Open on GitHub"
                              >
                                <ExternalLink size={11} />
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    {/* Latest Run */}
                    <TableCell>
                      {latestRun ? (
                        <div className="space-y-1">
                          <Link href={`/runs/${latestRun.id}`}>
                            <StatusBadge status={latestRun.status} size="small" />
                          </Link>
                          <p className="text-[11px] text-muted-foreground truncate max-w-[200px]">
                            {latestRun.workflow?.name || 'CI Workflow'}
                          </p>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground/60 font-mono">No runs yet</span>
                      )}
                    </TableCell>

                    {/* Commit SHA / Branch */}
                    <TableCell>
                      {latestRun ? (
                        <div className="space-y-0.5">
                          <span className="font-mono text-[11px] text-foreground bg-secondary/60 px-1.5 py-0.5 rounded border border-border/60">
                            {formatShortSha(latestRun.commitSha)}
                          </span>
                          <p className="text-[10px] text-muted-foreground font-mono truncate">
                            {latestRun.branch}
                          </p>
                        </div>
                      ) : (
                        <span className="text-muted-foreground/40 font-mono text-xs">—</span>
                      )}
                    </TableCell>

                    {/* Activity & Duration */}
                    <TableCell>
                      {latestRun ? (
                        <div className="text-[11px] space-y-0.5">
                          <p className="text-muted-foreground">
                            {formatRelativeTime(latestRun.createdAt)}
                          </p>
                          <p className="font-mono text-[10px] text-muted-foreground/80">
                            {formatDuration(latestRun.startedAt, latestRun.completedAt)}
                          </p>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground/40 font-mono">
                          {formatRelativeTime(repo.createdAt)}
                        </span>
                      )}
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="outline"
                          size="icon-sm"
                          onClick={() => setSelectedRepoForRun(repo)}
                          title="Trigger manual workflow run"
                          className="h-7 w-7 text-muted-foreground hover:text-foreground hover:border-primary/40"
                        >
                          <Play size={12} />
                        </Button>
                        <Link href={`/repositories/${repo.id}`}>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            className="h-7 w-7 text-muted-foreground hover:text-foreground"
                          >
                            <ChevronRight size={14} />
                          </Button>
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Manual Run CI Dialog */}
      {selectedRepoForRun && (
        <RunCIDialog
          open={!!selectedRepoForRun}
          repository={selectedRepoForRun}
          onClose={() => setSelectedRepoForRun(null)}
          onTriggered={() => {
            setSelectedRepoForRun(null);
            onRefresh?.();
          }}
        />
      )}
    </div>
  );
}
