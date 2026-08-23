'use client';

import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import { Settings, Server, Key, Bell, Shield, Check, Terminal } from 'lucide-react';

export default function SettingsPage() {
  const [apiUrl, setApiUrl] = useState(
    process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
  );
  const [streamerUrl, setStreamerUrl] = useState('ws://localhost:5001');
  const [autoFollow, setAutoFollow] = useState(true);
  const [savedToast, setSavedToast] = useState(false);

  const handleSave = () => {
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 3000);
  };

  return (
    <Box sx={{ maxWidth: 800 }}>
      {/* Header Bar */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h1" sx={{ fontSize: '1.5rem', fontWeight: 700, mb: 0.5 }}>
          Settings & Environment
        </Typography>
        <Typography variant="body2" sx={{ color: '#94A3B8' }}>
          Configure API endpoints, WebSocket streamers, and UI preferences for Nimbus CI.
        </Typography>
      </Box>

      {savedToast && (
        <Alert severity="success" sx={{ mb: 3, py: 0.5, fontSize: '0.8125rem' }}>
          Settings saved successfully!
        </Alert>
      )}

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Backend Endpoints */}
        <Card sx={{ p: 3, backgroundColor: '#0E1219' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 2 }}>
            <Server size={18} color="#3B82F6" />
            <Typography variant="h3" sx={{ fontSize: '1rem', fontWeight: 600 }}>
              Backend Service Connections
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box>
              <Typography variant="caption" sx={{ color: '#94A3B8', mb: 0.5, display: 'block' }}>
                Nimbus API Endpoint
              </Typography>
              <TextField
                fullWidth
                size="small"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                InputProps={{
                  sx: { fontFamily: 'var(--font-geist-mono), monospace', fontSize: '0.8125rem' },
                }}
              />
            </Box>

            <Box>
              <Typography variant="caption" sx={{ color: '#94A3B8', mb: 0.5, display: 'block' }}>
                WebSocket Log Streamer Endpoint
              </Typography>
              <TextField
                fullWidth
                size="small"
                value={streamerUrl}
                onChange={(e) => setStreamerUrl(e.target.value)}
                InputProps={{
                  sx: { fontFamily: 'var(--font-geist-mono), monospace', fontSize: '0.8125rem' },
                }}
              />
            </Box>
          </Box>
        </Card>

        {/* GitHub Webhook Info */}
        <Card sx={{ p: 3, backgroundColor: '#0E1219' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 1.5 }}>
            <Key size={18} color="#F59E0B" />
            <Typography variant="h3" sx={{ fontSize: '1rem', fontWeight: 600 }}>
              GitHub Webhook Integration
            </Typography>
          </Box>

          <Typography variant="body2" sx={{ color: '#94A3B8', mb: 2 }}>
            Configure your GitHub repository Webhook URL to automatically trigger Nimbus CI on every push:
          </Typography>

          <Box
            sx={{
              p: 1.5,
              borderRadius: 1,
              backgroundColor: '#070A0F',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              fontFamily: 'var(--font-geist-mono), monospace',
              fontSize: '0.8125rem',
              color: '#60A5FA',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span>http://your-nimbus-domain.com/api/webhooks/github</span>
            <Chip label="POST" size="small" sx={{ height: 20, fontSize: '0.6875rem', fontWeight: 600 }} />
          </Box>
        </Card>

        {/* Terminal Preferences */}
        <Card sx={{ p: 3, backgroundColor: '#0E1219' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 1.5 }}>
            <Terminal size={18} color="#10B981" />
            <Typography variant="h3" sx={{ fontSize: '1rem', fontWeight: 600 }}>
              Terminal & Log Preferences
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={autoFollow}
                  onChange={(e) => setAutoFollow(e.target.checked)}
                  color="primary"
                  size="small"
                />
              }
              label={
                <Typography variant="body2" sx={{ color: '#CBD5E1' }}>
                  Auto-follow active streaming logs by default
                </Typography>
              }
            />
          </Box>
        </Card>

        {/* Save Button */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button variant="contained" color="primary" onClick={handleSave} startIcon={<Check size={16} />}>
            Save Preferences
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
