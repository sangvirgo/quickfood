'use client'

import { Order } from '@/app/(customer)/orders/types'
import OrderCard from './OrderCard'

interface OrderListProps {
  orders: Order[]
  loading: boolean
  selectedId: number | null
  onSelect: (id: number) => void
}

function SkeletonOrderCard() {
  return (
    <div className="p-4 rounded-xl border border-qf-border bg-white animate-pulse flex flex-col gap-3">
      <div className="flex justify-between w-full items-center">
        <div className="w-24 h-6 bg-qf-border rounded-full" />
        <div className="w-20 h-4 bg-qf-border rounded" />
      </div>
      <div className="space-y-2">
        <div className="w-16 h-5 bg-qf-border rounded" />
        <div className="w-32 h-4 bg-qf-border rounded" />
      </div>
      <div className="w-full h-4 bg-qf-border rounded mt-2" />
    </div>
  )
}

export default function OrderList({ orders, loading, selectedId, onSelect }: OrderListProps) {
  if (loading) {
    return (
      <div className="space-y-4 pr-2">
        <SkeletonOrderCard />
        <SkeletonOrderCard />
        <SkeletonOrderCard />
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-xl border border-qf-border shadow-sm p-6">
        <svg viewBox="0 0 80 80" className="w-24 h-24 opacity-30 mb-4" fill="none">
          <circle cx="40" cy="40" r="38" stroke="#78716C" strokeWidth="2" />
          <path d="M25 30h30l-4 18H29L25 30z" stroke="#78716C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M20 26h4l1 4" stroke="#78716C" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <p className="font-semibold text-qf-secondary text-base mb-1">Bạn chưa có đơn hàng nào</p>
        <p className="text-sm text-qf-muted mb-6">Hãy đặt thử món ăn đầu tiên nhé</p>
        <a href="/" className="qf-btn-primary max-w-xs text-sm py-2">
          Đặt ngay
        </a>
      </div>
    )
  }

  return (
    <div className="space-y-4 overflow-y-auto max-h-[calc(100vh-140px)] pr-2"
      style={{ scrollbarWidth: 'thin', scrollbarColor: 'var(--color-qf-border) transparent' }}
    >
      {orders.map(order => (
        <OrderCard 
          key={order.id} 
          order={order} 
          selected={order.id === selectedId} 
          onClick={() => onSelect(order.id)} 
        />
      ))}
    </div>
  )
}
