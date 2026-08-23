'use client';

import React, { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import { Repository } from '../types/ci';
import { api } from '../lib/api';
import { RepositoryList } from '../components/repositories/RepositoryList';
import { TableSkeletonRows } from '../components/common/LoadingSkeleton';
import { ErrorState } from '../components/common/ErrorState';
import { ConnectGitHubDialog } from '../components/repositories/ConnectGitHubDialog';

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

  if (isLoading) {
    return (
      <Box sx={{ py: 3 }}>
        <TableSkeletonRows rows={5} cols={5} />
      </Box>
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={fetchRepos} />;
  }

  return (
    <Box>
      <RepositoryList
        repositories={repositories}
        onOpenConnectModal={() => setConnectModalOpen(true)}
        onRefresh={fetchRepos}
      />

      <ConnectGitHubDialog
        open={connectModalOpen}
        onClose={() => setConnectModalOpen(false)}
        onConnected={(newId) => {
          fetchRepos();
        }}
      />
    </Box>
  );
}
