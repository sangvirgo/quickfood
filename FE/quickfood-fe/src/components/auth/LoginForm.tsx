'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { saveAuth } from '@/lib/auth'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

interface LoginResponse {
  token: string
  type: string
  id: number
  email: string
  role: string
  name?: string
}

function getRoleRedirect(role: string): string {
  switch (role) {
    case 'STAFF':   return '/staff/dashboard'
    case 'SHIPPER': return '/shipper/dashboard'
    default:        return '/'
  }
}

export default function LoginForm() {
  const router = useRouter()

  const [email, setEmail]         = useState('')
  const [password, setPassword]   = useState('')
  const [showPw, setShowPw]       = useState(false)
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState('')
  const [shake, setShake]         = useState(false)

  const triggerShake = () => {
    setShake(true)
    setTimeout(() => setShake(false), 420)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch(`${API_BASE}/api/core/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      if (!res.ok) {
        const text = await res.text()
        const msg = text.includes('credentials')
          ? 'Email hoặc mật khẩu không đúng'
          : text || 'Email hoặc mật khẩu không đúng'
        throw new Error(msg)
      }

      const data: LoginResponse = await res.json()
      saveAuth(data.token, {
        id:    data.id,
        email: data.email,
        role:  data.role as 'CUSTOMER' | 'STAFF' | 'SHIPPER',
        name:  data.name,
      })
      router.replace(getRoleRedirect(data.role))
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Đã có lỗi xảy ra'
      setError(message)
      triggerShake()
    } finally {
      setLoading(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className={shake ? 'animate-shake' : ''}
    >
      <div className="space-y-5">
        {/* Email */}
        <div className="space-y-1.5">
          <label
            htmlFor="login-email"
            className="block text-sm font-medium text-qf-secondary"
          >
            Email
          </label>
          <input
            id="login-email"
            type="email"
            autoComplete="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="qf-input"
            required
            disabled={loading}
          />
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <label
            htmlFor="login-password"
            className="block text-sm font-medium text-qf-secondary"
          >
            Mật khẩu
          </label>
          <div className="relative">
            <input
              id="login-password"
              type={showPw ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="qf-input pr-11"
              required
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-qf-muted hover:text-qf-secondary transition-colors"
              aria-label={showPw ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
            >
              {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {/* Forgot password */}
          <div className="flex justify-end mt-1">
            <button
              type="button"
              className="text-xs text-qf-muted hover:text-qf-primary transition-colors"
            >
              Quên mật khẩu?
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div
            className="flex items-center gap-2 text-sm px-4 py-3 rounded-lg"
            style={{
              backgroundColor: '#FEF2F2',
              border: '1px solid #FECACA',
              color: '#DC2626',
            }}
            role="alert"
          >
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Submit */}
        <button
          id="btn-login"
          type="submit"
          className="qf-btn-primary flex items-center justify-center gap-2"
          disabled={loading}
        >
          {loading && <Loader2 size={18} className="animate-spin" />}
          {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </button>

        {/* Terms */}
        <p className="text-center text-xs text-qf-muted mt-2">
          Bằng cách đăng nhập, bạn đồng ý với{' '}
          <span className="text-qf-primary cursor-pointer hover:underline">
            Điều khoản sử dụng
          </span>
        </p>
      </div>
    </form>
  )
}
