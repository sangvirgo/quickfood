'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import AuthLayout from '@/components/auth/AuthLayout'
import LoginForm from '@/components/auth/LoginForm'
import RegisterForm from '@/components/auth/RegisterForm'

type Tab = 'login' | 'register'

export default function LoginPage() {
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState<Tab>('login')
  const [animKey, setAnimKey] = useState(0)
  const [successMsg, setSuccessMsg] = useState('')

  // If redirected after register
  useEffect(() => {
    if (searchParams.get('registered') === '1') {
      setSuccessMsg('Đăng ký thành công! Vui lòng đăng nhập.')
      setActiveTab('login')
    }
  }, [searchParams])

  const switchTab = (tab: Tab) => {
    if (tab === activeTab) return
    setActiveTab(tab)
    setSuccessMsg('')
    setAnimKey((k) => k + 1) // remount form content → re-trigger animation
  }

  return (
    <AuthLayout>
      <div>
        {/* ── Tab switcher ───────────────────────────────────── */}
        <div
          className="flex border-b mb-8"
          style={{ borderColor: 'var(--color-qf-border)' }}
          role="tablist"
        >
          {(
            [
              { key: 'login',    label: 'Đăng nhập' },
              { key: 'register', label: 'Đăng ký'   },
            ] as { key: Tab; label: string }[]
          ).map(({ key, label }) => (
            <button
              key={key}
              id={`tab-${key}`}
              role="tab"
              aria-selected={activeTab === key}
              onClick={() => switchTab(key)}
              className="relative pb-3 mr-8 text-sm font-medium transition-colors duration-150"
              style={{
                color:
                  activeTab === key
                    ? 'var(--color-qf-primary)'
                    : 'var(--color-qf-muted)',
                fontFamily: 'var(--font-sans)',
              }}
            >
              {label}
              {/* Underline indicator */}
              <span
                className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full transition-all duration-200"
                style={{
                  backgroundColor: 'var(--color-qf-primary)',
                  transform: activeTab === key ? 'scaleX(1)' : 'scaleX(0)',
                  transformOrigin: 'left',
                }}
              />
            </button>
          ))}
        </div>

        {/* ── Heading ────────────────────────────────────────── */}
        <div className="mb-6">
          <h2
            className="text-2xl font-bold text-qf-secondary"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {activeTab === 'login' ? 'Chào mừng trở lại' : 'Tạo tài khoản'}
          </h2>
          <p className="mt-1 text-sm text-qf-muted">
            {activeTab === 'login'
              ? 'Đăng nhập để tiếp tục đặt món yêu thích'
              : 'Tham gia QuickFood ngay hôm nay — hoàn toàn miễn phí'}
          </p>
        </div>

        {/* ── Success message (after register) ───────────────── */}
        {successMsg && (
          <div
            className="flex items-center gap-2 text-sm px-4 py-3 rounded-lg mb-5"
            style={{
              backgroundColor: '#D1FAE5',
              border: '1px solid #6EE7B7',
              color: '#065F46',
            }}
          >
            <span>✅</span>
            <span>{successMsg}</span>
          </div>
        )}

        {/* ── Form content with fade+slide animation ──────────── */}
        <div
          key={animKey}
          className="animate-slide-up"
          role="tabpanel"
          aria-labelledby={`tab-${activeTab}`}
        >
          {activeTab === 'login' ? <LoginForm /> : <RegisterForm />}
        </div>
      </div>
    </AuthLayout>
  )
}
