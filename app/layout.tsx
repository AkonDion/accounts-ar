import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'AR Control Center',
  description: 'Accounts Receivable Management Dashboard',
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-foreground">
        {children}
      </body>
    </html>
  )
}
