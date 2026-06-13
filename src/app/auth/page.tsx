'use client'

import { createBrowserClient } from '@supabase/ssr'
import { useEffect, useState } from 'react'

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
  const [splashDone, setSplashDone] = useState(false)
  const [splashFading, setSplashFading] = useState(false)

  useEffect(() => {
    // Splash: show for 1.4s then fade out over 0.4s
    const fadeTimer = setTimeout(() => setSplashFading(true), 1400)
    const doneTimer = setTimeout(() => setSplashDone(true), 1800)
    return () => { clearTimeout(fadeTimer); clearTimeout(doneTimer) }
  }, [])

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
    <div style={{
      position: 'fixed', inset: 0, height: '100dvh', overflow: 'hidden',
      background: '#0a0a0a',
    }}>
      {/* Logo pop-in (overshoot bounce) — pop-out handled by the fading wrapper below */}
      <style>{`
        @keyframes splashLogoPop {
          0% { transform: scale(0.4); opacity: 0; }
          55% { transform: scale(1.07); opacity: 1; }
          75% { transform: scale(0.97); }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
      {/* ── SPLASH SCREEN ── */}
      {!splashDone && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 100,
          background: '#7B1533',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          opacity: splashFading ? 0 : 1,
          transition: 'opacity 0.4s ease',
          pointerEvents: splashFading ? 'none' : 'auto',
          paddingTop: 'env(safe-area-inset-top)',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}>
          {/* Pop-out: scales down together with the fade */}
          <div style={{
            transform: splashFading ? 'scale(0.82)' : 'scale(1)',
            transition: 'transform 0.4s ease',
          }}>
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              animation: 'splashLogoPop 0.65s cubic-bezier(0.34, 1.56, 0.64, 1) both',
            }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/icons/Logo-LOKALGO.png"
                alt="LokalGo™"
                style={{ width: 'min(260px, 68vw)', height: 'auto', display: 'block', marginBottom: 18 }}
              />
              <div style={{ fontSize: 14, fontWeight: 500, color: 'rgba(255,255,255,0.65)', letterSpacing: 0.3, textAlign: 'center' }}>
                Platform perniagaan lokal setempat
              </div>
            </div>
          </div>
        </div>
      )}
    <div style={{
      position: 'absolute', inset: 0, height: '100dvh', overflow: 'hidden',
      background: '#0a0a0a',
      display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      paddingTop: 'env(safe-area-inset-top)',
      paddingBottom: 'env(safe-area-inset-bottom)',
    }}>
      <div style={{
        width: '100%', maxWidth: 430, flex: 1, minHeight: 0,
        background: '#7B1533',
        display: 'flex', flexDirection: 'column',
        height: '100%',
      }}>

        {/* TOP — Logo + tagline, centred in remaining height */}
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          padding: '32px 32px 24px',
          flex: 1, minHeight: 0, overflow: 'hidden',
        }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/icons/Logo-LOKALGO.png"
            alt="LokalGo™"
            style={{ width: 'min(270px, 72vw)', height: 'auto', display: 'block', flexShrink: 0, marginBottom: 14 }}
          />
          <div style={{ fontSize: 16, fontWeight: 600, color: 'rgba(255,255,255,0.75)', textAlign: 'center', letterSpacing: 0.2, lineHeight: 1.5, flexShrink: 0 }}>
            Platform perniagaan lokal setempat
          </div>
        </div>

        {/* BOTTOM — Buttons (fixed, never shrinks) */}
        <div style={{
          background: '#F0F0F5',
          borderRadius: '28px 28px 0 0',
          padding: '24px 24px max(24px, env(safe-area-inset-bottom))',
          boxShadow: '0 -20px 50px rgba(0,0,0,0.3)',
          flexShrink: 0,
        }}>

          {/* Arabic greeting */}
          <div style={{ fontFamily: "'Noto Naskh Arabic', serif", fontSize: 30, fontWeight: 700, color: '#7B1533', textAlign: 'center', lineHeight: 1.3, marginBottom: 2 }}>
            السلام عليكم
          </div>

          {/* Malay greeting */}
          <div style={{ fontSize: 26, fontWeight: 800, color: '#111', textAlign: 'center', letterSpacing: '-0.5px', lineHeight: 1.2, marginBottom: 20 }}>
            Selamat Datang
          </div>

          {/* Google Login Button */}
          <button
            onClick={handleGoogleLogin}
            style={{
              width: '100%', background: '#fff', border: 'none', borderRadius: 14,
              padding: '15px 20px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: 12, cursor: 'pointer', marginBottom: 8,
              boxShadow: '0 4px 20px rgba(0,0,0,0.12)', fontFamily: 'inherit',
              transition: 'transform 0.12s ease',
            }}
            disabled={isClearingSession}
            onMouseDown={e => { if (!isClearingSession) e.currentTarget.style.transform = 'scale(0.985)' }}
            onMouseUp={e => { e.currentTarget.style.transform = 'scale(1)' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <span style={{ fontSize: 15, fontWeight: 600, color: '#111' }}>
              {isClearingSession ? 'Menyediakan login...' : 'Teruskan dengan Google'}
            </span>
          </button>

          <div style={{ fontSize: 12, color: '#999', textAlign: 'center', lineHeight: 1.5, marginBottom: 14, padding: '0 8px' }}>
            Teruskan untuk masuk sebagai pembeli atau daftar kedai anda sebagai penjual.
          </div>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <div style={{ flex: 1, height: 1, background: '#E5E5EA' }} />
            <span style={{ fontSize: 12, fontWeight: 500, color: '#BBB' }}>atau</span>
            <div style={{ flex: 1, height: 1, background: '#E5E5EA' }} />
          </div>

          {/* Seller Register Button */}
          <button
            onClick={handleSellerRegister}
            style={{
              width: '100%', border: 'none', borderRadius: 14,
              padding: '15px 20px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: 12, cursor: 'pointer', marginBottom: 16, fontFamily: 'inherit',
              background: 'linear-gradient(180deg, #8f1a3a 0%, #6A1029 100%)',
              boxShadow: '0 6px 24px rgba(123,21,51,0.55)',
              transition: 'transform 0.12s ease',
            }}
            onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.985)')}
            onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            <span style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>
              Daftar sebagai Penjual
            </span>
          </button>

          {/* Terms */}
          <div style={{ fontSize: 11, color: '#BBB', textAlign: 'center', lineHeight: 1.7 }}>
            Dengan log masuk, anda bersetuju dengan{' '}
            <a href="/tnc" style={{ color: '#7B1533', textDecoration: 'none', fontWeight: 600 }}>Terma & Syarat</a>
            {' '}dan{' '}
            <a href="/privacy" style={{ color: '#7B1533', textDecoration: 'none', fontWeight: 600 }}>Dasar Privasi</a>
            {' '}LokalGo™.
          </div>
        </div>
      </div>
    </div>
    </div>
  )
}
