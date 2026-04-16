'use client'
import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { getUser, getRoleRedirect } from '@/lib/auth'

export default function RootPage() {
  const router = useRouter()
  const didRedirect = useRef(false)

  useEffect(() => {
    if (didRedirect.current) return

    const tryRedirect = () => {
      if (didRedirect.current) return
      const user = getUser()
      if (!user) {
        didRedirect.current = true
        router.replace('/login')
      } else {
        didRedirect.current = true
        router.replace(getRoleRedirect(user.role))
      }
    }

    // Thử ngay lập tức
    tryRedirect()

    // Fallback nếu localStorage chưa sync kịp (race condition sau login)
    const t = setTimeout(tryRedirect, 150)
    return () => clearTimeout(t)
  }, [router])

  return (
    <div className="min-h-screen bg-qf-bg flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-4 border-qf-border border-t-qf-primary animate-spin" />
    </div>
  )
}