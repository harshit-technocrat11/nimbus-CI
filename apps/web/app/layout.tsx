import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import ThemeRegistry from '../theme/ThemeRegistry';
import { AppShell } from '../components/layout/AppShell';

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  fallback: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
});

const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  fallback: ['JetBrains Mono', 'Fira Code', 'monospace'],
});

export const metadata: Metadata = {
  title: 'Nimbus CI - Distributed Continuous Integration',
  description: 'Fast, lightweight distributed CI execution platform for modern developers',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <ThemeRegistry>
          <AppShell>{children}</AppShell>
        </ThemeRegistry>
      </body>
    </html>
  );
}
