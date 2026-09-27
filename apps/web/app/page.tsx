'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  CloudLightning,
  Box,
  Radio,
  Layers,
  ArrowRight,
  ShieldCheck,
  Terminal,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { api, type AuthUser } from '@/lib/api';

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      />
    </svg>
  );
}

export default function LandingPage() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    api
      .getCurrentUser()
      .then((u) => {
        if (mounted) setUser(u);
      })
      .catch(() => {
        if (mounted) setUser(null);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="max-w-5xl mx-auto py-12 px-4 space-y-16">
      <div className="text-center space-y-6 pt-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-[#1f6feb]/10 text-[#58A6FF] border border-[#1f6feb]/30">
          <CloudLightning size={13} className="text-[#58A6FF]" />
          <span>Self-Hosted CI/CD Platform</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-[#F0F6FC]">
          Self-Hosted CI Pipelines <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-[#58A6FF] via-[#79c0ff] to-[#bc8cff] bg-clip-text text-transparent">
            Built for Developers
          </span>
        </h1>

        <p className="max-w-2xl mx-auto text-base sm:text-lg text-[#8B949E] leading-relaxed">
          Define your <code className="text-[#58A6FF] bg-[#161B22] px-1.5 py-0.5 rounded border border-[#30363D] font-mono text-sm font-semibold">nimbus-ci.yml</code> in
          your repo and run it. Connect with GitHub, trigger automated builds on every push, and stream container logs live.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          {!loading && user ? (
            <Link href="/repositories">
              <Button
                size="lg"
                className="gap-2 h-11 px-6 bg-[#238636] hover:bg-[#2ea043] text-white font-semibold text-sm shadow-md"
              >
                <span>Go to Repositories Dashboard</span>
                <ArrowRight size={16} />
              </Button>
            </Link>
          ) : (
            <a href={api.getLoginUrl()}>
              <Button
                size="lg"
                className="gap-2.5 h-11 px-6 bg-[#238636] hover:bg-[#2ea043] text-white font-semibold text-sm shadow-md transition-all hover:scale-102"
              >
                <GitHubIcon className="text-white" />
                <span>Connect with GitHub</span>
                <ArrowRight size={15} />
              </Button>
            </a>
          )}

          <Link href="/repositories">
            <Button
              variant="outline"
              size="lg"
              className="h-11 px-6 bg-[#21262D] border-[#30363D] hover:bg-[#30363D] text-[#F0F6FC] font-medium text-sm"
            >
              Explore Repositories
            </Button>
          </Link>
        </div>

        <div className="flex items-center justify-center gap-6 text-xs text-[#8B949E] pt-2">
          <div className="flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-[#3fb950]" />
            <span>GitHub OAuth & JWT</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Box size={14} className="text-[#58A6FF]" />
            <span>Docker Sandboxing</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Radio size={14} className="text-[#bc8cff]" />
            <span>Live Kafka Stream</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-6 rounded-lg bg-[#161B22] border border-[#30363D] space-y-3">
          <div className="w-8 h-8 rounded-full bg-[#1f6feb]/20 text-[#58A6FF] font-mono text-sm font-bold flex items-center justify-center border border-[#1f6feb]/30">
            1
          </div>
          <h3 className="font-semibold text-base text-[#F0F6FC]">Connect GitHub</h3>
          <p className="text-xs text-[#8B949E] leading-relaxed">
            Authenticate seamlessly with GitHub OAuth to link your repositories with a single click.
          </p>
        </div>

        <div className="p-6 rounded-lg bg-[#161B22] border border-[#30363D] space-y-3">
          <div className="w-8 h-8 rounded-full bg-[#bc8cff]/20 text-[#bc8cff] font-mono text-sm font-bold flex items-center justify-center border border-[#bc8cff]/30">
            2
          </div>
          <h3 className="font-semibold text-base text-[#F0F6FC]">Add nimbus-ci.yml</h3>
          <p className="text-xs text-[#8B949E] leading-relaxed">
            Commit a <code className="text-[#C9D1D9] font-mono">nimbus-ci.yml</code> to your repository root declaring your build and test commands.
          </p>
        </div>

        <div className="p-6 rounded-lg bg-[#161B22] border border-[#30363D] space-y-3">
          <div className="w-8 h-8 rounded-full bg-[#3fb950]/20 text-[#3fb950] font-mono text-sm font-bold flex items-center justify-center border border-[#3fb950]/30">
            3
          </div>
          <h3 className="font-semibold text-base text-[#F0F6FC]">Run & Stream Live</h3>
          <p className="text-xs text-[#8B949E] leading-relaxed">
            Workers clone your code into isolated Docker containers and stream execution logs live to your screen.
          </p>
        </div>
      </div>

      <div className="rounded-lg bg-[#161B22] border border-[#30363D] overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2.5 bg-[#0D1117] border-b border-[#30363D]">
          <div className="flex items-center gap-2">
            <Terminal size={14} className="text-[#8B949E]" />
            <span className="text-xs font-mono text-[#C9D1D9]">nimbus-ci.yml</span>
          </div>
          <span className="text-[10px] font-mono text-[#8B949E]">YAML</span>
        </div>
        <pre className="p-4 text-xs font-mono text-[#C9D1D9] overflow-x-auto leading-relaxed">
          <code>{`name: Nimbus CI Pipeline
on:
  push:
    branches: [main]

jobs:
  test-and-build:
    runs-on: nimbus-worker
    steps:
      - name: Checkout Code
        run: git clone https://github.com/my-org/my-project.git .
      - name: Install Dependencies
        run: pnpm install --frozen-lockfile
      - name: Run Test Suite
        run: pnpm test`}</code>
        </pre>
      </div>
    </div>
  );
}
