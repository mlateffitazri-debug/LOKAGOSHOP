import type { Metadata } from 'next'
import '../styles/globals.css'

export const metadata: Metadata = {
  title: 'LokaGo Shop',
  description: 'Platform perniagaan lokal setempat',
  manifest: '/manifest.json',
  themeColor: '#7B1533',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ms">
      <body>{children}</body>
    </html>
  )
}
