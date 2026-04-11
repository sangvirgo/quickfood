'use client'

import { LogOut } from 'lucide-react'
import { clearAuth, getUser } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function ShipperHeader({ shipperName }: { shipperName?: string }) {
  const router = useRouter()
  const [user, setUser] = useState<{ email: string } | null>(null)

  useEffect(() => {
    setUser(getUser())
  }, [])

  const handleLogout = () => {
    clearAuth()
    router.replace('/login')
  }

  const nameToDisplay = shipperName || user?.email?.split('@')[0] || 'Shipper'

  return (
    <div className="flex items-center justify-between p-4 bg-white border-b border-qf-border sticky top-0 z-40 shadow-sm">
      <h1 className="text-xl font-bold font-display text-qf-primary">
        QuickFood<span className="text-sm font-sans font-normal text-qf-muted ml-1">Shipper</span>
      </h1>
      
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-xs bg-qf-secondary shadow-inner">
            {nameToDisplay.charAt(0).toUpperCase()}
          </div>
          <span className="text-sm font-medium hidden sm:block truncate max-w-[100px]">{nameToDisplay}</span>
        </div>
        <button 
          onClick={handleLogout}
          className="p-2 text-qf-muted hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          aria-label="Đăng xuất"
        >
          <LogOut size={20} />
        </button>
      </div>
    </div>
  )
}
