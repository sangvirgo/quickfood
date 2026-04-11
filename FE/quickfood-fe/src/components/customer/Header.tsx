'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Search, ShoppingCart, ChevronDown, LogOut, ClipboardList } from 'lucide-react'
import { useCart } from '@/lib/cart-context'
import { clearAuth } from '@/lib/auth'

interface UserInfo {
  id: number
  email: string
  role: string
  name?: string
}

interface HeaderProps {
  onCartClick: () => void
  search: string
  onSearch: (v: string) => void
}

export default function Header({ onCartClick, search, onSearch }: HeaderProps) {
  const router = useRouter()
  const { count } = useCart()
  const [user, setUser] = useState<UserInfo | null>(null)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [badgeAnim, setBadgeAnim] = useState(false)
  const prevCount = useRef(count)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    try {
      const raw = localStorage.getItem('qf_user')
      if (raw) setUser(JSON.parse(raw))
    } catch {}
  }, [])

  // Badge pop animation on count change
  useEffect(() => {
    if (count !== prevCount.current) {
      setBadgeAnim(true)
      const t = setTimeout(() => setBadgeAnim(false), 300)
      prevCount.current = count
      return () => clearTimeout(t)
    }
  }, [count])

  // Close dropdown outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleLogout = () => {
    clearAuth()
    router.replace('/login')
  }

  const displayName = user?.name || user?.email?.split('@')[0] || 'Bạn'

  return (
    <header
      className="sticky top-0 z-40 flex items-center gap-4 px-4 lg:px-8 h-16"
      style={{
        backgroundColor: '#FFFFFF',
        boxShadow: '0 1px 0 var(--color-qf-border)',
      }}
    >
      {/* Logo */}
      <Link
        href="/"
        className="text-xl font-bold shrink-0"
        style={{
          fontFamily: 'var(--font-display)',
          color: 'var(--color-qf-primary)',
        }}
      >
        QuickFood
      </Link>

      {/* Search bar */}
      <div className="flex-1 max-w-md mx-auto relative">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
          style={{ color: 'var(--color-qf-muted)' }}
        />
        <input
          type="search"
          id="search-products"
          placeholder="Tìm món ăn..."
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          className="qf-input pl-9 h-9 text-sm"
          style={{ paddingTop: '0.375rem', paddingBottom: '0.375rem' }}
        />
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Cart button */}
        <button
          id="btn-cart"
          onClick={onCartClick}
          className="relative p-2 rounded-lg transition-colors hover:bg-qf-accent"
          aria-label="Giỏ hàng"
        >
          <ShoppingCart size={22} style={{ color: 'var(--color-qf-secondary)' }} />
          {count > 0 && (
            <span
              className="absolute -top-1 -right-1 flex items-center justify-center text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] px-1"
              style={{
                backgroundColor: 'var(--color-qf-primary)',
                transform: badgeAnim ? 'scale(1.3)' : 'scale(1)',
                transition: 'transform 150ms ease',
              }}
            >
              {count}
            </span>
          )}
        </button>

        {/* User dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            id="btn-user-menu"
            onClick={() => setDropdownOpen((v) => !v)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors hover:bg-qf-accent"
            style={{ color: 'var(--color-qf-secondary)' }}
          >
            <span
              className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
              style={{ backgroundColor: 'var(--color-qf-primary)' }}
            >
              {displayName.charAt(0).toUpperCase()}
            </span>
            <span className="hidden sm:block max-w-[100px] truncate">{displayName}</span>
            <ChevronDown size={14} className={`transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {dropdownOpen && (
            <div
              className="absolute right-0 top-full mt-2 w-48 rounded-xl border py-1 animate-scale-in"
              style={{
                backgroundColor: 'white',
                borderColor: 'var(--color-qf-border)',
                boxShadow: '0 8px 24px rgba(28,25,23,0.12)',
              }}
            >
              <Link
                href="/orders"
                className="flex items-center gap-2 px-4 py-2.5 text-sm transition-colors hover:bg-qf-accent"
                style={{ color: 'var(--color-qf-secondary)' }}
                onClick={() => setDropdownOpen(false)}
              >
                <ClipboardList size={15} />
                Đơn hàng của tôi
              </Link>
              <hr style={{ borderColor: 'var(--color-qf-border)' }} />
              <button
                id="btn-logout"
                onClick={handleLogout}
                className="flex items-center gap-2 w-full px-4 py-2.5 text-sm transition-colors hover:bg-red-50 text-red-600"
              >
                <LogOut size={15} />
                Đăng xuất
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
