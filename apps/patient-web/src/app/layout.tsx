import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AyuNet Patient Portal',
  description: 'AyuNet Healthcare Patient Portal Ecosystem',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
