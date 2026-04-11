'use client'

import { useState, useEffect } from 'react'
import { RefreshCw, Clock, CheckCircle2, PackageCheck, Box } from 'lucide-react'
import StatsCard from '@/components/staff/StatsCard'
import PendingOrderCard from '@/components/staff/PendingOrderCard'
import { useToast } from '@/components/shared/Toast'
import { getToken } from '@/lib/auth'
import { Order } from '@/app/(customer)/orders/types'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

// Simple helper to format time
const formatTime = (date: Date) => {
  return new Intl.DateTimeFormat('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(date)
}
const formatFullDate = (date: Date) => {
  const days = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7']
  return `${days[date.getDay()]}, ${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`
}

export default function StaffDashboardPage() {
  const toast = useToast()
  
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
  const [refreshCountdown, setRefreshCountdown] = useState(30)
  
  // Stats (mocking non-pending stats mostly, pending from actual data)
  const [stats, setStats] = useState({
    pending: 0,
    ready: 12, // Mocked per spec: "Chỉ có API pending orders thực, các số khác có thể mock"
    delivered: 45, // Mocked
    totalProducts: 104 // Mocked
  })

  const fetchOrders = async (showNotification = false) => {
    try {
      const token = getToken()
      // Note: Endpoint depends on backend, assuming /api/core/orders/pending as per spec
      const res = await fetch(`${API_BASE}/api/core/orders/pending`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) {
        let data: Order[] = await res.json()
        data = data.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) // Oldest first usually better for processing, or newest?
        
        if (showNotification && data.length > orders.length) {
          const newCount = data.length - orders.length
          toast.info(`🔔 Có ${newCount} đơn hàng mới`)
        }
        
        setOrders(data)
        setStats(prev => ({ ...prev, pending: data.length }))
        setLastUpdated(new Date())
      }
    } catch (err) {
      console.error('Lỗi khi tải đơn hàng chờ', err)
    } finally {
      setLoading(false)
      setRefreshCountdown(30)
    }
  }

  // Initial load
  useEffect(() => {
    fetchOrders()
  }, [])

  // Auto-refresh poll
  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshCountdown((prev) => {
        if (prev <= 1) {
          fetchOrders(true)
          return 30
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [orders.length]) // dependency on orders.length to know if we have new orders in fetchOrders

  const handleApprove = async (id: number) => {
    try {
      const token = getToken()
      const res = await fetch(`${API_BASE}/api/core/orders/${id}/ready`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (!res.ok) {
        throw new Error('Duyệt thất bại')
      }

      // Optimistic UI - update local state
      setOrders(prev => prev.filter(o => o.id !== id))
      setStats(prev => ({ ...prev, pending: prev.pending - 1, ready: prev.ready + 1 }))
      toast.success(`✅ Đơn #${id} đã sẵn sàng giao`)
      
    } catch (err) {
      toast.error(`❌ Không thể duyệt đơn #${id}`)
      throw err // Re-throw to inform Card component to drop loading state
    }
  }

  const handleManualRefresh = () => {
    setLoading(true)
    fetchOrders()
  }

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto min-h-screen">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold font-display text-qf-secondary">Dashboard</h1>
          <p className="text-sm text-qf-muted mt-1">{formatFullDate(lastUpdated)}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-qf-muted bg-qf-border/30 px-3 py-1.5 rounded-full">
            Cập nhật lúc {formatTime(lastUpdated)} (tự động sau {refreshCountdown}s)
          </span>
          <button 
            onClick={handleManualRefresh}
            disabled={loading}
            className="p-2 bg-white border border-qf-border rounded-lg text-qf-secondary hover:bg-qf-bg transition-colors disabled:opacity-50 shadow-sm"
            aria-label="Làm mới"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin text-qf-primary' : ''} />
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <StatsCard 
          label="Đang chờ xử lý" 
          value={stats.pending} 
          icon={<Clock size={24} />} 
          colorClass="#D97706" 
          iconBgColor="#FEF3C7" 
        />
        <StatsCard 
          label="Đã sẵn sàng" 
          value={stats.ready} 
          icon={<PackageCheck size={24} />} 
          colorClass="#2563EB" 
          iconBgColor="#DBEAFE" 
        />
        <StatsCard 
          label="Đã giao (hôm nay)" 
          value={stats.delivered} 
          icon={<CheckCircle2 size={24} />} 
          colorClass="#059669" 
          iconBgColor="#D1FAE5" 
        />
        <StatsCard 
          label="Tổng sản phẩm" 
          value={stats.totalProducts} 
          icon={<Box size={24} />} 
          colorClass="var(--color-qf-primary)" 
          iconBgColor="var(--color-qf-accent)" 
        />
      </div>

      {/* Pending Orders Section */}
      <div className="mb-6 flex items-center gap-3">
        <h2 className="text-xl font-bold font-display text-qf-secondary">Đơn hàng cần xử lý</h2>
        <span className="bg-red-100 text-red-600 text-xs font-bold px-2.5 py-1 rounded-full border border-red-200">
          {stats.pending}
        </span>
      </div>

      {loading && orders.length === 0 ? (
        <div className="space-y-4">
          {[1,2,3].map(n => (
            <div key={n} className="bg-white border border-qf-border rounded-xl p-5 h-40 animate-pulse" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-[#E6F4EA] border border-[#A7D7B5] rounded-xl p-10 flex flex-col items-center justify-center text-center shadow-sm">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
            <CheckCircle2 size={40} className="text-[#059669]" />
          </div>
          <p className="text-xl font-bold text-[#065F46] font-display mb-2">Tất cả đơn đã được xử lý! 🎉</p>
          <p className="text-[#047857] text-sm">Cửa hàng đang vào nếp, chờ đơn hàng mới nhé.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {orders.map(order => (
            <PendingOrderCard 
              key={order.id} 
              order={order} 
              onApprove={handleApprove} 
            />
          ))}
        </div>
      )}

    </div>
  )
}
