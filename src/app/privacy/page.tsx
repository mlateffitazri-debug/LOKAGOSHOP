'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

const copy = {
  ms: {
    label: 'English',
    title: 'Dasar Privasi',
    intro: 'Dasar ini menerangkan cara LokalGo mengumpul, menggunakan dan melindungi data peribadi selaras dengan Akta Perlindungan Data Peribadi 2010 (PDPA 2010).',
    sections: [
      {
        title: 'Data yang kami kumpul',
        body: 'Untuk pembeli, kami boleh menerima nama Google, email dan kawasan pilihan. Untuk penjual, kami mengumpul nombor WhatsApp, lokasi atau kawasan kedai, email, imej kedai atau produk dan maklumat kedai yang dihantar semasa onboarding.',
      },
      {
        title: 'Tujuan penggunaan data',
        body: 'Data digunakan untuk log masuk, memaparkan kedai, membantu pembeli mencari penjual setempat, mengurus onboarding penjual, moderasi dan keselamatan platform.',
      },
      {
        title: 'Data tidak dijual',
        body: 'LokalGo tidak menjual data peribadi kepada pihak ketiga. Maklumat penjual seperti nama kedai, kawasan dan nombor WhatsApp hanya dipaparkan untuk membolehkan pembeli menghubungi penjual secara terus.',
      },
      {
        title: 'Alamat penghantaran localStorage',
        body: 'Alamat penghantaran yang disimpan melalui localStorage berada pada peranti pengguna sahaja. Data ini tidak dihantar ke server melainkan pengguna sendiri memasukkannya dalam mesej WhatsApp atau borang lain.',
      },
      {
        title: 'Pemadaman akaun',
        body: 'Apabila akaun dipadam, data berkaitan akan dipadam atau dipurge dalam tempoh 30 hari, tertakluk kepada keperluan keselamatan, audit, undang-undang atau penyelesaian pertikaian.',
      },
      {
        title: 'Keselamatan dan akses',
        body: 'Kami mengehadkan akses data kepada fungsi pentadbiran yang perlu sahaja dan menggunakan kawalan teknikal yang munasabah untuk melindungi data daripada akses tidak dibenarkan.',
      },
    ],
    contact: 'Pertanyaan privasi: admin@lokago.app | SSM: NS0308474-A',
  },
  en: {
    label: 'BM',
    title: 'Privacy Policy',
    intro: 'This policy explains how LokalGo collects, uses and protects personal data in line with Malaysia Personal Data Protection Act 2010 (PDPA 2010).',
    sections: [
      {
        title: 'Data we collect',
        body: 'For buyers, we may receive Google name, email and preferred area. For sellers, we collect WhatsApp number, shop location or area, email, shop or product images and shop information submitted during onboarding.',
      },
      {
        title: 'How we use data',
        body: 'Data is used for login, displaying shops, helping buyers find nearby sellers, seller onboarding, moderation and platform safety.',
      },
      {
        title: 'No data sale',
        body: 'LokalGo does not sell personal data to third parties. Seller details such as shop name, area and WhatsApp number are displayed only so buyers can contact sellers directly.',
      },
      {
        title: 'Delivery addresses in localStorage',
        body: 'Delivery addresses saved through localStorage stay on the user device only. They are not sent to our server unless the user includes them in a WhatsApp message or another submitted form.',
      },
      {
        title: 'Account deletion',
        body: 'When an account is deleted, related data will be deleted or purged within 30 days, subject to safety, audit, legal or dispute-resolution requirements.',
      },
      {
        title: 'Security and access',
        body: 'We limit data access to necessary administration functions and use reasonable technical controls to protect data from unauthorised access.',
      },
    ],
    contact: 'Privacy enquiries: admin@lokago.app | SSM: NS0308474-A',
  },
}

export default function PrivacyPage() {
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
          <p className="rounded-lg border border-[#E5E5EA] bg-white p-4 text-xs font-semibold leading-6 text-[#555]" style={{ background: '#fff', border: '1px solid #E5E5EA', borderRadius: 8, padding: 16, color: '#555', fontSize: 12, fontWeight: 600, lineHeight: 1.6 }}>
            {t.contact}
          </p>
        </div>
      </section>
    </main>
  )
}
