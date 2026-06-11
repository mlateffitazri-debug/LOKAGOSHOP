'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

const EFFECTIVE_DATE = '1 Julai 2025'
const EFFECTIVE_DATE_EN = '1 July 2025'
const COMPANY = 'LokalGo (NS0308474-A)'
const EMAIL = 'privacy@lokago.app'
const DPA_EMAIL = 'dpa@lokago.app'

const copy = {
  ms: {
    label: 'English',
    title: 'Dasar Privasi',
    effectiveLabel: 'Berkuat kuasa',
    effectiveDate: EFFECTIVE_DATE,
    intro: `Dasar Privasi ini ("Dasar") menerangkan cara ${COMPANY} ("LokalGo", "kami", "milik kami") mengumpul, memproses, menyimpan, mendedahkan dan melindungi data peribadi anda ("Data Peribadi") apabila anda menggunakan platform LokalGo.\n\nLokalGo beroperasi selaras dengan Akta Perlindungan Data Peribadi 2010 (PDPA 2010) Malaysia dan Peraturan-Peraturan Perlindungan Data Peribadi (Tempoh Penyimpanan Data) 2013. Dengan menggunakan Platform kami, anda mengakui bahawa anda telah membaca dan memahami Dasar ini.`,
    sections: [
      {
        title: '1. Pengawal Data Peribadi',
        body: `Pengawal Data Peribadi bagi Platform ini ialah:\n\nLokalGo (NS0308474-A)\nPegawai Perlindungan Data (DPA): ${DPA_EMAIL}\nPertanyaan privasi umum: ${EMAIL}\n\nAnda berhak untuk menghubungi Pegawai Perlindungan Data kami untuk sebarang pertanyaan, kebimbangan atau untuk melaksanakan hak-hak anda di bawah PDPA 2010.`,
      },
      {
        title: '2. Data Peribadi yang Kami Kumpul',
        body: `Kami mengumpul Data Peribadi berikut berdasarkan kategori pengguna:\n\nA. PEMBELI\n• Nama penuh (diperoleh melalui log masuk Google)\n• Alamat e-mel\n• Gambar profil (jika ada)\n• Kawasan atau lokasi pilihan (jika diberikan secara sukarela)\n• Data penggunaan: halaman yang dilawati, carian yang dibuat, kedai yang disimpan\n\nB. PENJUAL\n• Nama penuh dan nama kedai\n• Alamat e-mel\n• Nombor WhatsApp perniagaan\n• Kawasan, nama taman dan poskod\n• Koordinat lokasi (latitud/longitud) jika diberikan\n• Imej profil kedai dan imej produk\n• Kategori produk dan maklumat inventori\n• Rekod moderasi dan kepatuhan\n\nC. DATA YANG DIJANA SECARA AUTOMATIK\n• Log akses (alamat IP, jenis peranti, pelayar web)\n• Cap masa log masuk dan aktiviti\n• Data sesi dan kuki teknikal\n\nD. DATA PADA PERANTI PENGGUNA SAHAJA (Tidak dihantar ke pelayan kami)\n• Alamat penghantaran rumah dan pejabat yang disimpan dalam peranti anda\n• Senarai pesanan tempatan dalam sesi semasa`,
      },
      {
        title: '3. Tujuan Pemprosesan Data Peribadi',
        body: `Kami memproses Data Peribadi anda untuk tujuan-tujuan berikut berdasarkan asas undang-undang yang berkenaan:\n\n3.1 PELAKSANAAN KONTRAK\n• Pengesahan identiti dan pengurusan akaun\n• Pemprosesan pendaftaran Penjual dan onboarding\n• Pemaparan profil kedai dan katalog produk\n• Membolehkan komunikasi antara Pembeli dan Penjual\n\n3.2 KEPENTINGAN YANG SAH\n• Keselamatan platform dan pencegahan penipuan\n• Moderasi kandungan dan pematuhan polisi\n• Analitik penggunaan untuk penambahbaikan perkhidmatan\n• Pengurusan rayuan dan pertikaian\n\n3.3 KEWAJIPAN UNDANG-UNDANG\n• Pematuhan kepada perintah mahkamah atau arahan agensi penguatkuasaan\n• Penyimpanan rekod untuk tujuan audit dan akauntabiliti\n\n3.4 PERSETUJUAN (untuk tujuan pilihan sahaja)\n• Komunikasi pemasaran dan kemaskini platform (boleh ditarik balik pada bila-bila masa)`,
      },
      {
        title: '4. Pendedahan Data Peribadi kepada Pihak Ketiga',
        body: `4.1 KAMI TIDAK MENJUAL DATA PERIBADI ANDA kepada mana-mana pihak ketiga untuk tujuan pemasaran atau komersial.\n\n4.2 Data Peribadi anda boleh dikongsi dalam keadaan berikut sahaja:\n\n• PEMBEKAL PERKHIDMATAN TEKNIKAL: Penyedia infrastruktur awan, perkhidmatan e-mel dan alat analitik yang memproses data bagi pihak kami di bawah perjanjian pemprosesan data yang mengikat. Semua pembekal dikehendaki mematuhi standard keselamatan yang setara atau lebih tinggi.\n\n• PEMATUHAN UNDANG-UNDANG: Apabila dikehendaki oleh undang-undang, perintah mahkamah atau arahan pihak berkuasa yang kompeten di Malaysia.\n\n• PERLINDUNGAN HAK: Apabila perlu untuk melindungi hak, harta atau keselamatan LokalGo, pengguna atau orang awam.\n\n• MAKLUMAT AWAM PENJUAL: Nama kedai, kawasan, nombor WhatsApp dan gambar profil Penjual dipaparkan secara awam di Platform berdasarkan persetujuan eksplisit Penjual semasa pendaftaran.\n\n4.3 Sekiranya berlaku pindahan perniagaan, penggabungan atau pemerolehan, Data Peribadi boleh dipindahkan kepada entiti penerus tertakluk kepada notis awal kepada pengguna.`,
      },
      {
        title: '5. Tempoh Penyimpanan Data',
        body: `Kami menyimpan Data Peribadi anda berdasarkan jadual berikut:\n\n• AKAUN AKTIF: Selagi akaun anda aktif dan digunakan.\n\n• SELEPAS PENUTUPAN AKAUN: Data peribadi utama (nama, e-mel, nombor telefon) akan dipadam atau dipseudonymkan dalam tempoh 30 hari. Imej yang dimuat naik akan dihapuskan dalam tempoh 60 hari.\n\n• REKOD AUDIT & KEPATUHAN: Disimpan sehingga 7 tahun selaras dengan keperluan undang-undang Malaysia bagi tujuan akauntabiliti.\n\n• DATA LOG TEKNIKAL: Disimpan selama 90 hari untuk tujuan keselamatan dan diagnostik.\n\n• DATA PERTIKAIAN AKTIF: Disimpan sehingga pertikaian diselesaikan sepenuhnya.\n\nData yang melebihi tempoh penyimpanan akan dipadam secara automatik atau dipseudonymkan mengikut prosedur dalaman kami.`,
      },
      {
        title: '6. Hak-hak Anda Di Bawah PDPA 2010',
        body: `Sebagai subjek data, anda mempunyai hak-hak berikut yang boleh dilaksanakan dengan menghubungi ${EMAIL}:\n\n6.1 HAK AKSES\nAnda berhak untuk mendapatkan salinan Data Peribadi yang kami simpan tentang anda. Permintaan akan diproses dalam tempoh 21 hari.\n\n6.2 HAK PEMBETULAN\nAnda berhak untuk meminta pembetulan Data Peribadi yang tidak tepat, tidak lengkap atau lapuk. Kami akan membenarkan atau menolak permintaan dalam tempoh 21 hari.\n\n6.3 HAK MENARIK BALIK PERSETUJUAN\nBagi pemprosesan berasaskan persetujuan (seperti komunikasi pemasaran), anda boleh menarik balik persetujuan pada bila-bila masa melalui tetapan akaun atau dengan menghubungi kami. Penarikan balik tidak menjejaskan kesahihan pemprosesan sebelumnya.\n\n6.4 HAK PEMADAMAN (RIGHT TO ERASURE)\nAnda boleh meminta pemadaman akaun dan Data Peribadi anda. Permintaan akan diproses dalam tempoh 30 hari, tertakluk kepada kewajipan undang-undang penyimpanan rekod yang berkenaan.\n\n6.5 HAK MEMBANTAH PEMPROSESAN\nAnda berhak untuk membantah pemprosesan Data Peribadi anda bagi tujuan tertentu. Kami akan mempertimbangkan bantahan anda dan memberi respons dalam tempoh 14 hari bekerja.\n\nUntuk melaksanakan mana-mana hak di atas, hubungi: ${EMAIL}`,
      },
      {
        title: '7. Keselamatan Data',
        body: `7.1 KAWALAN TEKNIKAL\nKami melaksanakan langkah-langkah keselamatan teknikal yang munasabah dan sesuai dengan industri, termasuk:\n• Enkripsi data semasa penghantaran menggunakan TLS 1.2 atau lebih tinggi\n• Kawalan akses berasaskan peranan (RBAC) yang ketat\n• Pemisahan data antara persekitaran pembangunan dan pengeluaran\n• Semakan keselamatan berkala terhadap infrastruktur Platform\n\n7.2 KAWALAN OPERASI\n• Akses pekerja kepada Data Peribadi adalah berdasarkan keperluan tugas semata-mata\n• Semua kakitangan yang mengendalikan Data Peribadi tertakluk kepada perjanjian kerahsiaan\n• Pengauditan akses dilakukan secara berkala\n\n7.3 PELANGGARAN DATA\nSekiranya berlaku pelanggaran data yang menjejaskan hak-hak anda, kami akan memaklumkan kepada Pesuruhjaya Perlindungan Data Peribadi Malaysia dan kepada anda (jika berkaitan) dalam tempoh yang ditetapkan oleh undang-undang.`,
      },
      {
        title: '8. Kuki dan Teknologi Penjejakan',
        body: `8.1 Platform kami menggunakan kuki dan storan tempatan (localStorage) untuk tujuan berikut:\n\n• KUKI TEKNIKAL YANG DIPERLUKAN: Pengurusan sesi pengesahan (log masuk). Tidak boleh dilumpuhkan.\n• KUKI FUNGSI: Menyimpan pilihan bahasa dan tetapan paparan. Boleh dilumpuhkan melalui tetapan pelayar.\n\n8.2 Kami TIDAK menggunakan kuki penjejakan pihak ketiga untuk pengiklanan atau profil tingkah laku.\n\n8.3 Data alamat penghantaran disimpan dalam localStorage peranti anda sahaja dan tidak pernah dihantar ke pelayan kami kecuali anda memasukkannya secara manual dalam mesej WhatsApp.\n\n8.4 Anda boleh memadam kuki pada bila-bila masa melalui tetapan pelayar anda. Ini mungkin menjejaskan fungsi tertentu Platform.`,
      },
      {
        title: '9. Pindahan Data Rentas Sempadan',
        body: `Infrastruktur teknikal LokalGo mungkin melibatkan pemprosesan data di pusat data yang berlokasi di luar Malaysia. Sebarang pindahan sedemikian akan dilakukan:\n\n• Hanya kepada negara yang mempunyai perlindungan data yang mencukupi atau setaraf;\n• Dengan perlindungan kontraktual yang sesuai (seperti Perjanjian Pemprosesan Data) yang memastikan standard perlindungan yang setara;\n• Selaras dengan keperluan PDPA 2010 berkenaan pindahan data antarabangsa.\n\nAnda boleh menghubungi ${EMAIL} untuk maklumat lanjut mengenai mekanisme perlindungan yang digunakan bagi pindahan data antarabangsa.`,
      },
      {
        title: '10. Privasi Kanak-kanak',
        body: `Platform LokalGo tidak ditujukan kepada individu di bawah umur 18 tahun. Kami tidak mengumpul Data Peribadi daripada kanak-kanak di bawah umur tersebut secara sedar.\n\nJika anda percaya bahawa kami telah mengumpul Data Peribadi daripada kanak-kanak tanpa persetujuan ibu bapa atau penjaga yang sah, sila hubungi kami di ${EMAIL} dengan segera dan kami akan mengambil tindakan untuk memadam data tersebut.`,
      },
      {
        title: '11. Perubahan kepada Dasar Privasi Ini',
        body: `11.1 Kami berhak untuk meminda Dasar Privasi ini pada bila-bila masa bagi mencerminkan perubahan dalam amalan data, keperluan undang-undang atau ciri Platform.\n\n11.2 Perubahan yang material akan diberitahu kepada anda melalui:\n• Notifikasi dalam Platform sekurang-kurangnya 14 hari sebelum berkuat kuasa; atau\n• E-mel kepada alamat e-mel berdaftar anda.\n\n11.3 Tarikh "Berkuat Kuasa" di bahagian atas Dasar ini menunjukkan tarikh semakan terkini. Penggunaan berterusan Platform selepas tarikh pindaan berkuat kuasa mengesahkan penerimaan anda terhadap Dasar yang dikemas kini.`,
      },
      {
        title: '12. Pertanyaan dan Aduan',
        body: `Untuk sebarang pertanyaan, kebimbangan atau untuk melaksanakan hak-hak anda berkaitan privasi data, sila hubungi:\n\nPegawai Perlindungan Data LokalGo\nE-mel: ${DPA_EMAIL}\nPertanyaan umum: ${EMAIL}\n\nJika anda tidak berpuas hati dengan respons kami, anda berhak untuk membuat aduan kepada:\n\nPejabat Pesuruhjaya Perlindungan Data Peribadi Malaysia\nKementerian Digital\nPutrajaya, Malaysia\nLaman web: www.pdp.gov.my`,
      },
    ],
  },
  en: {
    label: 'BM',
    title: 'Privacy Policy',
    effectiveLabel: 'Effective',
    effectiveDate: EFFECTIVE_DATE_EN,
    intro: `This Privacy Policy ("Policy") explains how ${COMPANY} ("LokalGo", "we", "us", "our") collects, processes, stores, discloses and protects your personal data ("Personal Data") when you use the LokalGo platform.\n\nLokalGo operates in compliance with Malaysia's Personal Data Protection Act 2010 (PDPA 2010) and the Personal Data Protection (Period of Retention of Data) Regulations 2013. By using our Platform, you acknowledge that you have read and understood this Policy.`,
    sections: [
      {
        title: '1. Personal Data Controller',
        body: `The Personal Data Controller for this Platform is:\n\nLokalGo (NS0308474-A)\nData Protection Officer (DPA): ${DPA_EMAIL}\nGeneral privacy enquiries: ${EMAIL}\n\nYou have the right to contact our Data Protection Officer for any enquiries, concerns or to exercise your rights under PDPA 2010.`,
      },
      {
        title: '2. Personal Data We Collect',
        body: `We collect the following Personal Data based on user category:\n\nA. BUYERS\n• Full name (obtained via Google login)\n• Email address\n• Profile photo (if available)\n• Preferred area or location (if voluntarily provided)\n• Usage data: pages visited, searches made, shops saved\n\nB. SELLERS\n• Full name and shop name\n• Email address\n• Business WhatsApp number\n• Area, taman name and postcode\n• Location coordinates (latitude/longitude) if provided\n• Shop profile image and product images\n• Product categories and inventory information\n• Moderation and compliance records\n\nC. AUTOMATICALLY GENERATED DATA\n• Access logs (IP address, device type, web browser)\n• Login and activity timestamps\n• Session data and technical cookies\n\nD. DATA ON YOUR DEVICE ONLY (Not transmitted to our servers)\n• Home and office delivery addresses stored on your device\n• Local order lists within the current session`,
      },
      {
        title: '3. Purposes for Processing Personal Data',
        body: `We process your Personal Data for the following purposes based on the applicable legal basis:\n\n3.1 CONTRACT PERFORMANCE\n• Identity verification and account management\n• Seller registration processing and onboarding\n• Shop profile and product catalogue display\n• Enabling communication between Buyers and Sellers\n\n3.2 LEGITIMATE INTERESTS\n• Platform security and fraud prevention\n• Content moderation and policy compliance\n• Usage analytics for service improvement\n• Appeal and dispute management\n\n3.3 LEGAL OBLIGATIONS\n• Compliance with court orders or enforcement agency directives\n• Record-keeping for audit and accountability purposes\n\n3.4 CONSENT (for optional purposes only)\n• Marketing communications and platform updates (withdrawable at any time)`,
      },
      {
        title: '4. Disclosure of Personal Data to Third Parties',
        body: `4.1 WE DO NOT SELL YOUR PERSONAL DATA to any third party for marketing or commercial purposes.\n\n4.2 Your Personal Data may be shared only in the following circumstances:\n\n• TECHNICAL SERVICE PROVIDERS: Cloud infrastructure providers, email services and analytics tools that process data on our behalf under binding data processing agreements. All providers are required to comply with equivalent or higher security standards.\n\n• LEGAL COMPLIANCE: When required by law, court order or direction from a competent authority in Malaysia.\n\n• RIGHTS PROTECTION: When necessary to protect the rights, property or safety of LokalGo, users or the public.\n\n• SELLER PUBLIC INFORMATION: Seller shop name, area, WhatsApp number and profile image are displayed publicly on the Platform based on the Seller's explicit consent during registration.\n\n4.3 In the event of a business transfer, merger or acquisition, Personal Data may be transferred to the successor entity subject to prior notice to users.`,
      },
      {
        title: '5. Data Retention Period',
        body: `We retain your Personal Data based on the following schedule:\n\n• ACTIVE ACCOUNTS: As long as your account is active and in use.\n\n• AFTER ACCOUNT CLOSURE: Key personal data (name, email, phone number) will be deleted or pseudonymised within 30 days. Uploaded images will be removed within 60 days.\n\n• AUDIT & COMPLIANCE RECORDS: Retained for up to 7 years in line with Malaysian legal requirements for accountability purposes.\n\n• TECHNICAL LOG DATA: Retained for 90 days for security and diagnostic purposes.\n\n• ACTIVE DISPUTE DATA: Retained until the dispute is fully resolved.\n\nData exceeding the retention period will be automatically deleted or pseudonymised in accordance with our internal procedures.`,
      },
      {
        title: '6. Your Rights Under PDPA 2010',
        body: `As a data subject, you have the following rights exercisable by contacting ${EMAIL}:\n\n6.1 RIGHT OF ACCESS\nYou have the right to obtain a copy of the Personal Data we hold about you. Requests will be processed within 21 days.\n\n6.2 RIGHT TO RECTIFICATION\nYou have the right to request correction of inaccurate, incomplete or outdated Personal Data. We will approve or reject the request within 21 days.\n\n6.3 RIGHT TO WITHDRAW CONSENT\nFor consent-based processing (such as marketing communications), you may withdraw consent at any time through account settings or by contacting us. Withdrawal does not affect the lawfulness of prior processing.\n\n6.4 RIGHT TO ERASURE\nYou may request deletion of your account and Personal Data. Requests will be processed within 30 days, subject to applicable legal record-keeping obligations.\n\n6.5 RIGHT TO OBJECT TO PROCESSING\nYou have the right to object to the processing of your Personal Data for certain purposes. We will consider your objection and respond within 14 business days.\n\nTo exercise any of the above rights, contact: ${EMAIL}`,
      },
      {
        title: '7. Data Security',
        body: `7.1 TECHNICAL CONTROLS\nWe implement reasonable and industry-appropriate technical security measures including:\n• Data encryption in transit using TLS 1.2 or higher\n• Strict role-based access control (RBAC)\n• Separation of data between development and production environments\n• Regular security reviews of Platform infrastructure\n\n7.2 OPERATIONAL CONTROLS\n• Staff access to Personal Data is on a need-to-know basis only\n• All personnel handling Personal Data are bound by confidentiality agreements\n• Access auditing is conducted periodically\n\n7.3 DATA BREACH\nIn the event of a data breach affecting your rights, we will notify the Malaysian Personal Data Protection Commissioner and you (where applicable) within the timeframe prescribed by law.`,
      },
      {
        title: '8. Cookies and Tracking Technologies',
        body: `8.1 Our Platform uses cookies and local storage (localStorage) for the following purposes:\n\n• REQUIRED TECHNICAL COOKIES: Authentication session management (login). Cannot be disabled.\n• FUNCTIONAL COOKIES: Storing language preferences and display settings. Can be disabled via browser settings.\n\n8.2 We DO NOT use third-party tracking cookies for advertising or behavioural profiling.\n\n8.3 Delivery address data is stored in your device's localStorage only and is never transmitted to our servers unless you manually include it in a WhatsApp message.\n\n8.4 You may delete cookies at any time through your browser settings. This may affect certain Platform functions.`,
      },
      {
        title: '9. Cross-Border Data Transfers',
        body: `LokalGo's technical infrastructure may involve data processing at data centres located outside Malaysia. Any such transfers will be conducted:\n\n• Only to countries with adequate or equivalent data protection;\n• With appropriate contractual protections (such as Data Processing Agreements) ensuring equivalent protection standards;\n• In compliance with PDPA 2010 requirements regarding international data transfers.\n\nYou may contact ${EMAIL} for further information on the safeguards used for international data transfers.`,
      },
      {
        title: '10. Children\'s Privacy',
        body: `The LokalGo Platform is not intended for individuals under the age of 18. We do not knowingly collect Personal Data from children under that age.\n\nIf you believe we have collected Personal Data from a child without valid parental or guardian consent, please contact us at ${EMAIL} immediately and we will take steps to delete such data.`,
      },
      {
        title: '11. Changes to This Privacy Policy',
        body: `11.1 We reserve the right to amend this Privacy Policy at any time to reflect changes in data practices, legal requirements or Platform features.\n\n11.2 Material changes will be notified to you through:\n• In-Platform notification at least 14 days before taking effect; or\n• Email to your registered email address.\n\n11.3 The "Effective" date at the top of this Policy indicates the date of the latest revision. Continued use of the Platform after the amendment effective date confirms your acceptance of the updated Policy.`,
      },
      {
        title: '12. Enquiries and Complaints',
        body: `For any enquiries, concerns or to exercise your data privacy rights, please contact:\n\nLokalGo Data Protection Officer\nEmail: ${DPA_EMAIL}\nGeneral enquiries: ${EMAIL}\n\nIf you are not satisfied with our response, you have the right to lodge a complaint with:\n\nOffice of the Personal Data Protection Commissioner Malaysia\nMinistry of Digital\nPutrajaya, Malaysia\nWebsite: www.pdp.gov.my`,
      },
    ],
  },
}

export default function PrivacyPage() {
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
          <div style={{ background: '#f0f7ff', border: '1px solid #b3d4f5', borderRadius: 8, padding: '10px 14px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 14 }}>🔒</span>
            <span style={{ fontSize: 12, color: '#1a5fa8', fontWeight: 600 }}>{t.effectiveLabel}: {t.effectiveDate}</span>
          </div>

          {/* Intro */}
          <div style={{ background: '#fff', borderRadius: 12, padding: '16px', marginBottom: 12, border: '1px solid #eee' }}>
            {t.intro.split('\n\n').map((para, i) => (
              <p key={i} style={{ fontSize: 13, lineHeight: 1.8, color: '#444', marginBottom: i < t.intro.split('\n\n').length - 1 ? 12 : 0 }}>{para}</p>
            ))}
          </div>

          {/* PDPA compliance badge */}
          <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 8, padding: '10px 14px', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 14 }}>✅</span>
            <span style={{ fontSize: 11.5, color: '#166534', fontWeight: 600, lineHeight: 1.5 }}>
              {lang === 'ms'
                ? 'Dasar ini mematuhi Akta Perlindungan Data Peribadi 2010 (PDPA 2010) Malaysia'
                : 'This Policy complies with Malaysia\'s Personal Data Protection Act 2010 (PDPA 2010)'}
            </span>
          </div>

          {/* Sections */}
          {t.sections.map((section) => (
            <article key={section.title} style={{ background: '#fff', borderRadius: 12, padding: '16px', marginBottom: 10, border: '1px solid #eee' }}>
              <h2 style={{ color: '#7B1533', fontSize: 14, fontWeight: 800, marginBottom: 10 }}>{section.title}</h2>
              {section.body.split('\n').map((line, i) => (
                line.trim() === '' ? <div key={i} style={{ height: 6 }} /> :
                line.startsWith('•') || /^[A-Z]\.\s/.test(line) || /^\d+\.\d+/.test(line) ? (
                  <p key={i} style={{ fontSize: 12.5, lineHeight: 1.75, paddingLeft: /^[A-Z]\.\s/.test(line) ? 0 : 12, marginBottom: 2, fontWeight: /^[A-Z]\.\s/.test(line) ? 700 : 400, color: /^[A-Z]\.\s/.test(line) ? '#333' : '#555' }}>{line}</p>
                ) : (
                  <p key={i} style={{ fontSize: 12.5, lineHeight: 1.75, color: '#555', marginBottom: 4 }}>{line}</p>
                )
              ))}
            </article>
          ))}

          {/* Footer note */}
          <div style={{ background: '#fff', border: '1px solid #E5E5EA', borderRadius: 10, padding: '14px 16px', marginTop: 8, textAlign: 'center' }}>
            <p style={{ fontSize: 11.5, color: '#888', lineHeight: 1.6, marginBottom: 6 }}>
              {lang === 'ms' ? 'Pertanyaan privasi:' : 'Privacy enquiries:'}{' '}
              <strong style={{ color: '#7B1533' }}>{EMAIL}</strong>
            </p>
            <p style={{ fontSize: 11, color: '#aaa' }}>
              © {new Date().getFullYear()} {COMPANY}
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}
