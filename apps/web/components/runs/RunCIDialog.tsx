'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Play, GitBranch, GitCommit, Loader2 } from 'lucide-react';
import { Repository, Workflow } from '@/types/ci';
import { api } from '@/lib/api';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface RunCIDialogProps {
  open: boolean;
  onClose: () => void;
  repository?: Repository | null;
  workflows?: Workflow[];
  onTriggered?: (runId?: string) => void;
  onRunTriggered?: (runId: string) => void;
}

export function RunCIDialog({
  open,
  onClose,
  repository,
  workflows = [],
  onTriggered,
  onRunTriggered,
}: RunCIDialogProps) {
  const router = useRouter();
  const availableWorkflows = workflows.length > 0 ? workflows : repository?.workflows || [];
  const defaultWf = availableWorkflows[0];

  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string>(defaultWf?.id || '');
  const [branch, setBranch] = useState<string>(repository?.defaultBranch || 'main');
  const [commitSha, setCommitSha] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (defaultWf?.id && !selectedWorkflowId) {
      setSelectedWorkflowId(defaultWf.id);
    }
    if (repository?.defaultBranch) {
      setBranch(repository.defaultBranch);
    }
  }, [defaultWf, repository, selectedWorkflowId]);

  const handleTrigger = async () => {
    const targetWfId = selectedWorkflowId || defaultWf?.id;
    if (!targetWfId) {
      setError('Please select a workflow to execute.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const run = await api.createWorkflowRun(targetWfId, {
        branch: branch.trim() || 'main',
        commitSha: commitSha.trim() || undefined,
      });

      onTriggered?.(run.id);
      onRunTriggered?.(run.id);
      onClose();
      router.push(`/runs/${run.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to trigger workflow');
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Play className="text-primary fill-primary" size={16} />
            Run CI Workflow
          </DialogTitle>
          <DialogDescription>
            Dispatch a manual workflow run for{' '}
            <span className="font-semibold text-foreground font-mono text-[11px]">
              {repository?.name || 'repository'}
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3.5 py-2">
          {error && (
            <div className="p-2.5 rounded-md bg-rose-950/20 border border-rose-500/30 text-rose-300 text-xs font-mono">
              {error}
            </div>
          )}

          {/* Workflow selection */}
          {availableWorkflows.length > 1 && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Workflow</label>
              <select
                value={selectedWorkflowId}
                onChange={(e) => setSelectedWorkflowId(e.target.value)}
                className="w-full h-8 rounded-md border border-border bg-secondary/40 px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                {availableWorkflows.map((wf) => (
                  <option key={wf.id} value={wf.id} className="bg-popover text-foreground">
                    {wf.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Branch input */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <GitBranch size={13} />
              <span>Target Branch</span>
            </label>
            <Input
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              placeholder="main"
              className="font-mono text-xs"
            />
          </div>

          {/* Commit SHA (optional) */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <GitCommit size={13} />
              <span>Commit SHA (optional)</span>
            </label>
            <Input
              value={commitSha}
              onChange={(e) => setCommitSha(e.target.value)}
              placeholder="Latest commit"
              className="font-mono text-xs"
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleTrigger} disabled={isLoading} className="gap-1.5">
            {isLoading ? (
              <>
                <Loader2 size={13} className="animate-spin" />
                <span>Dispatching...</span>
              </>
            ) : (
              <>
                <Play size={12} className="fill-current" />
                <span>Run workflow</span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
