'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getUser, getRoleRedirect } from '@/lib/auth'

export default function RootPage() {
  const router = useRouter()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const user = getUser()
    if (!user) {
      router.replace('/login')
    } else {
      router.replace(getRoleRedirect(user.role))
    }
    // Ensure we stay in loading state until redirect actually happens
    const t = setTimeout(() => setReady(true), 500)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Always show spinner while redirect is pending
  return (
    <div className="min-h-screen bg-qf-bg flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-4 border-qf-border border-t-qf-primary animate-spin" />
    </div>
  )
}