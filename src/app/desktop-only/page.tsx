import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'LokalGo — Open on Mobile',
}

export default function DesktopOnlyPage() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        html, body {
          margin: 0;
          padding: 0;
          background: #fff;
          height: 100%;
        }
        .dop {
          background: #fff;
          min-height: 100vh;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .dop img {
          max-width: 100%;
          height: auto;
          display: block;
        }
      ` }} />
      <div className="dop">
        <img src="/assets/mobile-redirect.png" alt="Please open on mobile" />
      </div>
    </>
  )
}
