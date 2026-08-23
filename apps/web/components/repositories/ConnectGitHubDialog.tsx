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
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Alert from '@mui/material/Alert';
import { Plus, CheckCircle2, GitBranch, ArrowRight } from 'lucide-react';
import GitHubIcon from '@mui/icons-material/GitHub';
import { api } from '../../lib/api';
import { parseRepoInfo } from '../../lib/utils';

interface ConnectGitHubDialogProps {
  open: boolean;
  onClose: () => void;
  onConnected?: (repoId: string) => void;
}

const SAMPLE_GITHUB_REPOS = [
  { name: 'nimbus-worker-runtime', owner: 'harshit', defaultBranch: 'main', desc: 'Docker executor runtime container' },
  { name: 'fullstack-auth-service', owner: 'harshit', defaultBranch: 'main', desc: 'OAuth2 and JWT microservice' },
  { name: 'event-streamer-go', owner: 'harshit', defaultBranch: 'master', desc: 'High-throughput SSE & WebSocket broker' },
];

export function ConnectGitHubDialog({ open, onClose, onConnected }: ConnectGitHubDialogProps) {
  const [activeTab, setActiveTab] = useState(0);
  const [customUrl, setCustomUrl] = useState('');
  const [customBranch, setCustomBranch] = useState('main');
  const [selectedSample, setSelectedSample] = useState(SAMPLE_GITHUB_REPOS[0]?.name || '');
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
      setIsLoading(false);
      setError(err instanceof Error ? err.message : 'Failed to connect repository.');
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
      setIsLoading(false);
      setError(err instanceof Error ? err.message : 'Failed to connect repository.');
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
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#F8FAFC',
          }}
        >
          <GitHubIcon sx={{ fontSize: 18 }} />
        </Box>
        <Box>
          <Typography variant="h6" sx={{ fontSize: '1.0625rem', fontWeight: 600 }}>
            Connect GitHub Repository
          </Typography>
          <Typography variant="caption" sx={{ color: '#94A3B8' }}>
            Link a repository to Nimbus CI for automated and manual workflows
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ px: 3, py: 1.5 }}>
        <Tabs
          value={activeTab}
          onChange={(_, val) => {
            setActiveTab(val);
            setError(null);
          }}
          sx={{ mb: 2.5 }}
        >
          <Tab label="GitHub Account Repositories" />
          <Tab label="Direct Repository URL" />
        </Tabs>

        {error && (
          <Alert severity="error" sx={{ mb: 2, py: 0.5, fontSize: '0.8125rem' }}>
            {error}
          </Alert>
        )}

        {activeTab === 0 ? (
          <Box>
            <Typography variant="body2" sx={{ color: '#94A3B8', mb: 1.5 }}>
              Select an authorized repository from your connected GitHub account:
            </Typography>
            <RadioGroup
              value={selectedSample}
              onChange={(e) => setSelectedSample(e.target.value)}
              sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}
            >
              {SAMPLE_GITHUB_REPOS.map((repo) => {
                const isSelected = selectedSample === repo.name;
                return (
                  <Box
                    key={repo.name}
                    onClick={() => setSelectedSample(repo.name)}
                    sx={{
                      p: 1.5,
                      borderRadius: '6px',
                      border: `1px solid ${isSelected ? '#3B82F6' : 'rgba(255, 255, 255, 0.08)'}`,
                      backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.06)' : '#0F131A',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'all 0.15s ease',
                      '&:hover': {
                        borderColor: isSelected ? '#3B82F6' : 'rgba(255, 255, 255, 0.2)',
                      },
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Radio
                        checked={isSelected}
                        size="small"
                        sx={{ color: '#64748B', '&.Mui-checked': { color: '#3B82F6' }, p: 0.5 }}
                      />
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#F8FAFC' }}>
                          {repo.owner}/{repo.name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#94A3B8' }}>
                          {repo.desc}
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#64748B' }}>
                      <GitBranch size={12} />
                      <Typography variant="caption" sx={{ fontFamily: 'var(--font-geist-mono), monospace' }}>
                        {repo.defaultBranch}
                      </Typography>
                    </Box>
                  </Box>
                );
              })}
            </RadioGroup>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box>
              <Typography variant="caption" sx={{ color: '#94A3B8', mb: 0.5, display: 'block' }}>
                GitHub Repository URL
              </Typography>
              <TextField
                fullWidth
                size="small"
                placeholder="https://github.com/username/repository"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
              />
            </Box>

            <Box>
              <Typography variant="caption" sx={{ color: '#94A3B8', mb: 0.5, display: 'block' }}>
                Default Branch
              </Typography>
              <TextField
                fullWidth
                size="small"
                placeholder="main"
                value={customBranch}
                onChange={(e) => setCustomBranch(e.target.value)}
              />
            </Box>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5, pt: 1.5, borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
        <Button variant="outlined" onClick={onClose} disabled={isLoading} size="small">
          Cancel
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={activeTab === 0 ? handleConnectSample : handleConnectCustom}
          disabled={isLoading}
          size="small"
          startIcon={activeTab === 0 ? <Plus size={14} /> : <ArrowRight size={14} />}
        >
          {isLoading ? 'Connecting...' : 'Connect Repository'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
