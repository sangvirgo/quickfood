'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getUser, getRoleRedirect } from '@/lib/auth'

export default function RootPage() {
  const router = useRouter()

  useEffect(() => {
    const user = getUser()
    if (!user) {
      router.replace('/login')
    } else {
      router.replace(getRoleRedirect(user.role))
    }
  }, [router])

  return null
}
