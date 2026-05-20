import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import 'katex/dist/katex.min.css';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { SiteHeader } from '@/components/site-header';

// next/font self-hosts the font at build time — no runtime CDN fetch.
const inter = Inter({ subsets: ['latin'], display: 'swap', variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'Electronics Tutorial',
  description:
    "Interactive companion to Charles Platt's Make: Electronics, 3rd Edition — local-only.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <body className="min-h-screen bg-background font-sans antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <SiteHeader />
          <main className="container mx-auto max-w-5xl px-4 py-8">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
