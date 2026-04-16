// Shipper layout stub — sẽ implement ở 06-shipper-dashboard.md
'use client'

import { ReactNode, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getUser } from '@/lib/auth'

function LoadingSpinner() {
  return (
    <div className="min-h-screen bg-qf-bg flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-4 border-qf-border border-t-qf-primary animate-spin" />
    </div>
  )
}

export default function ShipperLayout({ children }: { children: ReactNode }) {
  const router = useRouter()
  const [authChecked, setAuthChecked] = useState(false)

  useEffect(() => {
    const user = getUser()
    if (!user) {
      router.replace('/login')
    } else if (user.role !== 'SHIPPER') {
      router.replace('/')
    } else {
      setAuthChecked(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!authChecked) return <LoadingSpinner />

  return <>{children}</>
}
