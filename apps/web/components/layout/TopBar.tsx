'use client';

import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { CloudLightning, Radio, ExternalLink, Menu as MenuIcon } from 'lucide-react';
import GitHubIcon from '@mui/icons-material/GitHub';
import Link from 'next/link';

interface TopBarProps {
  onToggleSidebar?: () => void;
  onOpenConnectModal?: () => void;
}

export function TopBar({ onToggleSidebar, onOpenConnectModal }: TopBarProps) {
  return (
    <Box
      component="header"
      sx={{
        height: 54,
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        backgroundColor: '#0A0D12',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: 2.5,
        position: 'sticky',
        top: 0,
        zIndex: 1100,
      }}
    >
      {/* Brand & Left controls */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        {onToggleSidebar && (
          <IconButton
            size="small"
            onClick={onToggleSidebar}
            sx={{
              color: '#94A3B8',
              display: { xs: 'flex', md: 'none' },
              mr: 0.5,
            }}
          >
            <MenuIcon size={18} />
          </IconButton>
        )}

        <Link
          href="/repositories"
          style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Box
            sx={{
              width: 28,
              height: 28,
              borderRadius: '6px',
              backgroundColor: 'rgba(59, 130, 246, 0.15)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#60A5FA',
            }}
          >
            <CloudLightning size={16} />
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.75 }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                fontSize: '0.9375rem',
                letterSpacing: '-0.02em',
                color: '#F8FAFC',
              }}
            >
              NIMBUS
            </Typography>
            <Typography
              component="span"
              sx={{
                fontSize: '0.6875rem',
                fontWeight: 600,
                color: '#3B82F6',
                fontFamily: 'var(--font-geist-mono), monospace',
                letterSpacing: '0.04em',
              }}
            >
              CI
            </Typography>
          </Box>
        </Link>
      </Box>

      {/* Right controls */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        {/* Live Status indicator */}
        <Box
          sx={{
            display: { xs: 'none', sm: 'inline-flex' },
            alignItems: 'center',
            gap: 0.6,
            px: 1,
            py: 0.25,
            borderRadius: '4px',
            backgroundColor: 'rgba(16, 185, 129, 0.08)',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            color: '#10B981',
            fontSize: '0.6875rem',
            fontWeight: 500,
            fontFamily: 'var(--font-geist-mono), monospace',
          }}
        >
          <Box
            component="span"
            sx={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              backgroundColor: '#10B981',
              boxShadow: '0 0 8px #10B981',
            }}
          />
          Live
        </Box>

        {onOpenConnectModal && (
          <Button
            variant="outlined"
            size="small"
            onClick={onOpenConnectModal}
            startIcon={<GitHubIcon sx={{ fontSize: 14 }} />}
            sx={{
              fontSize: '0.75rem',
              py: 0.4,
              px: 1.25,
              borderColor: 'rgba(255, 255, 255, 0.15)',
              color: '#E2E8F0',
              '&:hover': {
                borderColor: 'rgba(255, 255, 255, 0.3)',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
              },
            }}
          >
            Connect GitHub
          </Button>
        )}

        <Tooltip title="View Source on GitHub">
          <IconButton
            size="small"
            component="a"
            href="https://github.com/harshit-technocrat11/nimbus-CI"
            target="_blank"
            rel="noopener noreferrer"
            sx={{ color: '#94A3B8', '&:hover': { color: '#F8FAFC' } }}
          >
            <GitHubIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
}
