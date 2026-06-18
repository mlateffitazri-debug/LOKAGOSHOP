import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'LokalGo — Open on Mobile',
}

export default function DesktopOnlyPage() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        *,*::before,*::after{box-sizing:border-box;}
        .dop{
          background:#fff;
          color:#1a0810;
          font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;
          min-height:100vh;
          display:flex;
          align-items:center;
          justify-content:center;
          padding:60px 40px;
        }
        .dop__inner{
          max-width:1080px;
          width:100%;
          display:flex;
          align-items:center;
          justify-content:space-between;
          gap:80px;
        }
        .dop__left{
          flex:1;
          min-width:0;
        }
        .dop__wordmark{
          font-size:22px;
          font-weight:900;
          letter-spacing:-0.5px;
          margin-bottom:44px;
          color:#1a0810;
        }
        .dop__wordmark em{color:#acd036;font-style:normal;}
        .dop__badge{
          display:inline-flex;
          align-items:center;
          gap:6px;
          background:#fdf0f3;
          border:1.5px solid #f0c8d4;
          color:#7B1533;
          font-size:11px;
          font-weight:700;
          padding:5px 14px;
          border-radius:100px;
          letter-spacing:0.6px;
          text-transform:uppercase;
          margin-bottom:20px;
        }
        .dop__h1{
          font-size:56px;
          font-weight:900;
          color:#7B1533;
          line-height:1.05;
          letter-spacing:-2px;
          margin:0 0 24px;
        }
        .dop__desc{
          font-size:18px;
          color:#666;
          line-height:1.7;
          margin:0 0 40px;
          max-width:460px;
        }
        .dop__cta{
          display:flex;
          align-items:center;
          gap:20px;
          flex-wrap:wrap;
          margin-bottom:40px;
        }
        .dop__cta-label{
          font-size:13px;
          color:#999;
          font-weight:500;
          margin-bottom:4px;
        }
        .dop__cta-url{
          display:inline-flex;
          align-items:center;
          gap:8px;
          background:#7B1533;
          color:#fff;
          font-size:16px;
          font-weight:700;
          padding:14px 28px;
          border-radius:14px;
          text-decoration:none;
          letter-spacing:-0.2px;
          transition:background 0.15s;
        }
        .dop__cta-url:hover{background:#5e0f26;}
        .dop__cta-url svg{flex-shrink:0;}
        .dop__alt{
          display:flex;
          flex-direction:column;
          justify-content:center;
        }
        .dop__alt-pill{
          display:inline-block;
          background:#f7fae8;
          border:1.5px solid #d6e88a;
          color:#5a7a10;
          font-size:14px;
          font-weight:700;
          padding:12px 20px;
          border-radius:12px;
          letter-spacing:-0.2px;
        }
        .dop__footer{
          font-size:13px;
          color:#bbb;
          line-height:1.6;
        }

        /* Phone mockup */
        .dop__right{flex-shrink:0;}
        .dop__phone-wrap{
          position:relative;
          width:240px;
        }
        .dop__phone{
          width:240px;
          height:480px;
          background:linear-gradient(160deg,#7B1533 0%,#5a0f25 100%);
          border-radius:42px;
          border:7px solid #15040b;
          box-shadow:
            0 48px 96px rgba(123,21,51,0.22),
            0 16px 32px rgba(0,0,0,0.12),
            0 0 0 1px rgba(255,255,255,0.04),
            inset 0 0 0 1px rgba(255,255,255,0.06);
          position:relative;
          overflow:hidden;
          display:flex;
          flex-direction:column;
          align-items:center;
          justify-content:center;
          gap:0;
        }
        .dop__phone-notch{
          position:absolute;
          top:0;left:50%;
          transform:translateX(-50%);
          width:90px;height:24px;
          background:#15040b;
          border-radius:0 0 16px 16px;
          z-index:2;
        }
        .dop__phone-content{
          display:flex;
          flex-direction:column;
          align-items:center;
          gap:14px;
          padding:20px;
        }
        .dop__phone-logo-img{
          width:96px;
          height:96px;
          border-radius:24px;
          object-fit:cover;
          box-shadow:0 8px 24px rgba(0,0,0,0.3);
        }
        .dop__phone-app-name{
          font-size:26px;
          font-weight:900;
          color:#fff;
          letter-spacing:-0.8px;
        }
        .dop__phone-app-name em{color:#acd036;font-style:normal;}
        .dop__phone-tagline{
          font-size:11px;
          color:rgba(255,255,255,0.5);
          font-weight:500;
          letter-spacing:0.4px;
          text-align:center;
          line-height:1.5;
        }
        .dop__phone-btn{
          margin-top:8px;
          background:#acd036;
          color:#1a0810;
          font-size:12px;
          font-weight:700;
          padding:9px 20px;
          border-radius:100px;
          letter-spacing:0.2px;
        }
        .dop__phone-bar{
          position:absolute;
          bottom:14px;
          left:50%;
          transform:translateX(-50%);
          width:80px;height:4px;
          background:rgba(255,255,255,0.25);
          border-radius:2px;
        }
        .dop__glow{
          position:absolute;
          top:-60px;right:-60px;
          width:220px;height:220px;
          background:radial-gradient(circle,rgba(172,208,54,0.15) 0%,transparent 70%);
          pointer-events:none;
        }

        @media(max-width:860px){
          .dop{padding:48px 24px;}
          .dop__inner{flex-direction:column;gap:48px;align-items:flex-start;}
          .dop__h1{font-size:40px;letter-spacing:-1px;}
          .dop__desc{max-width:100%;}
        }
        @media(max-width:480px){
          .dop__h1{font-size:32px;}
          .dop__phone-wrap{width:200px;}
          .dop__phone{width:200px;height:400px;}
        }
      ` }} />

      <div className="dop">
        <div className="dop__inner">

          {/* Left — text */}
          <div className="dop__left">
            <div className="dop__wordmark">
              lokal<em>go</em>
            </div>
            <div className="dop__badge">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>
              Mobile First
            </div>
            <h1 className="dop__h1">LokalGo works best on&nbsp;mobile</h1>
            <p className="dop__desc">
              We use your GPS location to suggest nearby local shops, food, products and independent sellers around you.
            </p>
            <div className="dop__cta">
              <div>
                <div className="dop__cta-label">Open on your phone</div>
                <a className="dop__cta-url" href="https://lokalgo.app">
                  lokalgo.app
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                </a>
              </div>
              <div className="dop__alt">
                <span className="dop__alt-pill">📱 Type <strong>lokalgo.app</strong> on your phone</span>
              </div>
            </div>
            <p className="dop__footer">
              Please open LokalGo using your mobile browser for the best experience.
            </p>
          </div>

          {/* Right — phone mockup */}
          <div className="dop__right">
            <div className="dop__phone-wrap">
              <div className="dop__glow" />
              <div className="dop__phone">
                <div className="dop__phone-notch" />
                <div className="dop__phone-content">
                  <img
                    src="/icons/favcon.png"
                    alt="LokalGo app icon"
                    className="dop__phone-logo-img"
                    width={96}
                    height={96}
                  />
                  <div className="dop__phone-app-name">lokal<em>go</em></div>
                  <div className="dop__phone-tagline">
                    Platform perniagaan<br />lokal setempat
                  </div>
                  <div className="dop__phone-btn">Open App</div>
                </div>
                <div className="dop__phone-bar" />
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  )
}
