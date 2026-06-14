'use client'

import { useEffect } from 'react'
import { HtmlPrototypePage } from '@/components/shared/HtmlPrototypePage'
import { createClient } from '@/lib/supabase/client'
import { compressImage } from '@/lib/compressImage'
import type { Seller } from '@/types/database'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
const MAX_RAW_BYTES = 10 * 1024 * 1024

type EditWindow = Window & {
  saveChanges?: () => Promise<void>
  setPickupInstruction?: (value: string) => void
}

const styles = `:root{--c-primary:#7B1533;--c-primary-dark:#6A1029;--c-primary-lt:#8f1a3a;--c-accent:#ADD036;--c-bg:#F5F5F5;--c-surface:#FFFFFF;--c-border:#E5E5EA;--c-text:#111111;--c-text2:#555555;--c-text3:#888888;--c-hint:#BBBBBB;}
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;-webkit-font-smoothing:antialiased;}
body{background:#0a0a0a;min-height:100vh;font-family:'Plus Jakarta Sans',-apple-system,sans-serif;font-size:14px;color:var(--c-text);}
.page{width:100%;max-width:430px;margin:0 auto;min-height:100vh;background:var(--c-bg);overflow:hidden;}
@media(min-width:500px){body{padding:40px 20px;display:flex;justify-content:center;align-items:flex-start;}.page{min-height:auto;border-radius:36px;border:8px solid #1a1a1a;box-shadow:0 32px 80px rgba(0,0,0,0.7);}}
@media(min-width:1024px){body{align-items:center;padding:40px;min-height:100vh;}}
.scroll{height:812px;overflow-y:auto;padding-bottom:40px;}.scroll::-webkit-scrollbar{display:none;}

.header{background:var(--c-primary);padding:14px 20px 14px;}
.header-r1{display:flex;align-items:center;gap:12px;}
.back-btn{width:32px;height:32px;border-radius:50%;background:rgba(255,255,255,0.15);border:none;display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0;}
.header-title{font-size:17px;font-weight:700;color:#fff;flex:1;}

.form-wrap{padding:16px 20px;display:flex;flex-direction:column;gap:14px;}
.section-card{background:#fff;border-radius:14px;padding:16px;border:1px solid #eee;}
.section-lbl{font-size:11px;font-weight:700;color:var(--c-primary);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:12px;}
.field{margin-bottom:12px;}
.field:last-child{margin-bottom:0;}
.field-lbl{font-size:12px;font-weight:600;color:var(--c-text2);margin-bottom:6px;}
.field-input{width:100%;border:1.5px solid var(--c-border);border-radius:10px;padding:11px 13px;font-size:14px;color:var(--c-text);outline:none;background:#fafafa;font-family:inherit;transition:border 0.2s;}
.field-input:focus{border-color:var(--c-primary);background:#fff;}
.field-input::placeholder{color:var(--c-hint);}
textarea.field-input{resize:none;height:80px;line-height:1.6;}
.pickup-tools{display:flex;gap:6px;flex-wrap:wrap;margin-top:8px;}.pickup-chip{border:1px solid #E5E5EA;background:#fff;border-radius:999px;padding:6px 10px;font-size:11px;font-weight:600;color:#555;font-family:inherit;cursor:pointer;}.pickup-meta{display:flex;justify-content:space-between;align-items:center;margin-top:6px;font-size:10px;color:#888;}.pickup-save-state{color:#3B6D11;font-weight:600;}

/* PROFILE PHOTO */
.photo-frame{width:100%;height:150px;border-radius:12px;background-size:cover;background-position:50% 50%;cursor:grab;user-select:none;touch-action:none;position:relative;background-color:#eee;}
.photo-frame:active{cursor:grabbing;}
.drag-hint{position:absolute;bottom:8px;left:50%;transform:translateX(-50%);background:rgba(0,0,0,0.5);color:#fff;font-size:10px;font-weight:600;padding:4px 10px;border-radius:10px;pointer-events:none;white-space:nowrap;}
.photo-placeholder{width:100%;height:150px;border-radius:12px;background:#f5f5f5;border:2px dashed var(--c-border);display:flex;align-items:center;justify-content:center;color:#ccc;}
.photo-actions{display:flex;gap:8px;margin-top:10px;}
.btn-change{flex:1;background:var(--c-primary);border:none;border-radius:8px;padding:11px 14px;color:#fff;font-size:12px;font-weight:600;font-family:inherit;cursor:pointer;min-height:44px;}
.btn-remove{flex:1;background:#f5f5f5;border:none;border-radius:8px;padding:11px 14px;color:#888;font-size:12px;font-weight:500;font-family:inherit;cursor:pointer;min-height:44px;}

/* APPROVAL NOTE */
.approval-note{background:#FFF3E0;border:1px solid #FFE0B2;border-radius:10px;padding:10px 12px;display:flex;gap:8px;align-items:flex-start;}
.approval-text{font-size:11px;color:#856404;line-height:1.6;}

/* INSTANT NOTE */
.instant-note{background:#EAF3DE;border:1px solid #C5E1A5;border-radius:10px;padding:10px 12px;display:flex;gap:8px;align-items:flex-start;}
.instant-text{font-size:11px;color:#3B6D11;line-height:1.6;}

/* SAVE BTN */
.save-btn{width:100%;background:linear-gradient(180deg,var(--c-primary-lt) 0%,var(--c-primary-dark) 100%);border:none;border-radius:14px;padding:16px;color:#fff;font-size:16px;font-weight:700;font-family:inherit;cursor:pointer;position:relative;overflow:hidden;box-shadow:0 1px 0 rgba(255,255,255,0.16) inset,0 6px 20px rgba(123,21,51,0.4);transition:transform 0.12s;}
.save-btn::after{content:'';position:absolute;top:0;left:0;right:0;height:50%;background:linear-gradient(180deg,rgba(255,255,255,0.12) 0%,transparent 100%);border-radius:14px 14px 0 0;pointer-events:none;}
.save-btn:active{transform:scale(0.985);}`

const markup = `<div class="page">
<div class="scroll">

<div class="header">
  <div class="header-r1">
    <button class="back-btn" onclick="history.back()"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg></button>
    <span class="header-title">Edit Kedai</span>
    <div style="width:32px;"></div>
  </div>
</div>

<div class="form-wrap">

  <!-- GAMBAR PROFIL -->
  <div class="section-card">
    <div class="section-lbl">Gambar Profil Kedai</div>
    <div class="photo-frame" id="photoFrame" style="display:none;">
      <div class="drag-hint">Seret untuk laras posisi</div>
    </div>
    <div class="photo-placeholder" id="photoPlaceholder">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ccc" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
    </div>
    <div id="photoStatus" style="font-size:12px;color:#7B1533;font-weight:600;margin-top:8px;min-height:16px;"></div>
    <div class="photo-actions">
      <button class="btn-change" onclick="document.getElementById('imgInput').click()">Tukar Gambar</button>
      <button class="btn-remove">Buang Gambar</button>
    </div>
    <input type="file" id="imgInput" accept="image/*" style="display:none;">
    <div style="margin-top:10px;">
      <div class="approval-note">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#F0A500" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;margin-top:1px;"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        <div class="approval-text">Gambar baru perlu diluluskan admin sebelum dipaparkan. Gambar semasa akan kekal sehingga diluluskan.</div>
      </div>
      <div style="font-size:12px;color:#888;margin-top:8px;line-height:1.6;">Cadangan gambar kedai: square 1:1, minimum 800×800px. Gambar resolusi rendah mungkin kelihatan pecah di Home.</div>
    </div>
  </div>

  <!-- INFO KEDAI — instant update -->
  <div class="section-card">
    <div class="section-lbl">Maklumat Kedai</div>
    <div class="instant-note" style="margin-bottom:12px;">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4A7C10" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;margin-top:1px;"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
      <div class="instant-text">Nama kedai dan penerangan akan dikemaskini serta-merta tanpa perlu kelulusan admin.</div>
    </div>
    <div class="field">
      <div class="field-lbl">Nama Kedai</div>
      <input class="field-input" type="text" value="Resepi Kak Mila">
    </div>
    <div class="field">
      <div class="field-lbl">Penerangan Kedai</div>
      <textarea class="field-input">Kuih-kuih tradisional &amp; kek untuk harijadi. Tempah sehari awal untuk tempahan secara pukal.</textarea>
    </div>
    <div class="field">
      <div class="field-lbl">Arahan Pickup / Titik Jumpa</div>
      <textarea id="pickupInstruction" class="field-input" maxlength="200" placeholder="cth: Self collect di Lobby A Blok 3"></textarea>
      <div class="pickup-tools">
        <button type="button" class="pickup-chip" onclick="setPickupInstruction('&#127968; Depan pintu')">&#127968; Depan pintu</button>
        <button type="button" class="pickup-chip" onclick="setPickupInstruction('&#127970; Lobby')">&#127970; Lobby</button>
        <button type="button" class="pickup-chip" onclick="setPickupInstruction('&#128757; Tepi jalan')">&#128757; Tepi jalan</button>
        <button type="button" class="pickup-chip" onclick="setPickupInstruction('&#128230; COD hantar')">&#128230; COD hantar</button>
      </div>
      <div class="pickup-meta"><span class="pickup-save-state">Disimpan automatik</span><span class="pickup-count">0/200</span></div>
    </div>
  </div>

  <!-- LOKASI — instant -->
  <div class="section-card">
    <div class="section-lbl">Lokasi</div>
    <div class="instant-note" style="margin-bottom:12px;">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4A7C10" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;margin-top:1px;"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
      <div class="instant-text">Lokasi dikemaskini serta-merta.</div>
    </div>
    <div class="field">
      <div class="field-lbl">Nama Taman</div>
      <input class="field-input" type="text" value="Taman Desa Baiduri">
    </div>
    <div class="field">
      <div class="field-lbl">Poskod</div>
      <input class="field-input" type="text" value="40150">
    </div>
  </div>

  <!-- PRODUK SECTION -->
  <div class="section-card">
    <div class="section-lbl">Produk &amp; Gambar Produk</div>
    <div class="approval-note">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#F0A500" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;margin-top:1px;"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      <div class="approval-text">Edit produk dan gambar produk baru perlu kelulusan admin. Urus produk melalui Dashboard &#8594; Produk Saya.</div>
    </div>
    <div style="margin-top:10px;">
      <button style="width:100%;background:#f5f5f5;border:none;border-radius:10px;padding:12px;color:var(--c-primary);font-size:13px;font-weight:600;font-family:inherit;cursor:pointer;" onclick="window.location.href='/seller/dashboard'">
        Pergi ke Dashboard &#8594;
      </button>
    </div>
  </div>

  <button class="save-btn" onclick="saveChanges()">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
    Simpan Perubahan
  </button>

</div>
</div>
</div>`

const scripts: string[] = ["function saveChanges() {\n  alert('✓ Perubahan telah disimpan.');\n  history.back();\n}"]
const externalScripts: string[] = []
const externalStylesheets: string[] = ["https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"]

export default function Page() {
  useEffect(() => {
    let currentSeller: Seller | null = null
    let profileImageUrl: string | null = null
    let posX = 50
    let posY = 50
    let isDragging = false
    let dragStartClientX = 0
    let dragStartClientY = 0
    let dragStartPosX = 50
    let dragStartPosY = 50

    const supabase = createClient()
    const fields = () => document.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('.field-input')
    const runtime = window as EditWindow
    let pickupSaveTimer: ReturnType<typeof setTimeout> | null = null

    const photoFrame = document.querySelector<HTMLElement>('#photoFrame')

    function applyPosition() {
      if (photoFrame) photoFrame.style.backgroundPosition = `${posX}% ${posY}%`
    }

    function renderPhoto(url: string | null) {
      const placeholder = document.querySelector<HTMLElement>('#photoPlaceholder')
      if (!photoFrame || !placeholder) return
      if (url) {
        photoFrame.style.backgroundImage = `url('${url}')`
        applyPosition()
        photoFrame.style.display = ''
        placeholder.style.display = 'none'
      } else {
        photoFrame.style.backgroundImage = ''
        photoFrame.style.display = 'none'
        placeholder.style.display = ''
      }
    }

    function showPhotoStatus(msg: string | null) {
      const el = document.querySelector<HTMLElement>('#photoStatus')
      if (el) el.textContent = msg ?? ''
    }

    function pickupInput() {
      return document.querySelector<HTMLTextAreaElement>('#pickupInstruction')
    }

    function updatePickupMeta(state = 'Disimpan automatik') {
      const input = pickupInput()
      const count = document.querySelector<HTMLElement>('.pickup-count')
      const status = document.querySelector<HTMLElement>('.pickup-save-state')
      if (count) count.textContent = `${input?.value.length ?? 0}/200`
      if (status) status.textContent = state
    }

    async function savePickupInstruction(value: string) {
      if (!currentSeller) return
      updatePickupMeta('Menyimpan...')
      const { error } = await supabase
        .from('sellers')
        .update({ pickup_instruction: value.trim() || null })
        .eq('id', currentSeller.id)
      updatePickupMeta(error ? 'Gagal disimpan' : 'Disimpan')
      if (error) console.error(error)
    }

    function queuePickupSave() {
      const value = pickupInput()?.value.slice(0, 200) ?? ''
      updatePickupMeta('Menyimpan...')
      if (pickupSaveTimer) clearTimeout(pickupSaveTimer)
      pickupSaveTimer = setTimeout(() => { void savePickupInstruction(value) }, 500)
    }

    async function loadSeller() {
      const { data: authData } = await supabase.auth.getUser()
      if (!authData.user) { window.location.href = '/auth'; return }

      const { data, error } = await supabase
        .from('sellers')
        .select('*')
        .eq('user_id', authData.user.id)
        .single()

      if (error) { console.error(error); alert('Rekod seller tidak ditemui.'); return }

      currentSeller = data as Seller
      profileImageUrl = currentSeller.profile_image_url
      posX = currentSeller.profile_image_position_x ?? 50
      posY = currentSeller.profile_image_position_y ?? 50

      const inputs = fields()
      if (inputs[0]) inputs[0].value = currentSeller.shop_name
      if (inputs[1]) inputs[1].value = `${currentSeller.shop_name} di ${currentSeller.taman_name}`
      if (inputs[2]) inputs[2].value = currentSeller.pickup_instruction ?? ''
      if (inputs[3]) inputs[3].value = currentSeller.taman_name
      if (inputs[4]) inputs[4].value = currentSeller.postcode
      renderPhoto(profileImageUrl)
      updatePickupMeta()
    }

    runtime.setPickupInstruction = (value: string) => {
      const input = pickupInput()
      if (!input) return
      input.value = value.slice(0, 200)
      queuePickupSave()
    }

    runtime.saveChanges = async () => {
      if (!currentSeller) { alert('Data seller belum dimuat.'); return }

      const inputs = fields()
      const shopName = inputs[0]?.value.trim()
      const pickupInstruction = inputs[2]?.value.trim() || null
      const tamanName = inputs[3]?.value.trim()
      const postcode = inputs[4]?.value.trim()

      if (!shopName || !tamanName || !postcode) {
        alert('Sila lengkapkan nama kedai, taman dan poskod.')
        return
      }

      const { error } = await supabase
        .from('sellers')
        .update({
          shop_name: shopName,
          taman_name: tamanName,
          kawasan: tamanName,
          postcode,
          profile_image_url: profileImageUrl,
          profile_image_position_x: posX,
          profile_image_position_y: posY,
          pickup_instruction: pickupInstruction,
        })
        .eq('id', currentSeller.id)

      if (error) { alert(error.message); return }

      alert('Perubahan telah disimpan.')
      window.location.href = '/seller/dashboard'
    }

    // ── Drag-to-reposition ───────────────────────────────────────────
    function onPointerDown(e: PointerEvent) {
      isDragging = true
      dragStartClientX = e.clientX
      dragStartClientY = e.clientY
      dragStartPosX = posX
      dragStartPosY = posY
      ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    }

    function onPointerMove(e: PointerEvent) {
      if (!isDragging || !photoFrame) return
      const rect = photoFrame.getBoundingClientRect()
      const dx = e.clientX - dragStartClientX
      const dy = e.clientY - dragStartClientY
      // Drag right = reveal left content = decrease posX
      posX = Math.min(100, Math.max(0, dragStartPosX - (dx / rect.width) * 100))
      posY = Math.min(100, Math.max(0, dragStartPosY - (dy / rect.height) * 100))
      applyPosition()
      e.preventDefault()
    }

    function onPointerUp() {
      isDragging = false
    }

    photoFrame?.addEventListener('pointerdown', onPointerDown)
    photoFrame?.addEventListener('pointermove', onPointerMove, { passive: false })
    photoFrame?.addEventListener('pointerup', onPointerUp)
    photoFrame?.addEventListener('pointercancel', onPointerUp)

    // ── Image upload ─────────────────────────────────────────────────
    const fileInput = document.querySelector<HTMLInputElement>('#imgInput')
    const removeButton = document.querySelector<HTMLButtonElement>('.btn-remove')
    const pickup = pickupInput()

    async function onImageChange() {
      const file = fileInput?.files?.[0]
      if (!file) return

      if (!ALLOWED_TYPES.includes(file.type.toLowerCase())) {
        showPhotoStatus('Format gambar tidak disokong. Sila tukar ke JPG.')
        if (fileInput) fileInput.value = ''
        return
      }
      if (file.size > MAX_RAW_BYTES) {
        showPhotoStatus('Gambar terlalu besar (max 10MB)')
        if (fileInput) fileInput.value = ''
        return
      }

      // Check image dimensions for quality warning (non-blocking)
      const dimReader = new FileReader()
      dimReader.onload = (e) => {
        const dataUrl = e.target?.result as string
        if (!dataUrl) return
        const img = new window.Image()
        img.onload = () => {
          if (img.naturalWidth > 0 && (img.naturalWidth < 600 || img.naturalHeight < 600)) {
            showPhotoStatus('⚠️ Gambar ini mungkin kelihatan pecah. Untuk hasil terbaik, gunakan gambar sekurang-kurangnya 800×800px.')
          }
        }
        img.src = dataUrl
      }
      dimReader.readAsDataURL(file)

      showPhotoStatus('Memampatkan gambar...')

      let compressed: File
      try {
        compressed = await compressImage(file, 'shop_profile')
      } catch {
        showPhotoStatus('Format gambar tidak disokong. Sila tukar ke JPG.')
        if (fileInput) fileInput.value = ''
        return
      }

      showPhotoStatus('Memuat naik...')

      try {
        const { data: { session } } = await supabase.auth.getSession()
        const token = session?.access_token
        if (!token) { showPhotoStatus('Sila log masuk semula.'); return }

        const form = new FormData()
        form.append('file', compressed)

        const res = await fetch('/api/seller/profile-image', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: form,
        })
        const json = await res.json() as { url?: string; error?: string }

        if (!res.ok) {
          showPhotoStatus(`Gagal memuat naik: ${json.error ?? 'Sila cuba semula'}`)
          return
        }

        profileImageUrl = json.url ?? null
        renderPhoto(profileImageUrl)
        showPhotoStatus(null)
      } catch (e) {
        showPhotoStatus('Gagal memuat naik. Periksa sambungan internet anda.')
        console.error(e)
      }
    }

    function removeImage() {
      profileImageUrl = null
      posX = 50
      posY = 50
      renderPhoto(null)
      showPhotoStatus(null)
    }

    fileInput?.addEventListener('change', onImageChange)
    removeButton?.addEventListener('click', removeImage)
    pickup?.addEventListener('input', queuePickupSave)
    loadSeller().catch(console.error)

    return () => {
      if (pickupSaveTimer) clearTimeout(pickupSaveTimer)
      photoFrame?.removeEventListener('pointerdown', onPointerDown)
      photoFrame?.removeEventListener('pointermove', onPointerMove)
      photoFrame?.removeEventListener('pointerup', onPointerUp)
      photoFrame?.removeEventListener('pointercancel', onPointerUp)
      fileInput?.removeEventListener('change', onImageChange)
      removeButton?.removeEventListener('click', removeImage)
      pickup?.removeEventListener('input', queuePickupSave)
      delete runtime.saveChanges
      delete runtime.setPickupInstruction
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
