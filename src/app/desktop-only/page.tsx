export default function DesktopOnlyPage() {
  return (
    <html lang="ms">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>LokalGo — Guna Mobile</title>
        <style>{`
          *{margin:0;padding:0;box-sizing:border-box;}
          body{
            background:#07070a;
            color:#f0f0f0;
            font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
            min-height:100vh;
            display:flex;
            align-items:center;
            justify-content:center;
            padding:24px;
            text-align:center;
          }
          .wrap{max-width:440px;}
          .logo{font-size:28px;font-weight:900;color:#acd036;letter-spacing:-0.5px;margin-bottom:32px;}
          .icon{font-size:72px;margin-bottom:24px;display:block;}
          h1{font-size:22px;font-weight:800;margin-bottom:12px;}
          p{font-size:15px;color:rgba(240,240,240,0.55);line-height:1.6;margin-bottom:24px;}
          .badge{
            display:inline-block;
            background:rgba(172,208,54,0.12);
            border:1px solid rgba(172,208,54,0.3);
            color:#acd036;
            font-size:13px;
            font-weight:700;
            padding:8px 20px;
            border-radius:100px;
          }
        `}</style>
      </head>
      <body>
        <div className="wrap">
          <div className="logo">LokalGo</div>
          <span className="icon">📱</span>
          <h1>Sila Guna Telefon Anda</h1>
          <p>
            LokalGo direka khas untuk pengalaman mobile.<br />
            Sila buka laman ini menggunakan telefon pintar anda untuk akses penuh.
          </p>
          <span className="badge">Mobile Only</span>
        </div>
      </body>
    </html>
  )
}
