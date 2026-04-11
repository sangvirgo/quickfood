'use client'

import { ReactNode, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import StaffSidebar from '@/components/staff/StaffSidebar'
import { getUser } from '@/lib/auth'

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

  if (!authChecked) return null

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-qf-bg overflow-hidden">
      <StaffSidebar />
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
    </div>
  )
}
