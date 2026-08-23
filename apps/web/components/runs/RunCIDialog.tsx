'use client';

import React, { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import Alert from '@mui/material/Alert';
import { Play, GitBranch, GitCommit, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Repository, Workflow } from '../../types/ci';
import { api } from '../../lib/api';

interface RunCIDialogProps {
  open: boolean;
  onClose: () => void;
  repository?: Repository | null;
  workflows?: Workflow[];
  onRunTriggered?: (runId: string) => void;
}

export function RunCIDialog({
  open,
  onClose,
  repository,
  workflows = [],
  onRunTriggered,
}: RunCIDialogProps) {
  const router = useRouter();
  const defaultWf = workflows[0] || repository?.workflows?.[0];
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string>(defaultWf?.id || '');
  const [branch, setBranch] = useState<string>(repository?.defaultBranch || 'main');
  const [commitSha, setCommitSha] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Sync selected workflow when props change
  React.useEffect(() => {
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

    setError(null);
    setIsLoading(true);

    try {
      const run = await api.createWorkflowRun(targetWfId, {
        branch: branch.trim() || 'main',
        commitSha: commitSha.trim() || undefined,
      });

      setIsLoading(false);
      onClose();

      if (onRunTriggered) {
        onRunTriggered(run.id);
      } else {
        router.push(`/runs/${run.id}`);
      }
    } catch (err) {
      setIsLoading(false);
      setError(err instanceof Error ? err.message : 'Failed to trigger workflow run.');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ pb: 1, pt: 2.5, px: 3, display: 'flex', alignItems: 'center', gap: 1.25 }}>
        <Box
          sx={{
            width: 32,
            height: 32,
            borderRadius: '6px',
            backgroundColor: 'rgba(59, 130, 246, 0.15)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#60A5FA',
          }}
        >
          <Play size={16} fill="currentColor" />
        </Box>
        <Box>
          <Typography variant="h6" sx={{ fontSize: '1.0625rem', fontWeight: 600 }}>
            Run Workflow
          </Typography>
          <Typography variant="caption" sx={{ color: '#94A3B8' }}>
            {repository ? `${repository.owner}/${repository.name}` : 'Trigger manual CI execution'}
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ px: 3, py: 2 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2, py: 0.5, fontSize: '0.8125rem' }}>
            {error}
          </Alert>
        )}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.25 }}>
          {/* Workflow Selector */}
          {workflows.length > 1 && (
            <Box>
              <Typography variant="caption" sx={{ color: '#94A3B8', mb: 0.5, display: 'block', fontWeight: 500 }}>
                Target Workflow
              </Typography>
              <FormControl fullWidth size="small">
                <Select
                  value={selectedWorkflowId}
                  onChange={(e) => setSelectedWorkflowId(e.target.value)}
                  sx={{ backgroundColor: '#0E1219' }}
                >
                  {workflows.map((wf) => (
                    <MenuItem key={wf.id} value={wf.id}>
                      {wf.name} ({wf.definition?.length || 0} jobs)
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          )}

          {/* Branch Field */}
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
              <GitBranch size={13} color="#94A3B8" />
              <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 500 }}>
                Branch
              </Typography>
            </Box>
            <TextField
              fullWidth
              size="small"
              placeholder="main"
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              InputProps={{
                sx: { fontFamily: 'var(--font-geist-mono), monospace' },
              }}
            />
          </Box>

          {/* Commit SHA Field (Optional) */}
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
              <GitCommit size={13} color="#94A3B8" />
              <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 500 }}>
                Commit SHA <span style={{ color: '#64748B' }}>(optional - defaults to latest HEAD)</span>
              </Typography>
            </Box>
            <TextField
              fullWidth
              size="small"
              placeholder="e.g. 71bd92ab or leave blank"
              value={commitSha}
              onChange={(e) => setCommitSha(e.target.value)}
              InputProps={{
                sx: { fontFamily: 'var(--font-geist-mono), monospace' },
              }}
            />
          </Box>

          {/* Trigger Info Box */}
          <Box
            sx={{
              p: 1.5,
              borderRadius: '6px',
              backgroundColor: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Zap size={14} color="#F59E0B" />
              <Typography variant="caption" sx={{ color: '#94A3B8' }}>
                Trigger Mode: <strong style={{ color: '#F8FAFC' }}>Manual Execution</strong>
              </Typography>
            </Box>
            <Typography variant="caption" sx={{ color: '#64748B', fontFamily: 'var(--font-geist-mono), monospace' }}>
              Nimbus Docker Runner
            </Typography>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5, pt: 1.5, borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
        <Button variant="outlined" onClick={onClose} disabled={isLoading} size="small">
          Cancel
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleTrigger}
          disabled={isLoading}
          size="small"
          startIcon={<Play size={13} fill="currentColor" />}
        >
          {isLoading ? 'Starting Run...' : 'Run CI'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
