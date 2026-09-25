'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  ChevronRight,
  CheckCircle2,
  XCircle,
  Loader2,
  Circle,
  Copy,
  Check,
  Search,
  Maximize2,
  Minimize2,
  Terminal,
  Download,
  MinusCircle,
} from 'lucide-react';
import { Job, JobLog, JobStatus } from '@/types/ci';
import { formatDuration, copyToClipboard } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export interface StepItem {
  id: string;
  name: string;
  command?: string;
  status: 'SUCCESS' | 'FAILED' | 'RUNNING' | 'QUEUED' | 'SKIPPED';
  durationSeconds: number;
  logs: JobLog[];
  lineOffset: number; 
}

interface StepAccordionProps {
  job: Job;
  logs: JobLog[];
  isLive?: boolean;
  searchQuery?: string;
}

export function StepAccordion({
  job,
  logs,
  isLive = false,
  searchQuery = '',
}: StepAccordionProps) {
  const [openSteps, setOpenSteps] = useState<Record<string, boolean>>({});
  const [copiedStepId, setCopiedStepId] = useState<string | null>(null);

  const steps: StepItem[] = useMemo(() => {
    const rawCommands = job.commands && job.commands.length > 0 ? job.commands : [];

    interface StepDef {
      id: string;
      name: string;
      command?: string;
    }

    const stepDefs: StepDef[] = [
      { id: 'step-setup', name: 'Set up job' },
      { id: 'step-checkout', name: 'Checkout repository Code' },
      ...rawCommands.map((cmd, idx) => ({
        id: `step-cmd-${idx}`,
        name: cmd.startsWith('Run ') ? cmd : `Run ${cmd}`,
        command: cmd,
      })),
      { id: 'step-complete', name: 'Complete job' },
    ];

    const stepLogsMap: Record<string, JobLog[]> = {};
    stepDefs.forEach((s) => {
      stepLogsMap[s.id] = [];
    });

    let currentStepId = 'step-setup';

    logs.forEach((log) => {
      const msg = log.message || '';

   
      if (msg.includes('▶️ Step:')) {
        const matchedCmd = rawCommands.find((c) => msg.includes(c));
        if (matchedCmd) {
          const idx = rawCommands.indexOf(matchedCmd);
          currentStepId = `step-cmd-${idx}`;
        }
      } else if (
        msg.toLowerCase().includes('checking out') ||
        msg.toLowerCase().includes('cloning into') ||
        msg.toLowerCase().includes('checkout commit') ||
        msg.toLowerCase().includes('fetching the repository')
      ) {
        currentStepId = 'step-checkout';
      } else if (
        msg.toLowerCase().includes('removing container') ||
        msg.toLowerCase().includes('job completed') ||
        msg.toLowerCase().includes('post job cleanup')
      ) {
        currentStepId = 'step-complete';
      }

      const targetBucket = stepLogsMap[currentStepId] ?? stepLogsMap['step-setup'];
      if (targetBucket) {
        targetBucket.push(log);
      }
    });

    const cmd0Logs = stepLogsMap['step-cmd-0'];
    if (
      rawCommands.length > 0 &&
      cmd0Logs &&
      cmd0Logs.length === 0 &&
      logs.length > 0
    ) {
      const allLogs = [...logs];
      const setupSlice = allLogs.slice(0, Math.min(3, allLogs.length));
      const rest = allLogs.slice(3);
      stepLogsMap['step-setup'] = setupSlice;
      stepLogsMap['step-cmd-0'] = rest;
    }

    let runningStepEncountered = false;
    let failedStepEncountered = false;
    let cumulativeLineCount = 1;

    return stepDefs.map((def, idx) => {
      const stepLogs = stepLogsMap[def.id] || [];
      const lineOffset = cumulativeLineCount;
      cumulativeLineCount += Math.max(stepLogs.length, 1);

      let status: 'SUCCESS' | 'FAILED' | 'RUNNING' | 'QUEUED' | 'SKIPPED' = 'QUEUED';

      if (job.status === 'SUCCESS') {
        status = 'SUCCESS';
      } else if (job.status === 'FAILED') {
        const hasFailedLog = stepLogs.some(
          (l) =>
            l.stream === 'STDERR' ||
            l.message.includes('❌') ||
            l.message.includes('failed with exit code') ||
            l.message.toLowerCase().includes('fatal:')
        );

        if (hasFailedLog || (!failedStepEncountered && idx === stepDefs.length - 2)) {
          status = 'FAILED';
          failedStepEncountered = true;
        } else if (failedStepEncountered) {
          status = 'SKIPPED';
        } else {
          status = 'SUCCESS';
        }
      } else if (job.status === 'RUNNING') {
        if (!runningStepEncountered) {
          if (stepLogs.length > 0 && idx === stepDefs.length - 1) {
            status = 'RUNNING';
            runningStepEncountered = true;
          } else if (stepLogs.length > 0) {
            const nextDef = stepDefs[idx + 1];
            if (!nextDef || (stepLogsMap[nextDef.id] || []).length === 0) {
              status = 'RUNNING';
              runningStepEncountered = true;
            } else {
              status = 'SUCCESS';
            }
          } else {
            status = 'RUNNING';
            runningStepEncountered = true;
          }
        } else {
          status = 'QUEUED';
        }
      } else {
        status = 'QUEUED';
      }

      // Duration approximation from logs timestamps
      let duration = 0;
      const firstLog = stepLogs[0];
      const lastLog = stepLogs[stepLogs.length - 1];
      if (stepLogs.length >= 2 && firstLog && lastLog) {
        const t1 = new Date(firstLog.createdAt).getTime();
        const t2 = new Date(lastLog.createdAt).getTime();
        duration = Math.max(0, Math.round((t2 - t1) / 1000));
      } else if (status === 'SUCCESS') {
        duration = idx === 1 ? 1 : idx === stepDefs.length - 1 ? 0 : 3;
      }

      return {
        id: def.id,
        name: def.name,
        command: def.command,
        status,
        durationSeconds: duration,
        logs: stepLogs,
        lineOffset,
      };
    });
  }, [job, logs]);

  // Auto-expand the active running step, failed step, or first step by default
  useEffect(() => {
    setOpenSteps((prev) => {
      // If user already interacted, preserve their toggles
      if (Object.keys(prev).length > 0) return prev;

      const initial: Record<string, boolean> = {};
      const failed = steps.find((s) => s.status === 'FAILED');
      const running = steps.find((s) => s.status === 'RUNNING');

      if (failed) {
        initial[failed.id] = true;
      } else if (running) {
        initial[running.id] = true;
      } else {
        const primary = steps.find((s) => s.id.startsWith('step-cmd-')) || steps[1] || steps[0];
        if (primary) initial[primary.id] = true;
      }
      return initial;
    });
  }, [steps]);

  // If search query changes, auto-expand steps containing matching logs
  useEffect(() => {
    if (!searchQuery.trim()) return;
    const q = searchQuery.toLowerCase();
    const newOpen: Record<string, boolean> = {};

    steps.forEach((step) => {
      const hasMatch =
        step.name.toLowerCase().includes(q) ||
        step.logs.some((l) => l.message.toLowerCase().includes(q));
      if (hasMatch) {
        newOpen[step.id] = true;
      }
    });

    if (Object.keys(newOpen).length > 0) {
      setOpenSteps((prev) => ({ ...prev, ...newOpen }));
    }
  }, [searchQuery, steps]);

  const toggleStep = (stepId: string) => {
    setOpenSteps((prev) => ({
      ...prev,
      [stepId]: !prev[stepId],
    }));
  };

  const expandAll = () => {
    const all: Record<string, boolean> = {};
    steps.forEach((s) => (all[s.id] = true));
    setOpenSteps(all);
  };

  const collapseAll = () => {
    setOpenSteps({});
  };

  const handleCopyStepLogs = async (step: StepItem) => {
    const text = step.logs.map((l) => l.message).join('\n');
    const success = await copyToClipboard(text);
    if (success) {
      setCopiedStepId(step.id);
      setTimeout(() => setCopiedStepId(null), 2000);
    }
  };

  return (
    <div className="rounded-md border border-[#30363D] bg-[#0D1117] overflow-hidden text-[#C9D1D9] select-text">
      {/* Controls Bar */}
      <div className="flex items-center justify-between px-3.5 py-2 bg-[#161B22] border-b border-[#30363D] text-xs">
        <div className="flex items-center gap-2 text-[#8B949E]">
          <span className="font-mono text-[11px]">
            {steps.length} steps • {logs.length} total lines
          </span>
          {isLive && (
            <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-medium">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live streaming
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={expandAll}
            className="text-[11px] text-[#58A6FF] hover:underline"
          >
            Expand all
          </button>
          <span className="text-[#30363D]">•</span>
          <button
            type="button"
            onClick={collapseAll}
            className="text-[11px] text-[#8B949E] hover:text-[#F0F6FC]"
          >
            Collapse all
          </button>
        </div>
      </div>

      {/* Step Rows Accordion */}
      <div className="divide-y divide-[#30363D]/60">
        {steps.map((step) => {
          const isOpen = !!openSteps[step.id];
          const hasLogs = step.logs.length > 0;

          // Filter logs by search query if present
          const displayLogs = searchQuery.trim()
            ? step.logs.filter((l) =>
                l.message.toLowerCase().includes(searchQuery.toLowerCase())
              )
            : step.logs;

          return (
            <div key={step.id} className="group">
              {/* Step Dropdown Header */}
              <button
                type="button"
                onClick={() => toggleStep(step.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 text-left transition-colors select-none ${
                  isOpen
                    ? 'bg-[#161B22] hover:bg-[#1C2128]'
                    : 'bg-[#0D1117] hover:bg-[#161B22]/70'
                }`}
              >

                <div className="flex items-center gap-2.5 min-w-0 pr-4">
                  <ChevronRight
                    size={13}
                    className={`text-[#8B949E] shrink-0 transition-transform duration-150 ${
                      isOpen ? 'rotate-90 text-[#F0F6FC]' : ''
                    }`}
                  />

                  {/* Status Icon */}
                  {step.status === 'SUCCESS' ? (
                    <CheckCircle2
                      size={15}
                      className="text-[#3FB950] shrink-0"
                    />
                  ) : step.status === 'FAILED' ? (
                    <XCircle
                      size={15}
                      className="text-[#F85149] shrink-0"
                    />
                  ) : step.status === 'RUNNING' ? (
                    <Loader2
                      size={15}
                      className="text-[#58A6FF] shrink-0 animate-spin"
                    />
                  ) : step.status === 'SKIPPED' ? (
                    <MinusCircle
                      size={15}
                      className="text-[#8B949E]/60 shrink-0"
                    />
                  ) : (
                    <Circle
                      size={15}
                      className="text-[#8B949E]/50 shrink-0"
                    />
                  )}

                  {/* Step Title */}
                  <span
                    className={`text-xs font-medium truncate ${
                      isOpen ? 'text-[#F0F6FC]' : 'text-[#C9D1D9]'
                    }`}
                  >
                    {step.name}
                  </span>
                </div>

                {/* Right: Copy action on hover + Duration */}
                <div className="flex items-center gap-3 shrink-0">
                  {hasLogs && (
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopyStepLogs(step);
                      }}
                      title="Copy step logs"
                      className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-[#30363D] text-[#8B949E] hover:text-[#F0F6FC] transition-opacity cursor-pointer"
                    >
                      {copiedStepId === step.id ? (
                        <Check size={12} className="text-emerald-400" />
                      ) : (
                        <Copy size={12} />
                      )}
                    </span>
                  )}

                  <span className="text-xs font-mono text-[#8B949E] min-w-[32px] text-right">
                    {step.status === 'QUEUED'
                      ? ''
                      : step.durationSeconds > 0
                      ? formatDuration(step.durationSeconds)
                      : '0s'}
                  </span>
                </div>
              </button>

              {/* Step Logs Drawer */}
              {isOpen && (
                <div className="bg-[#0D1117] border-t border-[#30363D]/70 px-2 py-2 font-mono text-[11px] leading-relaxed max-h-[440px] overflow-y-auto">
                  {displayLogs.length === 0 ? (
                    <div className="py-3 px-6 text-[#8B949E] text-xs italic">
                      {searchQuery
                        ? `No lines matching "${searchQuery}" in this step`
                        : step.status === 'QUEUED'
                        ? 'Step is queued...'
                        : 'No output recorded for this step'}
                    </div>
                  ) : (
                    <div className="space-y-0.5">
                      {displayLogs.map((log, logIdx) => {
                        const lineNum = step.lineOffset + logIdx;
                        const isError =
                          log.stream === 'STDERR' ||
                          log.message.includes('❌') ||
                          log.message.includes('Error:') ||
                          log.message.includes('failed with exit code');

                        const isHeader =
                          log.message.startsWith('▶️') ||
                          log.message.startsWith('==') ||
                          log.message.startsWith('✅');

                        return (
                          <div
                            key={log.id || logIdx}
                            className={`flex items-start gap-3 px-2 py-0.5 rounded hover:bg-[#161B22]/90 transition-colors ${
                              isError
                                ? 'text-[#F85149] bg-[#F85149]/5'
                                : isHeader
                                ? 'text-[#58A6FF] font-semibold'
                                : 'text-[#C9D1D9]'
                            }`}
                          >
                            {/* GitHub Actions Line Number */}
                            <span className="select-none text-[10px] text-[#484F58] w-7 text-right shrink-0 pt-[1px]">
                              {lineNum}
                            </span>

                            {/* Message */}
                            <span className="whitespace-pre-wrap break-all flex-1">
                              {log.message}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
