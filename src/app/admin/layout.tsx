import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth?next=/admin')
  }

  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase()
  const userEmail = user.email?.trim().toLowerCase()

  if (!adminEmail || userEmail !== adminEmail) {
    redirect('/home')
  }

  return children
}
