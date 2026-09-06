'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { JobLog, WorkflowRunStatus, JobStatus } from '../types/ci';
import { api } from '../lib/api';

const STREAMER_WS_URL =
  process.env.NEXT_PUBLIC_STREAMER_URL || 'ws://localhost:8001/ws';

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
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('offline');
  const [isFollowing, setIsFollowing] = useState<boolean>(true);
  const logsContainerRef = useRef<HTMLDivElement | null>(null);

  // 1. Sync initialLogs if passed via props
  useEffect(() => {
    if (initialLogs.length > 0) {
      setLogs(initialLogs);
    }
  }, [initialLogs]);

  // 2. Fetch historical logs from REST API on mount
  useEffect(() => {
    if (!jobId) return;

    let isMounted = true;
    api.getJobLogs(jobId).then((fetchedLogs) => {
      if (isMounted && fetchedLogs.length > 0) {
        setLogs((prev) => {
          // Merge without duplicate IDs
          const existingIds = new Set(prev.map((l) => l.id));
          const newEntries = fetchedLogs.filter((l) => !existingIds.has(l.id));
          return [...prev, ...newEntries].sort((a, b) => a.sequence - b.sequence);
        });
      }
    });

    return () => {
      isMounted = false;
    };
  }, [jobId]);

  // 3. Connect to Real-time WebSocket Streamer
  useEffect(() => {
    if (!jobId) return;

    let ws: WebSocket | null = null;
    let reconnectTimeout: NodeJS.Timeout | null = null;
    let isCleanedUp = false;

    const connect = () => {
      if (isCleanedUp) return;

      try {
        const wsUrl = `${STREAMER_WS_URL}?jobId=${encodeURIComponent(jobId)}`;
        ws = new WebSocket(wsUrl);

        ws.onopen = () => {
          setConnectionStatus('connected');
        };

        ws.onmessage = (event) => {
          try {
            const rawData = JSON.parse(event.data);
            
            const newLog: JobLog = {
              id: rawData.id || `ws-${Date.now()}-${Math.random()}`,
              jobId: rawData.jobId || jobId,
              sequence: rawData.sequence ?? Date.now(),
              stream: rawData.stream || 'STDOUT',
              message: rawData.message || event.data,
              createdAt: rawData.timestamp
                ? new Date(rawData.timestamp).toISOString()
                : new Date().toISOString(),
            };

            setLogs((prev) => [...prev, newLog]);
          } catch {
            // Fallback for non-JSON raw text
            const newLog: JobLog = {
              id: `ws-${Date.now()}-${Math.random()}`,
              jobId,
              sequence: Date.now(),
              stream: 'STDOUT',
              message: event.data,
              createdAt: new Date().toISOString(),
            };
            setLogs((prev) => [...prev, newLog]);
          }
        };

        ws.onclose = () => {
          if (!isCleanedUp) {
            setConnectionStatus('offline');
            // Try reconnecting after 3 seconds if job is still active
            reconnectTimeout = setTimeout(connect, 3000);
          }
        };

        ws.onerror = () => {
          setConnectionStatus('offline');
        };
      } catch (err) {
        setConnectionStatus('offline');
      }
    };

    connect();

    return () => {
      isCleanedUp = true;
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (ws) ws.close();
    };
  }, [jobId, isLive]);

  // 4. Auto-scroll terminal down when following
  useEffect(() => {
    if (isFollowing && logsContainerRef.current) {
      logsContainerRef.current.scrollTop = logsContainerRef.current.scrollHeight;
    }
  }, [logs, isFollowing]);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const isAtBottom =
      target.scrollHeight - target.scrollTop - target.clientHeight < 40;
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
