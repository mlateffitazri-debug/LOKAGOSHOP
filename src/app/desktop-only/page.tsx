import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'LokalGo — Open on Mobile',
}

export default function DesktopOnlyPage() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800;900&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .dop {
          background: #fff;
          font-family: 'Poppins', -apple-system, sans-serif;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 60px 48px;
          overflow: hidden;
        }

        .dop__inner {
          max-width: 1120px;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 40px;
        }

        /* ── Left column ── */
        .dop__left {
          flex: 1;
          min-width: 0;
        }

        .dop__logo {
          margin-bottom: 36px;
        }

        .dop__logo img {
          height: 52px;
          width: auto;
          /* logo is white text + lime green — needs dark bg to show lokal part */
          /* We'll place it on a maroon pill */
          display: block;
        }

        .dop__logo-wrap {
          display: inline-block;
          background: #7B1533;
          padding: 10px 24px;
          border-radius: 14px;
          margin-bottom: 36px;
        }

        .dop__logo-wrap img {
          height: 44px;
          width: auto;
          display: block;
        }

        .dop__badge {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          background: #fdf0f3;
          border: 1.5px solid #e8bfca;
          color: #7B1533;
          font-size: 11px;
          font-weight: 600;
          padding: 5px 14px;
          border-radius: 100px;
          letter-spacing: 0.7px;
          text-transform: uppercase;
          margin-bottom: 22px;
        }

        .dop__h1 {
          font-size: 54px;
          font-weight: 800;
          color: #7B1533;
          line-height: 1.1;
          letter-spacing: -1.5px;
          margin-bottom: 20px;
        }

        .dop__desc {
          font-size: 17px;
          font-weight: 400;
          color: #777;
          line-height: 1.75;
          margin-bottom: 40px;
          max-width: 420px;
        }

        /* CTA */
        .dop__cta {
          display: flex;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
          margin-bottom: 36px;
        }

        .dop__btn {
          display: inline-flex;
          align-items: center;
          gap: 9px;
          background: #7B1533;
          color: #fff;
          font-family: 'Poppins', sans-serif;
          font-size: 15px;
          font-weight: 700;
          padding: 14px 28px;
          border-radius: 14px;
          text-decoration: none;
          letter-spacing: -0.1px;
        }

        .dop__btn:hover { background: #5e0f26; }

        .dop__tip {
          background: #f5f9e8;
          border: 1.5px solid #cfe282;
          color: #5a7a10;
          font-family: 'Poppins', sans-serif;
          font-size: 13px;
          font-weight: 600;
          padding: 11px 18px;
          border-radius: 12px;
        }

        .dop__footer {
          font-size: 13px;
          font-weight: 400;
          color: #bbb;
          line-height: 1.6;
        }

        /* ── Right column ── */
        .dop__right {
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .dop__phone-img {
          width: 340px;
          height: auto;
          display: block;
          filter: drop-shadow(0 32px 64px rgba(123,21,51,0.18));
        }

        /* ── Responsive ── */
        @media (max-width: 900px) {
          .dop { padding: 48px 28px; }
          .dop__inner { flex-direction: column-reverse; align-items: center; text-align: center; gap: 32px; }
          .dop__h1 { font-size: 38px; letter-spacing: -1px; }
          .dop__desc { max-width: 100%; }
          .dop__cta { justify-content: center; }
          .dop__footer { text-align: center; }
          .dop__phone-img { width: 260px; }
          .dop__logo-wrap { margin-left: auto; margin-right: auto; }
        }

        @media (max-width: 480px) {
          .dop__h1 { font-size: 30px; }
          .dop__phone-img { width: 210px; }
          .dop__btn { font-size: 14px; padding: 13px 22px; }
        }
      ` }} />

      <div className="dop">
        <div className="dop__inner">

          {/* Left — text */}
          <div className="dop__left">
            <div className="dop__logo-wrap">
              <img src="/assets/logo-white.png" alt="LokalGo" />
            </div>

            <div className="dop__badge">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
              </svg>
              GPS · Mobile First
            </div>

            <h1 className="dop__h1">
              LokalGo works<br />best on mobile
            </h1>

            <p className="dop__desc">
              We use your GPS location to suggest nearby local shops, food, products and independent sellers around you.
            </p>

            <div className="dop__cta">
              <a className="dop__btn" href="https://lokalgo.app">
                Open lokalgo.app
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                  <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
                </svg>
              </a>
              <span className="dop__tip">📱 Type <strong>lokalgo.app</strong> on your phone</span>
            </div>

            <p className="dop__footer">
              Please open LokalGo using your mobile browser for the best experience.
            </p>
          </div>

          {/* Right — phone mockup */}
          <div className="dop__right">
            <img
              src="/assets/phone-mockup.png"
              alt="LokalGo app on mobile"
              className="dop__phone-img"
            />
          </div>

        </div>
      </div>
    </>
  )
}
