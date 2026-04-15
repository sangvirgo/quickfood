'use client'
// Customer layout stub — sẽ implement ở 02-home-customer.md

import { ReactNode, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CartProvider } from '@/lib/cart-context'
import { getUser } from '@/lib/auth'

function LoadingSpinner() {
  return (
    <div className="min-h-screen bg-qf-bg flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-4 border-qf-border border-t-qf-primary animate-spin" />
    </div>
  )
}

export default function CustomerLayout({ children }: { children: ReactNode }) {
  const router = useRouter()
  const [authChecked, setAuthChecked] = useState(false)

  useEffect(() => {
    const user = getUser()
    if (!user) {
      router.replace('/login')
    } else if (user.role !== 'CUSTOMER') {
      // Non-customer users should not access customer pages
      // Redirect to their role-appropriate page
      router.replace(user.role === 'STAFF' ? '/staff/dashboard' : '/shipper/dashboard')
    } else {
      setAuthChecked(true)
    }
  }, [router])

  if (!authChecked) return <LoadingSpinner />

  return (
    <CartProvider>
      {children}
    </CartProvider>
  )
}
