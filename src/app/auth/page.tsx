'use client'

import { createClient } from '@/lib/supabase/client'
import { useLang } from '@/lib/i18n'

export default function LoginPage() {
  const supabase = createClient()
  const { t, lang, toggle } = useLang()

  async function handleGoogleLogin() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/home`,
      },
    })
  }

  function handleSellerRegister() {
    window.location.href = '/onboarding/step0'
  }

  return (
    <div style={{ background: '#0a0a0a', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

      {/* Lang toggle */}
      <button onClick={toggle} style={{ position: 'fixed', top: 16, right: 16, background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 8, padding: '8px 12px', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', zIndex: 10 }}>
        {lang === 'ms' ? 'English' : 'BM'}
      </button>

      <div style={{ width: '100%', maxWidth: 430, minHeight: '100vh', background: '#7B1533', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* TOP — Logo + Mascot */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '56px 32px 0', flex: 1 }}>

          {/* Logo SVG */}
          <div style={{ marginBottom: 12 }}>
            <svg viewBox="0 0 1080 365" xmlns="http://www.w3.org/2000/svg" style={{ width: 260, height: 'auto', display: 'block' }}>
              <path fill="#FFF" d="M133,61v175c0,13-11,24-24,24h-4c-13,0-24-11-24-24V61c0-13,11-24,24-24h4C122,37,133,48,133,61z"/>
              <path fill="#FFF" d="M180,251c-13-7-23-17-31-30c-8-13-11-28-11-46c0-17,4-32,11-46s18-23,31-30c13-7,28-11,45-11s31,4,45,11c13,7,24,17,31,30s11,28,11,46c0,17-4,32-12,46c-8,13-18,23-32,30c-13,7-28,11-45,11S193,258,180,251z M249,207c7-7,10-18,10-31s-3-24-10-31c-7-7-15-11-25-11c-10,0-18,4-25,11c-7,7-10,18-10,31c0,13,3,24,10,31c7,7,15,11,25,11C234,218,242,214,249,207z"/>
              <path fill="#FFF" d="M411,248l-43-59v49c0,12-9,21-21,21h-7c-13,0-23-10-23-23V56c0-11,9-19,19-19h15c10,0,17,8,17,17v106l43-57c5-7,13-11,22-11h32c7,0,11,8,6,14l-58,70l54,65c6,7,1,19-9,19h-25C425,259,416,255,411,248z"/>
              <path fill="#FFF" d="M470,130c7-13,15-23,27-30c11-7,24-11,38-11c12,0,22,2,31,7s16,11,21,19v-8c0-9,7-16,16-16h20c8,0,15,7,15,15v139c0,7-6,13-13,13h-21c-10,0-17-8-17-17v-6c-5,8-12,14-21,19c-9,5-19,7-31,7c-14,0-26-4-37-11c-11-7-20-17-27-30c-7-13-10-28-10-46C460,158,464,143,470,130z M575,145c-7-7-16-11-26-11c-10,0-19,4-26,11c-7,7-11,17-11,30c0,13,4,23,11,31c7,8,16,11,26,11c10,0,19-4,26-11c7-7,11-18,11-30C586,163,582,153,575,145z"/>
              <path fill="#ADD036" d="M747,96c9,5,16,11,21,19v-7c0-9,7-17,17-17h19c9,0,16,7,16,16v152c0,15-3,29-9,42c-6,13-15,23-28,30c-13,7-28,11-47,11c-25,0-45-6-60-18c-11-8-18-19-23-31c-3-8,3-17,12-17h21c8,0,14,4,19,10c2,2,4,4,7,6c6,4,13,6,22,6c11,0,19-3,25-9c6-6,10-16,10-29v-24c-5,8-12,14-21,19c-9,5-19,7-31,7c-14,0-26-4-38-11c-11-7-20-17-27-30c-7-13-10-28-10-46c0-17,3-32,10-45c7-13,15-23,27-30c11-7,24-11,38-11C728,89,738,91,747,96z M757,145c-7-7-16-11-26-11c-10,0-19,4-26,11c-7,7-11,17-11,30c0,13,4,23,11,31c7,8,16,11,26,11c10,0,19-4,26-11c7-7,11-18,11-30C768,163,764,153,757,145z"/>
              <path fill="#ADD036" d="M866,251c-13-7-23-17-31-30c-8-13-11-28-11-46c0-17,4-32,11-46s18-23,31-30c13-7,28-11,45-11c16,0,31,4,45,11c13,7,24,17,31,30s11,28,11,46c0,17-4,32-12,46c-8,13-18,23-32,30c-13,7-28,11-45,11C894,262,879,258,866,251z M935,207c7-7,10-18,10-31s-3-24-10-31c-7-7-15-11-25-11c-10,0-18,4-25,11c-7,7-10,18-10,31c0,13,3,24,10,31c7,7,15,11,25,11C920,218,928,214,935,207z"/>
            </svg>
          </div>

          <div style={{ fontSize: 14, fontWeight: 500, color: 'rgba(255,255,255,0.55)', textAlign: 'center', marginBottom: 28 }}>
            {t('tagline')}
          </div>

          {/* Mascot placeholder — gantikan dengan base64 dari lokago_login.html */}
          <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: 0 }}>
            <div style={{ width: 220, height: 220, background: 'rgba(255,255,255,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>
              {<img src="data:image/png;base64,/9j/4AAQ..." style={{width:'100%', maxWidth:380}} alt="LokaGo Maskot" />}
              Mascot
            </div>
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
            {t('selamat_datang') || 'Selamat Datang'}
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
            onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.985)')}
            onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
          >
            <svg width="22" height="22" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <span style={{ fontSize: 16, fontWeight: 600, color: '#111' }}>
              {t('teruskan_google') || 'Teruskan dengan Google'}
            </span>
          </button>

          <div style={{ fontSize: 13, color: '#999', textAlign: 'center', lineHeight: 1.6, marginBottom: 22, padding: '0 8px' }}>
            Log masuk untuk mula meneroka kedai-kedai tempatan di kawasan anda.
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
              {t('daftar_penjual') || 'Daftar sebagai Penjual'}
            </span>
          </button>

          {/* Terms */}
          <div style={{ fontSize: 12, color: '#BBB', textAlign: 'center', lineHeight: 1.8 }}>
            Dengan log masuk, anda bersetuju dengan{' '}
            <a href="/terms" style={{ color: '#7B1533', textDecoration: 'none', fontWeight: 600 }}>Terma & Syarat</a>
            {' '}dan{' '}
            <a href="/privacy" style={{ color: '#7B1533', textDecoration: 'none', fontWeight: 600 }}>Dasar Privasi</a>
            {' '}LokaGo.
          </div>
        </div>
      </div>
    </div>
  )
}
