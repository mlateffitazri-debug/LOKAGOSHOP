export const BUSINESS_TYPE_OPTIONS = ['FOOD', 'SERVICE', 'PRODUCT', 'HOMESTAY'] as const
export type BusinessType = typeof BUSINESS_TYPE_OPTIONS[number]

export const PLAN_TYPE_OPTIONS = ['free', 'pro'] as const
export type PlanType = typeof PLAN_TYPE_OPTIONS[number]

export const DEFAULT_BUSINESS_TYPE: BusinessType = 'FOOD'
export const DEFAULT_PLAN_TYPE: PlanType = 'free'
export const DEFAULT_LISTING_LIMIT = 5

export const BUSINESS_TYPE_LABELS: Record<BusinessType, string> = {
  FOOD: 'Food',
  SERVICE: 'Service',
  PRODUCT: 'Product',
  HOMESTAY: 'Homestay',
}

export function isBusinessType(value: unknown): value is BusinessType {
  return typeof value === 'string' && (BUSINESS_TYPE_OPTIONS as readonly string[]).includes(value)
}

export function normalizeBusinessType(value: unknown): BusinessType {
  if (typeof value !== 'string') return DEFAULT_BUSINESS_TYPE
  const normalized = value.trim().toUpperCase()
  return isBusinessType(normalized) ? normalized : DEFAULT_BUSINESS_TYPE
}

// Listing categories per business type. Free text in the DB (no enum lock) —
// this is purely the dropdown vocabulary offered when adding a listing.
export const CATEGORIES_BY_BUSINESS_TYPE: Record<BusinessType, readonly string[]> = {
  FOOD: ['Nasi', 'Kuih', 'Dessert', 'Frozen', 'Minuman', 'Pastri & Kek', 'Snek'],
  SERVICE: ['Aircond', 'Plumbing', 'Electrical', 'Cleaning', 'Grass Cutting', 'Repair'],
  PRODUCT: ['Grocery', 'Fresh Fish', 'Vegetables', 'Beauty', 'Homemade Product', 'Household'],
  HOMESTAY: ['Homestay', 'Apartment', 'House', 'Room', 'Villa'],
}

export function getCategoriesForBusinessType(value: unknown): readonly string[] {
  return CATEGORIES_BY_BUSINESS_TYPE[normalizeBusinessType(value)]
}

export function normalizePlanType(value: unknown): PlanType {
  if (value === 'pro') return 'pro'
  return DEFAULT_PLAN_TYPE
}

export function normalizeListingLimit(value: unknown): number {
  const limit = typeof value === 'number' ? value : Number(value)
  return Number.isInteger(limit) && limit >= 0 ? limit : DEFAULT_LISTING_LIMIT
}

export function isListingLimitReached({
  planType,
  listingLimit,
  listingCount,
}: {
  planType: unknown
  listingLimit: unknown
  listingCount: number
}) {
  if (normalizePlanType(planType) === 'pro') return false
  return listingCount >= normalizeListingLimit(listingLimit)
}
