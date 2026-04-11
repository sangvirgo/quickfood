'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getUser, getRoleRedirect } from '@/lib/auth'

export default function RootPage() {
  const router = useRouter()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const user = getUser()
    if (!user) {
      router.replace('/login')
    } else {
      router.replace(getRoleRedirect(user.role))
    }
    setChecking(false)
  }, [router])

  // Hiện loading thay vì null để tránh flash trắng
  if (checking) {
    return (
      <div className="min-h-screen bg-qf-bg flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 border-qf-border border-t-qf-primary animate-spin" />
      </div>
    )
  }

  return null
}