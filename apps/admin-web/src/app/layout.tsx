import type { Metadata } from 'next';
import { AppProviders } from '../providers/app-providers';
import './globals.css';

export const metadata: Metadata = {
  title: 'AyuNet Enterprise Healthcare Platform',
  description: 'Multi-Tenant Cloud Healthcare & Hospital Management Platform',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-slate-50 antialiased dark:bg-slate-950">
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded-md focus:bg-teal-600 focus:px-4 focus:py-2 focus:text-white">
          Skip to main content
        </a>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
