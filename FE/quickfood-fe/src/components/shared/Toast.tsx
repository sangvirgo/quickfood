'use client'

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from 'react'

// ─── Types ───────────────────────────────────────────────────────────────────

type ToastType = 'success' | 'error' | 'info'

interface Toast {
  id: string
  type: ToastType
  message: string
  visible: boolean
}

interface ToastContextValue {
  success: (message: string) => void
  error: (message: string) => void
  info: (message: string) => void
}

// ─── Context ─────────────────────────────────────────────────────────────────

const ToastContext = createContext<ToastContextValue | null>(null)

// ─── Provider ────────────────────────────────────────────────────────────────

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const dismiss = useCallback((id: string) => {
    // Trigger fade-out first
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, visible: false } : t))
    )
    // Remove after animation
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 300)
  }, [])

  const push = useCallback(
    (type: ToastType, message: string) => {
      const id = Math.random().toString(36).slice(2)
      setToasts((prev) => {
        const next = [...prev, { id, type, message, visible: true }]
        // Keep max 3
        return next.slice(-3)
      })
      setTimeout(() => dismiss(id), 3000)
    },
    [dismiss]
  )

  const value: ToastContextValue = {
    success: (msg) => push('success', msg),
    error:   (msg) => push('error',   msg),
    info:    (msg) => push('info',    msg),
  }

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  )
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}

// ─── Visual config per type ──────────────────────────────────────────────────

const CONFIG: Record<
  ToastType,
  { bg: string; border: string; text: string; icon: string }
> = {
  success: {
    bg:     '#D1FAE5',
    border: '#6EE7B7',
    text:   '#065F46',
    icon:   '✅',
  },
  error: {
    bg:     '#FEE2E2',
    border: '#FCA5A5',
    text:   '#991B1B',
    icon:   '❌',
  },
  info: {
    bg:     '#F5E6D3',
    border: 'rgba(232, 82, 26, 0.4)',
    text:   '#92400E',
    icon:   'ℹ️',
  },
}

// ─── Container ───────────────────────────────────────────────────────────────

function ToastContainer({
  toasts,
  onDismiss,
}: {
  toasts: Toast[]
  onDismiss: (id: string) => void
}) {
  return (
    <div
      style={{
        position: 'fixed',
        top: '1.25rem',
        right: '1.25rem',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        pointerEvents: 'none',
      }}
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  )
}

// ─── Single toast item ────────────────────────────────────────────────────────

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: Toast
  onDismiss: (id: string) => void
}) {
  const cfg = CONFIG[toast.type]

  return (
    <div
      onClick={() => onDismiss(toast.id)}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.5rem',
        padding: '0.75rem 1rem',
        minWidth: '260px',
        maxWidth: '360px',
        backgroundColor: cfg.bg,
        border: `1px solid ${cfg.border}`,
        borderRadius: '10px',
        color: cfg.text,
        fontSize: '0.875rem',
        fontWeight: 500,
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        cursor: 'pointer',
        pointerEvents: 'auto',
        // Animate
        opacity: toast.visible ? 1 : 0,
        transform: toast.visible ? 'translateX(0)' : 'translateX(24px)',
        transition: 'opacity 300ms ease, transform 300ms ease',
      }}
    >
      <span style={{ fontSize: '1rem', flexShrink: 0 }}>{cfg.icon}</span>
      <span style={{ flex: 1, lineHeight: 1.4 }}>{toast.message}</span>
    </div>
  )
}
