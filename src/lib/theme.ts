// LokalGo brand tokens — single source of truth.
// Use these instead of hardcoded hex values in components.

export const theme = {
  color: {
    brandMaroon: '#7B1D2E',
    brandMaroonDark: '#4A0F1A',
    brandLime: '#C8E44A',
    surface: '#FFFFFF',
    surfaceAlt: '#F7F6F4',
    textPrimary: '#1E1E1E',
    textSecondary: '#6B6B6B',
    border: '#ECECEC',
  },
  radius: {
    sm: 8,
    md: 12,
    lg: 16,
    pill: 999,
  },
  font: {
    h1: { fontSize: 24, fontWeight: 700, lineHeight: 1.3 },
    h2: { fontSize: 18, fontWeight: 600, lineHeight: 1.3 },
    h3: { fontSize: 15, fontWeight: 600, lineHeight: 1.3 },
    body: { fontSize: 14, fontWeight: 400, lineHeight: 1.5 },
    caption: { fontSize: 12, fontWeight: 400, lineHeight: 1.5 },
    micro: { fontSize: 11, fontWeight: 400, lineHeight: 1.5 },
  },
  // Spacing scale — only these values: 4 / 8 / 12 / 16 / 20 / 24
  space: [4, 8, 12, 16, 20, 24] as const,
} as const

export const MAROON = theme.color.brandMaroon
export const MAROON_DARK = theme.color.brandMaroonDark
export const LIME = theme.color.brandLime
