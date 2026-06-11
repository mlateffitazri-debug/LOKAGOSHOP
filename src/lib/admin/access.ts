import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Primary admin — env var overrides/extends this list
const OWNER_EMAILS = ['m.lateffitazri@gmail.com', 'admin@lokalgo.app']

export function adminEmails() {
  const configured = process.env.ADMIN_EMAIL ?? process.env.ADMIN_EMAILS ?? ''
  const fromEnv = configured
    .split(/[,\s;]+/)
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean)
  return Array.from(new Set([...OWNER_EMAILS, ...fromEnv]))
}

export function isAdminEmail(email?: string | null) {
  return !!email && adminEmails().includes(email.trim().toLowerCase())
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
