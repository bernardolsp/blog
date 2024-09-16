import { ThemeProvider } from './ThemeProvider'
import { ThemeToggle } from './ThemeToggle'
import './globals.css'

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: {
    default: 'blog do bernardo',
    template: '%s | bernardo'
  },
  description: 'um blog sobre vida e tecnologia',
  openGraph: {
    title: 'blog do bernardo',
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
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
      <script defer src="https://comentario.bernardolopes.com/comentario.js"></script>
        <ThemeProvider>
          <div className="min-h-screen transition-colors duration-300 ease-in-out">
            <ThemeToggle />
            <main className="container mx-auto px-4 py-8">
              {children}
            </main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}

export const dynamic = 'force-static'