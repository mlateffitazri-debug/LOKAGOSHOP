import type { Metadata, Viewport } from 'next'
import '../styles/globals.css'
import ServiceWorkerRegister from '@/components/ServiceWorkerRegister'

const OG_IMAGE = '/assets/OG.png'
const SITE_URL = 'https://lokalgo.app'

export const metadata: Metadata = {
  title: 'LokalGo™',
  description: 'Temui peniaga lokal, makanan homemade, produk dan servis berdekatan anda.',
  manifest: '/manifest.json',
  metadataBase: new URL(SITE_URL),
  openGraph: {
    title: 'LokalGo™',
    description: 'Temui peniaga lokal, makanan homemade, produk dan servis berdekatan anda.',
    url: SITE_URL,
    siteName: 'LokalGo',
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: 'LokalGo — Peniaga Lokal Berdekatan Anda',
      },
    ],
    locale: 'ms_MY',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LokalGo™',
    description: 'Temui peniaga lokal, makanan homemade, produk dan servis berdekatan anda.',
    images: [OG_IMAGE],
  },
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
    shortcut: '/icons/favcon.png',
    icon: [
      { url: '/icons/favcon.png', sizes: '32x32', type: 'image/png' },
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
