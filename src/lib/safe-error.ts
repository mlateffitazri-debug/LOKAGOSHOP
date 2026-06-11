const DEV = process.env.NODE_ENV !== 'production'

/**
 * Returns a safe error message for API responses.
 * In production, hides internal DB/Supabase details from clients.
 */
export function safeError(err: unknown, fallback = 'Ralat dalaman berlaku'): string {
  if (DEV) {
    return err instanceof Error ? err.message : String(err)
  }
  // In production, only expose safe, non-leaking messages
  const msg = err instanceof Error ? err.message : String(err)
  // Allow simple validation messages through, block DB internals
  if (
    msg.includes('relation') ||
    msg.includes('column') ||
    msg.includes('constraint') ||
    msg.includes('violates') ||
    msg.includes('duplicate key') ||
    msg.includes('syntax error') ||
    msg.includes('permission denied')
  ) {
    return fallback
  }
  return msg || fallback
}
