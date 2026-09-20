'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, GitBranch, PlaySquare, ChevronRight, FolderGit2 } from 'lucide-react';
import { WorkflowRun } from '@/types/ci';
import { StatusBadge } from '@/components/common/StatusBadge';
import { TriggerBadge } from '@/components/common/TriggerBadge';
import { EmptyState } from '@/components/common/EmptyState';
import { formatDuration, formatRelativeTime, formatShortSha } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

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
    <div className="space-y-4">
      {title && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-1">
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-foreground flex items-center gap-2">
              <span>{title}</span>
              <Badge variant="secondary" className="text-[11px] font-mono font-normal">
                {runs.length}
              </Badge>
            </h1>
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
            )}
          </div>
        </div>
      )}

      {/* Filter Row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-1">
        <div className="flex items-center gap-1.5 flex-wrap">
          {(['ALL', 'SUCCESS', 'RUNNING', 'FAILED', 'QUEUED'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                statusFilter === filter
                  ? 'bg-secondary text-foreground border border-border'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/40'
              }`}
            >
              {filter === 'ALL' ? 'All Runs' : filter}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search
            size={14}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
          />
          <Input
            placeholder="Search runs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-8 text-xs bg-secondary/30"
          />
        </div>
      </div>

      {/* Runs Table */}
      {filteredRuns.length === 0 ? (
        <EmptyState
          icon={<PlaySquare size={24} />}
          title={searchQuery ? 'No workflow runs match filter' : 'No workflow runs recorded'}
          description={
            searchQuery
              ? 'Try changing your search term or status filter'
              : 'Trigger a workflow run or push code to a connected repository to start CI execution'
          }
        />
      ) : (
        <div className="rounded-lg border border-border bg-card/40 overflow-hidden shadow-xs">
          <Table>
            <TableHeader className="bg-secondary/20">
              <TableRow>
                <TableHead className="w-[15%]">Status</TableHead>
                <TableHead className="w-[28%]">Workflow & Run</TableHead>
                {showRepoColumn && <TableHead className="w-[22%]">Repository</TableHead>}
                <TableHead className="w-[18%]">Branch / Commit</TableHead>
                <TableHead className="w-[12%]">Duration & Time</TableHead>
                <TableHead className="w-[5%] text-right"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRuns.map((run) => {
                const repo = run.workflow?.repository;
                return (
                  <TableRow key={run.id} className="group hover:bg-secondary/30">
                    {/* Status */}
                    <TableCell>
                      <Link href={`/runs/${run.id}`}>
                        <StatusBadge status={run.status} size="small" />
                      </Link>
                    </TableCell>

                    {/* Workflow Name & Run ID */}
                    <TableCell>
                      <div className="space-y-0.5">
                        <Link
                          href={`/runs/${run.id}`}
                          className="font-semibold text-xs text-foreground hover:text-primary transition-colors flex items-center gap-1.5"
                        >
                          <span>{run.workflow?.name || 'CI Workflow'}</span>
                          <span className="font-mono text-muted-foreground font-normal text-[11px]">
                            #{run.id.replace('run-', '')}
                          </span>
                        </Link>
                        <div className="flex items-center gap-2 text-[11px]">
                          <TriggerBadge type={run.triggerType} />
                        </div>
                      </div>
                    </TableCell>

                    {/* Repository Column (optional) */}
                    {showRepoColumn && (
                      <TableCell>
                        {repo ? (
                          <Link
                            href={`/repositories/${repo.id}`}
                            className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1.5 transition-colors"
                          >
                            <FolderGit2 size={13} className="text-primary/70" />
                            <span className="truncate max-w-[160px]">
                              {repo.owner}/{repo.name}
                            </span>
                          </Link>
                        ) : (
                          <span className="text-xs text-muted-foreground/40 font-mono">—</span>
                        )}
                      </TableCell>
                    )}

                    {/* Branch & Commit */}
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-[11px] font-mono text-foreground">
                          <GitBranch size={11} className="text-muted-foreground" />
                          <span>{run.branch}</span>
                        </div>
                        <span className="font-mono text-[10px] text-muted-foreground bg-secondary/60 px-1.5 py-0.5 rounded border border-border/60">
                          {formatShortSha(run.commitSha)}
                        </span>
                      </div>
                    </TableCell>

                    {/* Duration & Relative Time */}
                    <TableCell>
                      <div className="text-[11px] space-y-0.5">
                        <p className="text-foreground font-mono text-[11px]">
                          {formatDuration(run.startedAt, run.completedAt)}
                        </p>
                        <p className="text-muted-foreground text-[10px]">
                          {formatRelativeTime(run.createdAt)}
                        </p>
                      </div>
                    </TableCell>

                    {/* Action */}
                    <TableCell className="text-right">
                      <Link href={`/runs/${run.id}`}>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="h-7 w-7 text-muted-foreground hover:text-foreground"
                        >
                          <ChevronRight size={14} />
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
