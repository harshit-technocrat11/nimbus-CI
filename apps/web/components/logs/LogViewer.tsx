'use client';

import React, { useState, useMemo } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Tooltip from '@mui/material/Tooltip';
import Paper from '@mui/material/Paper';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import {
  Terminal,
  Search,
  Copy,
  Download,
  Maximize2,
  Minimize2,
  ArrowDown,
  Clock,
  Radio,
} from 'lucide-react';
import { JobLog, JobStatus } from '../../types/ci';
import { useWorkflowStream } from '../../hooks/useWorkflowStream';
import { copyToClipboard } from '../../lib/utils';

interface LogViewerProps {
  jobId?: string;
  initialLogs?: JobLog[];
  jobStatus?: JobStatus;
  jobName?: string;
  runnerName?: string;
  isLive?: boolean;
}

export function LogViewer({
  jobId,
  initialLogs = [],
  jobStatus = 'RUNNING',
  jobName,
  runnerName,
  isLive = true,
}: LogViewerProps) {
  const {
    logs,
    currentStatus,
    isFollowing,
    resumeFollow,
    logsContainerRef,
    handleScroll,
  } = useWorkflowStream({
    jobId,
    initialLogs,
    jobStatus,
    isLive,
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [showTimestamps, setShowTimestamps] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copiedToast, setCopiedToast] = useState(false);

  // Filter logs by search query
  const filteredLogs = useMemo(() => {
    if (!searchQuery.trim()) return logs;
    const q = searchQuery.toLowerCase();
    return logs.filter((log) => log.message.toLowerCase().includes(q));
  }, [logs, searchQuery]);

  const handleCopyLogs = async () => {
    const rawText = logs.map((l) => `${showTimestamps ? `[${new Date(l.createdAt).toLocaleTimeString()}] ` : ''}${l.message}`).join('\n');
    const success = await copyToClipboard(rawText);
    if (success) setCopiedToast(true);
  };

  const handleDownloadLogs = () => {
    const rawText = logs.map((l) => `${showTimestamps ? `[${new Date(l.createdAt).toLocaleTimeString()}] ` : ''}${l.message}`).join('\n');
    const blob = new Blob([rawText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `nimbus-job-${jobId || 'log'}.log`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Paper
      sx={{
        borderRadius: 2,
        overflow: 'hidden',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        backgroundColor: '#070A0F',
        display: 'flex',
        flexDirection: 'column',
        height: isFullscreen ? '90vh' : 540,
        position: isFullscreen ? 'fixed' : 'relative',
        top: isFullscreen ? '5vh' : 'auto',
        left: isFullscreen ? '5vw' : 'auto',
        width: isFullscreen ? '90vw' : '100%',
        zIndex: isFullscreen ? 1300 : 'auto',
        boxShadow: isFullscreen ? '0 25px 50px -12px rgba(0, 0, 0, 0.85)' : 'none',
      }}
    >
      {/* Terminal Toolbar */}
      <Box
        sx={{
          py: 1,
          px: 2,
          backgroundColor: '#0E1219',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1.5,
        }}
      >
        {/* Left: Terminal Title & Live State */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, color: '#94A3B8' }}>
            <Terminal size={15} color="#3B82F6" />
            <Typography
              variant="body2"
              sx={{
                fontFamily: 'var(--font-geist-mono), monospace',
                fontWeight: 600,
                color: '#F8FAFC',
                fontSize: '0.8125rem',
              }}
            >
              {jobName ? `Job Terminal: ${jobName}` : 'Execution Logs'}
            </Typography>
          </Box>

          {runnerName && (
            <Typography
              variant="caption"
              sx={{
                color: '#64748B',
                fontFamily: 'var(--font-geist-mono), monospace',
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                px: 1,
                py: 0.2,
                borderRadius: '4px',
                border: '1px solid rgba(255, 255, 255, 0.05)',
              }}
            >
              {runnerName}
            </Typography>
          )}

          {currentStatus === 'RUNNING' && (
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.5,
                color: '#10B981',
                fontSize: '0.6875rem',
                fontFamily: 'var(--font-geist-mono), monospace',
              }}
            >
              <Box
                component="span"
                sx={{
                  width: 5,
                  height: 5,
                  borderRadius: '50%',
                  backgroundColor: '#10B981',
                  animation: 'pulse 1.5s infinite',
                }}
              />
              STREAMING
            </Box>
          )}
        </Box>

        {/* Right: Search, Timestamps, Copy, Fullscreen Controls */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Search bar inside logs */}
          <TextField
            size="small"
            placeholder="Search logs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{
              width: { xs: 130, sm: 180 },
              '& .MuiInputBase-root': {
                height: 28,
                fontSize: '0.75rem',
                backgroundColor: '#070A0F',
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search size={12} color="#64748B" />
                </InputAdornment>
              ),
            }}
          />

          {/* Timestamps Toggle */}
          <Tooltip title={showTimestamps ? 'Hide timestamps' : 'Show timestamps'}>
            <IconButton
              size="small"
              onClick={() => setShowTimestamps(!showTimestamps)}
              sx={{
                color: showTimestamps ? '#60A5FA' : '#64748B',
                p: 0.6,
                backgroundColor: showTimestamps ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
              }}
            >
              <Clock size={14} />
            </IconButton>
          </Tooltip>

          {/* Copy Button */}
          <Tooltip title="Copy all logs">
            <IconButton size="small" onClick={handleCopyLogs} sx={{ color: '#94A3B8', p: 0.6 }}>
              <Copy size={14} />
            </IconButton>
          </Tooltip>

          {/* Download Button */}
          <Tooltip title="Download .log file">
            <IconButton size="small" onClick={handleDownloadLogs} sx={{ color: '#94A3B8', p: 0.6 }}>
              <Download size={14} />
            </IconButton>
          </Tooltip>

          {/* Fullscreen Toggle */}
          <Tooltip title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}>
            <IconButton
              size="small"
              onClick={() => setIsFullscreen(!isFullscreen)}
              sx={{ color: '#94A3B8', p: 0.6 }}
            >
              {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Terminal Content Body */}
      <Box
        ref={logsContainerRef}
        onScroll={handleScroll}
        sx={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'auto',
          p: 2,
          fontFamily: 'var(--font-geist-mono), "JetBrains Mono", monospace',
          fontSize: '0.8125rem',
          lineHeight: 1.65,
          color: '#E2E8F0',
          position: 'relative',
        }}
      >
        {filteredLogs.length === 0 ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              color: '#64748B',
              textAlign: 'center',
            }}
          >
            <Radio size={24} style={{ marginBottom: 8, opacity: 0.6 }} />
            <Typography variant="body2" sx={{ fontFamily: 'inherit', color: '#94A3B8' }}>
              {searchQuery ? 'No matching log entries found.' : 'Waiting for logs...'}
            </Typography>
            <Typography variant="caption" sx={{ fontFamily: 'inherit', color: '#64748B', mt: 0.5 }}>
              {!searchQuery && 'The runner has not produced output yet.'}
            </Typography>
          </Box>
        ) : (
          filteredLogs.map((log, idx) => {
            const isStderr = log.stream === 'STDERR' || log.message.toLowerCase().includes('fail') || log.message.toLowerCase().includes('error');
            const isCommand = log.message.trim().startsWith('$');
            const isSuccess = log.message.includes('✔') || log.message.includes('PASS') || log.message.includes('successfully');

            const timeFormatted = new Date(log.createdAt).toLocaleTimeString('en-US', {
              hour12: false,
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            });

            return (
              <Box
                key={log.id || idx}
                sx={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 1.5,
                  py: 0.15,
                  '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.02)' },
                }}
              >
                {/* Line number */}
                <Typography
                  component="span"
                  sx={{
                    color: '#4B5563',
                    minWidth: 32,
                    textAlign: 'right',
                    userSelect: 'none',
                    fontSize: '0.75rem',
                    lineHeight: 'inherit',
                  }}
                >
                  {log.sequence || idx + 1}
                </Typography>

                {/* Optional Timestamp */}
                {showTimestamps && (
                  <Typography
                    component="span"
                    sx={{
                      color: '#475569',
                      minWidth: 64,
                      userSelect: 'none',
                      fontSize: '0.75rem',
                      lineHeight: 'inherit',
                    }}
                  >
                    {timeFormatted}
                  </Typography>
                )}

                {/* Stream Tag */}
                {log.stream === 'STDERR' && (
                  <Typography
                    component="span"
                    sx={{
                      color: '#EF4444',
                      fontSize: '0.6875rem',
                      fontWeight: 600,
                      userSelect: 'none',
                    }}
                  >
                    [stderr]
                  </Typography>
                )}

                {/* Log Line Message */}
                <Typography
                  component="span"
                  sx={{
                    flex: 1,
                    fontFamily: 'inherit',
                    fontSize: 'inherit',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    color: isStderr
                      ? '#F87171'
                      : isCommand
                      ? '#60A5FA'
                      : isSuccess
                      ? '#34D399'
                      : '#E2E8F0',
                    fontWeight: isCommand ? 600 : 400,
                  }}
                >
                  {log.message}
                </Typography>
              </Box>
            );
          })
        )}
      </Box>

      {/* Floating Follow Button when scrolled away */}
      {!isFollowing && logs.length > 0 && (
        <Box
          sx={{
            position: 'absolute',
            bottom: 16,
            right: 20,
            zIndex: 10,
          }}
        >
          <Button
            variant="contained"
            size="small"
            onClick={resumeFollow}
            startIcon={<ArrowDown size={13} />}
            sx={{
              backgroundColor: '#1E293B',
              color: '#F8FAFC',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 8px 20px rgba(0, 0, 0, 0.5)',
              fontSize: '0.75rem',
              py: 0.5,
              px: 1.5,
              '&:hover': { backgroundColor: '#334155' },
            }}
          >
            Follow Logs
          </Button>
        </Box>
      )}

      {/* Toast Notification */}
      <Snackbar
        open={copiedToast}
        autoHideDuration={2500}
        onClose={() => setCopiedToast(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" sx={{ py: 0.5, fontSize: '0.8125rem' }}>
          Logs copied to clipboard
        </Alert>
      </Snackbar>
    </Paper>
  );
}
