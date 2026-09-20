'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
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
  Check,
} from 'lucide-react';
import { JobLog, JobStatus } from '@/types/ci';
import { useWorkflowStream } from '@/hooks/useWorkflowStream';
import { copyToClipboard } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

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
    connectionStatus,
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
  const [showTimestamps, setShowTimestamps] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Filter logs by search query
  const filteredLogs = useMemo(() => {
    if (!searchQuery.trim()) return logs;
    const q = searchQuery.toLowerCase();
    return logs.filter((log) => log.message.toLowerCase().includes(q));
  }, [logs, searchQuery]);

  const handleCopyLogs = async () => {
    const rawText = logs
      .map(
        (l) =>
          `${showTimestamps ? `[${new Date(l.createdAt).toLocaleTimeString()}] ` : ''}${l.message}`
      )
      .join('\n');
    const success = await copyToClipboard(rawText);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadLogs = () => {
    const rawText = logs
      .map(
        (l) =>
          `${showTimestamps ? `[${new Date(l.createdAt).toLocaleTimeString()}] ` : ''}${l.message}`
      )
      .join('\n');
    const blob = new Blob([rawText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `nimbus-job-${jobName || jobId || 'log'}.log`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className={`rounded-lg border border-border bg-[#04070D] overflow-hidden flex flex-col font-mono text-xs shadow-md transition-all ${
        isFullscreen
          ? 'fixed inset-4 z-50 h-[calc(100vh-2rem)]'
          : 'relative h-[520px]'
      }`}
    >
      {/* Terminal Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-3 py-2 border-b border-border/80 bg-[#070C15] select-none">
        {/* Left: Job Info & Connection indicator */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-1.5 text-foreground font-semibold">
            <Terminal size={14} className="text-primary" />
            <span>{jobName || 'job-logs'}</span>
          </div>

          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-secondary/50 border border-border/60 text-[10px]">
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                connectionStatus === 'connected'
                  ? 'bg-emerald-400 animate-pulse'
                  : connectionStatus === 'reconnecting'
                  ? 'bg-amber-400 animate-ping'
                  : 'bg-slate-500'
              }`}
            />
            <span className="capitalize text-muted-foreground">
              {connectionStatus === 'connected'
                ? 'Live WebSocket'
                : connectionStatus}
            </span>
          </div>

          {runnerName && (
            <span className="text-[10px] text-muted-foreground hidden md:inline">
              runner: {runnerName}
            </span>
          )}
        </div>

        {/* Right: Actions & Search */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <div className="relative w-36 sm:w-44">
            <Search
              size={12}
              className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
            />
            <input
              type="text"
              placeholder="Search logs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-6 pl-6 pr-2 rounded bg-secondary/40 border border-border/70 text-[11px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary font-mono"
            />
          </div>

          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setShowTimestamps(!showTimestamps)}
            title={showTimestamps ? 'Hide timestamps' : 'Show timestamps'}
            className={`h-6 w-6 ${showTimestamps ? 'text-primary' : 'text-muted-foreground'}`}
          >
            <Clock size={12} />
          </Button>

          <Button
            variant="ghost"
            size="icon-sm"
            onClick={handleCopyLogs}
            title="Copy logs"
            className="h-6 w-6 text-muted-foreground hover:text-foreground"
          >
            {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
          </Button>

          <Button
            variant="ghost"
            size="icon-sm"
            onClick={handleDownloadLogs}
            title="Download log file"
            className="h-6 w-6 text-muted-foreground hover:text-foreground"
          >
            <Download size={12} />
          </Button>

          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setIsFullscreen(!isFullscreen)}
            title={isFullscreen ? 'Exit full screen' : 'Expand full screen'}
            className="h-6 w-6 text-muted-foreground hover:text-foreground"
          >
            {isFullscreen ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
          </Button>
        </div>
      </div>

      {/* Terminal Viewport */}
      <div
        ref={logsContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto overflow-x-auto p-3 space-y-0.5 text-left select-text bg-[#04070D]"
      >
        {filteredLogs.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground/60 text-xs">
            {searchQuery
              ? `No logs matching "${searchQuery}"`
              : 'Waiting for runner logs...'}
          </div>
        ) : (
          filteredLogs.map((log, index) => {
            const isStderr =
              log.stream === 'STDERR' ||
              log.message.includes('Error:') ||
              log.message.includes('FATAL') ||
              log.message.includes('failed');

            const isCommand = log.message.startsWith('$') || log.message.startsWith('>');

            return (
              <div
                key={log.id || index}
                className={`flex items-start gap-3 leading-relaxed hover:bg-white/[0.02] px-1 rounded transition-colors ${
                  isStderr
                    ? 'text-rose-400 font-medium'
                    : isCommand
                    ? 'text-sky-300 font-semibold'
                    : 'text-slate-300'
                }`}
              >
                {/* Line number */}
                <span className="select-none text-[10px] text-muted-foreground/40 w-8 text-right shrink-0 pt-[1px]">
                  {String(index + 1).padStart(4, '0')}
                </span>

                {/* Optional Timestamp */}
                {showTimestamps && (
                  <span className="select-none text-[10px] text-muted-foreground/50 shrink-0 pt-[1px]">
                    [{new Date(log.createdAt).toLocaleTimeString()}]
                  </span>
                )}

                {/* Message Body */}
                <span className="whitespace-pre-wrap break-all flex-1">
                  {log.message}
                </span>
              </div>
            );
          })
        )}
      </div>

      {/* Floating Resume Auto-Scroll Button */}
      {!isFollowing && isLive && (
        <div className="absolute bottom-4 right-4 z-10">
          <Button
            size="sm"
            onClick={resumeFollow}
            className="gap-1.5 h-7 text-xs bg-primary text-primary-foreground shadow-lg animate-bounce"
          >
            <ArrowDown size={12} />
            <span>Follow output</span>
          </Button>
        </div>
      )}
    </div>
  );
}
