'use client'

import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { PRODUCT_CATEGORIES } from '@/types/database'
import type { ProductCategory } from '@/types/database'

const MAX_IMAGES = 4

export default function TambahProdukPage() {
  const supabase = createClient()
  const [sellerId, setSellerId] = useState<string | null>(null)
  const [shopStatus, setShopStatus] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [name, setName] = useState('')
  const [category, setCategory] = useState<ProductCategory>(PRODUCT_CATEGORIES[0])
  const [description, setDescription] = useState('')
  const [priceFrom, setPriceFrom] = useState('')
  const [unit, setUnit] = useState('')
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    async function loadSeller() {
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
  }, [supabase])

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    const remaining = MAX_IMAGES - imageFiles.length
    const toAdd = files.slice(0, remaining)
    if (toAdd.length === 0) return
    setImageFiles((prev) => [...prev, ...toAdd])
    toAdd.forEach((file) => {
      const reader = new FileReader()
      reader.onload = (ev) => {
        setImagePreviews((prev) => [...prev, ev.target?.result as string])
      }
      reader.readAsDataURL(file)
    })
    e.target.value = ''
  }

  function removeImage(index: number) {
    setImageFiles((prev) => prev.filter((_, i) => i !== index))
    setImagePreviews((prev) => prev.filter((_, i) => i !== index))
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
      const uploadedUrls: string[] = []
      for (const file of imageFiles) {
        const fd = new FormData()
        fd.append('file', file)
        const res = await fetch('/api/seller/product-image', { method: 'POST', body: fd })
        const json = await res.json() as { url?: string; error?: string }
        if (!res.ok || !json.url) throw new Error(json.error ?? 'Gagal muat naik gambar')
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
            <div style={{ fontSize: 13, fontWeight: 700, color: '#111', marginBottom: 10 }}>Gambar Produk ({imagePreviews.length}/{MAX_IMAGES})</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {imagePreviews.map((src, i) => (
                <div key={i} style={{ position: 'relative', width: 80, height: 80, borderRadius: 10, overflow: 'hidden', border: '1px solid #E5E5EA' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <button type="button" onClick={() => removeImage(i)} style={{ position: 'absolute', top: 3, right: 3, background: 'rgba(0,0,0,0.55)', border: 'none', borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0 }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                </div>
              ))}
              {imagePreviews.length < MAX_IMAGES && (
                <button type="button" onClick={() => fileInputRef.current?.click()} style={{ width: 80, height: 80, borderRadius: 10, border: '2px dashed #D0D0D8', background: '#F8F8FA', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', gap: 4 }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#7B1533" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  <span style={{ fontSize: 10, color: '#888', fontWeight: 600 }}>Gambar</span>
                </button>
              )}
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleImageChange} style={{ display: 'none' }} />
            <div style={{ fontSize: 11, color: '#AAA', marginTop: 8 }}>Muat naik sehingga 4 gambar. Format: JPG, PNG, WEBP.</div>
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

          <button type="submit" disabled={submitting} style={{ width: '100%', background: submitting ? '#C0A0A8' : '#7B1533', color: '#fff', border: 'none', borderRadius: 14, padding: '15px', fontSize: 15, fontWeight: 700, cursor: submitting ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
            {submitting ? 'Menghantar…' : 'Hantar untuk Semakan'}
          </button>
        </form>
      </div>
    </div>
  )
}
