'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  GitFork,
  CheckCircle2,
  ShieldCheck,
  ExternalLink,
  ChevronLeft,
  ArrowRight,
  GitBranch,
  Key,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function GitHubConnectPage() {
  const [isRedirecting, setIsRedirecting] = useState(false);

  const permissions = [
    {
      title: 'Repository Access',
      desc: 'Read access to code, branches, and workflow files for repositories you select.',
    },
    {
      title: 'Commit Statuses & Checks',
      desc: 'Read & write access to report build statuses directly on GitHub pull requests and commits.',
    },
    {
      title: 'Webhook Events',
      desc: 'Automatic push notifications whenever code is pushed to your repositories.',
    },
  ];

  const handleInstall = () => {
    setIsRedirecting(true);
    if (process.env.NEXT_PUBLIC_GITHUB_APP_INSTALL_URL) {
      window.location.href = process.env.NEXT_PUBLIC_GITHUB_APP_INSTALL_URL;
    } else {
      window.location.href = '/repositories';
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 py-4">
      <Link
        href="/repositories"
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors group"
      >
        <ChevronLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
        <span>Back to Repositories</span>
      </Link>

      {/* Main Connection Card */}
      <Card className="p-6 bg-[#161B22] border-[#30363D] shadow-xs space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-[#1f6feb] text-white flex items-center justify-center">
                <GitFork size={20} />
              </div>
              <div>
                <h1 className="text-base font-semibold text-[#F0F6FC] tracking-tight">
                  Connect GitHub App
                </h1>
                <p className="text-xs text-[#8B949E]">
                  Automate CI pipelines with native GitHub checks and push triggers
                </p>
              </div>
            </div>
          </div>

          <Badge variant="secondary" className="bg-emerald-950/60 text-emerald-400 border-emerald-500/30 text-xs">
            App Ready
          </Badge>
        </div>

        {/* Explainer Panel */}
        <div className="space-y-3">
          <h2 className="text-xs font-semibold text-[#8B949E] uppercase tracking-wider">
            Required Permissions & Access
          </h2>

          <div className="space-y-2.5">
            {permissions.map((perm) => (
              <div
                key={perm.title}
                className="p-3 rounded-md bg-[#0D1117] border border-[#30363D] flex items-start gap-3"
              >
                <ShieldCheck size={16} className="text-[#58A6FF] mt-0.5 shrink-0" />
                <div className="space-y-0.5">
                  <p className="text-xs font-semibold text-[#F0F6FC]">{perm.title}</p>
                  <p className="text-[11px] text-[#8B949E] leading-relaxed">
                    {perm.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Security Notice */}
        <div className="p-3 rounded-md bg-[#0D1117] border border-[#30363D] text-xs text-[#8B949E] space-y-1">
          <div className="flex items-center gap-1.5 font-medium text-[#F0F6FC]">
            <Key size={13} className="text-[#58A6FF]" />
            <span>Server-side Credential Security</span>
          </div>
          <p className="text-[11px] text-[#8B949E]">
            Nimbus CI never exposes GitHub App secrets or tokens to the browser. All webhook verification and API communication occur securely server-side.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
          <Link href="/repositories">
            <Button variant="ghost" size="sm" className="text-xs">
              Configure Later
            </Button>
          </Link>

          <Button
            size="sm"
            onClick={handleInstall}
            disabled={isRedirecting}
            className="gap-2 w-full sm:w-auto"
          >
            <span>{isRedirecting ? 'Redirecting to GitHub...' : 'Install GitHub App'}</span>
            <ExternalLink size={13} />
          </Button>
        </div>
      </Card>
    </div>
  );
}
