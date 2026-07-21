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
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
