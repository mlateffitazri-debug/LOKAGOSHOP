export default function PrivacyPage() {
  return (
    <main style={{ minHeight: '100vh', background: '#F5F5F5', color: '#111', fontFamily: 'Plus Jakarta Sans, sans-serif', padding: '32px 20px' }}>
      <section style={{ maxWidth: 720, margin: '0 auto', background: '#fff', borderRadius: 16, padding: 24, border: '1px solid #eee' }}>
        <h1 style={{ color: '#7B1533', fontSize: 28, marginBottom: 12 }}>Privasi LokalGo</h1>
        <p style={{ lineHeight: 1.7, color: '#555' }}>
          LokalGo menyimpan maklumat akaun asas seperti nama, email, kawasan, alamat pilihan, maklumat kedai
          dan nombor WhatsApp untuk mengendalikan fungsi platform.
        </p>
        <p style={{ lineHeight: 1.7, color: '#555', marginTop: 12 }}>
          Data peribadi tidak dijual kepada pihak ketiga. Nombor WhatsApp penjual dipaparkan kepada pembeli
          supaya pesanan boleh dibuat terus melalui WhatsApp.
        </p>
        <a href="/auth" style={{ display: 'inline-block', marginTop: 20, color: '#7B1533', fontWeight: 700 }}>Kembali</a>
      </section>
    </main>
  )
}
