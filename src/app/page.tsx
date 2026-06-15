'use client'

import { useRouter } from 'next/navigation'
import { SplashScreen } from '@/components/SplashScreen'

export default function RootPage() {
  const router = useRouter()
  return <SplashScreen onDone={() => router.replace('/home')} />
}
