'use client'

import { useEffect, useRef } from 'react'

interface ConfirmDialogProps {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  danger?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Xác nhận',
  cancelLabel = 'Huỷ',
  danger = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null)

  // Focus trap & ESC close
  useEffect(() => {
    if (!open) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel()
    }
    window.addEventListener('keydown', handleKey)
    dialogRef.current?.focus()
    return () => window.removeEventListener('keydown', handleKey)
  }, [open, onCancel])

  if (!open) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
      className="fixed inset-0 z-50 flex items-center justify-center"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-qf-secondary/40 animate-fade-in"
        onClick={onCancel}
      />

      {/* Panel */}
      <div
        ref={dialogRef}
        tabIndex={-1}
        className="relative qf-card p-6 w-full max-w-sm mx-4 animate-scale-in focus:outline-none"
      >
        <h2
          id="confirm-title"
          className="text-lg font-semibold text-qf-secondary mb-2"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {title}
        </h2>
        <p className="text-sm text-qf-muted mb-6 leading-relaxed">{message}</p>

        <div className="flex gap-3 justify-end">
          <button
            className="qf-btn-secondary"
            style={{ width: 'auto' }}
            onClick={onCancel}
          >
            {cancelLabel}
          </button>
          <button
            className="qf-btn-primary"
            style={{
              width: 'auto',
              backgroundColor: danger ? '#DC2626' : undefined,
            }}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
