'use client'

import { useState, useEffect } from 'react'
import { X, ShoppingCart, Minus, Plus, ShoppingBag, Loader2 } from 'lucide-react'
import { useCart } from '@/lib/cart-context'
import { formatPrice } from '@/lib/format'

interface CartBottomSheetProps {
  onOrder: () => void
  ordering: boolean
}

export default function CartBottomSheet({ onOrder, ordering }: CartBottomSheetProps) {
  const { items, total, count, updateQuantity, deliveryAddress, setDeliveryAddress } = useCart()
  const [open, setOpen] = useState(false)

  // Close when cart becomes empty
  useEffect(() => {
    if (count === 0) setOpen(false)
  }, [count])

  // Lock body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (count === 0) return null

  return (
    <>
      {/* Sticky bar */}
      {!open && (
        <div className="fixed bottom-0 inset-x-0 z-40 lg:hidden px-4 pb-4 animate-slide-up">
          <button
            onClick={() => setOpen(true)}
            id="btn-bottom-cart"
            className="w-full flex items-center justify-between px-5 py-4 rounded-qf text-white"
            style={{ backgroundColor: 'var(--color-qf-primary)' }}
          >
            <div className="flex items-center gap-2">
              <ShoppingCart size={18} />
              <span className="font-medium">{count} món</span>
            </div>
            <span className="font-semibold">{formatPrice(total)}</span>
            <span className="text-sm opacity-90">Xem giỏ hàng →</span>
          </button>
        </div>
      )}

      {/* Bottom sheet modal */}
      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 lg:hidden animate-fade-in"
            style={{ backgroundColor: 'rgba(28,25,23,0.5)' }}
            onClick={() => setOpen(false)}
          />

          {/* Sheet */}
          <div
            className="fixed inset-x-0 bottom-0 z-50 lg:hidden flex flex-col rounded-t-2xl animate-slide-up"
            style={{
              backgroundColor: 'white',
              maxHeight: '85vh',
              boxShadow: '0 -8px 32px rgba(28,25,23,0.12)',
            }}
          >
            {/* Handle + header */}
            <div className="px-5 py-3 shrink-0">
              <div className="w-10 h-1 rounded-full mx-auto mb-3"
                style={{ backgroundColor: 'var(--color-qf-border)' }} />
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-base"
                  style={{ fontFamily: 'var(--font-display)', color: 'var(--color-qf-secondary)' }}>
                  Giỏ hàng ({count} món)
                </h3>
                <button onClick={() => setOpen(false)} className="p-1 rounded-lg hover:bg-qf-accent">
                  <X size={18} style={{ color: 'var(--color-qf-muted)' }} />
                </button>
              </div>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-5 py-2 space-y-3"
              style={{ borderTop: '1px solid var(--color-qf-border)' }}>
              {items.map((item) => (
                <div key={item.productId} className="flex items-center gap-3 py-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: 'var(--color-qf-secondary)' }}>
                      {item.name}
                    </p>
                    <p className="text-sm" style={{ color: 'var(--color-qf-primary)', fontWeight: 600 }}>
                      {formatPrice(item.price)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 rounded-lg border px-1"
                    style={{ borderColor: 'var(--color-qf-border)' }}>
                    <button onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      className="p-1.5 hover:bg-qf-accent rounded">
                      <Minus size={13} style={{ color: 'var(--color-qf-primary)' }} />
                    </button>
                    <span className="text-sm font-semibold w-5 text-center">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      className="p-1.5 hover:bg-qf-accent rounded">
                      <Plus size={13} style={{ color: 'var(--color-qf-primary)' }} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="px-5 py-4 space-y-3 shrink-0"
              style={{ borderTop: '1px solid var(--color-qf-border)' }}>
              <div className="flex justify-between items-center">
                <span className="text-sm" style={{ color: 'var(--color-qf-muted)' }}>Tổng</span>
                <span className="text-lg font-bold"
                  style={{ fontFamily: 'var(--font-display)', color: 'var(--color-qf-secondary)' }}>
                  {formatPrice(total)}
                </span>
              </div>
              <input
                type="text"
                placeholder="Địa chỉ giao hàng *"
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                className="qf-input text-sm"
              />
              <button
                onClick={() => { onOrder(); setOpen(false) }}
                disabled={ordering || !deliveryAddress.trim()}
                className="qf-btn-primary flex items-center justify-center gap-2"
                id="btn-mobile-order"
              >
                {ordering ? <Loader2 size={16} className="animate-spin" /> : <ShoppingBag size={16} />}
                {ordering ? 'Đang đặt...' : 'Đặt hàng'}
              </button>
            </div>
          </div>
        </>
      )}
    </>
  )
}
