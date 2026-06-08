import { redirect } from 'next/navigation'

export default function ShopByIdPage({ params }: { params: { id: string } }) {
  redirect(`/shop?seller=${encodeURIComponent(params.id)}`)
}
