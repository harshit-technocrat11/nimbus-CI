'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { TopBar } from './TopBar';
import { Sidebar } from './Sidebar';
import { ConnectGitHubDialog } from '@/components/repositories/ConnectGitHubDialog';

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [connectModalOpen, setConnectModalOpen] = useState(false);
  const pathname = usePathname();
  const isLandingPage = pathname === '/';

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <TopBar
        onToggleSidebar={isLandingPage ? undefined : () => setMobileOpen(!mobileOpen)}
        onOpenConnectModal={() => setConnectModalOpen(true)}
      />

      {isLandingPage ? (
        <main className="flex-1 min-w-0">
          {children}
        </main>
      ) : (
        <div className="flex flex-1">
          <div className="hidden md:block shrink-0">
            <Sidebar />
          </div>

          {mobileOpen && (
            <div className="fixed inset-0 z-50 md:hidden">
              <div
                className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity"
                onClick={() => setMobileOpen(false)}
              />
              <div className="fixed inset-y-0 left-0 z-50 w-64 bg-card p-0 shadow-xl animate-in slide-in-from-left duration-200">
                <Sidebar onClose={() => setMobileOpen(false)} />
              </div>
            </div>
          )}

          <main className="flex-1 min-w-0 p-4 sm:p-6 md:p-8 max-w-[1400px]">
            {children}
          </main>
        </div>
      )}

      <ConnectGitHubDialog
        open={connectModalOpen}
        onClose={() => setConnectModalOpen(false)}
        onConnected={() => {
          setConnectModalOpen(false);
          window.location.href = '/repositories';
        }}
      />
    </div>
  );
}
