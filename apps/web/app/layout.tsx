import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import ThemeRegistry from '../theme/ThemeRegistry';
import { AppShell } from '../components/layout/AppShell';

const sansFont = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-geist-sans',
});

const monoFont = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-geist-mono',
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
    <html lang="en" className={`${sansFont.variable} ${monoFont.variable}`}>
      <body>
        <ThemeRegistry>
          <AppShell>{children}</AppShell>
        </ThemeRegistry>
      </body>
    </html>
  );
}
