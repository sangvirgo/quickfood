'use client'

import { useRef, useEffect } from 'react'
import { X, Minus, Plus, ShoppingBag, Loader2 } from 'lucide-react'
import { useCart } from '@/lib/cart-context'
import { formatPrice } from '@/lib/format'

interface CartSidebarProps {
  open: boolean
  onClose: () => void
  onOrder: () => void
  ordering: boolean
}

export default function CartSidebar({ open, onClose, onOrder, ordering }: CartSidebarProps) {
  const { items, total, count, updateQuantity, removeItem, deliveryAddress, setDeliveryAddress } =
    useCart()

  // Close on ESC
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 transition-opacity duration-300 lg:hidden"
        style={{
          backgroundColor: 'rgba(28,25,23,0.4)',
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
        }}
        onClick={onClose}
      />

      {/* Panel */}
      <aside
        className="fixed top-0 right-0 h-full z-50 flex flex-col"
        style={{
          width: '360px',
          backgroundColor: '#FFFFFF',
          boxShadow: '-4px 0 24px rgba(28,25,23,0.1)',
          transform: open ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 300ms cubic-bezier(0.4, 0, 0.2, 1)',
        }}
        aria-label="Giỏ hàng"
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4 shrink-0"
          style={{ borderBottom: '1px solid var(--color-qf-border)' }}
        >
          <div className="flex items-center gap-2">
            <h2
              className="font-semibold text-base"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--color-qf-secondary)' }}
            >
              Giỏ hàng của bạn
            </h2>
            {count > 0 && (
              <span
                className="text-xs text-white font-bold px-2 py-0.5 rounded-full"
                style={{ backgroundColor: 'var(--color-qf-primary)' }}
              >
                {count}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg transition-colors hover:bg-qf-accent"
            aria-label="Đóng giỏ hàng"
          >
            <X size={18} style={{ color: 'var(--color-qf-muted)' }} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            /* Empty state */
            <div className="flex flex-col items-center justify-center h-full gap-4 px-8 text-center">
              <svg viewBox="0 0 80 80" className="w-20 h-20 opacity-30" fill="none">
                <circle cx="40" cy="40" r="38" stroke="#78716C" strokeWidth="2" />
                <path d="M25 30h30l-4 18H29L25 30z" stroke="#78716C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="33" cy="52" r="2.5" fill="#78716C" />
                <circle cx="47" cy="52" r="2.5" fill="#78716C" />
                <path d="M20 26h4l1 4" stroke="#78716C" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <p className="text-sm font-medium" style={{ color: 'var(--color-qf-muted)' }}>
                Giỏ hàng trống
              </p>
              <p className="text-xs" style={{ color: 'var(--color-qf-muted)' }}>
                Hãy thêm món ăn yêu thích của bạn
              </p>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {items.map((item) => (
                <div
                  key={item.productId}
                  className="flex items-center gap-3 p-3 rounded-xl"
                  style={{ backgroundColor: 'var(--color-qf-bg)' }}
                >
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: 'var(--color-qf-secondary)' }}>
                      {item.name}
                    </p>
                    <p className="text-sm font-semibold mt-0.5" style={{ color: 'var(--color-qf-primary)' }}>
                      {formatPrice(item.price)}
                    </p>
                  </div>

                  {/* Counter */}
                  <div
                    className="flex items-center gap-1 rounded-lg border"
                    style={{ borderColor: 'var(--color-qf-border)' }}
                  >
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      className="p-1.5 transition-colors hover:bg-qf-accent rounded-lg"
                      aria-label="Bớt"
                    >
                      <Minus size={13} style={{ color: 'var(--color-qf-primary)' }} />
                    </button>
                    <span className="text-sm font-semibold w-5 text-center" style={{ color: 'var(--color-qf-secondary)' }}>
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      className="p-1.5 transition-colors hover:bg-qf-accent rounded-lg"
                      aria-label="Thêm"
                    >
                      <Plus size={13} style={{ color: 'var(--color-qf-primary)' }} />
                    </button>
                  </div>

                  {/* Remove */}
                  <button
                    onClick={() => removeItem(item.productId)}
                    className="p-1 rounded transition-colors hover:text-red-500"
                    style={{ color: 'var(--color-qf-muted)' }}
                    aria-label="Xoá"
                  >
                    <X size={15} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div
            className="px-5 py-4 space-y-4 shrink-0"
            style={{ borderTop: '1px solid var(--color-qf-border)' }}
          >
            {/* Subtotal */}
            <div className="flex items-center justify-between">
              <span className="text-sm" style={{ color: 'var(--color-qf-muted)' }}>Tổng</span>
              <span
                className="text-lg font-bold"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--color-qf-secondary)' }}
              >
                {formatPrice(total)}
              </span>
            </div>

            {/* Delivery address */}
            <div>
              <label htmlFor="delivery-address" className="block text-sm font-medium mb-1.5"
                style={{ color: 'var(--color-qf-secondary)' }}>
                Địa chỉ giao hàng <span style={{ color: 'var(--color-qf-primary)' }}>*</span>
              </label>
              <input
                id="delivery-address"
                type="text"
                placeholder="Nhập địa chỉ giao hàng..."
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                className="qf-input text-sm"
              />
            </div>

            {/* Order button */}
            <button
              id="btn-place-order"
              onClick={onOrder}
              disabled={ordering || !deliveryAddress.trim()}
              className="qf-btn-primary flex items-center justify-center gap-2"
            >
              {ordering ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Đang đặt hàng...
                </>
              ) : (
                <>
                  <ShoppingBag size={16} />
                  Đặt hàng
                </>
              )}
            </button>
          </div>
        )}
      </aside>
    </>
  )
}
