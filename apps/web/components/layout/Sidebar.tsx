'use client';

import React from 'react';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import {
  FolderGit2,
  PlaySquare,
  Server,
  Settings,
  BookOpen,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SidebarProps {
  onClose?: () => void;
}

export function Sidebar({ onClose }: SidebarProps) {
  const pathname = usePathname();

  const navItems = [
    {
      label: 'Repositories',
      href: '/repositories',
      icon: <FolderGit2 size={16} />,
      active: pathname === '/' || pathname.startsWith('/repositories'),
    },
    {
      label: 'Workflow Runs',
      href: '/runs',
      icon: <PlaySquare size={16} />,
      active: pathname.startsWith('/runs'),
    },
    {
      label: 'Runners',
      href: '/runners',
      icon: <Server size={16} />,
      active: pathname.startsWith('/runners'),
    },
    {
      label: 'Settings',
      href: '/settings',
      icon: <Settings size={16} />,
      active: pathname.startsWith('/settings'),
    },
  ];

  return (
    <Box
      component="aside"
      sx={{
        width: 220,
        height: 'calc(100vh - 54px)',
        borderRight: '1px solid rgba(255, 255, 255, 0.08)',
        backgroundColor: '#0A0D12',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        p: 1.5,
      }}
    >
      <Box>
        <Typography
          variant="caption"
          sx={{
            px: 1.5,
            py: 0.75,
            display: 'block',
            fontWeight: 600,
            color: '#64748B',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            fontSize: '0.6875rem',
          }}
        >
          Navigation
        </Typography>

        <List sx={{ p: 0, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          {navItems.map((item) => (
            <ListItem key={item.href} disablePadding>
              <ListItemButton
                component={Link}
                href={item.href}
                onClick={onClose}
                sx={{
                  borderRadius: '6px',
                  py: 0.85,
                  px: 1.25,
                  backgroundColor: item.active ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                  border: `1px solid ${item.active ? 'rgba(59, 130, 246, 0.25)' : 'transparent'}`,
                  color: item.active ? '#F8FAFC' : '#94A3B8',
                  '&:hover': {
                    backgroundColor: item.active
                      ? 'rgba(59, 130, 246, 0.15)'
                      : 'rgba(255, 255, 255, 0.03)',
                    color: '#F8FAFC',
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 28,
                    color: item.active ? '#3B82F6' : '#64748B',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontSize: '0.8125rem',
                    fontWeight: item.active ? 600 : 400,
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>

      {/* Bottom Footer Info */}
      <Box
        sx={{
          p: 1.25,
          borderRadius: '6px',
          backgroundColor: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
          <Box
            sx={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              backgroundColor: '#10B981',
            }}
          />
          <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 500 }}>
            Runner Cluster
          </Typography>
        </Box>
        <Typography
          variant="caption"
          sx={{
            color: '#64748B',
            fontSize: '0.6875rem',
            display: 'block',
            fontFamily: 'var(--font-geist-mono), monospace',
          }}
        >
          3 / 4 Workers Active
        </Typography>
      </Box>
    </Box>
  );
}
