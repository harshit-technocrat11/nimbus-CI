'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  GitBranch,
  GitCommit,
  Copy,
  Check,
  RotateCcw,
  RefreshCw,
  Clock,
  ChevronLeft,
} from 'lucide-react';
import { WorkflowRun } from '@/types/ci';
import { StatusBadge } from '@/components/common/StatusBadge';
import { TriggerBadge } from '@/components/common/TriggerBadge';
import {
  formatDuration,
  formatRelativeTime,
  formatShortSha,
  copyToClipboard,
} from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
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
    <div className="space-y-3 mb-5">
      {/* Back Link */}
      {repository && (
        <Link
          href={`/repositories/${repository.id}`}
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors group"
        >
          <ChevronLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to {repository.name}</span>
        </Link>
      )}

      {/* Main Run Summary Card */}
      <Card className="p-5 bg-card/70 border-border/80">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            {/* Title & Status Bar */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-lg font-semibold tracking-tight text-foreground font-mono">
                Run {runNumber}
              </h1>
              <StatusBadge status={run.status} size="medium" />
              <TriggerBadge type={run.triggerType} />
              {run.workflow?.name && (
                <span className="text-xs text-muted-foreground font-normal">
                  • {run.workflow.name}
                </span>
              )}
            </div>

            {/* Metadata tags */}
            <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
              <div className="flex items-center gap-1 font-mono text-[11px] bg-secondary/60 px-2 py-0.5 rounded border border-border/60">
                <GitBranch size={12} className="text-primary" />
                <span>{run.branch}</span>
              </div>

              {run.commitSha && (
                <button
                  onClick={handleCopySha}
                  className="flex items-center gap-1 font-mono text-[11px] bg-secondary/60 px-2 py-0.5 rounded border border-border/60 hover:bg-secondary transition-colors text-foreground"
                  title="Click to copy full commit SHA"
                >
                  <GitCommit size={12} className="text-muted-foreground" />
                  <span>{formatShortSha(run.commitSha)}</span>
                  {copied ? (
                    <Check size={11} className="text-emerald-400" />
                  ) : (
                    <Copy size={11} className="text-muted-foreground" />
                  )}
                </button>
              )}

              <span>•</span>
              <div className="flex items-center gap-1 text-[11px]">
                <Clock size={12} className="text-muted-foreground" />
                <span>Started {formatRelativeTime(run.createdAt)}</span>
              </div>

              <span>•</span>
              <span className="font-mono text-[11px] text-foreground">
                Duration: {formatDuration(run.startedAt, run.completedAt)}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            {onRefresh && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
                title="Refresh run status"
                className="gap-1.5 h-8 text-xs"
              >
                <RefreshCw size={13} />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
            )}

            <Button
              size="sm"
              onClick={() => setReRunDialogOpen(true)}
              className="gap-1.5 h-8 text-xs"
            >
              <RotateCcw size={13} />
              <span>Re-run</span>
            </Button>
          </div>
        </div>
      </Card>

      {/* Re-run dialog */}
      {reRunDialogOpen && (
        <RunCIDialog
          open={reRunDialogOpen}
          onClose={() => setReRunDialogOpen(false)}
          repository={repository}
          workflows={run.workflow ? [run.workflow] : []}
          onTriggered={() => onRefresh?.()}
        />
      )}
    </div>
  );
}
