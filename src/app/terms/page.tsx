export default function TermsPage() {
  return (
    <main style={{ minHeight: '100vh', background: '#F5F5F5', color: '#111', fontFamily: 'Plus Jakarta Sans, sans-serif', padding: '32px 20px' }}>
      <section style={{ maxWidth: 720, margin: '0 auto', background: '#fff', borderRadius: 16, padding: 24, border: '1px solid #eee' }}>
        <h1 style={{ color: '#7B1533', fontSize: 28, marginBottom: 12 }}>Terma & Syarat LokalGo</h1>
        <p style={{ lineHeight: 1.7, color: '#555' }}>
          LokalGo Shop ialah platform komuniti untuk memaparkan kedai dan produk setempat. Urusan jual beli,
          pembayaran, penghantaran dan komunikasi selepas klik WhatsApp berlaku terus antara pembeli dan penjual.
        </p>
        <p style={{ lineHeight: 1.7, color: '#555', marginTop: 12 }}>
          Penjual bertanggungjawab memastikan maklumat kedai, harga, produk dan kualiti adalah tepat, halal,
          selamat dan mematuhi undang-undang Malaysia. LokalGo boleh menggantung atau menolak akaun yang
          melanggar garis panduan platform.
        </p>
        <a href="/auth" style={{ display: 'inline-block', marginTop: 20, color: '#7B1533', fontWeight: 700 }}>Kembali</a>
      </section>
    </main>
  )
}
