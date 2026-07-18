import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AyuNet Admin Console',
  description: 'AyuNet Healthcare Admin Console Portal',
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
