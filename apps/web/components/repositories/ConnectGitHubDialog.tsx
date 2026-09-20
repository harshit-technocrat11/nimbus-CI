'use client';

import React, { useState } from 'react';
import { GitBranch, GitFork, ArrowRight, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { parseRepoInfo } from '@/lib/utils';
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

interface ConnectGitHubDialogProps {
  open: boolean;
  onClose: () => void;
  onConnected?: (repoId: string) => void;
}

const SAMPLE_GITHUB_REPOS = [
  {
    name: 'nimbus-worker-runtime',
    owner: 'harshit',
    defaultBranch: 'main',
    desc: 'Docker executor runtime container',
  },
  {
    name: 'fullstack-auth-service',
    owner: 'harshit',
    defaultBranch: 'main',
    desc: 'OAuth2 and JWT microservice',
  },
  {
    name: 'event-streamer-go',
    owner: 'harshit',
    defaultBranch: 'master',
    desc: 'High-throughput SSE & WebSocket broker',
  },
];

export function ConnectGitHubDialog({
  open,
  onClose,
  onConnected,
}: ConnectGitHubDialogProps) {
  const [activeTab, setActiveTab] = useState<'sample' | 'custom'>('custom');
  const [customUrl, setCustomUrl] = useState('');
  const [customBranch, setCustomBranch] = useState('main');
  const [selectedSample, setSelectedSample] = useState(
    SAMPLE_GITHUB_REPOS[0]?.name || ''
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConnectCustom = async () => {
    if (!customUrl.trim()) {
      setError('Please enter a valid GitHub repository URL.');
      return;
    }
    setError(null);
    setIsLoading(true);
    try {
      const { owner, name } = parseRepoInfo(customUrl);
      const newRepo = await api.createRepository({
        name,
        owner,
        url: customUrl.trim(),
        defaultBranch: customBranch.trim() || 'main',
      });
      setIsLoading(false);
      onClose();
      if (onConnected) onConnected(newRepo.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect repository');
      setIsLoading(false);
    }
  };

  const handleConnectSample = async () => {
    const sample = SAMPLE_GITHUB_REPOS.find((r) => r.name === selectedSample);
    if (!sample) return;

    setError(null);
    setIsLoading(true);
    try {
      const newRepo = await api.createRepository({
        name: sample.name,
        owner: sample.owner,
        url: `https://github.com/${sample.owner}/${sample.name}`,
        defaultBranch: sample.defaultBranch,
      });
      setIsLoading(false);
      onClose();
      if (onConnected) onConnected(newRepo.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect repository');
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GitFork className="text-primary" size={16} />
            Connect GitHub Repository
          </DialogTitle>
          <DialogDescription>
            Import or select a GitHub repository to track workflow runs
          </DialogDescription>
        </DialogHeader>

        {/* Tab selection */}
        <div className="flex gap-2 border-b border-border/80 pb-2">
          <button
            type="button"
            onClick={() => {
              setActiveTab('custom');
              setError(null);
            }}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'custom'
                ? 'bg-secondary text-foreground border border-border'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Custom Repository URL
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('sample');
              setError(null);
            }}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'sample'
                ? 'bg-secondary text-foreground border border-border'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Quick Select
          </button>
        </div>

        {error && (
          <div className="p-2.5 rounded-md bg-rose-950/30 border border-rose-500/30 text-rose-300 text-xs font-mono">
            {error}
          </div>
        )}

        {activeTab === 'custom' ? (
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                GitHub Repository URL
              </label>
              <Input
                placeholder="https://github.com/owner/repository"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                className="font-mono text-xs"
              />
              <p className="text-[11px] text-muted-foreground">
                Example: https://github.com/harshit-technocrat11/nimbus-ci
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <GitBranch size={13} />
                <span>Default Branch</span>
              </label>
              <Input
                placeholder="main"
                value={customBranch}
                onChange={(e) => setCustomBranch(e.target.value)}
                className="font-mono text-xs"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-2 py-2">
            <p className="text-xs text-muted-foreground mb-1">
              Select one of your detected repositories:
            </p>
            {SAMPLE_GITHUB_REPOS.map((sample) => (
              <label
                key={sample.name}
                onClick={() => setSelectedSample(sample.name)}
                className={`flex items-start gap-2.5 p-2.5 rounded-md border cursor-pointer transition-colors ${
                  selectedSample === sample.name
                    ? 'bg-primary/10 border-primary/40 text-foreground'
                    : 'bg-card/40 border-border hover:bg-secondary/40 text-muted-foreground'
                }`}
              >
                <input
                  type="radio"
                  name="sampleRepo"
                  checked={selectedSample === sample.name}
                  onChange={() => setSelectedSample(sample.name)}
                  className="mt-1"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-foreground font-mono">
                      {sample.owner}/{sample.name}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-mono">
                      {sample.defaultBranch}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {sample.desc}
                  </p>
                </div>
              </label>
            ))}
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={activeTab === 'custom' ? handleConnectCustom : handleConnectSample}
            disabled={isLoading}
            className="gap-1.5"
          >
            {isLoading ? (
              <>
                <Loader2 size={13} className="animate-spin" />
                <span>Connecting...</span>
              </>
            ) : (
              <>
                <span>Connect Repository</span>
                <ArrowRight size={13} />
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
