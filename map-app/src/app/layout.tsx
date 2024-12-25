import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Tree Planting Map',
  description: 'View planted trees on an interactive map',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}