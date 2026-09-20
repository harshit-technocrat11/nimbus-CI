'use client';

import React from 'react';
import Link from 'next/link';
import { CloudLightning, Menu, GitFork } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface TopBarProps {
  onToggleSidebar?: () => void;
  onOpenConnectModal?: () => void;
}

export function TopBar({ onToggleSidebar, onOpenConnectModal }: TopBarProps) {
  return (
    <header className="h-[52px] border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-40 flex items-center justify-between px-4 sm:px-6">
      {/* Brand & Left controls */}
      <div className="flex items-center gap-3">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="md:hidden p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary/60 focus:outline-none focus:ring-1 focus:ring-primary"
            aria-label="Toggle navigation"
          >
            <Menu size={18} />
          </button>
        )}

        <Link
          href="/"
          className="flex items-center gap-2 group transition-opacity hover:opacity-90"
        >
          <div className="w-7 h-7 rounded-md bg-primary/15 border border-primary/30 flex items-center justify-center text-primary group-hover:bg-primary/25 transition-colors">
            <CloudLightning size={16} />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-sm tracking-tight text-foreground">
              Nimbus
            </span>
            <span className="text-[10px] font-mono text-primary px-1 py-0.5 rounded bg-primary/10 border border-primary/20">
              CI
            </span>
          </div>
        </Link>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2.5">
        <Button
          variant="outline"
          size="sm"
          onClick={onOpenConnectModal}
          className="gap-1.5 h-7 text-xs border-border/80 hover:border-primary/40"
        >
          <GitFork size={13} className="text-primary" />
          <span className="hidden sm:inline">Connect Repository</span>
          <span className="sm:hidden">Connect</span>
        </Button>
      </div>
    </header>
  );
}
