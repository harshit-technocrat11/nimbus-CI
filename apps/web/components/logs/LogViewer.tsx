'use client';

import React, { useState, useMemo } from 'react';
import {
  Terminal,
  Search,
  Copy,
  Download,
  Maximize2,
  Minimize2,
  ArrowDown,
  Clock,
  Check,
  ListTree,
} from 'lucide-react';
import { Job, JobLog, JobStatus } from '@/types/ci';
import { useWorkflowStream } from '@/hooks/useWorkflowStream';
import { copyToClipboard } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { StepAccordion } from './StepAccordion';

interface LogViewerProps {
  jobId?: string;
  job?: Job;
  initialLogs?: JobLog[];
  jobStatus?: JobStatus;
  jobName?: string;
  runnerName?: string;
  isLive?: boolean;
}

export function LogViewer({
  jobId,
  job,
  initialLogs = [],
  jobStatus = 'RUNNING',
  jobName,
  runnerName,
  isLive = true,
}: LogViewerProps) {
  const targetJobId = job?.id || jobId;
  const targetStatus = job?.status || jobStatus;
  const targetName = job?.name || jobName || 'job-logs';
  const targetLogs = initialLogs.length > 0 ? initialLogs : job?.logs || [];

  const {
    logs,
    connectionStatus,
    isFollowing,
    resumeFollow,
    logsContainerRef,
    handleScroll,
  } = useWorkflowStream({
    jobId: targetJobId,
    initialLogs: targetLogs,
    jobStatus: targetStatus,
    isLive,
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'steps' | 'raw'>('steps');
  const [showTimestamps, setShowTimestamps] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Construct effective job object for StepAccordion
  const effectiveJob: Job = useMemo(() => {
    if (job) return job;
    return {
      id: targetJobId || 'job-default',
      workflowRunId: 'run-default',
      name: targetName,
      commands: [],
      status: targetStatus,
      runnerId: runnerName || null,
      queuedAt: new Date().toISOString(),
      startedAt: null,
      completedAt: null,
      exitCode: null,
      errorMessage: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }, [job, targetJobId, targetName, targetStatus, runnerName]);

  // Filter logs by search query for raw view
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
    link.download = `nimbus-job-${targetName || targetJobId || 'log'}.log`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className={`rounded-md border border-[#30363D] bg-[#0D1117] overflow-hidden flex flex-col font-mono text-xs shadow-md transition-all ${
        isFullscreen
          ? 'fixed inset-3 z-50 h-[calc(100vh-1.5rem)]'
          : 'relative'
      }`}
    >
      {/* GitHub Actions Style Top Search & Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 px-3.5 py-2.5 border-b border-[#30363D] bg-[#161B22] select-none">
        {/* Left: Job Info & Connection Status */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-1.5 text-[#F0F6FC] font-semibold">
            <Terminal size={14} className="text-[#58A6FF]" />
            <span className="font-sans text-xs">{targetName}</span>
          </div>

          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#0D1117] border border-[#30363D] text-[10px]">
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                connectionStatus === 'connected'
                  ? 'bg-[#3FB950] animate-pulse'
                  : connectionStatus === 'reconnecting'
                  ? 'bg-amber-400 animate-ping'
                  : 'bg-[#8B949E]'
              }`}
            />
            <span className="capitalize text-[#8B949E]">
              {connectionStatus === 'connected' ? 'Live Stream' : connectionStatus}
            </span>
          </div>
        </div>

        {/* Right: Search, View Mode Toggle, Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Search Logs Input */}
          <div className="relative w-40 sm:w-52">
            <Search
              size={12}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#8B949E] pointer-events-none"
            />
            <input
              type="text"
              placeholder="Search logs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-7 pl-7 pr-2 rounded-md bg-[#0D1117] border border-[#30363D] text-[11px] text-[#F0F6FC] placeholder:text-[#8B949E] focus:outline-none focus:border-[#58A6FF] font-sans"
            />
          </div>

          {/* View Mode Switcher (Steps vs Raw Console) */}
          <div className="flex items-center rounded-md border border-[#30363D] bg-[#0D1117] p-0.5">
            <button
              type="button"
              onClick={() => setViewMode('steps')}
              className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] font-sans transition-colors ${
                viewMode === 'steps'
                  ? 'bg-[#161B22] text-[#58A6FF] font-medium border border-[#30363D]'
                  : 'text-[#8B949E] hover:text-[#F0F6FC]'
              }`}
              title="GitHub Actions Steps View"
            >
              <ListTree size={12} />
              <span>Steps</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('raw')}
              className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] font-sans transition-colors ${
                viewMode === 'raw'
                  ? 'bg-[#161B22] text-[#58A6FF] font-medium border border-[#30363D]'
                  : 'text-[#8B949E] hover:text-[#F0F6FC]'
              }`}
              title="Raw Full Terminal Output"
            >
              <Terminal size={12} />
              <span>Raw</span>
            </button>
          </div>

          {/* Timestamp Toggle (for raw view) */}
          {viewMode === 'raw' && (
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setShowTimestamps(!showTimestamps)}
              title={showTimestamps ? 'Hide timestamps' : 'Show timestamps'}
              className={`h-7 w-7 text-[#8B949E] hover:text-[#F0F6FC] hover:bg-[#30363D]/40 ${
                showTimestamps ? 'text-[#58A6FF]' : ''
              }`}
            >
              <Clock size={13} />
            </Button>
          )}

          {/* Copy Logs */}
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={handleCopyLogs}
            title="Copy all logs"
            className="h-7 w-7 text-[#8B949E] hover:text-[#F0F6FC] hover:bg-[#30363D]/40"
          >
            {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
          </Button>

          {/* Download Logs */}
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={handleDownloadLogs}
            title="Download log file"
            className="h-7 w-7 text-[#8B949E] hover:text-[#F0F6FC] hover:bg-[#30363D]/40"
          >
            <Download size={13} />
          </Button>

          {/* Fullscreen Toggle */}
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setIsFullscreen(!isFullscreen)}
            title={isFullscreen ? 'Exit full screen' : 'Full screen'}
            className="h-7 w-7 text-[#8B949E] hover:text-[#F0F6FC] hover:bg-[#30363D]/40"
          >
            {isFullscreen ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
          </Button>
        </div>
      </div>

      {/* Main Viewport */}
      {viewMode === 'steps' ? (
        <div className="p-3 bg-[#0D1117] min-h-[380px]">
          <StepAccordion
            job={effectiveJob}
            logs={logs}
            isLive={isLive}
            searchQuery={searchQuery}
          />
        </div>
      ) : (
        /* Raw Terminal Viewport */
        <div
          ref={logsContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto overflow-x-auto p-3 space-y-0.5 text-left select-text bg-[#0D1117] min-h-[420px] max-h-[600px]"
        >
          {filteredLogs.length === 0 ? (
            <div className="py-20 text-center text-[#8B949E] text-xs">
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

              const isCommand =
                log.message.startsWith('$') ||
                log.message.startsWith('>') ||
                log.message.startsWith('▶️');

              return (
                <div
                  key={log.id || index}
                  className={`flex items-start gap-3 leading-relaxed hover:bg-[#161B22]/80 px-1 rounded transition-colors ${
                    isStderr
                      ? 'text-[#F85149]'
                      : isCommand
                      ? 'text-[#58A6FF] font-semibold'
                      : 'text-[#C9D1D9]'
                  }`}
                >
                  {/* Line Number */}
                  <span className="select-none text-[10px] text-[#484F58] w-8 text-right shrink-0 pt-[1px]">
                    {String(index + 1).padStart(4, '0')}
                  </span>

                  {/* Optional Timestamp */}
                  {showTimestamps && (
                    <span className="select-none text-[10px] text-[#8B949E] shrink-0 pt-[1px]">
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

          {/* Floating Resume Auto-Scroll Button */}
          {!isFollowing && isLive && (
            <div className="absolute bottom-4 right-4 z-10">
              <Button
                size="sm"
                onClick={resumeFollow}
                className="gap-1.5 h-7 text-xs bg-[#238636] hover:bg-[#2EA043] text-white shadow-lg"
              >
                <ArrowDown size={12} />
                <span>Follow output</span>
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
