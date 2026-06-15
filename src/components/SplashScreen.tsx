'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

const REDIRECT_MS = 1500

const CSS = `
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
html,body{height:100%;overflow:hidden;}
.splash{
  position:fixed;inset:0;
  background:#7B1533;
  display:flex;flex-direction:column;align-items:center;justify-content:center;
  cursor:pointer;
  -webkit-tap-highlight-color:transparent;
  user-select:none;
}
.splash-inner{display:flex;flex-direction:column;align-items:center;gap:0;}
.splash-logo{
  font-family:'Plus Jakarta Sans',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
  font-size:48px;font-weight:900;letter-spacing:-1px;
  color:#ffffff;
  animation:splashFadeUp 0.65s cubic-bezier(0.22,1,0.36,1) both;
}
.splash-logo span{color:#ADD036;}
.splash-tagline{
  font-family:'Plus Jakarta Sans',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
  font-size:15px;font-weight:500;letter-spacing:0.3px;
  color:rgba(255,255,255,0.65);
  margin-top:10px;
  animation:splashFadeUp 0.65s cubic-bezier(0.22,1,0.36,1) 0.18s both;
}
.splash-dots{
  display:flex;align-items:center;gap:7px;
  margin-top:52px;
  animation:splashFadeUp 0.5s ease 0.4s both;
}
.splash-dot{
  width:7px;height:7px;border-radius:50%;background:rgba(255,255,255,0.55);
}
.splash-dot:nth-child(1){animation:splashDotPulse 1.1s ease-in-out 0.5s infinite;}
.splash-dot:nth-child(2){animation:splashDotPulse 1.1s ease-in-out 0.65s infinite;}
.splash-dot:nth-child(3){animation:splashDotPulse 1.1s ease-in-out 0.8s infinite;}
.splash-hint{
  font-family:'Plus Jakarta Sans',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
  font-size:11px;font-weight:500;
  color:rgba(255,255,255,0.35);
  margin-top:10px;
  letter-spacing:0.2px;
  animation:splashFadeUp 0.5s ease 0.5s both;
}
@keyframes splashFadeUp{
  from{opacity:0;transform:translateY(14px) scale(0.96);}
  to{opacity:1;transform:translateY(0) scale(1);}
}
@keyframes splashDotPulse{
  0%,80%,100%{transform:scale(0.55);opacity:0.35;}
  40%{transform:scale(1);opacity:1;}
}
`

export function SplashScreen() {
  const router = useRouter()

  const go = () => router.replace('/home')

  useEffect(() => {
    const t = setTimeout(go, REDIRECT_MS)
    return () => clearTimeout(t)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="splash" onClick={go} role="presentation" aria-label="LokalGo — Membuka aplikasi">
        <div className="splash-inner">
          <div className="splash-logo">
            Lokal<span>Go</span>
          </div>
          <div className="splash-tagline">Dari jiran, untuk jiran</div>
          <div className="splash-dots">
            <div className="splash-dot" />
            <div className="splash-dot" />
            <div className="splash-dot" />
          </div>
          <div className="splash-hint">Membuka komuniti anda...</div>
        </div>
      </div>
    </>
  )
}
