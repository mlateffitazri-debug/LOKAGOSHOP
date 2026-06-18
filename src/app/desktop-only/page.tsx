import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'LokalGo — Open on Mobile',
}

export default function DesktopOnlyPage() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800;900&display=swap');

        html, body {
          margin: 0;
          padding: 0;
          background: #fff;
          min-height: 100vh;
        }

        *, *::before, *::after { box-sizing: border-box; }

        .dop {
          background: #fff;
          font-family: 'Poppins', -apple-system, sans-serif;
          min-height: 100vh;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 60px 80px;
        }

        .dop__inner {
          max-width: 1100px;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 48px;
        }

        /* ── Left column ── */
        .dop__left {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }

        /* CSS wordmark — maroon + lime, works on white bg */
        .dop__wordmark {
          font-family: 'Poppins', sans-serif;
          font-size: 36px;
          font-weight: 900;
          letter-spacing: -1px;
          line-height: 1;
          margin-bottom: 28px;
        }
        .dop__wordmark-lokal { color: #7B1533; }
        .dop__wordmark-go    { color: #acd036; }

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
          margin-bottom: 20px;
        }

        .dop__h1 {
          font-size: 52px;
          font-weight: 800;
          color: #7B1533;
          line-height: 1.1;
          letter-spacing: -1.5px;
          margin: 0 0 18px;
        }

        .dop__desc {
          font-size: 16px;
          font-weight: 400;
          color: #888;
          line-height: 1.75;
          margin: 0 0 36px;
          max-width: 400px;
        }

        .dop__cta {
          display: flex;
          align-items: center;
          gap: 14px;
          flex-wrap: wrap;
          margin-bottom: 32px;
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
          border-radius: 12px;
          text-decoration: none;
          white-space: nowrap;
        }
        .dop__btn:hover { background: #5e0f26; }

        .dop__tip {
          background: #f5f9e8;
          border: 1.5px solid #cfe282;
          color: #5a7a10;
          font-family: 'Poppins', sans-serif;
          font-size: 13px;
          font-weight: 600;
          padding: 11px 16px;
          border-radius: 12px;
          white-space: nowrap;
        }

        .dop__footer {
          font-size: 13px;
          font-weight: 400;
          color: #ccc;
          line-height: 1.6;
        }

        /* ── Right column — phone mockup ── */
        .dop__right {
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .dop__phone-img {
          /* The source PNG is tilted ~12° clockwise; rotate back to upright */
          width: 320px;
          height: auto;
          display: block;
          transform: rotate(-12deg);
          filter: drop-shadow(0 24px 48px rgba(123,21,51,0.15));
        }

        /* ── Responsive ── */
        @media (max-width: 900px) {
          .dop { padding: 48px 32px; }
          .dop__inner {
            flex-direction: column-reverse;
            align-items: center;
            text-align: center;
            gap: 32px;
          }
          .dop__left { align-items: center; }
          .dop__h1 { font-size: 36px; }
          .dop__desc { max-width: 100%; }
          .dop__cta { justify-content: center; }
          .dop__phone-img { width: 240px; }
        }

        @media (max-width: 480px) {
          .dop { padding: 40px 20px; }
          .dop__h1 { font-size: 28px; }
          .dop__phone-img { width: 200px; }
        }
      ` }} />

      <div className="dop">
        <div className="dop__inner">

          {/* Left */}
          <div className="dop__left">
            <div className="dop__wordmark">
              <span className="dop__wordmark-lokal">lokal</span><span className="dop__wordmark-go">go</span>
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
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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

          {/* Right */}
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
