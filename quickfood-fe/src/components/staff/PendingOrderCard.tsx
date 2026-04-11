'use client'

import { useState } from 'react'
import { Check, Loader2, MapPin, User, Clock } from 'lucide-react'
import { formatPrice } from '@/lib/format'
import { Order } from '@/app/(customer)/orders/types'

// Format helper according to spec: Thứ X, HH:MM
const formatOrderTime = (iso: string) => {
  const date = new Date(iso)
  const days = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7']
  const dayName = days[date.getDay()]
  
  const formatter = new Intl.DateTimeFormat('vi-VN', {
    hour: '2-digit', minute: '2-digit'
  })
  
  return `${dayName}, ${formatter.format(date)}`
}

interface PendingOrderCardProps {
  order: Order
  onApprove: (id: number) => Promise<void>
}

export default function PendingOrderCard({ order, onApprove }: PendingOrderCardProps) {
  const [loading, setLoading] = useState(false)
  const [shrinking, setShrinking] = useState(false)

  const handleApprove = async () => {
    // Optional confirm as mentioned in the spec
    if (!window.confirm(`Xác nhận duyệt đơn #${order.id}?`)) return
    
    setLoading(true)
    try {
      await onApprove(order.id)
      setShrinking(true) // Trigger slide-out/shrink animation
    } catch (err) {
      setLoading(false)
    }
  }

  if (shrinking) {
    return (
      <div className="h-0 opacity-0 overflow-hidden transition-all duration-300 ease-out" />
    )
  }

  return (
    <div 
      className="bg-white border rounded-xl p-5 shadow-sm transition-shadow hover:shadow-md"
      style={{
        borderColor: 'var(--color-qf-border)',
        borderLeft: '4px solid var(--color-qf-primary)'
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-qf-border">
        <h3 className="text-lg font-bold font-display text-qf-secondary">Đơn #{order.id}</h3>
        <div className="flex items-center gap-1.5 text-sm text-qf-muted font-medium bg-qf-bg px-2.5 py-1 rounded-md border border-qf-border">
          <Clock size={14} className="text-qf-primary" />
          {formatOrderTime(order.createdAt)}
        </div>
      </div>

      {/* Items */}
      <div className="space-y-2 mb-4">
        {order.items.map((item, idx) => (
          <div key={item.id} className="flex items-start justify-between text-sm">
            <div className="flex items-start gap-2 max-w-[70%]">
              <span className="opacity-50 mt-0.5">{idx === 0 ? '🛍️' : '  '}</span>
              <span className="font-medium text-qf-secondary leading-snug">
                {item.productName} <span className="text-qf-muted ml-1">x{item.quantity}</span>
              </span>
            </div>
            <span className="font-medium text-qf-secondary shrink-0">{formatPrice(item.subtotal)}</span>
          </div>
        ))}
      </div>

      {/* Customer & Address */}
      <div className="space-y-2 mb-5 pt-3 border-t border-qf-border border-dashed">
        <div className="flex items-start gap-2 text-sm text-qf-muted">
          <MapPin size={16} className="mt-0.5 shrink-0" />
          <span className="leading-snug">{order.deliveryAddress || 'Nhận tại cửa tiệm'}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-qf-muted">
          <User size={16} className="shrink-0" />
          <span>Customer #{order.customerId}</span>
        </div>
      </div>

      {/* Action */}
      <div className="flex justify-end pt-3">
        <button
          onClick={handleApprove}
          disabled={loading}
          className="qf-btn-primary !w-auto flex items-center gap-2 py-2.5 px-5 text-sm shadow-sm"
        >
          {loading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Check size={16} />
          )}
          {loading ? 'Đang duyệt...' : 'Duyệt - Sẵn sàng →'}
        </button>
      </div>
    </div>
  )
}
