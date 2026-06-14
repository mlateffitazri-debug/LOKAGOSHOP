export const PRODUCT_CATEGORIES = [
  'Pastri & Kek',
  'Set Makanan & Lauk',
  'Frozen & Simpanan',
  'Minuman',
  'Fresh & Semulajadi',
  'Snek',
] as const

export type ProductCategory = typeof PRODUCT_CATEGORIES[number]

export type BadgeLevel = 'seller_baharu' | 'seller_aktif' | 'verified_seller'
export type ShopStatus = 'pending' | 'active' | 'suspended' | 'rejected'
export type AppealStatus = 'pending' | 'approved' | 'rejected'
export type OrderType = 'normal' | 'preorder'
export type DeliveryType = 'self_pickup' | 'cod_rumah' | 'cod_pejabat'

export interface Seller {
  id: string
  user_id: string
  shop_name: string
  email: string | null
  whatsapp_number: string
  kawasan: string
  postcode: string
  taman_name: string
  profile_image_url: string | null
  profile_image_position_x?: number | null
  profile_image_position_y?: number | null
  pickup_instruction: string | null
  // Pin GPS kedai dari onboarding step 1 — boleh jadi string (lajur text) atau number
  latitude?: number | string | null
  longitude?: number | string | null
  badge: BadgeLevel
  status: ShopStatus
  is_open: boolean
  view_count: number
  wa_click_count: number
  testimonial_count: number
  months_active: number
  created_at: string
  approved_at: string | null
  custom_note: string | null
  custom_note_updated_at: string | null
  slug?: string | null
}

export interface Product {
  id: string
  seller_id: string
  name?: string | null
  category: string
  description: string | null
  price_from: number | null
  unit?: string | null
  images: string[]
  is_available: boolean
  is_preorder: boolean
  min_qty_preorder: number | null
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
}

export interface Buyer {
  id: string
  user_id: string
  name: string
  email: string
  whatsapp_number: string | null
  kawasan: string | null
  address_rumah: string | null
  address_pejabat: string | null
  created_at: string
}

export interface Testimonial {
  id: string
  seller_id: string
  buyer_id: string | null
  buyer_name: string // anonymized to 'Pembeli LokalGo' if buyer deleted
  buyer_kawasan: string | null
  rating: number
  content: string
  is_approved: boolean
  created_at: string
}

export interface SuspendedSeller {
  id: string
  whatsapp_number: string
  seller_id: string
  suspend_date: string
  appeal_status: AppealStatus | null
  cooldown_until: string | null
  permanent_ban: boolean
  reason: string | null
}

export interface AdminMessage {
  id: string
  seller_id: string
  type: 'warning' | 'info' | 'flag' | 'success'
  title: string
  body: string
  is_read: boolean
  sent_at: string
}
