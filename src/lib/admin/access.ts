import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Admin access is intentionally restricted to a single account — never a list.
// ADMIN_EMAIL may override this value (e.g. credential rotation) but must
// always resolve to exactly one email. Do not add a second hardcoded email
// or support a comma-separated list here: any additional value silently
// grants full admin access (database wipe, seller/listing edits, shop
// preview) to that account.
const OWNER_EMAIL = 'm.lateffitazri@gmail.com'

export function adminEmail(): string {
  const configured = process.env.ADMIN_EMAIL?.trim().toLowerCase()
  return configured || OWNER_EMAIL
}

export function isAdminEmail(email?: string | null) {
  return !!email && email.trim().toLowerCase() === adminEmail()
}

export async function requireAdmin() {
  const supabase = createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: 'Not authenticated' }, { status: 401 }),
    }
  }

  if (!isAdminEmail(user.email)) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: 'Admin access required' }, { status: 403 }),
    }
  }

  return { ok: true as const, user }
}
