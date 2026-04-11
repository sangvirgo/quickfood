// Customer layout stub — sẽ implement ở 02-home-customer.md
'use client'

import { ReactNode } from 'react'
import { CartProvider } from '@/lib/cart-context'

export default function CustomerLayout({ children }: { children: ReactNode }) {
  return (
    <CartProvider>
      {children}
    </CartProvider>
  )
}
