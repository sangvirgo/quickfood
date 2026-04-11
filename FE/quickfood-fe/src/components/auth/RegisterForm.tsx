'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

type Role = 'CUSTOMER' | 'STAFF' | 'SHIPPER'

const ROLE_OPTIONS: { value: Role; label: string; icon: string }[] = [
  { value: 'CUSTOMER', label: 'Khách hàng', icon: '🛍' },
  { value: 'STAFF',    label: 'Nhân viên',  icon: '👨‍🍳' },
  { value: 'SHIPPER',  label: 'Shipper',    icon: '🛵' },
]

export default function RegisterForm() {
  const router = useRouter()

  const [name, setName]           = useState('')
  const [email, setEmail]         = useState('')
  const [password, setPassword]   = useState('')
  const [role, setRole]           = useState<Role>('CUSTOMER')
  const [phone, setPhone]         = useState('')
  const [dob, setDob]             = useState('')
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState('')
  const [shake, setShake]         = useState(false)

  const isShipperOrStaff = role === 'SHIPPER'

  const triggerShake = () => {
    setShake(true)
    setTimeout(() => setShake(false), 420)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const body: Record<string, string> = { name, email, password, role }
    if (isShipperOrStaff && phone)  body.phone = phone
    if (isShipperOrStaff && dob)    body.dateOfBirth = dob

    try {
      const res = await fetch(`${API_BASE}/api/core/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const text = await res.text()
        const lower = text.toLowerCase()
        let msg = text || 'Đăng ký thất bại'
        if (lower.includes('exist') || lower.includes('duplicate') || lower.includes('already')) {
          msg = 'Email này đã được sử dụng'
        }
        throw new Error(msg)
      }

      // Redirect to login after success
      router.replace('/login?registered=1')
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
      <div className="space-y-4">
        {/* Họ và tên */}
        <div className="space-y-1.5">
          <label htmlFor="reg-name" className="block text-sm font-medium text-qf-secondary">
            Họ và tên
          </label>
          <input
            id="reg-name"
            type="text"
            autoComplete="name"
            placeholder="Nguyễn Văn A"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="qf-input"
            required
            disabled={loading}
          />
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <label htmlFor="reg-email" className="block text-sm font-medium text-qf-secondary">
            Email
          </label>
          <input
            id="reg-email"
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
          <label htmlFor="reg-password" className="block text-sm font-medium text-qf-secondary">
            Mật khẩu
          </label>
          <input
            id="reg-password"
            type="password"
            autoComplete="new-password"
            placeholder="Tối thiểu 6 ký tự"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="qf-input"
            required
            minLength={6}
            disabled={loading}
          />
        </div>

        {/* Role custom select */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-qf-secondary">
            Vai trò
          </label>
          <div className="grid grid-cols-3 gap-2">
            {ROLE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                id={`role-${opt.value.toLowerCase()}`}
                onClick={() => setRole(opt.value)}
                disabled={loading}
                className="flex flex-col items-center gap-1.5 px-3 py-3 rounded-xl border-2 transition-all duration-150"
                style={{
                  borderColor: role === opt.value
                    ? 'var(--color-qf-primary)'
                    : 'var(--color-qf-border)',
                  backgroundColor: role === opt.value
                    ? 'var(--color-qf-accent)'
                    : 'white',
                  transform: role === opt.value ? 'scale(1.03)' : 'scale(1)',
                }}
              >
                <span className="text-xl">{opt.icon}</span>
                <span
                  className="text-xs font-medium"
                  style={{
                    color: role === opt.value
                      ? 'var(--color-qf-primary)'
                      : 'var(--color-qf-secondary)',
                  }}
                >
                  {opt.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Phone + DOB — only for SHIPPER */}
        {isShipperOrStaff && (
          <div className="space-y-4 animate-slide-up">
            <div className="space-y-1.5">
              <label htmlFor="reg-phone" className="block text-sm font-medium text-qf-secondary">
                Số điện thoại{' '}
                <span className="text-qf-muted font-normal">(tuỳ chọn)</span>
              </label>
              <input
                id="reg-phone"
                type="tel"
                autoComplete="tel"
                placeholder="0901 234 567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="qf-input"
                disabled={loading}
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="reg-dob" className="block text-sm font-medium text-qf-secondary">
                Ngày sinh{' '}
                <span className="text-qf-muted font-normal">(tuỳ chọn)</span>
              </label>
              <input
                id="reg-dob"
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="qf-input"
                disabled={loading}
                max={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>
        )}

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
          id="btn-register"
          type="submit"
          className="qf-btn-primary flex items-center justify-center gap-2"
          disabled={loading}
        >
          {loading && <Loader2 size={18} className="animate-spin" />}
          {loading ? 'Đang đăng ký...' : 'Đăng ký'}
        </button>

        {/* Terms */}
        <p className="text-center text-xs text-qf-muted">
          Bằng cách đăng ký, bạn đồng ý với{' '}
          <span className="text-qf-primary cursor-pointer hover:underline">
            Điều khoản sử dụng
          </span>
        </p>
      </div>
    </form>
  )
}
