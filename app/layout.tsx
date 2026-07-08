import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { DottedSurface } from '@/components/ui/dotted-surface';
import { Providers } from '@/components/providers';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Code 09',
  description: 'Prompt management & visualization platform',
  icons: {
    icon: '/CODE_09-Transparente.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full">
        <Providers>
          <DottedSurface />
          {children}
        </Providers>
      </body>
    </html>
  );
}
