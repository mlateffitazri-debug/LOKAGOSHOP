export function formatMYPhoneNumber(phone: string | null | undefined): string | null {
  if (!phone) return null
  const digits = phone.replace(/\D/g, '')
  if (digits.length < 9) return null
  if (digits.startsWith('60')) return digits
  if (digits.startsWith('0')) return `6${digits}`
  if (digits.length >= 9) return `60${digits}`
  return null
}

export function formatCurrencyMYR(amount: number): string {
  return amount.toFixed(2)
}

export function formatCurrentDate(): string {
  return new Intl.DateTimeFormat('ms-MY', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date())
}

export function formatCurrentTime(): string {
  return new Intl.DateTimeFormat('ms-MY', { hour: '2-digit', minute: '2-digit', hour12: true }).format(new Date())
}

export function calculateOrderTotal(items: Array<{ price: number; qty: number }>): number {
  return items.reduce((sum, i) => sum + i.price * i.qty, 0)
}

export function buildWAEnquiryMessage(shopName: string): string {
  return [
    'Assalamualaikum!',
    '',
    `Saya jumpa kedai ${shopName} di LokalGo.`,
    'Saya nak tanya tentang produk yang dijual.',
    '',
    'Boleh bantu saya?',
    '',
    '---',
    '',
    'Pesanan dari: https://lokalgo.app',
    `Masa: ${formatCurrentTime()}`,
    `Tarikh: ${formatCurrentDate()}`,
  ].join('\n')
}

export type WAOrderItem = {
  name: string
  qty: number
  price: number
  unit?: string
  isPreorder?: boolean
  pickupDate?: string | null
}

export function buildWAOrderMessage(params: {
  items: WAOrderItem[]
  isPreorder?: boolean
  deliveryAddress?: string | null
  scheduledPickup?: string | null
}): string {
  const { items, isPreorder, deliveryAddress, scheduledPickup } = params
  const total = calculateOrderTotal(items)
  const lines: string[] = [
    'Assalamualaikum!',
    '',
    isPreorder ? 'Saya nak buat pre-order:' : 'Saya nak tempah:',
  ]

  for (const item of items) {
    const pricePart = item.price > 0 ? ` = RM ${formatCurrencyMYR(item.price)} x ${item.qty}` : ''
    lines.push(`${item.qty} x ${item.name}${pricePart}`)
    if (item.isPreorder && item.pickupDate) {
      const pickup = new Date(`${item.pickupDate}T00:00:00`).toLocaleDateString('ms-MY', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
      lines.push(`  Tarikh pickup: ${pickup}`)
    }
  }

  lines.push('', '---', '', `Jumlah RM ${formatCurrencyMYR(total)}`, '', '---', '')

  if (deliveryAddress) {
    lines.push('Dan tempahan ini dihantar di alamat:', deliveryAddress, '')
  }
  if (scheduledPickup) {
    lines.push(`Tarikh penghantaran: ${scheduledPickup}`, '')
  }

  if (isPreorder) {
    lines.push('Boleh saya tahu tarikh ready, cara bayaran dan anggaran delivery?')
  } else if (deliveryAddress) {
    lines.push('Boleh berikan saya harga tambahan untuk delivery?')
  }

  lines.push('', '---', '', 'Pesanan dari: https://lokalgo.app', `Masa: ${formatCurrentTime()}`, `Tarikh: ${formatCurrentDate()}`)
  return lines.join('\n')
}
