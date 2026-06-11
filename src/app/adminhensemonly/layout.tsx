import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { isAdminEmail } from '@/lib/admin/access'

export const metadata: Metadata = {
  title: 'LokalGo Admin',
  manifest: '/manifest-admin.json',
  icons: {
    icon: [{ url: '/icons/icon-512-admin.png', sizes: '512x512', type: 'image/png' }],
    apple: [{ url: '/icons/icon-512-admin.png', sizes: '512x512', type: 'image/png' }],
  },
}

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
    redirect('/adminhensemonly/login')
  }

  if (!isAdminEmail(user.email)) {
    redirect('/home')
  }

  return children
}
