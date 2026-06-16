'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { HtmlPrototypePage } from '@/components/shared/HtmlPrototypePage'
import { compressImage } from '@/lib/compressImage'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
const MAX_RAW_BYTES = 10 * 1024 * 1024

type OnboardingWindow = Window & {
  __submitSellerOnboarding?: () => void
  __handleImageFile?: (file: File) => Promise<void>
  __showImagePreview?: (dataUrl: string) => void
  __getImgPos?: () => { x: number; y: number }
}

const styles = `:root{--c-primary:#7B1533;--c-primary-dark:#6A1029;--c-primary-lt:#8f1a3a;--c-accent:#ADD036;--c-bg:#F5F5F5;--c-surface:#FFFFFF;--c-border:#E5E5EA;--c-text:#111111;--c-text2:#555555;--c-text3:#888888;--c-hint:#BBBBBB;}
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;-webkit-font-smoothing:antialiased;}
body{background:#0a0a0a;min-height:100vh;font-family:'Plus Jakarta Sans',-apple-system,sans-serif;font-size:14px;color:var(--c-text);}
.page{width:100%;max-width:430px;margin:0 auto;min-height:100vh;background:var(--c-bg);overflow:hidden;}
@media(min-width:500px){body{padding:40px 20px;display:flex;justify-content:center;align-items:flex-start;}.page{min-height:auto;border-radius:36px;border:8px solid #1a1a1a;box-shadow:0 32px 80px rgba(0,0,0,0.7);}}
@media(min-width:1024px){body{align-items:center;padding:40px;min-height:100vh;}}
.scroll{height:812px;overflow-y:auto;padding-bottom:32px;}.scroll::-webkit-scrollbar{display:none;}

/* HEADER */
.header{background:var(--c-primary);padding:14px 20px 12px;}
.header-r1{display:flex;align-items:center;justify-content:space-between;margin-bottom:3px;}
.header-sub{font-size:11px;color:rgba(255,255,255,0.55);margin-bottom:10px;}
.header-r2{display:flex;gap:8px;align-items:center;}
.sokong-btn{background:rgba(255,255,255,0.15);border:none;border-radius:20px;padding:6px 12px;color:#fff;font-size:11px;font-weight:600;font-family:inherit;display:flex;align-items:center;gap:5px;cursor:pointer;white-space:nowrap;}
.search-wrap{flex:1;background:rgba(255,255,255,0.92);border-radius:10px;padding:9px 12px;display:flex;align-items:center;gap:8px;}
.search-wrap span{font-size:13px;color:#aaa;}
.lang-btn{background:rgba(255,255,255,0.15);border:none;border-radius:8px;padding:8px 10px;color:#fff;font-size:11px;font-weight:600;font-family:inherit;display:flex;align-items:center;gap:4px;cursor:pointer;white-space:nowrap;}

/* PAGE TITLE */
.page-title-wrap{padding:24px 20px 20px;text-align:center;}
.page-title{font-size:22px;font-weight:800;color:var(--c-text);letter-spacing:-0.3px;}

/* SECTION */
.form-section{padding:0 20px;display:flex;flex-direction:column;gap:20px;}
.field-label{font-size:14px;font-weight:700;color:var(--c-primary);text-align:center;margin-bottom:12px;}

/* UPLOAD BOX */
.upload-box{width:100%;background:#fff;border:2px dashed var(--c-border);border-radius:14px;padding:32px 20px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;cursor:pointer;transition:border 0.2s;}
.upload-box:hover{border-color:var(--c-primary);}
.upload-icon{width:48px;height:48px;background:#f5f5f5;border-radius:12px;display:flex;align-items:center;justify-content:center;}
.upload-text{font-size:14px;font-weight:600;color:var(--c-text2);}
.upload-hint{font-size:11px;color:var(--c-hint);}

/* IMAGE PREVIEW FRAME */
.img-preview-wrap{width:100%;border-radius:14px;overflow:hidden;border:2px solid var(--c-primary);}
.img-preview-frame{width:100%;height:150px;background-size:cover;background-position:50% 50%;background-color:#f0f0f0;}
.pos-btns{display:flex;background:#f9f9f9;border-top:1px solid #eee;}
.pos-btn{flex:1;border:none;border-right:1px solid #eee;background:transparent;padding:11px 8px;font-size:12px;font-weight:600;color:#666;font-family:inherit;cursor:pointer;min-height:44px;}
.pos-btn:last-child{border-right:none;}
.pos-btn.pos-btn-active{color:var(--c-primary);background:#fff5f7;}
.btn-change-img{width:100%;border:none;background:var(--c-primary);color:#fff;font-size:13px;font-weight:600;font-family:inherit;padding:12px;cursor:pointer;min-height:44px;}

/* DESCRIPTION */
.desc-input{width:100%;border:1.5px solid var(--c-border);border-radius:10px;padding:12px 14px;font-size:14px;color:var(--c-text);outline:none;background:#fff;font-family:inherit;resize:none;height:90px;line-height:1.6;transition:border 0.2s;}
.desc-input:focus{border-color:var(--c-primary);}
.desc-input::placeholder{color:var(--c-hint);}

/* CATEGORY GRID */
.cat-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;}
.cat-item{display:flex;align-items:center;gap:10px;background:#fff;border:1.5px solid var(--c-border);border-radius:10px;padding:12px;cursor:pointer;transition:all 0.15s;}
.cat-item.selected{border-color:var(--c-primary);background:#fff5f7;}
.cat-checkbox{width:20px;height:20px;border-radius:5px;border:1.5px solid var(--c-border);display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:all 0.15s;}
.cat-item.selected .cat-checkbox{background:var(--c-primary);border-color:var(--c-primary);}
.cat-name{font-size:13px;font-weight:600;color:var(--c-text);}
.cat-item.selected .cat-name{color:var(--c-primary);}
.cat-full{grid-column:1/-1;}

/* AGREE */
.agree-wrap{background:#fff;border:1.5px solid var(--c-border);border-radius:12px;padding:14px;display:flex;gap:12px;align-items:flex-start;cursor:pointer;}
.agree-wrap.checked{border-color:var(--c-primary);background:#fff5f7;}
.agree-box{width:22px;height:22px;border-radius:6px;border:1.5px solid var(--c-border);display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1px;transition:all 0.15s;}
.agree-wrap.checked .agree-box{background:var(--c-primary);border-color:var(--c-primary);}
.agree-text{font-size:12px;color:var(--c-text2);line-height:1.6;}
.agree-text a{color:var(--c-primary);font-weight:600;text-decoration:none;}

/* SUBMIT */
.submit-wrap{padding:20px 20px 0;}
.submit-btn{width:100%;background:linear-gradient(180deg,var(--c-primary-lt) 0%,var(--c-primary-dark) 100%);border:none;border-radius:14px;padding:16px 20px;display:flex;align-items:center;justify-content:center;gap:10px;color:#fff;font-size:16px;font-weight:700;font-family:inherit;cursor:pointer;position:relative;overflow:hidden;box-shadow:0 1px 0 rgba(255,255,255,0.16) inset,0 -1px 0 rgba(0,0,0,0.2) inset,0 6px 24px rgba(123,21,51,0.45);transition:transform 0.12s;}
.submit-btn::after{content:'';position:absolute;top:0;left:0;right:0;height:50%;background:linear-gradient(180deg,rgba(255,255,255,0.12) 0%,transparent 100%);border-radius:14px 14px 0 0;pointer-events:none;}
.submit-btn:active{transform:scale(0.985);}
.submit-note{font-size:11px;color:var(--c-hint);text-align:center;margin-top:10px;line-height:1.6;padding:0 8px;}
.back-btn{width:32px;height:32px;border-radius:50%;background:rgba(255,255,255,0.15);border:none;display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0;}
.img-guide-text{font-size:12px;color:var(--c-hint);text-align:center;margin-bottom:12px;line-height:1.6;padding:0 4px;}`

const markup = `<div class="page">
<div class="scroll">

<!-- HEADER -->
<div class="header">
  <div class="header-r1">
    <button class="back-btn" onclick="history.back()" title="Kembali"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg></button>
    <img src="/icons/Logo-LOKALGO.png" alt="LokalGo" style="height:40px;width:auto;display:block;">
    <button class="sokong-btn">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
      Sokong Pembangun Anda
    </button>
  </div>
  <div class="header-sub"><span data-i18n="tagline">Platform perniagaan lokal setempat</span></div>
</div>

<!-- PAGE TITLE -->
<div class="page-title-wrap">
  <div class="page-title">Kedai digital anda hampir siap</div>
</div>

<!-- FORM -->
<div class="form-section">

  <!-- Upload Gambar -->
  <div>
    <div class="field-label">Gambar Profil Kedai</div>
    <div class="img-guide-text">Gunakan gambar square 1:1 untuk hasil terbaik. Cadangan minimum 800×800px. Elakkan screenshot kecil atau gambar terlalu rendah resolusi.</div>
    <input type="file" id="imgInput" accept="image/*,.heic,.heif" style="display:none;">
    <div class="upload-box" id="uploadBox" onclick="document.getElementById('imgInput').click()">
      <div class="upload-icon">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#aaa" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
      </div>
      <div class="upload-text">Muat naik Logo atau Gambar Kedai</div>
      <div class="upload-hint">JPG atau PNG • Maksimum 10MB</div>
    </div>
    <div class="img-preview-wrap" id="imgPreviewWrap" style="display:none;">
      <div class="img-preview-frame" id="imgPreviewFrame"></div>
      <div class="pos-btns">
        <button type="button" class="pos-btn" onclick="setImgPos(50,15)">Atas</button>
        <button type="button" class="pos-btn pos-btn-active" onclick="setImgPos(50,50)">Tengah</button>
        <button type="button" class="pos-btn" onclick="setImgPos(50,85)">Bawah</button>
      </div>
      <button type="button" class="btn-change-img" onclick="document.getElementById('imgInput').click()">Tukar gambar</button>
    </div>
    <div id="imgStatus" style="font-size:12px;color:#7B1533;font-weight:600;margin-top:8px;min-height:16px;text-align:center;"></div>
  </div>

  <!-- Penerangan -->
  <div>
    <div class="field-label">Penerangan Kedai</div>
    <textarea class="desc-input" placeholder="Ceritakan apa yang anda jual dikedai anda disini!"></textarea>
  </div>

  <!-- Kategori -->
  <div>
    <div class="field-label">Kategori Produk</div>
    <div class="cat-grid">
      <div class="cat-item" onclick="toggleCat(this)">
        <div class="cat-checkbox"></div>
        <span class="cat-name">Pastri &amp; Kek</span>
      </div>
      <div class="cat-item" onclick="toggleCat(this)">
        <div class="cat-checkbox"></div>
        <span class="cat-name">Set Makanan &amp; Lauk</span>
      </div>
      <div class="cat-item" onclick="toggleCat(this)">
        <div class="cat-checkbox"></div>
        <span class="cat-name">Frozen &amp; Simpanan</span>
      </div>
      <div class="cat-item" onclick="toggleCat(this)">
        <div class="cat-checkbox"></div>
        <span class="cat-name">Minuman</span>
      </div>
      <div class="cat-item" onclick="toggleCat(this)">
        <div class="cat-checkbox"></div>
        <span class="cat-name">Fresh &amp; Semulajadi</span>
      </div>
      <div class="cat-item cat-full" onclick="toggleCat(this)">
        <div class="cat-checkbox"></div>
        <span class="cat-name">Snek</span>
      </div>
    </div>
  </div>

  <!-- Agree -->
  <div class="agree-wrap" id="agreeWrap" onclick="toggleAgree()">
    <div class="agree-box" id="agreeBox"></div>
    <div class="agree-text">
      Saya bersetuju dengan <a href="/tnc" target="_blank" rel="noopener noreferrer" onclick="event.stopPropagation()">Terma &amp; Syarat Penjual</a> dan <a href="/privacy" target="_blank" rel="noopener noreferrer" onclick="event.stopPropagation()">Dasar Privasi</a>. Saya faham bahawa kedai saya akan disemak oleh admin sebelum diaktifkan.
    </div>
  </div>

</div>

<!-- SUBMIT -->
<div class="submit-wrap">
  <button class="submit-btn" onclick="window.__submitSellerOnboarding()">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
    Hantar permohonan
  </button>
  <div class="submit-note">Admin akan menghubungi anda dalam masa 24 jam melalui WhatsApp untuk sesi video call 5 minit.</div>
</div>

</div>
</div>`

const scripts: string[] = [`
var imgPosX = 50, imgPosY = 50;

function setImgPos(x, y) {
  imgPosX = x; imgPosY = y;
  var frame = document.getElementById('imgPreviewFrame');
  if (frame) frame.style.backgroundPosition = x + '% ' + y + '%';
  var btns = document.querySelectorAll('.pos-btn');
  btns.forEach(function(b) { b.classList.remove('pos-btn-active'); });
  if (y <= 25) { if (btns[0]) btns[0].classList.add('pos-btn-active'); }
  else if (y >= 75) { if (btns[2]) btns[2].classList.add('pos-btn-active'); }
  else { if (btns[1]) btns[1].classList.add('pos-btn-active'); }
}

function toggleCat(el) {
  var selected = document.querySelectorAll('.cat-item.selected').length;
  if (el.classList.contains('selected')) {
    el.classList.remove('selected');
    el.querySelector('.cat-checkbox').innerHTML = '';
  } else {
    if (selected >= 5) { alert('Maksimum 5 kategori sahaja.'); return; }
    el.classList.add('selected');
    el.querySelector('.cat-checkbox').innerHTML = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';
  }
}

function toggleAgree() {
  var wrap = document.getElementById('agreeWrap');
  var box = document.getElementById('agreeBox');
  wrap.classList.toggle('checked');
  box.innerHTML = wrap.classList.contains('checked')
    ? '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>'
    : '';
}
`]
const externalScripts: string[] = []
const externalStylesheets: string[] = []

export default function Page() {
  useEffect(() => {
    let authCancelled = false
    let profileImageUrl: string | null = null
    const supabase = createClient()

    function showImgStatus(msg: string | null) {
      const el = document.querySelector<HTMLElement>('#imgStatus')
      if (el) el.textContent = msg ?? ''
    }

    async function handleImageFile(file: File) {
      if (!ALLOWED_TYPES.includes(file.type.toLowerCase())) {
        showImgStatus('Format gambar tidak disokong. Sila tukar ke JPG.')
        return
      }
      if (file.size > MAX_RAW_BYTES) {
        showImgStatus('Gambar terlalu besar (max 10MB)')
        return
      }

      // Show preview immediately; check dimensions for quality warning (non-blocking)
      const reader = new FileReader()
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string
        if (!dataUrl) return
        ;(window as OnboardingWindow).__showImagePreview?.(dataUrl)
        const img = new window.Image()
        img.onload = () => {
          if (img.naturalWidth > 0 && (img.naturalWidth < 600 || img.naturalHeight < 600)) {
            showImgStatus('⚠️ Gambar ini mungkin kelihatan pecah. Untuk hasil terbaik, gunakan gambar sekurang-kurangnya 800×800px.')
          }
        }
        img.src = dataUrl
      }
      reader.readAsDataURL(file)

      showImgStatus('Memampatkan gambar...')

      let compressed: File
      try {
        compressed = await compressImage(file, 'shop_profile')
      } catch {
        showImgStatus('Format gambar tidak disokong. Sila tukar ke JPG.')
        return
      }

      showImgStatus('Memuat naik...')

      try {
        const { data: { session } } = await supabase.auth.getSession()
        const token = session?.access_token
        if (!token) { showImgStatus('Sila log masuk semula.'); return }

        const form = new FormData()
        form.append('file', compressed)

        const res = await fetch('/api/seller/profile-image', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: form,
        })
        const json = await res.json() as { url?: string; error?: string }

        if (!res.ok) {
          showImgStatus(`Gagal memuat naik: ${json.error ?? 'Sila cuba semula'}`)
          return
        }

        profileImageUrl = json.url ?? null
        showImgStatus('✓ Gambar berjaya dimuat naik')
      } catch (e) {
        showImgStatus('Gagal memuat naik. Periksa sambungan internet anda.')
        console.error(e)
      }
    }

    // Set window helpers — called from TypeScript, cleaned up on unmount
    ;(window as OnboardingWindow).__handleImageFile = handleImageFile
    ;(window as OnboardingWindow).__showImagePreview = (dataUrl: string) => {
      const box = document.querySelector<HTMLElement>('#uploadBox')
      const wrap = document.querySelector<HTMLElement>('#imgPreviewWrap')
      const frame = document.querySelector<HTMLElement>('#imgPreviewFrame')
      if (box) box.style.display = 'none'
      if (wrap) wrap.style.display = ''
      if (frame) frame.style.backgroundImage = `url("${dataUrl}")`
    }
    ;(window as OnboardingWindow).__getImgPos = () => {
      const w = window as Window & { imgPosX?: number; imgPosY?: number }
      return { x: w.imgPosX ?? 50, y: w.imgPosY ?? 50 }
    }

    const fileInput = document.querySelector<HTMLInputElement>('#imgInput')
    function onFileChange() {
      const file = fileInput?.files?.[0]
      if (file) void handleImageFile(file)
    }
    fileInput?.addEventListener('change', onFileChange)

    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser()
      if (authCancelled) return
      if (!user) { window.location.href = '/auth?next=/onboarding/step2'; return }
      const { data: seller } = await supabase
        .from('sellers').select('id').eq('user_id', user.id).maybeSingle()
      if (authCancelled) return
      if (seller) { window.location.href = '/seller/dashboard' }
    }

    checkAuth().catch(console.error)

    ;(window as OnboardingWindow).__submitSellerOnboarding = async () => {
      const submitButton = document.querySelector<HTMLButtonElement>('.submit-btn')
      const saved = localStorage.getItem('lokalgo_seller_onboarding')
      const baseData = saved ? JSON.parse(saved) as Record<string, string> : {}
      const description = document.querySelector<HTMLTextAreaElement>('.desc-input')?.value.trim() || ''
      const categories = Array.from(document.querySelectorAll<HTMLElement>('.cat-item.selected .cat-name'))
        .map((item) => item.textContent?.trim())
        .filter(Boolean)
      const accepted = document.getElementById('agreeWrap')?.classList.contains('checked')

      if (!accepted) {
        alert('Sila setuju dengan Terma & Syarat Penjual dahulu.')
        return
      }

      if (!baseData.shop_name || !baseData.taman_name || !baseData.whatsapp_number) {
        alert('Maklumat kedai belum lengkap. Sila kembali ke langkah sebelumnya.')
        window.location.href = '/onboarding/step1'
        return
      }

      submitButton?.setAttribute('disabled', 'true')
      if (submitButton) submitButton.textContent = 'Menghantar...'

      const { data: { session } } = await supabase.auth.getSession()
      const accessToken = session?.access_token

      if (!accessToken) {
        localStorage.setItem('lokalgo_after_login', '/onboarding/step2')
        window.location.href = '/auth?next=/onboarding/step2'
        return
      }

      const imgPos = (window as OnboardingWindow).__getImgPos?.() ?? { x: 50, y: 50 }

      const response = await fetch('/api/seller/onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          shop_name: baseData.shop_name,
          whatsapp_number: baseData.whatsapp_number,
          taman_name: baseData.taman_name,
          postcode: baseData.postcode || '00000',
          kawasan: baseData.kawasan || baseData.taman_name,
          business_type: baseData.business_type || 'FOOD',
          latitude: baseData.latitude ? parseFloat(baseData.latitude) : undefined,
          longitude: baseData.longitude ? parseFloat(baseData.longitude) : undefined,
          profile_image_url: profileImageUrl,
          profile_image_position_x: imgPos.x,
          profile_image_position_y: imgPos.y,
        }),
      })
      const result = await response.json() as { error?: string; sellerId?: string }

      if (response.status === 401) {
        localStorage.setItem('lokalgo_after_login', '/onboarding/step2')
        window.location.href = '/auth?next=/onboarding/step2'
        return
      }

      if (!response.ok) {
        console.error(result.error)
        alert(`Permohonan tidak dapat dihantar: ${result.error || 'Sila cuba semula.'}`)
        submitButton?.removeAttribute('disabled')
        if (submitButton) submitButton.textContent = 'Hantar permohonan'
        return
      }

      localStorage.setItem('lokalgo_seller_onboarding_extra', JSON.stringify({ description, categories, seller_id: result.sellerId }))
      localStorage.setItem('lokalgo_seller_onboarding_success', 'true')
      window.location.href = `/onboarding/step3?seller=${encodeURIComponent(result.sellerId || '')}&success=1`
    }

    return () => {
      authCancelled = true
      fileInput?.removeEventListener('change', onFileChange)
      delete (window as OnboardingWindow).__submitSellerOnboarding
      delete (window as OnboardingWindow).__handleImageFile
      delete (window as OnboardingWindow).__showImagePreview
      delete (window as OnboardingWindow).__getImgPos
    }
  }, [])

  return (
    <HtmlPrototypePage
      styles={styles}
      markup={markup}
      scripts={scripts}
      externalScripts={externalScripts}
      externalStylesheets={externalStylesheets}
    />
  )
}
