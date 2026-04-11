'use client'

import { formatPrice } from '@/lib/format'
import { Order } from '@/app/(customer)/orders/types'
import { OrderStatusBadge } from './OrderCard'
import TrackingCard from './TrackingCard'
import { X } from 'lucide-react'

// Format helper according to spec
const formatDate = (iso: string) => 
  new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  }).format(new Date(iso))

interface OrderDetailPanelProps {
  order: Order | null
  onCloseMobile?: () => void
}

export default function OrderDetailPanel({ order, onCloseMobile }: OrderDetailPanelProps) {
  if (!order) {
    return (
      <div className="hidden lg:flex flex-col items-center justify-center h-full bg-white rounded-2xl border border-qf-border text-qf-muted p-10 min-h-[400px]">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-12 h-12 mb-3 opacity-30">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.805-3.085-2.5-2.225h3.093l.951-3.085.95 3.085h3.094l-2.5 2.225.805 3.085-2.51-2.225z" />
        </svg>
        <p>Chọn một đơn hàng để xem chi tiết</p>
      </div>
    )
  }

  return (
    <div className="bg-white lg:rounded-2xl lg:border border-qf-border lg:shadow-sm overflow-hidden h-full flex flex-col">
      {/* Mobile close handle */}
      {onCloseMobile && (
        <div className="flex items-center justify-center p-3 lg:hidden shrink-0 border-b border-qf-border">
          <div className="w-10 h-1.5 bg-qf-border rounded-full" />
          <button 
            onClick={onCloseMobile}
            className="absolute right-4 p-1.5 bg-qf-bg rounded-full text-qf-secondary"
          >
            <X size={18} />
          </button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto w-full p-5 lg:p-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <h2 className="text-2xl font-bold font-display text-qf-secondary">
            Chi tiết đơn #{order.id}
          </h2>
          <OrderStatusBadge status={order.status} />
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 p-4 bg-qf-bg rounded-xl border border-qf-border">
          <div>
            <p className="text-xs text-qf-muted mb-1 font-semibold uppercase tracking-wide">Ngày đặt</p>
            <p className="text-sm font-medium text-qf-secondary">{formatDate(order.createdAt)}</p>
          </div>
          <div>
            <p className="text-xs text-qf-muted mb-1 font-semibold uppercase tracking-wide">Địa chỉ giao</p>
            <p className="text-sm font-medium text-qf-secondary">{order.deliveryAddress || 'Nhận tại cửa hàng'}</p>
          </div>
        </div>

        {/* Product Table */}
        <h3 className="text-lg font-bold font-display text-qf-secondary mb-4 border-b border-qf-border pb-2">
          Danh sách sản phẩm
        </h3>
        <div className="mb-6 space-y-3">
          {/* Header Row */}
          <div className="flex items-center text-xs text-qf-muted font-semibold uppercase tracking-wide pb-2 mb-2 border-b border-qf-border/50">
            <span className="flex-1 min-w-0 pr-4">Tên sản phẩm</span>
            <span className="w-12 text-center">SL</span>
            <span className="w-24 text-right hidden sm:block">Đơn giá</span>
            <span className="w-24 text-right">Thành tiền</span>
          </div>

          {/* Items */}
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center text-sm">
              <span className="flex-1 min-w-0 font-medium text-qf-secondary truncate pr-4">{item.productName}</span>
              <span className="w-12 text-center text-qf-muted">x{item.quantity}</span>
              <span className="w-24 text-right text-qf-muted hidden sm:block">{formatPrice(item.unitPrice)}</span>
              <span className="w-24 text-right font-medium text-qf-secondary">{formatPrice(item.subtotal)}</span>
            </div>
          ))}
        </div>

        {/* Total Price */}
        <div className="pt-4 border-t border-qf-border flex justify-end">
          <div className="flex gap-12 items-baseline">
            <span className="text-sm font-bold text-qf-muted uppercase tracking-wider">Tổng cộng:</span>
            <span className="text-2xl font-bold font-display text-qf-primary">{formatPrice(order.totalPrice)}</span>
          </div>
        </div>

        {/* Tracking Card Area */}
        <TrackingCard orderId={order.id} status={order.status} />
      </div>
    </div>
  )
}
