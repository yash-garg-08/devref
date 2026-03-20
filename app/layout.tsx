import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'DevRef — Yash',
  description: 'Personal developer command reference dashboard',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    // suppressHydrationWarning: the inline script below may remove the 'dark'
    // class before React hydrates, causing a mismatch we want to ignore.
    <html lang="en">
      <body className="bg-bg text-text antialiased">
        {children}
      </body>
    </html>
  )
}
