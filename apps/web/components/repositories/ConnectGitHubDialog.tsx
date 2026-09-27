'use client';

import React, { useState, useEffect } from 'react';
import {
  GitBranch,
  GitFork,
  ArrowRight,
  Loader2,
  Lock,
  Globe,
  Search,
  CheckCircle2,
  Zap,
} from 'lucide-react';
import { api, type AuthUser, type GitHubRepoItem } from '@/lib/api';
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

export function ConnectGitHubDialog({
  open,
  onClose,
  onConnected,
}: ConnectGitHubDialogProps) {
  const [activeTab, setActiveTab] = useState<'github' | 'custom'>('github');
  const [user, setUser] = useState<AuthUser | null>(null);
  const [repos, setRepos] = useState<GitHubRepoItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRepo, setSelectedRepo] = useState<GitHubRepoItem | null>(null);
  const [customUrl, setCustomUrl] = useState('');
  const [customBranch, setCustomBranch] = useState('main');
  const [isLoadingRepos, setIsLoadingRepos] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setError(null);
      setSuccessMsg(null);
      return;
    }

    let mounted = true;
    api.getCurrentUser().then((u) => {
      if (!mounted) return;
      setUser(u);
      if (u) {
        setIsLoadingRepos(true);
        api
          .getGitHubRepos()
          .then((res) => {
            if (mounted) {
              setRepos(res.repositories || []);
              if (res.repositories?.length > 0) {
                const firstAvailable = res.repositories.find((r) => !r.isConnected);
                setSelectedRepo(firstAvailable || res.repositories[0] || null);
              }
            }
          })
          .catch((err) => {
            if (mounted) setError(err instanceof Error ? err.message : 'Failed to load GitHub repos');
          })
          .finally(() => {
            if (mounted) setIsLoadingRepos(false);
          });
      } else {
        setActiveTab('custom');
      }
    });

    return () => {
      mounted = false;
    };
  }, [open]);

  const handleConnectGitHubRepo = async () => {
    if (!selectedRepo) return;
    setError(null);
    setSuccessMsg(null);
    setIsSubmitting(true);

    try {
      const repoUrl = selectedRepo.cloneUrl || selectedRepo.htmlUrl;
      const connected = await api.connectGitHubRepo({
        name: selectedRepo.name,
        owner: selectedRepo.owner,
        defaultBranch: selectedRepo.defaultBranch || 'main',
        url: repoUrl,
      });

      setSuccessMsg(`Connected ${selectedRepo.fullName} with push webhook!`);
      setIsSubmitting(false);
      setTimeout(() => {
        onClose();
        if (onConnected) onConnected(connected.id);
      }, 700);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect repository');
      setIsSubmitting(false);
    }
  };

  const handleConnectCustom = async () => {
    if (!customUrl.trim()) {
      setError('Please enter a valid GitHub repository URL.');
      return;
    }
    setError(null);
    setSuccessMsg(null);
    setIsSubmitting(true);

    try {
      const { owner, name } = parseRepoInfo(customUrl);
      const newRepo = await api.createRepository({
        name,
        owner,
        url: customUrl.trim(),
        defaultBranch: customBranch.trim() || 'main',
      });
      setSuccessMsg(`Repository connected successfully!`);
      setIsSubmitting(false);
      setTimeout(() => {
        onClose();
        if (onConnected) onConnected(newRepo.id);
      }, 700);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect repository');
      setIsSubmitting(false);
    }
  };

  const filteredRepos = repos.filter((r) =>
    r.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (r.description && r.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-[520px] bg-[#161B22] border-[#30363D] text-[#F0F6FC]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base text-[#F0F6FC]">
            <GitFork className="text-[#58A6FF]" size={18} />
            Connect GitHub Repository
          </DialogTitle>
          <DialogDescription className="text-xs text-[#8B949E]">
            Select a repository to track. Push events will trigger automated CI runs in isolated containers.
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-2 border-b border-[#30363D] pb-2">
          {user && (
            <button
              type="button"
              onClick={() => {
                setActiveTab('github');
                setError(null);
              }}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                activeTab === 'github'
                  ? 'bg-[#21262D] text-[#F0F6FC] border border-[#30363D]'
                  : 'text-[#8B949E] hover:text-[#F0F6FC]'
              }`}
            >
              Your GitHub Repositories ({repos.length})
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              setActiveTab('custom');
              setError(null);
            }}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'custom'
                ? 'bg-[#21262D] text-[#F0F6FC] border border-[#30363D]'
                : 'text-[#8B949E] hover:text-[#F0F6FC]'
            }`}
          >
            Custom Repository URL
          </button>
        </div>

        {error && (
          <div className="p-2.5 rounded-md bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs font-mono">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="p-2.5 rounded-md bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 size={14} className="text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {activeTab === 'github' ? (
          <div className="space-y-3 py-1">
            <div className="relative">
              <Search
                size={14}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#8B949E]"
              />
              <Input
                placeholder="Search your repositories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-8 text-xs font-mono bg-[#0D1117] border-[#30363D] text-[#F0F6FC]"
              />
            </div>

            {isLoadingRepos ? (
              <div className="py-8 flex flex-col items-center justify-center gap-2 text-[#8B949E]">
                <Loader2 size={20} className="animate-spin text-[#58A6FF]" />
                <span className="text-xs">Loading repositories from GitHub...</span>
              </div>
            ) : filteredRepos.length === 0 ? (
              <div className="py-6 text-center text-xs text-[#8B949E]">
                {repos.length === 0
                  ? 'No repositories found for this account.'
                  : 'No repositories match your search.'}
              </div>
            ) : (
              <div className="max-h-[260px] overflow-y-auto space-y-1.5 pr-1">
                {filteredRepos.map((repo) => {
                  const isSelected = selectedRepo?.id === repo.id;
                  return (
                    <div
                      key={repo.id}
                      onClick={() => !repo.isConnected && setSelectedRepo(repo)}
                      className={`p-2.5 rounded-md border transition-colors flex items-start justify-between gap-3 ${
                        repo.isConnected
                          ? 'opacity-60 bg-[#0D1117] border-[#30363D] cursor-not-allowed'
                          : isSelected
                            ? 'bg-[#1f6feb]/10 border-[#1f6feb]/60 cursor-pointer'
                            : 'bg-[#0D1117] border-[#30363D] hover:border-[#8B949E]/50 cursor-pointer'
                      }`}
                    >
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          {repo.private ? (
                            <Lock size={12} className="text-amber-400 shrink-0" />
                          ) : (
                            <Globe size={12} className="text-[#8B949E] shrink-0" />
                          )}
                          <span className="font-mono text-xs font-semibold text-[#F0F6FC] truncate">
                            {repo.fullName}
                          </span>
                          <span className="text-[10px] font-mono text-[#8B949E] px-1.5 py-0.5 rounded bg-[#21262D] border border-[#30363D]">
                            {repo.defaultBranch}
                          </span>
                        </div>
                        {repo.description && (
                          <p className="text-[11px] text-[#8B949E] truncate">
                            {repo.description}
                          </p>
                        )}
                      </div>

                      {repo.isConnected ? (
                        <span className="text-[10px] text-emerald-400 font-semibold px-2 py-0.5 rounded bg-emerald-950/40 border border-emerald-800/40">
                          Connected
                        </span>
                      ) : (
                        <input
                          type="radio"
                          name="selectedRepo"
                          checked={isSelected}
                          onChange={() => setSelectedRepo(repo)}
                          className="mt-1"
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            <div className="flex items-center gap-1.5 text-[11px] text-[#8B949E] pt-1">
              <Zap size={13} className="text-amber-400" />
              <span>Automatically installs GitHub push webhook on connect.</span>
            </div>
          </div>
        ) : (
          <div className="space-y-3 py-2">
            {!user && (
              <div className="p-3 rounded-md bg-[#0D1117] border border-[#30363D] flex items-center justify-between gap-3">
                <span className="text-xs text-[#8B949E]">
                  Sign in with GitHub to auto-load your repositories.
                </span>
                <a href={api.getLoginUrl()}>
                  <Button size="sm" className="h-7 text-xs bg-[#238636] hover:bg-[#2ea043] text-white">
                    Sign in
                  </Button>
                </a>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#8B949E]">
                GitHub Repository URL
              </label>
              <Input
                placeholder="https://github.com/owner/repository"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                className="font-mono text-xs bg-[#0D1117] border-[#30363D] text-[#F0F6FC]"
              />
              <p className="text-[11px] text-[#8B949E]">
                Example: https://github.com/harshit-technocrat11/nimbus-ci
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#8B949E] flex items-center gap-1.5">
                <GitBranch size={13} />
                <span>Default Branch</span>
              </label>
              <Input
                placeholder="main"
                value={customBranch}
                onChange={(e) => setCustomBranch(e.target.value)}
                className="font-mono text-xs bg-[#0D1117] border-[#30363D] text-[#F0F6FC]"
              />
            </div>
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0 pt-2 border-t border-[#30363D]">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isSubmitting}
            className="bg-[#21262D] border-[#30363D] text-[#F0F6FC] hover:bg-[#30363D]"
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={activeTab === 'github' ? handleConnectGitHubRepo : handleConnectCustom}
            disabled={isSubmitting || (activeTab === 'github' && !selectedRepo)}
            className="gap-1.5 bg-[#238636] hover:bg-[#2ea043] text-white"
          >
            {isSubmitting ? (
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
