'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { JobLog, WorkflowRunStatus, JobStatus } from '../types/ci';
import { api } from '../lib/api';

interface UseWorkflowStreamProps {
  jobId?: string;
  initialLogs?: JobLog[];
  jobStatus?: JobStatus;
  runStatus?: WorkflowRunStatus;
  isLive?: boolean;
}

export type ConnectionStatus = 'connected' | 'reconnecting' | 'offline';

export function useWorkflowStream({
  jobId,
  initialLogs = [],
  jobStatus = 'RUNNING',
  isLive = true,
}: UseWorkflowStreamProps) {
  const [logs, setLogs] = useState<JobLog[]>(initialLogs);
  const [currentStatus, setCurrentStatus] = useState<JobStatus>(jobStatus);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('connected');
  const [isFollowing, setIsFollowing] = useState<boolean>(true);
  const logsContainerRef = useRef<HTMLDivElement | null>(null);

  // Sync initial logs if they change
  useEffect(() => {
    if (initialLogs.length > 0) {
      setLogs(initialLogs);
    }
  }, [initialLogs]);

  // Load existing logs on mount/jobId change
  useEffect(() => {
    if (!jobId) return;

    let isMounted = true;
    api.getJobLogs(jobId).then((fetchedLogs) => {
      if (isMounted && fetchedLogs.length > 0) {
        setLogs(fetchedLogs);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [jobId]);

  // Live log simulation if job is RUNNING
  useEffect(() => {
    if (!jobId || !isLive || currentStatus !== 'RUNNING') return;

    const streamLines = [
      { stream: 'STDOUT' as const, message: '$ executing docker environment container image...' },
      { stream: 'STDOUT' as const, message: 'Container ID: 9f8a32bc17d0 allocated on runner' },
      { stream: 'STDOUT' as const, message: '$ installing workspace dependencies...' },
      { stream: 'STDOUT' as const, message: 'Packages: +42 verified in cache (1.1s)' },
      { stream: 'STDOUT' as const, message: '$ executing build & test scripts...' },
      { stream: 'STDOUT' as const, message: '✔ Unit test suite 12/12 passed (340ms)' },
      { stream: 'STDOUT' as const, message: '✔ Typecheck zero diagnostics found' },
      { stream: 'STDOUT' as const, message: '✨ Build output generated: dist/ (size 4.2 MB)' },
      { stream: 'STDOUT' as const, message: 'Nimbus CI Job completed successfully with exit code 0' },
    ];

    let lineIndex = 0;
    const interval = setInterval(() => {
      if (lineIndex < streamLines.length) {
        const item = streamLines[lineIndex];
        if (item) {
          const newLog: JobLog = {
            id: `stream-${Date.now()}-${lineIndex}`,
            jobId,
            sequence: logs.length + lineIndex + 1,
            stream: item.stream,
            message: item.message,
            createdAt: new Date().toISOString(),
          };
          setLogs((prev) => [...prev, newLog]);
        }
        lineIndex++;
      } else {
        clearInterval(interval);
        setCurrentStatus('SUCCESS');
      }
    }, 1800);

    return () => clearInterval(interval);
  }, [jobId, isLive, currentStatus, logs.length]);

  // Auto-scroll when following
  useEffect(() => {
    if (isFollowing && logsContainerRef.current) {
      logsContainerRef.current.scrollTop = logsContainerRef.current.scrollHeight;
    }
  }, [logs, isFollowing]);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const isAtBottom = target.scrollHeight - target.scrollTop - target.clientHeight < 30;
    setIsFollowing(isAtBottom);
  }, []);

  const resumeFollow = useCallback(() => {
    setIsFollowing(true);
    if (logsContainerRef.current) {
      logsContainerRef.current.scrollTop = logsContainerRef.current.scrollHeight;
    }
  }, []);

  return {
    logs,
    currentStatus,
    connectionStatus,
    isFollowing,
    setIsFollowing,
    resumeFollow,
    logsContainerRef,
    handleScroll,
  };
}
