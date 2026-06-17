'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { HtmlPrototypePage } from '@/components/shared/HtmlPrototypePage'
import { compressImage } from '@/lib/compressImage'

// --- Client-side MIME pre-filter ---
// 'image/jpg' is a common Android variant of 'image/jpeg'.
// Empty string and 'application/octet-stream' are allowed through so the server's
// magic-bytes check makes the authoritative type decision.
const ALLOWED_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
]
const MAX_RAW_BYTES = 10 * 1024 * 1024

type UploadState = 'idle' | 'uploading' | 'success' | 'failed'

type OnboardingWindow = Window & {
  __submitSellerOnboarding?: () => void
  __handleImageFile?: (file: File) => Promise<void>
  __showImagePreview?: (dataUrl: string) => void
  __getImgPos?: () => { x: number; y: number }
  __triggerImageUpload?: () => void
  __resetImagePos?: () => void
}

const styles = `:root{--c-primary:#7B1533;--c-primary-dark:#6A1029;--c-primary-lt:#8f1a3a;--c-accent:#ADD036;--c-bg:#F5F5F5;--c-surface:#FFFFFF;--c-border:#E5E5EA;--c-text:#111111;--c-text2:#555555;--c-text3:#888888;--c-hint:#BBBBBB;}
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;-webkit-font-smoothing:antialiased;}
body{background:#0a0a0a;min-height:100vh;font-family:'Plus Jakarta Sans',-apple-system,sans-serif;font-size:14px;color:var(--c-text);}
.page{width:100%;max-width:430px;margin:0 auto;min-height:100vh;background:var(--c-bg);overflow:hidden;}
@media(min-width:500px){body{padding:40px 20px;display:flex;justify-content:center;align-items:flex-start;}.page{min-height:auto;border-radius:36px;border:8px solid #1a1a1a;box-shadow:0 32px 80px rgba(0,0,0,0.7);}.scroll{height:812px;}}
@media(min-width:1024px){body{align-items:center;padding:40px;min-height:100vh;}}
.scroll{height:100dvh;overflow-y:auto;overscroll-behavior-y:contain;-webkit-overflow-scrolling:touch;padding-bottom:env(safe-area-inset-bottom,32px);}.scroll::-webkit-scrollbar{display:none;}

/* HEADER */
.header{background:var(--c-primary);padding:calc(env(safe-area-inset-top,0px) + 14px) 20px 12px;}
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
.img-preview-frame{width:100%;height:150px;background-size:cover;background-position:50% 50%;background-color:#f0f0f0;cursor:grab;user-select:none;touch-action:none;position:relative;}
.img-preview-frame:active{cursor:grabbing;}
.drag-hint{position:absolute;bottom:8px;left:50%;transform:translateX(-50%);background:rgba(0,0,0,0.5);color:#fff;font-size:10px;font-weight:600;padding:4px 10px;border-radius:10px;pointer-events:none;white-space:nowrap;}
.img-helper{font-size:11px;color:var(--c-hint);text-align:center;padding:8px 12px;background:#f9f9f9;border-top:1px solid #eee;line-height:1.5;}
.preview-actions{display:flex;border-top:1px solid #eee;}
.btn-change-img{flex:1;border:none;background:var(--c-primary);color:#fff;font-size:13px;font-weight:600;font-family:inherit;padding:12px;cursor:pointer;min-height:44px;}
.btn-reset-pos{width:110px;flex-shrink:0;border:none;border-left:1px solid rgba(255,255,255,0.2);background:#666;color:#fff;font-size:12px;font-weight:600;font-family:inherit;padding:12px 8px;cursor:pointer;min-height:44px;}

/* DESCRIPTION */
.desc-input{width:100%;border:1.5px solid var(--c-border);border-radius:10px;padding:12px 14px;font-size:14px;color:var(--c-text);outline:none;background:#fff;font-family:inherit;resize:none;height:90px;line-height:1.6;transition:border 0.2s;}
.desc-input:focus{border-color:var(--c-primary);}
.desc-input::placeholder{color:var(--c-hint);}

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
.back-btn{width:44px;height:44px;border-radius:50%;background:rgba(255,255,255,0.15);border:none;display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0;}
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
    <div class="upload-box" id="uploadBox" onclick="window.__triggerImageUpload && window.__triggerImageUpload()">
      <div class="upload-icon">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#aaa" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
      </div>
      <div class="upload-text">Muat naik Logo atau Gambar Kedai</div>
      <div class="upload-hint">JPG atau PNG • Maksimum 10MB</div>
    </div>
    <div class="img-preview-wrap" id="imgPreviewWrap" style="display:none;">
      <div class="img-preview-frame" id="imgPreviewFrame">
        <div class="drag-hint">Drag untuk laras posisi</div>
      </div>
      <div class="img-helper">Drag gambar untuk pilih bahagian yang mahu dipaparkan. Gambar ini akan digunakan di Home dan halaman kedai anda.</div>
      <div class="preview-actions">
        <button type="button" class="btn-change-img" onclick="window.__triggerImageUpload && window.__triggerImageUpload()">Tukar Gambar</button>
        <button type="button" class="btn-reset-pos" onclick="window.__resetImagePos && window.__resetImagePos()">Reset Posisi</button>
      </div>
    </div>
    <div id="imgStatus" style="font-size:12px;font-weight:600;margin-top:8px;text-align:center;border-radius:8px;min-height:0;"></div>
  </div>

  <!-- Penerangan -->
  <div>
    <div class="field-label">Penerangan Kedai</div>
    <textarea class="desc-input" placeholder="Ceritakan apa yang anda jual dikedai anda disini!"></textarea>
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
  <div class="submit-note">Admin akan menyemak permohonan anda dalam masa 3-5 hari bekerja.</div>
</div>

</div>
</div>`

// Only toggleAgree remains as vanilla JS — position tracking moved to TypeScript useEffect
const scripts: string[] = [`
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
    let uploadState: UploadState = 'idle'
    let posX = 50
    let posY = 50
    let isDragging = false
    let dragStartClientX = 0
    let dragStartClientY = 0
    let dragStartPosX = 50
    let dragStartPosY = 50

    const supabase = createClient()
    const previewFrame = document.querySelector<HTMLElement>('#imgPreviewFrame')

    function applyPosition() {
      if (previewFrame) previewFrame.style.backgroundPosition = `${posX}% ${posY}%`
    }

    function showImgStatus(msg: string | null, state: UploadState = 'idle') {
      const el = document.querySelector<HTMLElement>('#imgStatus')
      if (!el) return
      el.textContent = msg ?? ''
      if (!msg) {
        el.style.cssText = 'font-size:12px;font-weight:600;margin-top:8px;text-align:center;border-radius:8px;min-height:0;'
        return
      }
      if (state === 'success') {
        el.style.cssText = 'font-size:12px;font-weight:600;margin-top:8px;text-align:center;border-radius:8px;padding:10px 12px;color:#3B6D11;background:#EAF3DE;border:1px solid #C5E1A5;'
      } else if (state === 'failed') {
        el.style.cssText = 'font-size:12px;font-weight:600;margin-top:8px;text-align:center;border-radius:8px;padding:10px 12px;color:#A32D2D;background:#FFF0F3;border:1px solid #F3C4D2;'
      } else if (state === 'uploading') {
        el.style.cssText = 'font-size:12px;font-weight:600;margin-top:8px;text-align:center;border-radius:8px;padding:10px 12px;color:#7B1533;background:#FFF8F9;border:1px solid #F3C4D2;'
      } else {
        el.style.cssText = 'font-size:12px;font-weight:600;margin-top:8px;text-align:center;border-radius:8px;min-height:0;'
      }
    }

    async function handleImageFile(file: File) {
      // MIME pre-filter: accept known image MIME types, Android variants (image/jpg),
      // and ambiguous types (octet-stream, blank) — server magic bytes is authoritative
      const mime = file.type.toLowerCase()
      const mimeOk =
        mime === '' ||
        mime === 'application/octet-stream' ||
        ALLOWED_TYPES.includes(mime)

      if (!mimeOk) {
        showImgStatus('⚠️ Format gambar tidak disokong. Sila gunakan JPG, PNG, atau WebP.', 'failed')
        return
      }

      if (file.size > MAX_RAW_BYTES) {
        showImgStatus('⚠️ Gambar terlalu besar (maksimum 10MB)', 'failed')
        return
      }

      // Reset upload state when new file is chosen
      profileImageUrl = null
      uploadState = 'uploading'

      // Show preview immediately from local file (non-blocking)
      const reader = new FileReader()
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string
        if (!dataUrl) return
        ;(window as OnboardingWindow).__showImagePreview?.(dataUrl)
        // Quality warning — only shown if still uploading (not failed/success yet)
        const img = new window.Image()
        img.onload = () => {
          if (img.naturalWidth > 0 && (img.naturalWidth < 600 || img.naturalHeight < 600)) {
            if (uploadState === 'uploading') {
              showImgStatus('⚠️ Gambar ini mungkin kelihatan pecah. Untuk hasil terbaik, gunakan gambar sekurang-kurangnya 800×800px.', 'uploading')
            }
          }
        }
        img.src = dataUrl
      }
      reader.readAsDataURL(file)

      showImgStatus('Memampatkan gambar...', 'uploading')

      let compressed: File
      try {
        // HEIC/HEIF: pass through — browser-image-compression cannot decode HEIC outside Safari
        compressed = (mime === 'image/heic' || mime === 'image/heif')
          ? file
          : await compressImage(file, 'shop_profile')
      } catch {
        uploadState = 'failed'
        showImgStatus('⚠️ Format gambar tidak dapat diproses. Sila tukar ke JPG atau PNG.', 'failed')
        return
      }

      showImgStatus('Memuat naik gambar...', 'uploading')

      try {
        const { data: { session } } = await supabase.auth.getSession()
        const token = session?.access_token
        if (!token) {
          uploadState = 'failed'
          showImgStatus('⚠️ Sesi tamat. Sila muat semula halaman ini.', 'failed')
          return
        }

        const form = new FormData()
        form.append('file', compressed)

        const res = await fetch('/api/seller/profile-image', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: form,
        })
        const json = await res.json() as { url?: string; error?: string }

        if (!res.ok) {
          uploadState = 'failed'
          showImgStatus(`⚠️ Gagal memuat naik: ${json.error ?? 'Sila cuba semula'}`, 'failed')
          return
        }

        profileImageUrl = json.url ?? null
        uploadState = 'success'
        showImgStatus('✓ Gambar berjaya dimuat naik', 'success')
      } catch (e) {
        uploadState = 'failed'
        showImgStatus('⚠️ Gagal memuat naik. Periksa sambungan internet anda.', 'failed')
        console.error(e)
      }
    }

    // ── Window helpers ───────────────────────────────────────────────────
    ;(window as OnboardingWindow).__handleImageFile = handleImageFile

    ;(window as OnboardingWindow).__showImagePreview = (dataUrl: string) => {
      const box = document.querySelector<HTMLElement>('#uploadBox')
      const wrap = document.querySelector<HTMLElement>('#imgPreviewWrap')
      const frame = document.querySelector<HTMLElement>('#imgPreviewFrame')
      if (box) box.style.display = 'none'
      if (wrap) wrap.style.display = ''
      if (frame) frame.style.backgroundImage = `url("${dataUrl}")`
    }

    ;(window as OnboardingWindow).__getImgPos = () => ({ x: posX, y: posY })

    // Triggers file picker after resetting value — allows re-selecting the same file
    ;(window as OnboardingWindow).__triggerImageUpload = () => {
      const fi = document.querySelector<HTMLInputElement>('#imgInput')
      if (fi) {
        fi.value = ''
        fi.click()
      }
    }

    ;(window as OnboardingWindow).__resetImagePos = () => {
      posX = 50
      posY = 50
      applyPosition()
    }

    // ── File input change handler ────────────────────────────────────────
    const fileInput = document.querySelector<HTMLInputElement>('#imgInput')
    function onFileChange() {
      const file = fileInput?.files?.[0]
      if (file) void handleImageFile(file)
    }
    fileInput?.addEventListener('change', onFileChange)

    // ── Drag-to-reposition (PointerEvent — works on touch + mouse) ──────
    function onPointerDown(e: PointerEvent) {
      isDragging = true
      dragStartClientX = e.clientX
      dragStartClientY = e.clientY
      dragStartPosX = posX
      dragStartPosY = posY
      ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    }

    function onPointerMove(e: PointerEvent) {
      if (!isDragging || !previewFrame) return
      const rect = previewFrame.getBoundingClientRect()
      const dx = e.clientX - dragStartClientX
      const dy = e.clientY - dragStartClientY
      // Drag right → reveal left content → decrease posX; same logic as seller/edit
      posX = Math.min(100, Math.max(0, dragStartPosX - (dx / rect.width) * 100))
      posY = Math.min(100, Math.max(0, dragStartPosY - (dy / rect.height) * 100))
      applyPosition()
      e.preventDefault()
    }

    function onPointerUp() {
      isDragging = false
    }

    previewFrame?.addEventListener('pointerdown', onPointerDown)
    previewFrame?.addEventListener('pointermove', onPointerMove, { passive: false })
    previewFrame?.addEventListener('pointerup', onPointerUp)
    previewFrame?.addEventListener('pointercancel', onPointerUp)

    // ── Auth check ───────────────────────────────────────────────────────
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

    // ── Final submit ─────────────────────────────────────────────────────
    ;(window as OnboardingWindow).__submitSellerOnboarding = async () => {
      const submitButton = document.querySelector<HTMLButtonElement>('.submit-btn')

      // Block if upload is still in progress
      if (uploadState === 'uploading') {
        alert('Tunggu gambar selesai dimuat naik.')
        return
      }

      // Block if seller selected an image but upload failed — do not silently submit null URL
      if (uploadState === 'failed') {
        showImgStatus('⚠️ Gambar belum berjaya dimuat naik. Sila tukar gambar atau cuba semula.', 'failed')
        document.querySelector<HTMLElement>('#imgStatus')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
        return
      }

      const saved = localStorage.getItem('lokalgo_seller_onboarding')
      const baseData = saved ? JSON.parse(saved) as Record<string, string> : {}
      const description = document.querySelector<HTMLTextAreaElement>('.desc-input')?.value.trim() || ''
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
          profile_image_position_x: posX,
          profile_image_position_y: posY,
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

      localStorage.setItem('lokalgo_seller_onboarding_extra', JSON.stringify({ description, seller_id: result.sellerId }))
      localStorage.setItem('lokalgo_seller_onboarding_success', 'true')
      window.location.href = `/onboarding/step3?seller=${encodeURIComponent(result.sellerId || '')}&success=1`
    }

    return () => {
      authCancelled = true
      fileInput?.removeEventListener('change', onFileChange)
      previewFrame?.removeEventListener('pointerdown', onPointerDown)
      previewFrame?.removeEventListener('pointermove', onPointerMove)
      previewFrame?.removeEventListener('pointerup', onPointerUp)
      previewFrame?.removeEventListener('pointercancel', onPointerUp)
      delete (window as OnboardingWindow).__submitSellerOnboarding
      delete (window as OnboardingWindow).__handleImageFile
      delete (window as OnboardingWindow).__showImagePreview
      delete (window as OnboardingWindow).__getImgPos
      delete (window as OnboardingWindow).__triggerImageUpload
      delete (window as OnboardingWindow).__resetImagePos
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
