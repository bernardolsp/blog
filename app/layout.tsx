import { ThemeProvider } from './ThemeProvider'
import { ThemeToggle } from './ThemeToggle'
import './globals.css'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
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