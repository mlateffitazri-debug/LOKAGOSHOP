'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { PRODUCT_CATEGORIES } from '@/types/database'
import type { ProductCategory } from '@/types/database'
import { compressImage } from '@/lib/compressImage'

const MAX_IMAGES = 4

export default function TambahProdukPage() {
  const [sellerId, setSellerId] = useState<string | null>(null)
  const [shopStatus, setShopStatus] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [compressing, setCompressing] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [name, setName] = useState('')
  const [category, setCategory] = useState<ProductCategory>(PRODUCT_CATEGORIES[0])
  const [description, setDescription] = useState('')
  const [priceFrom, setPriceFrom] = useState('')
  const [unit, setUnit] = useState('')
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [imageWarnings, setImageWarnings] = useState<(string | null)[]>([])
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    async function loadSeller() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/auth'; return }
      const { data: seller } = await supabase
        .from('sellers')
        .select('id, status')
        .eq('user_id', user.id)
        .maybeSingle()
      if (!seller) { window.location.href = '/home'; return }
      setSellerId(seller.id)
      setShopStatus(seller.status)
      setLoading(false)
    }
    loadSeller().catch(console.error)
  }, [])

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    const remaining = MAX_IMAGES - imageFiles.length
    const toAdd = files.slice(0, remaining)
    if (toAdd.length === 0) return
    e.target.value = ''

    setCompressing(true)
    try {
      const compressed = await Promise.all(toAdd.map(async (file) => {
        // HEIC/HEIF: pass through without compression — browser-image-compression
        // cannot reliably decode HEIC on non-Safari environments
        if (file.type === 'image/heic' || file.type === 'image/heif') return file
        return compressImage(file, 'product')
      }))

      const dataUrls = await Promise.all(compressed.map((file) => new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = (ev) => resolve(ev.target?.result as string)
        reader.onerror = reject
        reader.readAsDataURL(file)
      })))

      const warnings = await Promise.all(toAdd.map((originalFile, idx) => new Promise<string | null>((resolve) => {
        // Skip dimension check for HEIC — browser may not decode dimensions correctly
        if (originalFile.type === 'image/heic' || originalFile.type === 'image/heif') { resolve(null); return }
        const img = new window.Image()
        img.onload = () => {
          const w = img.naturalWidth
          const h = img.naturalHeight
          if (!w || !h) { resolve(null); return }
          const ratio = w / h
          if (w < 600 || h < 600) {
            resolve('Gambar ini mungkin kelihatan pecah. Gunakan gambar sekurang-kurangnya 800×800px.')
          } else if (ratio < 0.75 || ratio > 1.33) {
            resolve('Gambar ini tidak square. Untuk hasil terbaik, crop gambar kepada nisbah 1:1 sebelum upload.')
          } else {
            resolve(null)
          }
        }
        img.onerror = () => resolve(null)
        img.src = dataUrls[idx]
      })))

      setImageFiles((prev) => [...prev, ...compressed])
      setImagePreviews((prev) => [...prev, ...dataUrls])
      setImageWarnings((prev) => [...prev, ...warnings])
    } finally {
      setCompressing(false)
    }
  }

  function removeImage(index: number) {
    setImageFiles((prev) => prev.filter((_, i) => i !== index))
    setImagePreviews((prev) => prev.filter((_, i) => i !== index))
    setImageWarnings((prev) => prev.filter((_, i) => i !== index))
  }

  function moveImage(index: number, dir: -1 | 1) {
    const newIdx = index + dir
    if (newIdx < 0 || newIdx >= imageFiles.length) return
    setImageFiles((prev) => {
      const arr = [...prev];
      [arr[index], arr[newIdx]] = [arr[newIdx], arr[index]]
      return arr
    })
    setImagePreviews((prev) => {
      const arr = [...prev];
      [arr[index], arr[newIdx]] = [arr[newIdx], arr[index]]
      return arr
    })
    setImageWarnings((prev) => {
      const arr = [...prev];
      [arr[index], arr[newIdx]] = [arr[newIdx], arr[index]]
      return arr
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!sellerId) return
    setError(null)

    if (!name.trim()) { setError('Nama produk diperlukan.'); return }
    if (!priceFrom || isNaN(Number(priceFrom)) || Number(priceFrom) <= 0) {
      setError('Masukkan harga yang sah.'); return
    }

    setSubmitting(true)
    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      const uploadedUrls: string[] = []
      for (const file of imageFiles) {
        const fd = new FormData()
        fd.append('file', file)
        const res = await fetch('/api/seller/product-image', {
          method: 'POST',
          body: fd,
          ...(session?.access_token ? { headers: { 'Authorization': `Bearer ${session.access_token}` } } : {}),
        })
        const json = await res.json() as { url?: string; error?: string }
        if (!res.ok || !json.url) throw new Error(json.error ?? 'Gagal muat naik gambar. Sila cuba lagi.')
        uploadedUrls.push(json.url)
      }

      const { error: insertError } = await supabase.from('products').insert({
        seller_id: sellerId,
        name: name.trim(),
        category,
        description: description.trim() || null,
        price_from: Number(priceFrom),
        unit: unit.trim() || null,
        images: uploadedUrls,
        is_available: false,
        is_preorder: false,
        status: 'pending',
      })
      if (insertError) throw insertError

      window.location.href = '/seller/dashboard'
    } catch (err) {
      setError((err as Error).message ?? 'Ralat tidak diketahui. Cuba lagi.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div style={{ position: 'fixed', inset: 0, background: '#F5F5F5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#7B1533', fontSize: 14, fontWeight: 600 }}>Memuatkan…</div>
      </div>
    )
  }

  if (shopStatus !== 'active') {
    return (
      <div style={{ position: 'fixed', inset: 0, background: '#F5F5F5', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32, textAlign: 'center', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>🔒</div>
        <div style={{ fontSize: 16, fontWeight: 700, color: '#111', marginBottom: 8 }}>Kedai belum diluluskan</div>
        <div style={{ fontSize: 13, color: '#555', lineHeight: 1.6, marginBottom: 24 }}>Anda boleh muat naik produk selepas kedai anda diluluskan oleh admin.</div>
        <button onClick={() => window.location.href = '/seller/dashboard'} style={{ background: '#7B1533', color: '#fff', border: 'none', borderRadius: 12, padding: '12px 24px', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
          Kembali ke Dashboard
        </button>
      </div>
    )
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#F5F5F5', overflowY: 'auto', fontFamily: "'Plus Jakarta Sans', sans-serif", paddingBottom: 'max(24px, env(safe-area-inset-bottom))' }}>
      <div style={{ maxWidth: 430, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ background: '#7B1533', padding: 'calc(env(safe-area-inset-top) + 14px) 20px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => window.history.back()} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <div>
            <div style={{ fontSize: 17, fontWeight: 800, color: '#fff' }}>Tambah Produk</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>Produk akan disemak oleh admin sebelum dipaparkan</div>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '16px 16px 8px' }}>
          {/* Images */}
          <div style={{ background: '#fff', borderRadius: 16, padding: 16, marginBottom: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#111', marginBottom: 6 }}>Gambar Produk ({imagePreviews.length}/{MAX_IMAGES})</div>
            <div style={{ fontSize: 11, color: '#888', marginBottom: 10 }}>Gunakan anak panah ← → untuk susun semula gambar mengikut urutan paparan.</div>

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {imagePreviews.map((src, i) => (
                <div key={i} style={{ position: 'relative', width: 96, height: 96, borderRadius: 10, overflow: 'visible', border: '1px solid #E5E5EA', flexShrink: 0 }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt="" style={{ width: 96, height: 96, objectFit: 'cover', objectPosition: 'center', borderRadius: 10, display: 'block' }} />
                  {/* position badge */}
                  <div style={{ position: 'absolute', bottom: 3, left: 3, background: 'rgba(0,0,0,0.55)', borderRadius: 4, padding: '1px 5px', fontSize: 9, color: '#fff', fontWeight: 700 }}>{i + 1}</div>
                  {/* remove */}
                  <button type="button" onClick={() => removeImage(i)} style={{ position: 'absolute', top: -6, right: -6, background: '#e44', border: '2px solid #fff', borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0, zIndex: 1 }}>
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                  {/* reorder arrows */}
                  <div style={{ position: 'absolute', top: -6, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 2, zIndex: 1 }}>
                    <button type="button" onClick={() => moveImage(i, -1)} disabled={i === 0} style={{ background: i === 0 ? '#ccc' : '#7B1533', border: '2px solid #fff', borderRadius: 4, width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: i === 0 ? 'default' : 'pointer', padding: 0 }}>
                      <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
                    </button>
                    <button type="button" onClick={() => moveImage(i, 1)} disabled={i === imageFiles.length - 1} style={{ background: i === imageFiles.length - 1 ? '#ccc' : '#7B1533', border: '2px solid #fff', borderRadius: 4, width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: i === imageFiles.length - 1 ? 'default' : 'pointer', padding: 0 }}>
                      <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                    </button>
                  </div>
                </div>
              ))}
              {imagePreviews.length < MAX_IMAGES && (
                <button type="button" onClick={() => fileInputRef.current?.click()} disabled={compressing} style={{ width: 96, height: 96, borderRadius: 10, border: '2px dashed #D0D0D8', background: '#F8F8FA', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: compressing ? 'wait' : 'pointer', gap: 4 }}>
                  {compressing
                    ? <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7B1533" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                    : <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#7B1533" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  }
                  <span style={{ fontSize: 10, color: '#888', fontWeight: 600 }}>{compressing ? 'Mampat…' : 'Gambar'}</span>
                </button>
              )}
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleImageChange} style={{ display: 'none' }} />
            {imageWarnings.some(Boolean) && (
              <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 4 }}>
                {imageWarnings.map((warning, i) => warning ? (
                  <div key={i} style={{ fontSize: 11, color: '#C62828', lineHeight: 1.5 }}>
                    ⚠️ <strong>Gambar {i + 1}:</strong> {warning}
                  </div>
                ) : null)}
              </div>
            )}
            <div style={{ fontSize: 11, color: '#AAA', marginTop: 10 }}>Gunakan gambar produk square 1:1 untuk hasil terbaik. Cadangan minimum 800×800px. Elakkan screenshot panjang atau gambar terlalu kecil.</div>
          </div>

          {/* Name + Category */}
          <div style={{ background: '#fff', borderRadius: 16, padding: 16, marginBottom: 12, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#555', display: 'block', marginBottom: 5 }}>Nama Produk *</label>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Cth: Kuih Talam Pandan" maxLength={80} style={{ width: '100%', border: '1.5px solid #E5E5EA', borderRadius: 10, padding: '10px 12px', fontSize: 14, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#555', display: 'block', marginBottom: 5 }}>Kategori *</label>
              <select value={category} onChange={(e) => setCategory(e.target.value as ProductCategory)} style={{ width: '100%', border: '1.5px solid #E5E5EA', borderRadius: 10, padding: '10px 12px', fontSize: 14, fontFamily: 'inherit', background: '#fff', outline: 'none', boxSizing: 'border-box' }}>
                {PRODUCT_CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#555', display: 'block', marginBottom: 5 }}>Penerangan</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Huraian ringkas produk, bahan, saiz, dsb." maxLength={300} rows={3} style={{ width: '100%', border: '1.5px solid #E5E5EA', borderRadius: 10, padding: '10px 12px', fontSize: 14, fontFamily: 'inherit', outline: 'none', resize: 'none', boxSizing: 'border-box' }} />
            </div>
          </div>

          {/* Price */}
          <div style={{ background: '#fff', borderRadius: 16, padding: 16, marginBottom: 12, display: 'flex', gap: 12 }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#555', display: 'block', marginBottom: 5 }}>Harga Dari (RM) *</label>
              <input type="number" value={priceFrom} onChange={(e) => setPriceFrom(e.target.value)} placeholder="0.00" min="0.01" step="0.01" style={{ width: '100%', border: '1.5px solid #E5E5EA', borderRadius: 10, padding: '10px 12px', fontSize: 14, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#555', display: 'block', marginBottom: 5 }}>Unit / Saiz</label>
              <input value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="Cth: 1 biji, 1 pek" maxLength={30} style={{ width: '100%', border: '1.5px solid #E5E5EA', borderRadius: 10, padding: '10px 12px', fontSize: 14, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }} />
            </div>
          </div>

          {/* Info note */}
          <div style={{ background: '#FFF8E7', border: '1px solid #FFE0A3', borderRadius: 12, padding: '10px 14px', marginBottom: 16, fontSize: 12, color: '#7A5800', lineHeight: 1.6 }}>
            Produk akan disemak oleh admin sebelum dipaparkan kepada pembeli. Status <strong>Dalam Semakan</strong> akan terpapar di dashboard anda.
          </div>

          {error && (
            <div style={{ background: '#FFF0F0', border: '1px solid #FFCDD2', borderRadius: 10, padding: '10px 14px', marginBottom: 12, fontSize: 13, color: '#C62828', fontWeight: 600 }}>{error}</div>
          )}

          <button type="submit" disabled={submitting || compressing} style={{ width: '100%', background: (submitting || compressing) ? '#C0A0A8' : '#7B1533', color: '#fff', border: 'none', borderRadius: 14, padding: '15px', fontSize: 15, fontWeight: 700, cursor: (submitting || compressing) ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
            {submitting ? 'Menghantar…' : compressing ? 'Memampatkan gambar…' : 'Hantar untuk Semakan'}
          </button>
        </form>
      </div>
    </div>
  )
}
