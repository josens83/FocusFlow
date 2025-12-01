import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from './providers';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: 'FocusFlow - AI 집중력 & 생산성 관리',
    template: '%s | FocusFlow',
  },
  description: '당신의 뇌를 위한 퍼스널 트레이너. 스마트 포모도로, 집중 정원, AI 코칭으로 생산성을 높이세요.',
  keywords: ['포모도로', '집중력', '생산성', '타이머', '집중', 'ADHD', '시간관리'],
  authors: [{ name: 'FocusFlow Team' }],
  creator: 'FocusFlow',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: 'https://focusflow.app',
    siteName: 'FocusFlow',
    title: 'FocusFlow - AI 집중력 & 생산성 관리',
    description: '당신의 뇌를 위한 퍼스널 트레이너',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'FocusFlow',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FocusFlow - AI 집중력 & 생산성 관리',
    description: '당신의 뇌를 위한 퍼스널 트레이너',
    images: ['/og-image.png'],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0F172A' },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
