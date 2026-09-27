'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { CloudLightning, Menu, GitFork, LogOut, User as UserIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { api, type AuthUser } from '@/lib/api';

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      />
    </svg>
  );
}

interface TopBarProps {
  onToggleSidebar?: () => void;
  onOpenConnectModal?: () => void;
}

export function TopBar({ onToggleSidebar, onOpenConnectModal }: TopBarProps) {
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

  const handleLogout = async () => {
    await api.logout();
    setUser(null);
    window.location.reload();
  };

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

        {!loading && (
          user ? (
            <div className="flex items-center gap-2 pl-2 border-l border-[#30363D]">
              <div className="flex items-center gap-2">
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.githubUsername}
                    className="w-6 h-6 rounded-full border border-[#30363D]"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-[#30363D] text-[#8B949E] flex items-center justify-center">
                    <UserIcon size={12} />
                  </div>
                )}
                <span className="text-xs font-medium text-[#C9D1D9] hidden md:inline">
                  {user.githubUsername}
                </span>
              </div>
              <button
                onClick={handleLogout}
                title="Sign out"
                className="p-1 rounded text-[#8B949E] hover:text-[#F85149] hover:bg-[#21262D] transition-colors"
                aria-label="Sign out"
              >
                <LogOut size={14} />
              </button>
            </div>
          ) : (
            <a href={api.getLoginUrl()}>
              <Button
                size="sm"
                className="gap-1.5 h-7 text-xs bg-[#238636] hover:bg-[#2ea043] text-white font-medium border border-[#2ea043]/40"
              >
                <GitHubIcon className="text-white" />
                <span>Sign in with GitHub</span>
              </Button>
            </a>
          )
        )}
      </div>
    </header>
  );
}
