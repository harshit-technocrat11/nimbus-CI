'use client';

import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#0B0D11',
      paper: '#11151D',
    },
    primary: {
      main: '#3B82F6',
      light: '#60A5FA',
      dark: '#2563EB',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#8B5CF6',
      light: '#A78BFA',
      dark: '#7C3AED',
    },
    success: {
      main: '#10B981',
      light: '#34D399',
      dark: '#059669',
      contrastText: '#064E3B',
    },
    error: {
      main: '#EF4444',
      light: '#F87171',
      dark: '#DC2626',
      contrastText: '#450A0A',
    },
    warning: {
      main: '#F59E0B',
      light: '#FBBF24',
      dark: '#D97706',
      contrastText: '#451A03',
    },
    info: {
      main: '#0EA5E9',
      light: '#38BDF8',
      dark: '#0284C7',
    },
    text: {
      primary: '#F3F4F6',
      secondary: '#94A3B8',
      disabled: '#4B5563',
    },
    divider: 'rgba(255, 255, 255, 0.08)',
  },
  shape: {
    borderRadius: 6,
  },
  typography: {
    fontFamily:
      'var(--font-geist-sans), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    h1: {
      fontSize: '1.75rem',
      fontWeight: 600,
      letterSpacing: '-0.02em',
      color: '#F8FAFC',
    },
    h2: {
      fontSize: '1.35rem',
      fontWeight: 600,
      letterSpacing: '-0.015em',
      color: '#F8FAFC',
    },
    h3: {
      fontSize: '1.15rem',
      fontWeight: 600,
      color: '#F8FAFC',
    },
    h4: {
      fontSize: '1rem',
      fontWeight: 600,
      color: '#F8FAFC',
    },
    body1: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
      color: '#F3F4F6',
    },
    body2: {
      fontSize: '0.8125rem',
      lineHeight: 1.5,
      color: '#94A3B8',
    },
    caption: {
      fontSize: '0.75rem',
      color: '#64748B',
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
      fontSize: '0.8125rem',
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#0B0D11',
          color: '#F3F4F6',
          scrollbarColor: '#262F40 #0B0D11',
          '&::-webkit-scrollbar': {
            width: '8px',
            height: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: '#0B0D11',
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#262F40',
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: '#374151',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: '#11151D',
          border: '1px solid rgba(255, 255, 255, 0.08)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: '#11151D',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: 'none',
          borderRadius: 8,
          transition: 'border-color 0.15s ease',
          '&:hover': {
            borderColor: 'rgba(255, 255, 255, 0.16)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          boxShadow: 'none',
          padding: '6px 14px',
          '&:hover': {
            boxShadow: 'none',
          },
        },
        containedPrimary: {
          backgroundColor: '#3B82F6',
          color: '#FFFFFF',
          '&:hover': {
            backgroundColor: '#2563EB',
          },
        },
        outlined: {
          borderColor: 'rgba(255, 255, 255, 0.15)',
          color: '#E2E8F0',
          '&:hover': {
            borderColor: 'rgba(255, 255, 255, 0.3)',
            backgroundColor: 'rgba(255, 255, 255, 0.03)',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          fontWeight: 500,
          fontSize: '0.75rem',
          height: '24px',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
          padding: '10px 14px',
          fontSize: '0.8125rem',
        },
        head: {
          fontWeight: 600,
          color: '#94A3B8',
          fontSize: '0.75rem',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          backgroundColor: '#0F131A',
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          transition: 'background-color 0.12s ease',
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.02) !important',
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundColor: '#121722',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: 10,
          boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.7)',
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: '#0E1219',
          borderRadius: 6,
          '& fieldset': {
            borderColor: 'rgba(255, 255, 255, 0.12)',
          },
          '&:hover fieldset': {
            borderColor: 'rgba(255, 255, 255, 0.25)',
          },
          '&.Mui-focused fieldset': {
            borderColor: '#3B82F6',
          },
        },
        input: {
          padding: '8px 12px',
          fontSize: '0.875rem',
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          minHeight: 38,
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        },
        indicator: {
          backgroundColor: '#3B82F6',
          height: 2,
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          minHeight: 38,
          fontSize: '0.8125rem',
          fontWeight: 500,
          color: '#94A3B8',
          padding: '6px 14px',
          '&.Mui-selected': {
            color: '#F8FAFC',
          },
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: '#1E2638',
          color: '#F8FAFC',
          fontSize: '0.75rem',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: 4,
          padding: '4px 8px',
        },
      },
    },
  },
});
