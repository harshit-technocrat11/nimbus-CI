'use client';

import React, { useEffect, useState } from 'react';
import { Repository } from '@/types/ci';
import { api } from '@/lib/api';
import { RepositoryList } from '@/components/repositories/RepositoryList';
import { TableSkeletonRows } from '@/components/common/LoadingSkeleton';
import { ErrorState } from '@/components/common/ErrorState';
import { ConnectGitHubDialog } from '@/components/repositories/ConnectGitHubDialog';
import { Card } from '@/components/ui/card';
import { FolderGit2, Play, CheckCircle2 } from 'lucide-react';

export default function HomePage() {
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [connectModalOpen, setConnectModalOpen] = useState<boolean>(false);

  const fetchRepos = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getRepositories();
      setRepositories(data);
      setIsLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load repositories');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRepos();
  }, []);

  const totalRuns = repositories.reduce((acc, r) => acc + (r.workflows?.length || 0), 0);
  const runningCount = repositories.filter(
    (r) => r.latestRun?.status === 'RUNNING'
  ).length;

  return (
    <div className="space-y-6">
      {/* Top 3 Minimal Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card className="p-4 bg-card/60 border-border/80 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
              Connected Repos
            </p>
            <p className="text-xl font-semibold text-foreground font-mono mt-0.5">
              {isLoading ? '—' : repositories.length}
            </p>
          </div>
          <div className="p-2.5 rounded-md bg-primary/10 text-primary border border-primary/20">
            <FolderGit2 size={16} />
          </div>
        </Card>

        <Card className="p-4 bg-card/60 border-border/80 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
              Active Runs
            </p>
            <p className="text-xl font-semibold text-foreground font-mono mt-0.5">
              {isLoading ? '—' : runningCount}
            </p>
          </div>
          <div className="p-2.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Play size={16} />
          </div>
        </Card>

        <Card className="p-4 bg-card/60 border-border/80 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
              Workflows Tracked
            </p>
            <p className="text-xl font-semibold text-foreground font-mono mt-0.5">
              {isLoading ? '—' : totalRuns || 3}
            </p>
          </div>
          <div className="p-2.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 size={16} />
          </div>
        </Card>
      </div>

      {/* Main Content */}
      {isLoading ? (
        <div className="py-2">
          <TableSkeletonRows rows={4} />
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={fetchRepos} />
      ) : (
        <RepositoryList
          repositories={repositories}
          onOpenConnectModal={() => setConnectModalOpen(true)}
          onRefresh={fetchRepos}
        />
      )}

      <ConnectGitHubDialog
        open={connectModalOpen}
        onClose={() => setConnectModalOpen(false)}
        onConnected={() => fetchRepos()}
      />
    </div>
  );
}
