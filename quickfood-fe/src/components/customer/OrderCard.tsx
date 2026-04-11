'use client'

import { formatPrice } from '@/lib/format'
import { Order } from '@/app/(customer)/orders/types'

// Format helper according to spec: Intl.DateTimeFormat
const formatDate = (iso: string) => 
  new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  }).format(new Date(iso))

interface OrderCardProps {
  order: Order
  selected: boolean
  onClick: () => void
}

export function OrderStatusBadge({ status }: { status: Order['status'] }) {
  switch (status) {
    case 'PENDING':
      return (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: '#FEF3C7', color: '#92400E' }}>
          <span>⏳</span> CHỜ XÁC NHẬN
        </div>
      )
    case 'READY':
      return (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: '#DBEAFE', color: '#1E40AF' }}>
          <span>🔔</span> SẴN SÀNG/ĐANG GIAO
        </div>
      )
    case 'DELIVERED':
      return (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: '#D1FAE5', color: '#065F46' }}>
          <span>✅</span> ĐÃ GIAO
        </div>
      )
    default:
      return null
  }
}

export default function OrderCard({ order, selected, onClick }: OrderCardProps) {
  const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0)
  const previews = order.items.map(i => i.productName).slice(0, 2).join(', ') + (order.items.length > 2 ? ', ...' : '')

  return (
    <div 
      onClick={onClick}
      className={`p-4 rounded-xl cursor-pointer transition-colors ${selected ? 'bg-qf-accent shadow-sm' : 'bg-white border border-qf-border hover:bg-qf-bg'}`}
      style={{
        borderLeft: selected ? '4px solid var(--color-qf-primary)' : '1px solid var(--color-qf-border)',
      }}
    >
      <div className="flex items-start justify-between mb-3">
        <OrderStatusBadge status={order.status} />
        <span className="text-xs text-qf-muted">{formatDate(order.createdAt)}</span>
      </div>
      
      <div className="mb-2">
        <h4 className="font-semibold text-qf-secondary text-base mb-1">Đơn #{order.id}</h4>
        <p className="text-sm font-medium" style={{ color: 'var(--color-qf-primary)' }}>
          {itemCount} món · {formatPrice(order.totalPrice)}
        </p>
      </div>

      <p className="text-sm text-qf-muted line-clamp-1">{previews}</p>
    </div>
  )
}
