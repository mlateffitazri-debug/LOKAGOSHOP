'use client'

import { useEffect } from 'react'
import { HtmlPrototypePage } from '@/components/shared/HtmlPrototypePage'
import { createClient } from '@/lib/supabase/client'
import { compressImage } from '@/lib/compressImage'
import type { Seller } from '@/types/database'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
const MAX_RAW_BYTES = 10 * 1024 * 1024 // 10 MB pre-compression limit

type EditWindow = Window & {
  saveChanges?: () => Promise<void>
  setPickupInstruction?: (value: string) => void
}


const styles = ":root{--c-primary:#7B1533;--c-primary-dark:#6A1029;--c-primary-lt:#8f1a3a;--c-accent:#ADD036;--c-bg:#F5F5F5;--c-surface:#FFFFFF;--c-border:#E5E5EA;--c-text:#111111;--c-text2:#555555;--c-text3:#888888;--c-hint:#BBBBBB;}\n*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;-webkit-font-smoothing:antialiased;}\nbody{background:#0a0a0a;min-height:100vh;font-family:\u0027Plus Jakarta Sans\u0027,-apple-system,sans-serif;font-size:14px;color:var(--c-text);}\n.page{width:100%;max-width:430px;margin:0 auto;min-height:100vh;background:var(--c-bg);overflow:hidden;}\n@media(min-width:500px){body{padding:40px 20px;display:flex;justify-content:center;align-items:flex-start;}.page{min-height:auto;border-radius:36px;border:8px solid #1a1a1a;box-shadow:0 32px 80px rgba(0,0,0,0.7);}}\n@media(min-width:1024px){body{align-items:center;padding:40px;min-height:100vh;}}\n.scroll{height:812px;overflow-y:auto;padding-bottom:40px;}.scroll::-webkit-scrollbar{display:none;}\n\n.header{background:var(--c-primary);padding:14px 20px 14px;}\n.header-r1{display:flex;align-items:center;gap:12px;}\n.back-btn{width:32px;height:32px;border-radius:50%;background:rgba(255,255,255,0.15);border:none;display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0;}\n.header-title{font-size:17px;font-weight:700;color:#fff;flex:1;}\n\n.form-wrap{padding:16px 20px;display:flex;flex-direction:column;gap:14px;}\n.section-card{background:#fff;border-radius:14px;padding:16px;border:1px solid #eee;}\n.section-lbl{font-size:11px;font-weight:700;color:var(--c-primary);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:12px;}\n.field{margin-bottom:12px;}\n.field:last-child{margin-bottom:0;}\n.field-lbl{font-size:12px;font-weight:600;color:var(--c-text2);margin-bottom:6px;}\n.field-input{width:100%;border:1.5px solid var(--c-border);border-radius:10px;padding:11px 13px;font-size:14px;color:var(--c-text);outline:none;background:#fafafa;font-family:inherit;transition:border 0.2s;}\n.field-input:focus{border-color:var(--c-primary);background:#fff;}\n.field-input::placeholder{color:var(--c-hint);}\ntextarea.field-input{resize:none;height:80px;line-height:1.6;}\n.pickup-tools{display:flex;gap:6px;flex-wrap:wrap;margin-top:8px;}.pickup-chip{border:1px solid #E5E5EA;background:#fff;border-radius:999px;padding:6px 10px;font-size:11px;font-weight:600;color:#555;font-family:inherit;cursor:pointer;}.pickup-meta{display:flex;justify-content:space-between;align-items:center;margin-top:6px;font-size:10px;color:#888;}.pickup-save-state{color:#3B6D11;font-weight:600;}\n\n/* PROFILE PHOTO */\n.photo-wrap{display:flex;align-items:center;gap:14px;}\n.photo-preview{width:72px;height:72px;border-radius:12px;background:var(--c-primary);display:flex;align-items:center;justify-content:center;flex-shrink:0;overflow:hidden;}\n.photo-preview img{width:100%;height:100%;object-fit:cover;}\n.photo-actions{display:flex;flex-direction:column;gap:6px;}\n.btn-change{background:var(--c-primary);border:none;border-radius:8px;padding:8px 14px;color:#fff;font-size:12px;font-weight:600;font-family:inherit;cursor:pointer;}\n.btn-remove{background:#f5f5f5;border:none;border-radius:8px;padding:8px 14px;color:#888;font-size:12px;font-weight:500;font-family:inherit;cursor:pointer;}\n\n/* APPROVAL NOTE */\n.approval-note{background:#FFF3E0;border:1px solid #FFE0B2;border-radius:10px;padding:10px 12px;display:flex;gap:8px;align-items:flex-start;}\n.approval-text{font-size:11px;color:#856404;line-height:1.6;}\n\n/* INSTANT NOTE */\n.instant-note{background:#EAF3DE;border:1px solid #C5E1A5;border-radius:10px;padding:10px 12px;display:flex;gap:8px;align-items:flex-start;}\n.instant-text{font-size:11px;color:#3B6D11;line-height:1.6;}\n\n/* SAVE BTN */\n.save-btn{width:100%;background:linear-gradient(180deg,var(--c-primary-lt) 0%,var(--c-primary-dark) 100%);border:none;border-radius:14px;padding:16px;color:#fff;font-size:16px;font-weight:700;font-family:inherit;cursor:pointer;position:relative;overflow:hidden;box-shadow:0 1px 0 rgba(255,255,255,0.16) inset,0 6px 20px rgba(123,21,51,0.4);transition:transform 0.12s;}\n.save-btn::after{content:\u0027\u0027;position:absolute;top:0;left:0;right:0;height:50%;background:linear-gradient(180deg,rgba(255,255,255,0.12) 0%,transparent 100%);border-radius:14px 14px 0 0;pointer-events:none;}\n.save-btn:active{transform:scale(0.985);}"
const markup = "\u003cdiv class=\"page\"\u003e\n\u003cdiv class=\"scroll\"\u003e\n\n\u003cdiv class=\"header\"\u003e\n  \u003cdiv class=\"header-r1\"\u003e\n    \u003cbutton class=\"back-btn\" onclick=\"history.back()\"\u003e\u003csvg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#fff\" stroke-width=\"2.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"\u003e\u003cpolyline points=\"15 18 9 12 15 6\"/\u003e\u003c/svg\u003e\u003c/button\u003e\n    \u003cspan class=\"header-title\"\u003eEdit Kedai\u003c/span\u003e\n    \u003cdiv style=\"width:32px;\"\u003e\u003c/div\u003e\n  \u003c/div\u003e\n\u003c/div\u003e\n\n\u003cdiv class=\"form-wrap\"\u003e\n\n  \u003c!-- GAMBAR PROFIL --\u003e\n  \u003cdiv class=\"section-card\"\u003e\n    \u003cdiv class=\"section-lbl\"\u003eGambar Profil Kedai\u003c/div\u003e\n    \u003cdiv class=\"photo-wrap\"\u003e\n      \u003cdiv class=\"photo-preview\"\u003e\n        \u003csvg width=\"28\" height=\"28\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"rgba(255,255,255,0.4)\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"\u003e\u003crect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"2\"/\u003e\u003ccircle cx=\"8.5\" cy=\"8.5\" r=\"1.5\"/\u003e\u003cpolyline points=\"21 15 16 10 5 21\"/\u003e\u003c/svg\u003e\n      \u003c/div\u003e\n      \u003cdiv class=\"photo-actions\"\u003e\n        \u003cbutton class=\"btn-change\" onclick=\"document.getElementById(\u0027imgInput\u0027).click()\"\u003eTukar Gambar\u003c/button\u003e\n        \u003cbutton class=\"btn-remove\"\u003eBuang Gambar\u003c/button\u003e\n        \u003cinput type=\"file\" id=\"imgInput\" accept=\"image/*\" style=\"display:none;\"\u003e\n      \u003c/div\u003e\n    \u003c/div\u003e\n    \u003cdiv style=\"margin-top:10px;\"\u003e\n      \u003cdiv class=\"approval-note\"\u003e\n        \u003csvg width=\"14\" height=\"14\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#F0A500\" stroke-width=\"2.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\" style=\"flex-shrink:0;margin-top:1px;\"\u003e\u003ccircle cx=\"12\" cy=\"12\" r=\"10\"/\u003e\u003cline x1=\"12\" y1=\"8\" x2=\"12\" y2=\"12\"/\u003e\u003cline x1=\"12\" y1=\"16\" x2=\"12.01\" y2=\"16\"/\u003e\u003c/svg\u003e\n        \u003cdiv class=\"approval-text\"\u003eGambar baru perlu diluluskan admin sebelum dipaparkan. Gambar semasa akan kekal sehingga diluluskan.\u003c/div\u003e\n      \u003c/div\u003e\n    \u003c/div\u003e\n  \u003c/div\u003e\n\n  \u003c!-- INFO KEDAI — instant update --\u003e\n  \u003cdiv class=\"section-card\"\u003e\n    \u003cdiv class=\"section-lbl\"\u003eMaklumat Kedai\u003c/div\u003e\n    \u003cdiv class=\"instant-note\" style=\"margin-bottom:12px;\"\u003e\n      \u003csvg width=\"14\" height=\"14\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#4A7C10\" stroke-width=\"2.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\" style=\"flex-shrink:0;margin-top:1px;\"\u003e\u003cpath d=\"M22 11.08V12a10 10 0 1 1-5.93-9.14\"/\u003e\u003cpolyline points=\"22 4 12 14.01 9 11.01\"/\u003e\u003c/svg\u003e\n      \u003cdiv class=\"instant-text\"\u003eNama kedai dan penerangan akan dikemaskini serta-merta tanpa perlu kelulusan admin.\u003c/div\u003e\n    \u003c/div\u003e\n    \u003cdiv class=\"field\"\u003e\n      \u003cdiv class=\"field-lbl\"\u003eNama Kedai\u003c/div\u003e\n      \u003cinput class=\"field-input\" type=\"text\" value=\"Resepi Kak Mila\"\u003e\n    \u003c/div\u003e\n    \u003cdiv class=\"field\"\u003e\n      \u003cdiv class=\"field-lbl\"\u003ePenerangan Kedai\u003c/div\u003e\n      \u003ctextarea class=\"field-input\"\u003eKuih-kuih tradisional \u0026 kek untuk harijadi. Tempah sehari awal untuk tempahan secara pukal.\u003c/textarea\u003e\n    \u003c/div\u003e\n    \u003cdiv class=\"field\"\u003e\n      \u003cdiv class=\"field-lbl\"\u003eArahan Pickup / Titik Jumpa\u003c/div\u003e\n      \u003ctextarea id=\"pickupInstruction\" class=\"field-input\" maxlength=\"200\" placeholder=\"cth: Self collect di Lobby A Blok 3\"\u003e\u003c/textarea\u003e\n      \u003cdiv class=\"pickup-tools\"\u003e\n        \u003cbutton type=\"button\" class=\"pickup-chip\" onclick=\"setPickupInstruction(\u0027\uD83C\uDFE0 Depan pintu\u0027)\"\u003e\uD83C\uDFE0 Depan pintu\u003c/button\u003e\n        \u003cbutton type=\"button\" class=\"pickup-chip\" onclick=\"setPickupInstruction(\u0027\uD83C\uDFE2 Lobby\u0027)\"\u003e\uD83C\uDFE2 Lobby\u003c/button\u003e\n        \u003cbutton type=\"button\" class=\"pickup-chip\" onclick=\"setPickupInstruction(\u0027\uD83D\uDEF5 Tepi jalan\u0027)\"\u003e\uD83D\uDEF5 Tepi jalan\u003c/button\u003e\n        \u003cbutton type=\"button\" class=\"pickup-chip\" onclick=\"setPickupInstruction(\u0027\uD83D\uDCE6 COD hantar\u0027)\"\u003e\uD83D\uDCE6 COD hantar\u003c/button\u003e\n      \u003c/div\u003e\n      \u003cdiv class=\"pickup-meta\"\u003e\u003cspan class=\"pickup-save-state\"\u003eDisimpan automatik\u003c/span\u003e\u003cspan class=\"pickup-count\"\u003e0/200\u003c/span\u003e\u003c/div\u003e\n    \u003c/div\u003e\n  \u003c/div\u003e\n\n  \u003c!-- LOKASI — instant --\u003e\n  \u003cdiv class=\"section-card\"\u003e\n    \u003cdiv class=\"section-lbl\"\u003eLokasi\u003c/div\u003e\n    \u003cdiv class=\"instant-note\" style=\"margin-bottom:12px;\"\u003e\n      \u003csvg width=\"14\" height=\"14\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#4A7C10\" stroke-width=\"2.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\" style=\"flex-shrink:0;margin-top:1px;\"\u003e\u003cpath d=\"M22 11.08V12a10 10 0 1 1-5.93-9.14\"/\u003e\u003cpolyline points=\"22 4 12 14.01 9 11.01\"/\u003e\u003c/svg\u003e\n      \u003cdiv class=\"instant-text\"\u003eLokasi dikemaskini serta-merta.\u003c/div\u003e\n    \u003c/div\u003e\n    \u003cdiv class=\"field\"\u003e\n      \u003cdiv class=\"field-lbl\"\u003eNama Taman\u003c/div\u003e\n      \u003cinput class=\"field-input\" type=\"text\" value=\"Taman Desa Baiduri\"\u003e\n    \u003c/div\u003e\n    \u003cdiv class=\"field\"\u003e\n      \u003cdiv class=\"field-lbl\"\u003ePoskod\u003c/div\u003e\n      \u003cinput class=\"field-input\" type=\"text\" value=\"40150\"\u003e\n    \u003c/div\u003e\n  \u003c/div\u003e\n\n  \u003c!-- PRODUK SECTION --\u003e\n  \u003cdiv class=\"section-card\"\u003e\n    \u003cdiv class=\"section-lbl\"\u003eProduk \u0026 Gambar Produk\u003c/div\u003e\n    \u003cdiv class=\"approval-note\"\u003e\n      \u003csvg width=\"14\" height=\"14\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#F0A500\" stroke-width=\"2.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\" style=\"flex-shrink:0;margin-top:1px;\"\u003e\u003ccircle cx=\"12\" cy=\"12\" r=\"10\"/\u003e\u003cline x1=\"12\" y1=\"8\" x2=\"12\" y2=\"12\"/\u003e\u003cline x1=\"12\" y1=\"16\" x2=\"12.01\" y2=\"16\"/\u003e\u003c/svg\u003e\n      \u003cdiv class=\"approval-text\"\u003eEdit produk dan gambar produk baru perlu kelulusan admin. Urus produk melalui Dashboard → Produk Saya.\u003c/div\u003e\n    \u003c/div\u003e\n    \u003cdiv style=\"margin-top:10px;\"\u003e\n      \u003cbutton style=\"width:100%;background:#f5f5f5;border:none;border-radius:10px;padding:12px;color:var(--c-primary);font-size:13px;font-weight:600;font-family:inherit;cursor:pointer;\" onclick=\"window.location.href=\u0027lokalgo_dashboard.html\u0027\"\u003e\n        Pergi ke Dashboard →\n      \u003c/button\u003e\n    \u003c/div\u003e\n  \u003c/div\u003e\n\n  \u003cbutton class=\"save-btn\" onclick=\"saveChanges()\"\u003e\n    \u003csvg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#fff\" stroke-width=\"2.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"\u003e\u003cpath d=\"M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z\"/\u003e\u003cpolyline points=\"17 21 17 13 7 13 7 21\"/\u003e\u003cpolyline points=\"7 3 7 8 15 8\"/\u003e\u003c/svg\u003e\n    Simpan Perubahan\n  \u003c/button\u003e\n\n\u003c/div\u003e\n\u003c/div\u003e\n\u003c/div\u003e"
const scripts: string[] = ["function saveChanges() {\n  alert(\u0027✓ Perubahan telah disimpan.\u0027);\n  history.back();\n}"]
const externalScripts: string[] = []
const externalStylesheets: string[] = ["https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800\u0026display=swap"]

export default function Page() {
  useEffect(() => {
    let currentSeller: Seller | null = null
    let profileImageUrl: string | null = null
    const supabase = createClient()
    const fields = () => document.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('.field-input')
    const runtime = window as EditWindow
    let pickupSaveTimer: ReturnType<typeof setTimeout> | null = null

    function renderPhoto(url: string | null) {
      const preview = document.querySelector<HTMLElement>('.photo-preview')
      if (!preview) return

      if (url) {
        preview.innerHTML = `<img src="${url}" alt="">`
      }
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
      pickupSaveTimer = setTimeout(() => {
        void savePickupInstruction(value)
      }, 500)
    }

    async function loadSeller() {
      const { data: authData } = await supabase.auth.getUser()

      if (!authData.user) {
        window.location.href = '/auth'
        return
      }

      const { data, error } = await supabase
        .from('sellers')
        .select('*')
        .eq('user_id', authData.user.id)
        .single()

      if (error) {
        console.error(error)
        alert('Rekod seller tidak ditemui.')
        return
      }

      currentSeller = data as Seller
      profileImageUrl = currentSeller.profile_image_url
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
      if (!currentSeller) {
        alert('Data seller belum dimuat.')
        return
      }

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
          pickup_instruction: pickupInstruction,
        })
        .eq('id', currentSeller.id)

      if (error) {
        alert(error.message)
        return
      }

      alert('Perubahan telah disimpan.')
      window.location.href = '/seller/dashboard'
    }

    const fileInput = document.querySelector<HTMLInputElement>('#imgInput')
    const removeButton = document.querySelector<HTMLButtonElement>('.btn-remove')
    const pickup = pickupInput()

    function showPhotoStatus(msg: string | null) {
      let el = document.querySelector<HTMLElement>('#photoStatus')
      if (!el) {
        el = document.createElement('div')
        el.id = 'photoStatus'
        el.style.cssText = 'font-size:12px;color:#7B1533;font-weight:600;margin-top:8px;min-height:16px;'
        document.querySelector('.photo-wrap')?.after(el)
      }
      el.textContent = msg ?? ''
    }

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

      showPhotoStatus('Memampatkan gambar...')

      let compressed: File
      try {
        compressed = await compressImage(file, 'avatar')
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
      const preview = document.querySelector<HTMLElement>('.photo-preview')
      if (preview) preview.innerHTML = ''
    }

    fileInput?.addEventListener('change', onImageChange)
    removeButton?.addEventListener('click', removeImage)
    pickup?.addEventListener('input', queuePickupSave)
    loadSeller().catch(console.error)

    return () => {
      if (pickupSaveTimer) clearTimeout(pickupSaveTimer)
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
