'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LogOut, ClipboardList, Package, Menu, X } from 'lucide-react'
import { useState, useEffect } from 'react'
import { getUser, clearAuth } from '@/lib/auth'

export default function StaffSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<{ name?: string; email: string; role: string } | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    setUser(getUser())
  }, [])

  const handleLogout = () => {
    clearAuth()
    router.replace('/login')
  }

  const navItems = [
    { path: '/staff/dashboard', label: 'Đơn hàng chờ', icon: ClipboardList },
    { path: '/staff/products', label: 'Quản lý sản phẩm', icon: Package },
  ]

  const displayName = user?.name || user?.email?.split('@')[0] || 'Staff'

  const sidebarContent = (
    <div className="h-full flex flex-col w-64 text-white" style={{ backgroundColor: 'var(--color-qf-secondary)' }}>
      <div className="p-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display" style={{ color: 'var(--color-qf-primary)' }}>
            QuickFood
          </h1>
          <p className="text-xs mt-1 text-[var(--color-qf-border)] opacity-70">Staff Portal</p>
        </div>
        <button className="lg:hidden p-1 rounded hover:bg-white/10" onClick={() => setMobileOpen(false)}>
          <X size={20} />
        </button>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4">
        {navItems.map((item) => {
          const isActive = pathname === item.path
          return (
            <Link
              key={item.path}
              href={item.path}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all duration-200 ${
                isActive ? 'bg-qf-primary/20 text-white font-medium' : 'text-[var(--color-qf-border)] hover:bg-white/5'
              }`}
              style={{
                borderLeft: isActive ? '3px solid var(--color-qf-primary)' : '3px solid transparent',
              }}
            >
              <item.icon size={18} className={isActive ? 'text-[var(--color-qf-primary)]' : 'opacity-70'} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-white/10 shrink-0">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow-inner" style={{ backgroundColor: 'var(--color-qf-primary)' }}>
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{displayName}</p>
            <p className="text-xs opacity-60 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors border border-red-500/20"
        >
          <LogOut size={15} />
          Đăng xuất
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block h-full shrink-0">
        {sidebarContent}
      </aside>

      {/* Mobile Topbar & Hamburger */}
      <div className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-qf-border text-qf-secondary sticky top-0 z-40">
        <h1 className="text-xl font-bold font-display text-qf-primary">QuickFood<span className="text-sm font-sans font-normal text-qf-muted ml-2">Staff</span></h1>
        <button onClick={() => setMobileOpen(true)} className="p-2 -mr-2 bg-qf-bg rounded-lg text-qf-secondary">
          <Menu size={24} />
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-qf-secondary/50" onClick={() => setMobileOpen(false)} />
          <div className="relative h-full animate-slide-up" style={{ transform: 'none' }}>
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  )
}
