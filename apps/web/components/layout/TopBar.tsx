'use client';

import React from 'react';
import Link from 'next/link';
import { CloudLightning, Menu, GitFork } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TopBarProps {
  onToggleSidebar?: () => void;
  onOpenConnectModal?: () => void;
}

export function TopBar({ onToggleSidebar, onOpenConnectModal }: TopBarProps) {
  return (
    <header className="h-[52px] border-b border-[#30363D] bg-[#161B22] sticky top-0 z-40 flex items-center justify-between px-4 sm:px-6">
      {/* Brand & Left controls */}
      <div className="flex items-center gap-3">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="md:hidden p-1.5 rounded-md text-[#8B949E] hover:text-[#F0F6FC] hover:bg-[#21262D] focus:outline-none"
            aria-label="Toggle navigation"
          >
            <Menu size={18} />
          </button>
        )}

        <Link
          href="/"
          className="flex items-center gap-2 group transition-opacity hover:opacity-90"
        >
          <div className="w-7 h-7 rounded-md bg-[#1f6feb] text-white flex items-center justify-center shadow-xs">
            <CloudLightning size={16} />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-sm tracking-tight text-[#F0F6FC]">
              Nimbus
            </span>
            <span className="text-[10px] font-mono font-semibold text-[#58A6FF] px-1.5 py-0.5 rounded bg-[#21262D] border border-[#30363D]">
              CI
            </span>
          </div>
        </Link>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2.5">
        <Link href="/connect/github">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 h-7 text-xs bg-[#21262D] border-[#30363D] hover:bg-[#30363D] text-[#F0F6FC] font-medium"
          >
            <GitFork size={13} className="text-[#58A6FF]" />
            <span className="hidden sm:inline">Connect Repository</span>
            <span className="sm:hidden">Connect</span>
          </Button>
        </Link>
      </div>
    </header>
  );
}
