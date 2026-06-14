'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { SellerSuccessShareModal } from '@/components/SellerSuccessShareModal'

export default function Page() {
  const router = useRouter()
  const [shopName, setShopName] = useState('Kedai Saya')

  useEffect(() => {
    localStorage.removeItem('lokalgo_after_login')
    localStorage.removeItem('lokalgo_seller_onboarding_success')
    try {
      const saved = localStorage.getItem('lokalgo_seller_onboarding')
      if (saved) {
        const d = JSON.parse(saved) as { shop_name?: string }
        if (d.shop_name) setShopName(d.shop_name)
      }
    } catch { /* ignore */ }
  }, [])

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: 'html,body{background:#7B1533!important;}' }} />
      <SellerSuccessShareModal
        open={true}
        shopName={shopName}
        onClose={() => router.push('/home')}
      />
    </>
  )
}
