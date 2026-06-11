'use client'

import { createBrowserClient } from '@supabase/ssr'
import Image from 'next/image'
import { useEffect, useState } from 'react'

const mascotSrc = '/assets/IMG_5827.PNG'

function createAuthClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        flowType: 'pkce',
      },
      cookieOptions: {
        path: '/',
        sameSite: 'lax',
        secure: typeof window !== 'undefined' && window.location.protocol === 'https:',
      },
    },
  )
}

export default function LoginPage() {
  const [isClearingSession, setIsClearingSession] = useState(true)

  useEffect(() => {
    let cancelled = false
    const supabase = createAuthClient()

    async function clearSession() {
      await supabase.auth.signOut()
      if (!cancelled) setIsClearingSession(false)
    }

    const error = new URLSearchParams(window.location.search).get('error')
    if (error) {
      alert(decodeURIComponent(error))
    }

    clearSession().catch((signOutError) => {
      console.error('Unable to clear stale auth session', signOutError)
      if (!cancelled) setIsClearingSession(false)
    })

    return () => {
      cancelled = true
    }
  }, [])

  async function handleGoogleLogin() {
    if (isClearingSession) return
    const next = new URLSearchParams(window.location.search).get('next') || localStorage.getItem('lokalgo_after_login') || '/home'
    const callback = new URL('/auth/callback', window.location.origin)
    callback.searchParams.set('next', next)

    const supabase = createAuthClient()

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: callback.toString(),
      },
    })

    if (error) {
      console.error('Google OAuth login failed', error)
      alert(error.message || 'Google OAuth login failed')
      return
    }
  }

  function handleSellerRegister() {
    window.location.href = '/onboarding/step0'
  }

  return (
    <div style={{ width: '100%', height: '100%', minHeight: '100dvh', overflowY: 'auto', overscrollBehaviorY: 'contain', background: '#0a0a0a', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

      <div style={{ width: '100%', maxWidth: 430, minHeight: '100vh', background: '#7B1533', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* TOP — Logo + Mascot */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '56px 32px 0', flex: 1 }}>

          {/* Logo */}
          <div style={{ marginBottom: 12 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icons/Logo-LOKALGO.png" alt="LokalGo™" style={{ width: 220, height: 'auto', display: 'block' }} />
          </div>

          <div style={{ fontSize: 14, fontWeight: 500, color: 'rgba(255,255,255,0.55)', textAlign: 'center', marginBottom: 28 }}>
            Platform perniagaan lokal setempat
          </div>

          {/* Mascot */}
          <div style={{ flex: 1, width: '100%', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: 0 }}>
            <Image src={mascotSrc} width={380} height={380} priority style={{ width: '100%', maxWidth: 380, height: 'auto', objectFit: 'contain', display: 'block', marginBottom: -4 }} alt="LokalGo Maskot" />
          </div>
        </div>

        {/* BOTTOM — Buttons */}
        <div style={{ background: '#F0F0F5', borderRadius: '28px 28px 0 0', padding: '36px 28px 52px', boxShadow: '0 -20px 50px rgba(0,0,0,0.3)' }}>

          {/* Arabic greeting */}
          <div style={{ fontFamily: "'Noto Naskh Arabic', serif", fontSize: 34, fontWeight: 700, color: '#7B1533', textAlign: 'center', lineHeight: 1.4, marginBottom: 4 }}>
            السلام عليكم
          </div>

          {/* Malay greeting */}
          <div style={{ fontSize: 30, fontWeight: 800, color: '#111', textAlign: 'center', letterSpacing: '-0.6px', lineHeight: 1.2, marginBottom: 32 }}>
            Selamat Datang
          </div>

          {/* Google Login Button */}
          <button
            onClick={handleGoogleLogin}
            style={{
              width: '100%', background: '#fff', border: 'none', borderRadius: 16,
              padding: '17px 20px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: 12, cursor: 'pointer', marginBottom: 10,
              boxShadow: '0 4px 20px rgba(0,0,0,0.12)', fontFamily: 'inherit',
              transition: 'transform 0.12s ease',
            }}
            disabled={isClearingSession}
            onMouseDown={e => { if (!isClearingSession) e.currentTarget.style.transform = 'scale(0.985)' }}
            onMouseUp={e => { e.currentTarget.style.transform = 'scale(1)' }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <span style={{ fontSize: 16, fontWeight: 600, color: '#111' }}>
              {isClearingSession ? 'Menyediakan login...' : 'Teruskan dengan Google'}
            </span>
          </button>

          <div style={{ fontSize: 13, color: '#999', textAlign: 'center', lineHeight: 1.6, marginBottom: 22, padding: '0 8px' }}>
            Teruskan untuk masuk sebagai pembeli atau daftar kedai anda sebagai penjual.
          </div>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
            <div style={{ flex: 1, height: 1, background: '#E5E5EA' }} />
            <span style={{ fontSize: 13, fontWeight: 500, color: '#BBB' }}>atau</span>
            <div style={{ flex: 1, height: 1, background: '#E5E5EA' }} />
          </div>

          {/* Seller Register Button */}
          <button
            onClick={handleSellerRegister}
            style={{
              width: '100%', border: 'none', borderRadius: 16,
              padding: '17px 20px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: 12, cursor: 'pointer', marginBottom: 28, fontFamily: 'inherit',
              background: 'linear-gradient(180deg, #8f1a3a 0%, #6A1029 100%)',
              boxShadow: '0 6px 24px rgba(123,21,51,0.55)',
              transition: 'transform 0.12s ease',
            }}
            onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.985)')}
            onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            <span style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>
              Daftar sebagai Penjual
            </span>
          </button>

          {/* Terms */}
          <div style={{ fontSize: 12, color: '#BBB', textAlign: 'center', lineHeight: 1.8 }}>
            Dengan log masuk, anda bersetuju dengan{' '}
            <a href="/tnc" style={{ color: '#7B1533', textDecoration: 'none', fontWeight: 600 }}>Terma & Syarat</a>
            {' '}dan{' '}
            <a href="/privacy" style={{ color: '#7B1533', textDecoration: 'none', fontWeight: 600 }}>Dasar Privasi</a>
            {' '}LokalGo™.
          </div>
        </div>
      </div>
    </div>
  )
}
