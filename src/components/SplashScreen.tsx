'use client'

import { useEffect, useState } from 'react'

type Props = {
  onDone: () => void
  duration?: number
}

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
  z-index:9999;
}
.splash-inner{display:flex;flex-direction:column;align-items:center;gap:0;}
.splash-logo{
  width:210px;height:auto;
  object-fit:contain;
  display:block;
  animation:splashIn 0.6s cubic-bezier(0.22,1,0.36,1) both,splashBreathe 2.4s ease-in-out 0.7s infinite;
}
.splash-wordmark{
  font-family:'Plus Jakarta Sans',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
  font-size:52px;font-weight:900;letter-spacing:-1.5px;
  color:#ffffff;line-height:1;
  animation:splashIn 0.6s cubic-bezier(0.22,1,0.36,1) both,splashBreathe 2.4s ease-in-out 0.7s infinite;
}
.splash-wordmark span{color:#ADD036;}
.splash-tagline{
  font-family:'Plus Jakarta Sans',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
  font-size:15px;font-weight:500;letter-spacing:0.3px;
  color:rgba(255,255,255,0.65);
  margin-top:12px;
  animation:splashFadeUp 0.5s ease 0.3s both;
}
.splash-dots{
  display:flex;align-items:center;gap:7px;
  margin-top:52px;
  animation:splashFadeUp 0.5s ease 0.45s both;
}
.splash-dot{
  width:7px;height:7px;border-radius:50%;background:rgba(255,255,255,0.55);
}
.splash-dot:nth-child(1){animation:splashDotPulse 1.1s ease-in-out 0.6s infinite;}
.splash-dot:nth-child(2){animation:splashDotPulse 1.1s ease-in-out 0.75s infinite;}
.splash-dot:nth-child(3){animation:splashDotPulse 1.1s ease-in-out 0.9s infinite;}
.splash-hint{
  font-family:'Plus Jakarta Sans',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
  font-size:11px;font-weight:500;
  color:rgba(255,255,255,0.35);
  margin-top:10px;letter-spacing:0.2px;
  animation:splashFadeUp 0.5s ease 0.55s both;
}
@keyframes splashIn{
  from{opacity:0;transform:scale(0.92);}
  to{opacity:1;transform:scale(1);}
}
@keyframes splashBreathe{
  0%,100%{transform:scale(1);}
  50%{transform:scale(1.04);}
}
@keyframes splashFadeUp{
  from{opacity:0;transform:translateY(12px);}
  to{opacity:1;transform:translateY(0);}
}
@keyframes splashDotPulse{
  0%,80%,100%{transform:scale(0.55);opacity:0.35;}
  40%{transform:scale(1);opacity:1;}
}
`

export function SplashScreen({ onDone, duration = 1500 }: Props) {
  const [imgError, setImgError] = useState(false)

  useEffect(() => {
    const t = setTimeout(onDone, duration)
    return () => clearTimeout(t)
  }, [onDone, duration])

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div
        className="splash"
        onClick={onDone}
        role="presentation"
        aria-label="LokalGo — Membuka aplikasi"
      >
        <div className="splash-inner">
          {!imgError ? (
            <img
              src="/icons/Lokalgo-Logo-New.PNG"
              alt="LokalGo"
              className="splash-logo"
              onError={() => setImgError(true)}
              draggable={false}
            />
          ) : (
            <div className="splash-wordmark">lokal<span>go</span></div>
          )}
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
