# Prompt: Setup Dự Án Next.js — QuickFood Frontend

## Mục tiêu
Khởi tạo project Next.js 14+ với cấu trúc thư mục chuẩn, cài đặt dependencies, config Tailwind, fonts, và các helper utilities dùng chung cho toàn bộ QuickFood FE.

---

## Khởi tạo project

```bash
npx create-next-app@latest quickfood-fe \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*"
```

---

## Dependencies cần cài thêm

```bash
npm install lucide-react
```

Không cài thêm UI library khác (shadcn, chakra, MUI...).

---

## Tailwind Config (`tailwind.config.ts`)

```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'qf-bg': '#FAF7F2',
        'qf-surface': '#FFFFFF',
        'qf-primary': '#E8521A',
        'qf-primary-hover': '#C94412',
        'qf-secondary': '#1C1917',
        'qf-muted': '#78716C',
        'qf-border': '#E7E0D8',
        'qf-accent': '#F5E6D3',
      },
      fontFamily: {
        display: ['var(--font-playfair)', 'Georgia', 'serif'],
        sans: ['var(--font-dm-sans)', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'qf': '12px',
      },
      boxShadow: {
        'qf-card': '0 2px 8px rgba(28, 25, 23, 0.06)',
        'qf-card-hover': '0 4px 16px rgba(28, 25, 23, 0.12)',
      },
      animation: {
        'fade-in': 'fadeIn 200ms ease-out',
        'slide-up': 'slideUp 250ms ease-out',
        'scale-in': 'scaleIn 200ms ease-out',
        'shake': 'shake 400ms ease-in-out',
        'pulse-dot': 'pulseDot 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%': { transform: 'translateX(-6px)' },
          '40%': { transform: 'translateX(6px)' },
          '60%': { transform: 'translateX(-4px)' },
          '80%': { transform: 'translateX(4px)' },
        },
        pulseDot: {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.4)', opacity: '0.7' },
        },
      },
    },
  },
  plugins: [],
}

export default config
```

---

## Root Layout (`src/app/layout.tsx`)

```typescript
import type { Metadata } from 'next'
import { Playfair_Display, DM_Sans } from 'next/font/google'
import './globals.css'

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'QuickFood — Đặt nhanh, giao nhanh',
  description: 'Nền tảng đặt đồ ăn nhanh',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="vi" className={`${playfair.variable} ${dmSans.variable}`}>
      <body className="font-sans bg-qf-bg text-qf-secondary antialiased">
        {children}
      </body>
    </html>
  )
}
```

---

## Global CSS (`src/app/globals.css`)

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  * {
    box-sizing: border-box;
  }

  html {
    scroll-behavior: smooth;
  }

  input, textarea, select {
    @apply outline-none;
  }

  input:focus, textarea:focus, select:focus {
    @apply ring-2 ring-qf-primary ring-opacity-30 border-qf-primary;
  }
}

@layer components {
  /* Reusable input style */
  .qf-input {
    @apply w-full px-4 py-3 bg-white border border-qf-border rounded-lg 
           text-qf-secondary placeholder-qf-muted text-sm
           transition-all duration-150
           focus:ring-2 focus:ring-qf-primary/20 focus:border-qf-primary;
  }

  /* Reusable primary button */
  .qf-btn-primary {
    @apply w-full px-6 py-3 bg-qf-primary text-white font-medium rounded-lg
           transition-all duration-150 active:scale-[0.98]
           hover:bg-qf-primary-hover
           disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100;
  }

  /* Reusable secondary button */
  .qf-btn-secondary {
    @apply px-6 py-3 border border-qf-border text-qf-secondary font-medium rounded-lg
           transition-all duration-150 hover:bg-qf-accent
           disabled:opacity-50 disabled:cursor-not-allowed;
  }

  /* Card base */
  .qf-card {
    @apply bg-qf-surface border border-qf-border rounded-qf shadow-qf-card;
  }
}

/* Scrollbar tùy chỉnh */
::-webkit-scrollbar {
  width: 6px;
}
::-webkit-scrollbar-track {
  background: #FAF7F2;
}
::-webkit-scrollbar-thumb {
  background: #E7E0D8;
  border-radius: 3px;
}
::-webkit-scrollbar-thumb:hover {
  background: #78716C;
}
```

---

## Environment Variables (`.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

---

## Utility Helpers (`src/lib/`)

### `src/lib/api.ts`

```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('qf_token')
}

interface FetchOptions extends RequestInit {
  auth?: boolean
}

export async function apiFetch<T>(
  path: string,
  options: FetchOptions = {}
): Promise<T> {
  const { auth = true, headers, ...rest } = options

  const finalHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    ...(headers as Record<string, string> || {}),
  }

  if (auth) {
    const token = getToken()
    if (token) {
      (finalHeaders as Record<string, string>)['Authorization'] = `Bearer ${token}`
    }
  }

  const response = await fetch(`${API_URL}${path}`, {
    headers: finalHeaders,
    ...rest,
  })

  if (response.status === 401) {
    // Clear auth và redirect login
    localStorage.removeItem('qf_token')
    localStorage.removeItem('qf_user')
    window.location.href = '/login'
    throw new Error('Unauthorized')
  }

  if (!response.ok) {
    const errorBody = await response.text()
    throw new Error(errorBody || `HTTP ${response.status}`)
  }

  if (response.status === 204) return null as T

  return response.json()
}
```

### `src/lib/auth.ts`

```typescript
export interface UserInfo {
  id: number
  email: string
  role: 'CUSTOMER' | 'STAFF' | 'SHIPPER'
  name?: string
}

export function getUser(): UserInfo | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem('qf_user')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('qf_token')
}

export function saveAuth(token: string, user: UserInfo): void {
  localStorage.setItem('qf_token', token)
  localStorage.setItem('qf_user', JSON.stringify(user))
}

export function clearAuth(): void {
  localStorage.removeItem('qf_token')
  localStorage.removeItem('qf_user')
  localStorage.removeItem('qf_current_shipment')
}

export function getRoleRedirect(role: string): string {
  switch (role) {
    case 'STAFF': return '/staff/dashboard'
    case 'SHIPPER': return '/shipper/dashboard'
    default: return '/'
  }
}
```

### `src/lib/format.ts`

```typescript
export function formatPrice(amount: number): string {
  return amount.toLocaleString('vi-VN') + ' đ'
}

export function formatDateTime(iso: string): string {
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso))
}

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(iso))
}

export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Vừa xong'
  if (mins < 60) return `${mins} phút trước`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours} giờ trước`
  return formatDate(iso)
}
```

---

## Routing Structure

```
src/app/
  layout.tsx                    ← root layout (fonts, body)
  page.tsx                      ← redirect dựa trên role
  
  login/
    page.tsx                    ← login/register (01-auth)
  
  (customer)/
    layout.tsx                  ← customer guard + header
    page.tsx                    ← home/menu (02-home-customer)
    orders/
      page.tsx                  ← order history + tracking (03-orders-tracking)
  
  (staff)/
    layout.tsx                  ← staff guard + sidebar
    staff/
      dashboard/
        page.tsx                ← staff dashboard (04-staff-dashboard)
      products/
        page.tsx                ← product management (05-staff-products)
  
  (shipper)/
    layout.tsx                  ← shipper guard
    shipper/
      dashboard/
        page.tsx                ← shipper dashboard (06-shipper-dashboard)

src/components/
  auth/                         ← auth components
  customer/                     ← customer-specific
  staff/                        ← staff-specific
  shipper/                      ← shipper-specific
  shared/
    Toast.tsx
    LoadingSkeleton.tsx
    ConfirmDialog.tsx

src/lib/
  api.ts
  auth.ts
  format.ts
  cart-context.tsx
```

---

## Root Page Redirect (`src/app/page.tsx`)

```typescript
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
```

---

## Shared Toast Component (`src/components/shared/Toast.tsx`)

Tạo một Toast system đơn giản dùng Context:

```typescript
// Cung cấp hook: useToast()
// Usage: const toast = useToast()
// toast.success('Message') | toast.error('Message') | toast.info('Message')

// Auto dismiss sau 3 giây
// Animation: slide in từ phải, fade out
// Position: fixed top-right, z-50
// Tối đa 3 toast cùng lúc
```

Style:
- Success: background #D1FAE5, border #6EE7B7, text #065F46, icon ✅
- Error: background #FEE2E2, border #FCA5A5, text #991B1B, icon ❌
- Info: background #F5E6D3, border #E8521A với opacity, text #92400E, icon ℹ️

---

## Lưu ý quan trọng

1. **Tất cả components dùng `'use client'`** khi có state/effects
2. **Không dùng `<a>` tag** để navigate — dùng `next/link` hoặc `useRouter`
3. **Images từ URL bên ngoài**: dùng `<img>` thường thay vì `next/image` (trừ khi config domains)
4. **Responsive**: tất cả page phải dùng được trên mobile (375px) và desktop (1280px+)
5. **API calls**: luôn có loading state, error state, và empty state
