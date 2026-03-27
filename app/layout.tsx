import { ThemeProvider } from './ThemeProvider'
import './globals.css'

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: {
    default: 'bernardo',
    template: '%s | bernardo'
  },
  description: 'um blog sobre vida e tecnologia',
  openGraph: {
    title: 'bernardo',
    description: 'um blog sobre vida e tecnologia',
    url: 'https://bernardolopes.com',
    siteName: 'bernardo',
    locale: 'pt_BR',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  twitter: {
    title: 'bernardo',
    card: 'summary_large_image',
  },
  icons: {
    shortcut: '/favicon.ico',
  },
  alternates: {
    types: {
      'application/rss+xml': 'https://bernardolopes.com/feed.xml',
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Source+Serif+4:ital,opsz,wght@0,8..60,400;0,8..60,500;0,8..60,600;1,8..60,400&display=swap" 
          rel="stylesheet" 
        />
      </head>
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <body>
        <ThemeProvider>
          <div className="min-h-screen transition-colors duration-500 ease-out">
            <main className="relative">
              {children}
            </main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}

export const dynamic = 'force-static'
