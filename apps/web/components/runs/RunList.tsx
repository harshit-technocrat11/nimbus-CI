'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Search,
  GitBranch,
  PlaySquare,
  ChevronRight,
  FolderGit2,
  CheckCircle2,
  XCircle,
  Loader2,
  Circle,
  Clock,
  Calendar,
  MoreHorizontal,
} from 'lucide-react';
import { WorkflowRun } from '@/types/ci';
import { EmptyState } from '@/components/common/EmptyState';
import { formatDuration, formatRelativeTime, formatShortSha } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface RunListProps {
  runs: WorkflowRun[];
  showRepoColumn?: boolean;
  title?: string;
  subtitle?: string;
}

export function RunList({
  runs,
  showRepoColumn = true,
  title = 'All workflows',
  subtitle = 'Showing runs from all workflows',
}: RunListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'SUCCESS' | 'RUNNING' | 'FAILED' | 'QUEUED'>('ALL');

  const filteredRuns = runs.filter((run) => {
    const repoName = run.workflow?.repository?.name || '';
    const branch = run.branch || '';
    const commit = run.commitSha || '';
    const workflowName = run.workflow?.name || '';

    const matchesSearch =
      repoName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      branch.toLowerCase().includes(searchQuery.toLowerCase()) ||
      commit.toLowerCase().includes(searchQuery.toLowerCase()) ||
      workflowName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      run.id.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (statusFilter === 'ALL') return true;
    return run.status === statusFilter;
  });

  return (
    <div className="space-y-4">
      {/* GitHub Actions Header & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-1 border-b border-[#30363D]/60">
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-[#F0F6FC]">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs text-[#8B949E] mt-0.5">{subtitle}</p>
          )}
        </div>

        {/* Filter workflow runs search */}
        <div className="relative w-full sm:w-72">
          <Search
            size={13}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#8B949E] pointer-events-none"
          />
          <Input
            placeholder="Filter workflow runs"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-8 text-xs bg-[#0D1117] border-[#30363D] text-[#F0F6FC] placeholder:text-[#8B949E] focus:border-[#58A6FF]"
          />
        </div>
      </div>

      {/* Workflow Run Card List (matching GitHub Actions screenshot) */}
      <div className="rounded-md border border-[#30363D] bg-[#0D1117] overflow-hidden">
        {/* Subheader summary & dropdown filters */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-[#161B22] border-b border-[#30363D] text-xs text-[#8B949E]">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#F0F6FC]">
              {filteredRuns.length} workflow runs
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 text-[11px]">
            {(['ALL', 'SUCCESS', 'RUNNING', 'FAILED'] as const).map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setStatusFilter(filter)}
                className={`transition-colors ${
                  statusFilter === filter
                    ? 'text-[#58A6FF] font-semibold'
                    : 'text-[#8B949E] hover:text-[#F0F6FC]'
                }`}
              >
                {filter === 'ALL' ? 'All' : filter.charAt(0) + filter.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Runs List Items */}
        {filteredRuns.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon={<PlaySquare size={24} />}
              title={searchQuery ? 'No workflow runs match filter' : 'No workflow runs recorded'}
              description={
                searchQuery
                  ? 'Try changing your search term or status filter'
                  : 'Trigger a workflow run or push code to a connected repository to start CI execution'
              }
            />
          </div>
        ) : (
          <div className="divide-y divide-[#30363D]/60">
            {filteredRuns.map((run) => {
              const repo = run.workflow?.repository;
              const runDisplayNumber = run.id.replace('run-', '');
              const commitSha = run.commitSha ? formatShortSha(run.commitSha) : null;
              const workflowName = run.workflow?.name || 'Nimbus CI';

              return (
                <div
                  key={run.id}
                  className="flex items-center justify-between px-4 py-3 hover:bg-[#161B22]/60 transition-colors group"
                >
                  {/* Left: Status Icon + Title + Metadata */}
                  <div className="flex items-start gap-3 min-w-0 flex-1 pr-4">
                    {/* Status Icon */}
                    <div className="pt-0.5 shrink-0">
                      {run.status === 'SUCCESS' ? (
                        <CheckCircle2 size={16} className="text-[#3FB950] fill-[#3FB950]/15" />
                      ) : run.status === 'FAILED' ? (
                        <XCircle size={16} className="text-[#F85149] fill-[#F85149]/15" />
                      ) : run.status === 'RUNNING' ? (
                        <Loader2 size={16} className="text-[#58A6FF] animate-spin" />
                      ) : (
                        <Circle size={16} className="text-[#8B949E]" />
                      )}
                    </div>

                    {/* Run Title & Subtitle */}
                    <div className="min-w-0 space-y-0.5">
                      <Link
                        href={`/runs/${run.id}`}
                        className="font-bold text-xs text-[#F0F6FC] hover:text-[#58A6FF] transition-colors truncate block"
                      >
                        {workflowName}
                      </Link>

                      <div className="text-[11px] text-[#8B949E] flex items-center gap-1.5 flex-wrap">
                        <span>
                          {workflowName} #{runDisplayNumber}:
                        </span>
                        {commitSha ? (
                          <>
                            <span>Commit</span>
                            <span className="font-mono text-[#58A6FF] hover:underline">
                              {commitSha}
                            </span>
                          </>
                        ) : null}
                        {repo && (
                          <span className="truncate">
                            in {repo.owner}/{repo.name}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Middle: Branch Badge */}
                  {run.branch && (
                    <div className="hidden md:flex items-center px-3">
                      <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded-full bg-[#161B22] border border-[#30363D] text-[#58A6FF]">
                        <GitBranch size={10} />
                        <span>{run.branch}</span>
                      </span>
                    </div>
                  )}

                  {/* Right: Date & Duration & More Menu */}
                  <div className="flex items-center gap-4 text-xs text-[#8B949E] shrink-0 text-right">
                    <div className="space-y-0.5 min-w-[90px]">
                      <div className="flex items-center justify-end gap-1.5 text-[11px]">
                        <Calendar size={11} className="text-[#8B949E]" />
                        <span>{formatRelativeTime(run.createdAt)}</span>
                      </div>

                      <div className="flex items-center justify-end gap-1.5 font-mono text-[11px]">
                        <Clock size={11} className="text-[#8B949E]" />
                        <span>
                          {run.durationSeconds
                            ? formatDuration(run.durationSeconds)
                            : formatDuration(run.startedAt, run.completedAt)}
                        </span>
                      </div>
                    </div>

                    <Link href={`/runs/${run.id}`}>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="h-7 w-7 text-[#8B949E] hover:text-[#F0F6FC] hover:bg-[#30363D]/40"
                      >
                        <MoreHorizontal size={14} />
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
