'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FolderGit2, PlaySquare, LayoutDashboard, GitFork } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface SidebarProps {
  onClose?: () => void;
}

export function Sidebar({ onClose }: SidebarProps) {
  const pathname = usePathname();

  const navItems = [
    {
      label: 'Overview',
      href: '/',
      icon: LayoutDashboard,
      active: pathname === '/',
    },
    {
      label: 'Repositories',
      href: '/repositories',
      icon: FolderGit2,
      active: pathname.startsWith('/repositories'),
    },
    {
      label: 'Workflow Runs',
      href: '/runs',
      icon: PlaySquare,
      active: pathname.startsWith('/runs'),
    },
    {
      label: 'Connect GitHub',
      href: '/connect/github',
      icon: GitFork,
      active: pathname.startsWith('/connect'),
    },
  ];

  return (
    <aside className="w-56 h-[calc(100vh-52px)] border-r border-border bg-[#0D1117] text-[#C9D1D9] flex flex-col justify-between p-3 select-none">
      <div className="space-y-4">
        <div>
          <p className="px-2.5 py-1 text-[10px] font-bold text-[#8B949E] uppercase tracking-wider">
            Menu
          </p>
          <nav className="mt-1 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    "flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors",
                    item.active
                      ? "bg-[#161B22] text-[#58A6FF] font-semibold border border-[#30363D]"
                      : "text-[#8B949E] hover:bg-[#161B22] hover:text-[#F0F6FC] border border-transparent"
                  )}
                >
                  <Icon
                    size={15}
                    className={item.active ? "text-[#58A6FF]" : "text-[#8B949E]"}
                  />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* GitHub App Connection Status */}
      <div className="pt-3 border-t border-[#30363D]">
        <Link
          href="/connect/github"
          className="flex items-center justify-between px-2.5 py-2 rounded-md bg-[#161B22] border border-[#30363D] hover:border-[#58A6FF]/40 transition-colors"
        >
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[11px] font-medium text-[#F0F6FC]">GitHub App</span>
          </div>
          <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 bg-emerald-950/60 text-emerald-400 border-emerald-500/30">
            Connected
          </Badge>
        </Link>
      </div>
    </aside>
  );
}
