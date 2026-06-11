'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

const EFFECTIVE_DATE = '1 Julai 2025'
const EFFECTIVE_DATE_EN = '1 July 2025'
const COMPANY = 'LokalGo (NS0308474-A)'
const EMAIL = 'legal@lokago.app'

const copy = {
  ms: {
    label: 'English',
    title: 'Terma & Syarat Penggunaan',
    effectiveLabel: 'Berkuat kuasa',
    effectiveDate: EFFECTIVE_DATE,
    intro: `Terma & Syarat Penggunaan ini ("Terma") merupakan perjanjian yang mengikat secara undang-undang antara anda ("Pengguna") dengan ${COMPANY} ("LokalGo", "kami"). Dengan mendaftar, mengakses atau menggunakan platform LokalGo dalam apa jua bentuk, anda mengesahkan bahawa anda telah membaca, memahami dan bersetuju untuk terikat dengan Terma ini sepenuhnya.\n\nJika anda tidak bersetuju dengan mana-mana bahagian Terma ini, sila hentikan penggunaan platform dengan segera.`,
    sections: [
      {
        title: '1. Tafsiran dan Definisi',
        body: `Dalam Terma ini:\n\n• "Platform" merujuk kepada laman web, aplikasi progresif (PWA) dan semua perkhidmatan digital yang dikendalikan oleh LokalGo.\n• "Penjual" merujuk kepada individu atau entiti yang mendaftar untuk menyenaraikan kedai atau produk pada Platform.\n• "Pembeli" merujuk kepada individu yang melayari, menyimpan atau menghubungi Penjual melalui Platform.\n• "Kandungan" merujuk kepada semua teks, imej, data, maklumat dan bahan lain yang dimuat naik atau dipaparkan pada Platform.\n• "Transaksi" merujuk kepada sebarang urusan jual beli yang berlaku antara Penjual dan Pembeli.`,
      },
      {
        title: '2. Sifat dan Skop Platform',
        body: `LokalGo adalah platform direktori dan paparan iklan digital bagi perniagaan mikro setempat. LokalGo BUKAN:\n\n• Penjual, pembeli atau pihak dalam mana-mana Transaksi;\n• Pengeluar, pembekal, pengedar atau wakil produk yang disenaraikan;\n• Penyelesai pertikaian atau pengantara bagi urusan antara Penjual dan Pembeli;\n• Platform e-dagang yang memegang bayaran atau menguruskan penghantaran.\n\nFungsi Platform adalah terhad kepada penyediaan ruang paparan maklumat kedai, katalog produk dan pautan komunikasi WhatsApp. Semua urusan antara Penjual dan Pembeli berlaku secara terus dan berasingan daripada Platform.`,
      },
      {
        title: '3. Kelayakan dan Pendaftaran Akaun',
        body: `3.1 Anda mesti berumur sekurang-kurangnya 18 tahun atau di bawah pengawasan ibu bapa/penjaga yang sah untuk menggunakan Platform.\n\n3.2 Pendaftaran dilakukan melalui akaun Google. Anda bertanggungjawab untuk:\n(a) Memastikan maklumat yang diberikan adalah tepat, lengkap dan terkini;\n(b) Menjaga kerahsiaan kelayakan akaun anda;\n(c) Semua aktiviti yang berlaku di bawah akaun anda.\n\n3.3 Bagi Penjual, setiap nombor WhatsApp hanya boleh digunakan untuk mendaftarkan satu (1) kedai. Pendaftaran berbilang akaun menggunakan identiti yang berbeza adalah dilarang dan boleh mengakibatkan penamatan kekal.`,
      },
      {
        title: '4. Tanggungjawab Penjual',
        body: `Dengan mendaftar sebagai Penjual, anda bersetuju untuk:\n\n4.1 Memastikan semua maklumat kedai, harga dan penerangan produk adalah tepat, tidak mengelirukan dan dikemas kini secara berkala.\n\n4.2 Mematuhi semua undang-undang Malaysia yang berkaitan, termasuk tetapi tidak terhad kepada Akta Jualan Barang 1957, Akta Perihal Dagangan 2011, Akta Perlindungan Pengguna 1999 dan peraturan berkaitan Kementerian Perdagangan Dalam Negeri dan Kos Sara Hidup (KPDN).\n\n4.3 Tidak menyenaraikan atau mempromosikan:\n(a) Barangan atau perkhidmatan yang menyalahi undang-undang Malaysia;\n(b) Dadah, bahan kawalan, alkohol atau tembakau;\n(c) Barangan tiruan, cetak rompak atau melanggar hak harta intelek;\n(d) Barangan berbahaya, senjata atau bahan letupan;\n(e) Apa-apa kandungan berunsur penipuan atau yang boleh mengelirukan Pembeli.\n\n4.4 Mematuhi proses pengesahan yang ditetapkan oleh LokalGo sebelum kedai diaktifkan.`,
      },
      {
        title: '5. Tanggungjawab Pembeli',
        body: `5.1 Pembeli bertanggungjawab sepenuhnya untuk menilai, mengesahkan dan membuat keputusan berkaitan mana-mana Penjual atau produk sebelum membuat Transaksi.\n\n5.2 LokalGo tidak memberikan apa-apa jaminan, pengesyoran atau waranti berkaitan kualiti, ketulenan, keselamatan atau kesahihan produk yang disenaraikan oleh Penjual.\n\n5.3 Semua urusan, pembayaran, penghantaran, tuntutan dan pertikaian adalah antara Pembeli dan Penjual secara eksklusif. LokalGo tidak campur tangan dalam hal ini.`,
      },
      {
        title: '6. Kandungan dan Hak Harta Intelek',
        body: `6.1 Semua kandungan yang dimuat naik oleh Pengguna ke Platform kekal menjadi milik Pengguna yang berkenaan. Dengan memuat naik kandungan, anda memberikan LokalGo lesen tidak eksklusif, bebas royalti, boleh dipindah milik dan berskala global untuk menggunakan, memaparkan, menyimpan dan memproses kandungan tersebut bagi tujuan operasi Platform.\n\n6.2 Anda mengesahkan bahawa kandungan yang dimuat naik adalah milik anda atau anda mempunyai kebenaran untuk menggunakannya dan tidak melanggar hak pihak ketiga.\n\n6.3 Semua elemen reka bentuk, tanda dagangan, logo, nama "LokalGo" dan harta intelek Platform adalah milik eksklusif LokalGo dan tidak boleh digunakan tanpa kebenaran bertulis.`,
      },
      {
        title: '7. Penggantungan, Pemansuhan dan Rayuan',
        body: `7.1 LokalGo berhak untuk menggantung, menyekat atau menamatkan akaun mana-mana Pengguna yang:\n(a) Melanggar mana-mana peruntukan Terma ini;\n(b) Menyiarkan kandungan yang salah, mengelirukan atau berbahaya;\n(c) Terlibat dalam penipuan, ugutan atau salah laku;\n(d) Gagal mematuhi proses pengesahan atau pengemaskinian maklumat yang diperlukan.\n\n7.2 Penjual yang digantung berhak untuk mengemukakan rayuan bertulis kepada ${EMAIL} dalam tempoh 14 hari dari tarikh pemberitahuan. Setiap rayuan akan disemak dan dijawab dalam tempoh 14 hari bekerja.\n\n7.3 Jika rayuan ditolak, akaun akan dibubarkan dan terdapat tempoh larangan pendaftaran semula selama 90 hari. Percubaan untuk mendaftar semula menggunakan identiti, nombor telefon atau maklumat yang berbeza untuk mengelakkan tindakan boleh mengakibatkan ban kekal dan tindakan undang-undang.`,
      },
      {
        title: '8. Penafian Liabiliti',
        body: `8.1 Platform disediakan secara "sebagaimana adanya" ("as is") tanpa sebarang waranti, tersurat atau tersirat, termasuk tetapi tidak terhad kepada waranti kebolehdagangan, kesesuaian untuk tujuan tertentu atau ketiadaan pelanggaran.\n\n8.2 Setakat yang dibenarkan oleh undang-undang Malaysia, LokalGo, pengarah, pekerja dan ejennya tidak akan bertanggungjawab terhadap:\n(a) Sebarang kerugian langsung, tidak langsung, berbangkit, khas atau punitif;\n(b) Kehilangan keuntungan, data, muhibah atau peluang perniagaan;\n(c) Gangguan perkhidmatan, kegagalan teknikal atau akses tidak dibenarkan oleh pihak ketiga;\n(d) Perbuatan, peninggalan atau kandungan mana-mana Pengguna;\n(e) Kerosakan yang timbul daripada Transaksi antara Penjual dan Pembeli.\n\n8.3 Had liabiliti maksimum LokalGo kepada mana-mana Pengguna adalah terhad kepada jumlah yuran (jika ada) yang dibayar oleh Pengguna kepada LokalGo dalam tempoh 12 bulan sebelum tuntutan.`,
      },
      {
        title: '9. Perlindungan Data Peribadi',
        body: `Pengumpulan, penggunaan dan perlindungan data peribadi anda dikawal oleh Dasar Privasi LokalGo yang boleh diakses di /privacy. Dasar Privasi tersebut adalah sebahagian daripada Terma ini dan hendaklah dibaca bersama-sama.\n\nLokalGo mematuhi Akta Perlindungan Data Peribadi 2010 (PDPA 2010) dan semua peraturan perlindungan data yang berkuat kuasa di Malaysia.`,
      },
      {
        title: '10. Perubahan Terma',
        body: `10.1 LokalGo berhak untuk meminda Terma ini pada bila-bila masa. Perubahan material akan diberitahu kepada Pengguna melalui e-mel atau notifikasi dalam Platform sekurang-kurangnya 14 hari sebelum perubahan berkuat kuasa.\n\n10.2 Penggunaan berterusan Platform selepas tarikh pindaan berkuat kuasa menunjukkan penerimaan anda terhadap Terma yang dipinda.`,
      },
      {
        title: '11. Undang-undang Terpakai dan Penyelesaian Pertikaian',
        body: `11.1 Terma ini ditadbir, ditafsir dan dikuatkuasakan mengikut undang-undang Malaysia.\n\n11.2 Sebarang pertikaian yang timbul daripada atau berkaitan dengan Terma ini hendaklah diselesaikan melalui:\n(a) Rundingan baik hati antara pihak-pihak dalam tempoh 30 hari;\n(b) Jika gagal, melalui penimbang taraan (arbitration) di bawah peraturan Pusat Penimbang Taraan Asia (AIAC) di Kuala Lumpur;\n(c) Bidang kuasa eksklusif Mahkamah Malaysia terpakai bagi perkara yang tidak dapat ditimbang tarabicarakan.\n\n11.3 Tiada satu pun peruntukan Terma ini yang menghadkan hak statutori anda di bawah undang-undang Malaysia yang berkenaan.`,
      },
      {
        title: '12. Hubungi Kami',
        body: `Untuk sebarang pertanyaan berkaitan Terma ini, sila hubungi:\n\nLokalGo (${COMPANY})\nE-mel: ${EMAIL}\n\nBahagian perkhidmatan pelanggan kami akan membalas dalam tempoh 3 hari bekerja.`,
      },
    ],
  },
  en: {
    label: 'BM',
    title: 'Terms & Conditions',
    effectiveLabel: 'Effective',
    effectiveDate: EFFECTIVE_DATE_EN,
    intro: `These Terms & Conditions ("Terms") constitute a legally binding agreement between you ("User") and ${COMPANY} ("LokalGo", "we", "us"). By registering, accessing or using the LokalGo platform in any form, you confirm that you have read, understood and agree to be fully bound by these Terms.\n\nIf you do not agree with any part of these Terms, please stop using the platform immediately.`,
    sections: [
      {
        title: '1. Interpretation and Definitions',
        body: `In these Terms:\n\n• "Platform" refers to the website, progressive web application (PWA) and all digital services operated by LokalGo.\n• "Seller" refers to any individual or entity registered to list a shop or products on the Platform.\n• "Buyer" refers to any individual who browses, saves or contacts a Seller through the Platform.\n• "Content" refers to all text, images, data, information and other material uploaded or displayed on the Platform.\n• "Transaction" refers to any sale or purchase between a Seller and a Buyer.`,
      },
      {
        title: '2. Nature and Scope of Platform',
        body: `LokalGo is a digital directory and advertising display platform for local micro-businesses. LokalGo is NOT:\n\n• A seller, buyer or party to any Transaction;\n• A producer, supplier, distributor or representative of listed products;\n• A dispute resolver or mediator for dealings between Sellers and Buyers;\n• An e-commerce platform that holds payments or manages delivery.\n\nThe Platform's function is limited to providing display space for shop information, product catalogues and WhatsApp communication links. All dealings between Sellers and Buyers occur directly and separately from the Platform.`,
      },
      {
        title: '3. Eligibility and Account Registration',
        body: `3.1 You must be at least 18 years of age or under valid parental/guardian supervision to use the Platform.\n\n3.2 Registration is via Google account. You are responsible for:\n(a) Ensuring information provided is accurate, complete and current;\n(b) Maintaining the confidentiality of your account credentials;\n(c) All activities that occur under your account.\n\n3.3 For Sellers, each WhatsApp number may only be used to register one (1) shop. Multiple account registrations using different identities are prohibited and may result in permanent termination.`,
      },
      {
        title: '4. Seller Responsibilities',
        body: `By registering as a Seller, you agree to:\n\n4.1 Ensure all shop information, prices and product descriptions are accurate, not misleading and regularly updated.\n\n4.2 Comply with all applicable Malaysian laws including but not limited to the Sale of Goods Act 1957, Trade Descriptions Act 2011, Consumer Protection Act 1999 and regulations under the Ministry of Domestic Trade and Cost of Living (KPDN).\n\n4.3 Not list or promote:\n(a) Goods or services that are illegal under Malaysian law;\n(b) Drugs, controlled substances, alcohol or tobacco;\n(c) Counterfeit, pirated or intellectual property-infringing goods;\n(d) Dangerous goods, weapons or explosives;\n(e) Any fraudulent content or content that may mislead Buyers.\n\n4.4 Comply with any verification process set by LokalGo before the shop is activated.`,
      },
      {
        title: '5. Buyer Responsibilities',
        body: `5.1 Buyers are solely responsible for evaluating, verifying and making decisions regarding any Seller or product before completing a Transaction.\n\n5.2 LokalGo makes no guarantees, recommendations or warranties regarding the quality, authenticity, safety or legality of products listed by Sellers.\n\n5.3 All dealings, payments, deliveries, claims and disputes are exclusively between the Buyer and Seller. LokalGo does not intervene in such matters.`,
      },
      {
        title: '6. Content and Intellectual Property',
        body: `6.1 All content uploaded by Users to the Platform remains the property of the respective User. By uploading content, you grant LokalGo a non-exclusive, royalty-free, transferable, globally-scoped licence to use, display, store and process such content for the purposes of operating the Platform.\n\n6.2 You confirm that uploaded content is owned by you or you have permission to use it and it does not infringe third-party rights.\n\n6.3 All design elements, trademarks, logos, the name "LokalGo" and Platform intellectual property are the exclusive property of LokalGo and may not be used without written consent.`,
      },
      {
        title: '7. Suspension, Termination and Appeal',
        body: `7.1 LokalGo reserves the right to suspend, restrict or terminate any User account that:\n(a) Violates any provision of these Terms;\n(b) Posts false, misleading or harmful content;\n(c) Engages in fraud, threats or misconduct;\n(d) Fails to comply with required verification or information update processes.\n\n7.2 Suspended Sellers have the right to submit a written appeal to ${EMAIL} within 14 days of the notification date. Each appeal will be reviewed and responded to within 14 business days.\n\n7.3 If an appeal is rejected, the account will be dissolved with a 90-day re-registration prohibition. Attempts to re-register using different identities, phone numbers or information to circumvent enforcement may result in a permanent ban and legal action.`,
      },
      {
        title: '8. Disclaimer of Liability',
        body: `8.1 The Platform is provided "as is" without any warranty, express or implied, including but not limited to warranties of merchantability, fitness for a particular purpose or non-infringement.\n\n8.2 To the extent permitted by Malaysian law, LokalGo, its directors, employees and agents shall not be liable for:\n(a) Any direct, indirect, consequential, special or punitive losses;\n(b) Loss of profit, data, goodwill or business opportunity;\n(c) Service interruptions, technical failures or unauthorised access by third parties;\n(d) Acts, omissions or content of any User;\n(e) Damages arising from Transactions between Sellers and Buyers.\n\n8.3 LokalGo's maximum liability to any User is limited to fees (if any) paid by the User to LokalGo in the 12 months preceding the claim.`,
      },
      {
        title: '9. Personal Data Protection',
        body: `The collection, use and protection of your personal data is governed by LokalGo's Privacy Policy accessible at /privacy. The Privacy Policy forms part of these Terms and should be read together with them.\n\nLokalGo complies with the Personal Data Protection Act 2010 (PDPA 2010) and all applicable data protection regulations in Malaysia.`,
      },
      {
        title: '10. Changes to Terms',
        body: `10.1 LokalGo reserves the right to amend these Terms at any time. Material changes will be notified to Users by email or in-Platform notification at least 14 days before taking effect.\n\n10.2 Continued use of the Platform after the amendment effective date constitutes acceptance of the amended Terms.`,
      },
      {
        title: '11. Governing Law and Dispute Resolution',
        body: `11.1 These Terms are governed, construed and enforced in accordance with Malaysian law.\n\n11.2 Any dispute arising from or related to these Terms shall be resolved through:\n(a) Good faith negotiation between the parties within 30 days;\n(b) If unsuccessful, through arbitration under the Asian International Arbitration Centre (AIAC) rules in Kuala Lumpur;\n(c) Exclusive Malaysian Court jurisdiction applies to matters that cannot be arbitrated.\n\n11.3 Nothing in these Terms limits your statutory rights under applicable Malaysian law.`,
      },
      {
        title: '12. Contact Us',
        body: `For any enquiries relating to these Terms, please contact:\n\nLokalGo (${COMPANY})\nEmail: ${EMAIL}\n\nOur customer service team will respond within 3 business days.`,
      },
    ],
  },
}

export default function TncPage() {
  const router = useRouter()
  const [lang, setLang] = useState<'ms' | 'en'>('ms')
  const t = copy[lang]

  return (
    <main style={{ minHeight: '100vh', background: '#0a0a0a' }}>
      <section style={{ maxWidth: 430, minHeight: '100vh', margin: '0 auto', background: '#F5F5F5' }}>
        <header style={{ position: 'sticky', top: 0, zIndex: 10, background: '#7B1533', color: '#fff', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button
            onClick={() => router.back()}
            style={{ border: 0, borderRadius: 999, background: 'rgba(255,255,255,0.15)', color: '#fff', padding: '8px 14px', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}
          >
            ← Kembali
          </button>
          <h1 style={{ fontSize: 15, fontWeight: 800, textAlign: 'center', flex: 1, margin: '0 8px' }}>{t.title}</h1>
          <button
            onClick={() => setLang(lang === 'ms' ? 'en' : 'ms')}
            style={{ border: 0, borderRadius: 999, background: '#fff', color: '#7B1533', padding: '8px 14px', fontWeight: 700, fontSize: 12, cursor: 'pointer', whiteSpace: 'nowrap' }}
          >
            {t.label}
          </button>
        </header>

        <div style={{ padding: '20px 16px 48px' }}>
          {/* Effective date badge */}
          <div style={{ background: '#fff8e1', border: '1px solid #f3d875', borderRadius: 8, padding: '10px 14px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 14 }}>📋</span>
            <span style={{ fontSize: 12, color: '#856404', fontWeight: 600 }}>{t.effectiveLabel}: {t.effectiveDate}</span>
          </div>

          {/* Intro */}
          <div style={{ background: '#fff', borderRadius: 12, padding: '16px', marginBottom: 12, border: '1px solid #eee' }}>
            {t.intro.split('\n\n').map((para, i) => (
              <p key={i} style={{ fontSize: 13, lineHeight: 1.8, color: '#444', marginBottom: i < t.intro.split('\n\n').length - 1 ? 12 : 0 }}>{para}</p>
            ))}
          </div>

          {/* Sections */}
          {t.sections.map((section) => (
            <article key={section.title} style={{ background: '#fff', borderRadius: 12, padding: '16px', marginBottom: 10, border: '1px solid #eee' }}>
              <h2 style={{ color: '#7B1533', fontSize: 14, fontWeight: 800, marginBottom: 10 }}>{section.title}</h2>
              {section.body.split('\n').map((line, i) => (
                line.trim() === '' ? <div key={i} style={{ height: 6 }} /> :
                line.startsWith('•') || /^\([a-z]\)/.test(line.trim()) ? (
                  <p key={i} style={{ fontSize: 12.5, lineHeight: 1.75, color: '#555', paddingLeft: 12, marginBottom: 2 }}>{line}</p>
                ) : (
                  <p key={i} style={{ fontSize: 12.5, lineHeight: 1.75, color: '#555', marginBottom: 4 }}>{line}</p>
                )
              ))}
            </article>
          ))}

          <p style={{ fontSize: 11, color: '#aaa', textAlign: 'center', marginTop: 24, lineHeight: 1.6 }}>
            © {new Date().getFullYear()} LokalGo ({COMPANY}). Hak cipta terpelihara.
          </p>
        </div>
      </section>
    </main>
  )
}
