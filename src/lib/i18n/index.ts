'use client'

export type Lang = 'ms' | 'en'

export const translations: Record<string, Record<Lang, string>> = {
  tagline: { ms: 'Platform perniagaan lokal setempat', en: 'Your local community marketplace' },
  cat_kuih: { ms: 'Kuih & Kek', en: 'Kuih & Cake' },
  cat_lauk: { ms: 'Lauk', en: 'Side Dishes' },
  cat_minuman: { ms: 'Minuman', en: 'Drinks' },
  cat_fresh: { ms: 'Fresh & Semula Jadi', en: 'Fresh & Natural' },
  cat_frozen: { ms: 'Frozen & Simpanan', en: 'Frozen & Stored' },
  popular_title: { ms: 'Popular di kawasan anda', en: 'Popular near you' },
  cod_available: { ms: 'COD Available', en: 'COD Available' },
  buka: { ms: 'BUKA', en: 'OPEN' },
  tutup: { ms: 'TUTUP', en: 'CLOSED' },
  verified_shop: { ms: 'Verified Shop', en: 'Verified Shop' },
  produk_kami: { ms: 'Produk kami', en: 'Our Products' },
  semua: { ms: 'Semua', en: 'All' },
  tersedia: { ms: 'Produk Tersedia', en: 'Available' },
  tidak_tersedia: { ms: 'Produk Tidak Tersedia', en: 'Not Available' },
  testi_reviu: { ms: 'Testimoni / Reviu', en: 'Reviews' },
  ulasan: { ms: 'ulasan', en: 'reviews' },
  status_kedai: { ms: 'Status Kedai', en: 'Shop Status' },
  produk_saya: { ms: 'Produk Saya', en: 'My Products' },
  mesej_admin: { ms: 'Mesej Admin', en: 'Admin Messages' },
  profil_saya: { ms: 'Profil Saya', en: 'My Profile' },
  kedai_disimpan: { ms: 'Kedai Disimpan', en: 'Saved Shops' },
  log_keluar: { ms: 'Log Keluar', en: 'Sign Out' },
  imbas_qr: { ms: 'Imbas QR untuk menyokong', en: 'Scan QR to support' },
  search_placeholder: { ms: 'Cari kedai atau produk', en: 'Search shops or products' },
  sokong_btn: { ms: 'Sokong Pembangun Anda', en: 'Support Your Developer' },
  see_all: { ms: 'Lihat Semuanya', en: 'See All' },
  seller_baharu: { ms: 'Seller Baharu', en: 'New Seller' },
  seller_aktif: { ms: 'Seller Aktif', en: 'Active Seller' },
  verified_seller: { ms: 'Verified Seller', en: 'Verified Seller' },
  order_biasa: { ms: 'Order Biasa', en: 'Regular Order' },
  pra_tempahan: { ms: 'Produk Pra Tempahan', en: 'Pre-Order' },
  whatsapp_order: { ms: 'Order via WhatsApp', en: 'Order via WhatsApp' },
  saved_shops: { ms: 'Kedai Disimpan', en: 'Saved Shops' },
  profile: { ms: 'Profil', en: 'Profile' },
  notifications: { ms: 'Notifikasi', en: 'Notifications' },
  dashboard: { ms: 'Dashboard', en: 'Dashboard' },
  edit_shop: { ms: 'Edit Kedai', en: 'Edit Shop' },
}

export function t(key: string, lang: Lang): string {
  return translations[key]?.[lang] ?? key
}

// Hook untuk guna dalam components
import { useState, useEffect } from 'react'

export function useLang() {
  const [lang, setLang] = useState<Lang>('ms')

  useEffect(() => {
    const saved = localStorage.getItem('lokago_lang') as Lang | null
    if (saved) setLang(saved)
  }, [])

  const toggle = () => {
    const next: Lang = lang === 'ms' ? 'en' : 'ms'
    setLang(next)
    localStorage.setItem('lokago_lang', next)
  }

  const translate = (key: string) => t(key, lang)

  return { lang, toggle, t: translate }
}
