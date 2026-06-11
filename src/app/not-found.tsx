import Link from 'next/link'

export default function NotFound() {
  return (
    <div style={{
      minHeight: '100dvh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#fff',
      padding: '32px 24px',
      fontFamily: 'system-ui, sans-serif',
      textAlign: 'center',
    }}>
      <div style={{ fontSize: 48, marginBottom: 8 }}>🏪</div>
      <div style={{ fontSize: 22, fontWeight: 700, color: '#7B1533', marginBottom: 8 }}>
        Halaman Tidak Dijumpai
      </div>
      <div style={{ fontSize: 14, color: '#888', marginBottom: 32, maxWidth: 280, lineHeight: 1.5 }}>
        Halaman yang anda cari tidak wujud atau telah dipindahkan.
      </div>
      <Link href="/home" style={{
        background: '#7B1533',
        color: '#fff',
        borderRadius: 12,
        padding: '13px 28px',
        fontWeight: 700,
        fontSize: 15,
        textDecoration: 'none',
        display: 'inline-block',
      }}>
        Kembali ke Utama
      </Link>
    </div>
  )
}
