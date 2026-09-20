import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { AppShell } from '@/components/layout/AppShell';

const sansFont = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
});

const monoFont = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: 'Nimbus CI — Lightweight CI/CD for Developers',
  description: 'Fast, lightweight distributed CI execution platform inspired by GitHub Actions and GitLab CI',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${sansFont.variable} ${monoFont.variable}`}>
      <body className="min-h-screen bg-background text-foreground antialiased font-sans">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
