'use client'

import { ReactNode, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import StaffSidebar from '@/components/staff/StaffSidebar'
import { getUser } from '@/lib/auth'

function LoadingSpinner() {
  return (
    <div className="min-h-screen bg-qf-bg flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-4 border-qf-border border-t-qf-primary animate-spin" />
    </div>
  )
}

export default function StaffLayout({ children }: { children: ReactNode }) {
  const router = useRouter()
  const [authChecked, setAuthChecked] = useState(false)

  useEffect(() => {
    const user = getUser()
    if (!user) {
      router.replace('/login')
    } else if (user.role !== 'STAFF') {
      router.replace('/')
    } else {
      setAuthChecked(true)
    }
  }, [router])

  if (!authChecked) return <LoadingSpinner />

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-qf-bg overflow-hidden">
      <StaffSidebar />
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
    </div>
  )
}
