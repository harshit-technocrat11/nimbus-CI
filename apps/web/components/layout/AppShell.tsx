'use client';

import React, { useState } from 'react';
import { TopBar } from './TopBar';
import { Sidebar } from './Sidebar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { GitBranch, ShieldCheck, ArrowUpRight } from 'lucide-react';

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [connectModalOpen, setConnectModalOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <TopBar
        onToggleSidebar={() => setMobileOpen(!mobileOpen)}
        onOpenConnectModal={() => setConnectModalOpen(true)}
      />

      <div className="flex flex-1">
        {/* Desktop Sidebar */}
        <div className="hidden md:block shrink-0">
          <Sidebar />
        </div>

        {/* Mobile Overlay Drawer */}
        {mobileOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity"
              onClick={() => setMobileOpen(false)}
            />
            {/* Drawer */}
            <div className="fixed inset-y-0 left-0 z-50 w-64 bg-card p-0 shadow-xl animate-in slide-in-from-left duration-200">
              <Sidebar onClose={() => setMobileOpen(false)} />
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 md:p-8 max-w-[1400px]">
          {children}
        </main>
      </div>

      {/* Connect GitHub Dialog */}
      <Dialog open={connectModalOpen} onOpenChange={setConnectModalOpen}>
        <DialogContent className="sm:max-w-[460px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <GitBranch className="text-primary" size={18} />
              Connect GitHub Repositories
            </DialogTitle>
            <DialogDescription>
              Nimbus CI securely integrates through a GitHub App to execute workflows on push and pull requests.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-3 text-xs text-muted-foreground">
            <div className="flex items-start gap-2.5 p-2.5 rounded-md bg-secondary/40 border border-border">
              <ShieldCheck className="text-emerald-400 shrink-0 mt-0.5" size={16} />
              <div>
                <p className="font-medium text-foreground">Granular Permissions</p>
                <p className="mt-0.5 text-[11px]">
                  Only granted read access to workflows and write access to commit statuses on chosen repositories.
                </p>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setConnectModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={() => {
                // When user sets up GitHub App, this will trigger the install URL
                setConnectModalOpen(false);
              }}
              className="gap-1.5"
            >
              <span>Install GitHub App</span>
              <ArrowUpRight size={14} />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
