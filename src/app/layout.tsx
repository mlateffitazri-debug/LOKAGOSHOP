import type { Metadata, Viewport } from 'next'
import '../styles/globals.css'
import ServiceWorkerRegister from '@/components/ServiceWorkerRegister'

export const metadata: Metadata = {
  title: 'LokalGo™ Shop',
  description: 'Platform perniagaan lokal setempat',
  manifest: '/manifest.json',
  // iOS standalone PWA — fullscreen app feel when added to Home Screen
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'LokalGo',
  },
  // Stop iOS auto-linking phone numbers/addresses (breaks app styling)
  formatDetection: {
    telephone: false,
    address: false,
    email: false,
  },
  icons: {
    icon: [
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512-font-icon.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/icon-180.png', sizes: '180x180', type: 'image/png' },
    ],
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#7B1533',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ms">
      <body style={{ touchAction: 'pan-y' }}>
        {children}
        <ServiceWorkerRegister />
      </body>
    </html>
  )
}
