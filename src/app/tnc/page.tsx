'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

const copy = {
  ms: {
    label: 'English',
    title: 'Terma & Syarat',
    intro: 'Dengan menggunakan LokalGo, anda bersetuju dengan terma ini. LokalGo ialah platform paparan iklan dan direktori komuniti, bukan pihak jual beli.',
    sections: [
      {
        title: 'Platform iklan sahaja',
        body: 'LokalGo hanya menyediakan ruang paparan kedai, produk dan pautan WhatsApp. Kami tidak memegang bayaran, tidak mengurus penghantaran dan tidak menjadi pihak dalam transaksi antara pembeli dan penjual.',
      },
      {
        title: 'Tanggungjawab transaksi',
        body: 'Semua harga, stok, kualiti produk, bayaran, penghantaran, refund dan pertikaian adalah tanggungjawab pembeli dan penjual. LokalGo tidak bertanggungjawab terhadap kerugian, penipuan, kelewatan atau salah faham dalam transaksi.',
      },
      {
        title: 'Satu WhatsApp, satu kedai',
        body: 'Setiap nombor WhatsApp hanya boleh digunakan untuk satu kedai. Penjual perlu melalui semakan dan video call verification sebelum kedai diaktifkan.',
      },
      {
        title: 'Barangan dilarang',
        body: 'Penjual dilarang menawarkan dadah, ketum, rokok, vape atau sebarang barangan yang menyalahi undang-undang Malaysia atau polisi platform.',
      },
      {
        title: 'Penggantungan dan rayuan',
        body: 'Akaun yang melanggar polisi boleh digantung. Penjual diberi satu peluang rayuan. Jika rayuan ditolak, terdapat cooldown 30 hari. Cubaan bypass, daftar semula secara mengelirukan atau guna nombor lain untuk elak tindakan boleh menyebabkan ban kekal.',
      },
      {
        title: 'Undang-undang terpakai',
        body: 'Terma ini ditadbir oleh undang-undang Malaysia. Sebarang pertikaian hendaklah diselesaikan mengikut bidang kuasa dan undang-undang Malaysia.',
      },
    ],
  },
  en: {
    label: 'BM',
    title: 'Terms & Conditions',
    intro: 'By using LokalGo, you agree to these terms. LokalGo is an ads and community directory platform, not a party to buyer-seller transactions.',
    sections: [
      {
        title: 'Ads-only platform',
        body: 'LokalGo only provides shop listings, product display and WhatsApp links. We do not hold payments, manage delivery or become a party to transactions between buyers and sellers.',
      },
      {
        title: 'Transaction responsibility',
        body: 'All prices, stock, product quality, payment, delivery, refunds and disputes are the responsibility of buyers and sellers. LokalGo is not liable for losses, fraud, delays or misunderstandings in transactions.',
      },
      {
        title: 'One WhatsApp, one shop',
        body: 'Each WhatsApp number may only be used for one shop. Sellers must complete review and video call verification before the shop is activated.',
      },
      {
        title: 'Prohibited goods',
        body: 'Sellers must not offer drugs, ketum, cigarettes, vape or any goods that violate Malaysian law or platform policy.',
      },
      {
        title: 'Suspension and appeal',
        body: 'Accounts that violate policy may be suspended. Sellers get one appeal. If the appeal is rejected, a 30-day cooldown applies. Bypassing enforcement, misleading re-registration or using another number to avoid action may result in a permanent ban.',
      },
      {
        title: 'Governing law',
        body: 'These terms are governed by Malaysian law. Any dispute shall be handled under Malaysian jurisdiction and law.',
      },
    ],
  },
}

export default function TncPage() {
  const router = useRouter()
  const [lang, setLang] = useState<'ms' | 'en'>('ms')
  const t = copy[lang]

  return (
    <main className="min-h-screen bg-[#0a0a0a] font-sans text-[#111]" style={{ minHeight: '100vh', background: '#0a0a0a' }}>
      <section className="mx-auto min-h-screen w-full max-w-[430px] bg-[#F5F5F5]" style={{ maxWidth: 430, minHeight: '100vh', margin: '0 auto', background: '#F5F5F5' }}>
        <header className="sticky top-0 z-10 flex items-center justify-between bg-[#7B1533] px-5 py-4 text-white" style={{ background: '#7B1533', color: '#fff', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button onClick={() => router.back()} className="rounded-full bg-white/15 px-3 py-2 text-sm font-bold" style={{ border: 0, borderRadius: 999, background: 'rgba(255,255,255,0.15)', color: '#fff', padding: '8px 12px', fontWeight: 700 }}>
            Back
          </button>
          <h1 className="text-lg font-extrabold">{t.title}</h1>
          <button onClick={() => setLang(lang === 'ms' ? 'en' : 'ms')} className="rounded-full bg-white px-3 py-2 text-xs font-bold text-[#7B1533]" style={{ border: 0, borderRadius: 999, background: '#fff', color: '#7B1533', padding: '8px 12px', fontWeight: 700 }}>
            {t.label}
          </button>
        </header>

        <div className="space-y-4 px-5 py-6" style={{ padding: '24px 20px' }}>
          <p className="rounded-lg bg-white p-4 text-sm leading-7 text-[#555]" style={{ background: '#fff', borderRadius: 8, padding: 16, color: '#555', lineHeight: 1.7 }}>
            {t.intro}
          </p>
          {t.sections.map((section) => (
            <article key={section.title} className="rounded-lg bg-white p-4 shadow-sm" style={{ background: '#fff', borderRadius: 8, padding: 16, marginTop: 14 }}>
              <h2 className="mb-2 text-base font-extrabold text-[#7B1533]" style={{ color: '#7B1533', fontSize: 16, fontWeight: 800, marginBottom: 8 }}>{section.title}</h2>
              <p className="text-sm leading-7 text-[#555]" style={{ color: '#555', lineHeight: 1.7 }}>{section.body}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}
