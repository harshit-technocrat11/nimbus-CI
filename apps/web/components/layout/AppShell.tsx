'use client';

import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import { TopBar } from './TopBar';
import { Sidebar } from './Sidebar';
import { ConnectGitHubDialog } from '../repositories/ConnectGitHubDialog';

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [connectModalOpen, setConnectModalOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#0B0D11' }}>
      <TopBar
        onToggleSidebar={handleDrawerToggle}
        onOpenConnectModal={() => setConnectModalOpen(true)}
      />

      <Box sx={{ display: 'flex', flex: 1 }}>
        {/* Desktop Sidebar */}
        <Box sx={{ display: { xs: 'none', md: 'block' } }}>
          <Sidebar />
        </Box>

        {/* Mobile Drawer Sidebar */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: 240,
              backgroundColor: '#0A0D12',
              backgroundImage: 'none',
              borderRight: '1px solid rgba(255, 255, 255, 0.1)',
            },
          }}
        >
          <Sidebar onClose={() => setMobileOpen(false)} />
        </Drawer>

        {/* Main Content Area */}
        <Box
          component="main"
          sx={{
            flex: 1,
            p: { xs: 2, sm: 3, md: 4 },
            maxWidth: 1320,
            mx: 'auto',
            width: '100%',
            overflowX: 'hidden',
          }}
        >
          {children}
        </Box>
      </Box>

      {/* Global Connect GitHub Dialog */}
      <ConnectGitHubDialog
        open={connectModalOpen}
        onClose={() => setConnectModalOpen(false)}
        onConnected={() => {
          setConnectModalOpen(false);
          if (typeof window !== 'undefined') {
            window.location.href = '/repositories';
          }
        }}
      />
    </Box>
  );
}
