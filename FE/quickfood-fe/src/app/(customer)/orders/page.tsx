'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/customer/Header'
import { useCart } from '@/lib/cart-context'
import { useToast } from '@/components/shared/Toast'
import { getToken, getUser } from '@/lib/auth'

import { Order } from '@/app/(customer)/orders/types'
import OrderList from '@/components/customer/OrderList'
import OrderDetailPanel from '@/components/customer/OrderDetailPanel'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

export default function OrdersPage() {
  const router = useRouter()
  const toast = useToast()
  
  // Header needs these props, though we won't use cart interaction heavily here
  const [search, setSearch] = useState('')
  const [authChecked, setAuthChecked] = useState(false)

  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null)
  const [showMobilePanel, setShowMobilePanel] = useState(false)

  useEffect(() => {
    const user = getUser()
    if (!user) {
      router.replace('/login')
    } else if (user.role !== 'CUSTOMER') {
      router.replace(user.role === 'STAFF' ? '/staff/dashboard' : '/shipper/dashboard')
    } else {
      setAuthChecked(true)
    }
  }, [router])

  useEffect(() => {
    if (!authChecked) return

    async function fetchOrders() {
      try {
        const token = getToken()
        const headers: HeadersInit = {}
        if (token) {
          headers['Authorization'] = `Bearer ${token}`
        }
        
        const res = await fetch(`${API_BASE}/api/core/orders`, { headers })
        
        if (res.ok) {
          let data: Order[] = await res.json()
          // Sort by newest first
          data = data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          setOrders(data)
          
          if (data.length > 0) {
            setSelectedOrderId(data[0].id)
          }
        } else if (res.status === 401) {
          router.replace('/login')
        } else {
          throw new Error('Failed fetching orders')
        }
      } catch (error) {
        toast.error('Không thể tải lịch sử đơn hàng')
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [authChecked, router, toast])

  const handleSelectOrder = (id: number) => {
    setSelectedOrderId(id)
    setShowMobilePanel(true)
  }

  const selectedOrder = orders.find(o => o.id === selectedOrderId) || null

  if (!authChecked) return null

  return (
    <div className="min-h-screen bg-qf-bg flex flex-col">
      <Header 
        onCartClick={() => router.push('/')} 
        search={search}
        onSearch={setSearch}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-8 flex flex-col">
        {/* Page Title */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold font-display text-qf-secondary mb-1">
            Đơn hàng của tôi
          </h1>
          <p className="text-sm text-qf-muted">
            {loading ? 'Đang tải...' : `${orders.length} đơn hàng`}
          </p>
        </div>

        {/* 2 Cols Layout for Desktop */}
        <div className="flex-1 flex flex-col lg:flex-row gap-6 h-full min-h-0">
          
          {/* Left Column: Order List */}
          <div className="w-full lg:w-[40%] flex flex-col min-h-0">
            <OrderList 
              orders={orders} 
              loading={loading} 
              selectedId={selectedOrderId} 
              onSelect={handleSelectOrder} 
            />
          </div>

          {/* Right Column: Order Detail (Desktop) */}
          <div className="hidden lg:block lg:w-[60%] min-h-0">
            <OrderDetailPanel order={selectedOrder} />
          </div>

        </div>
      </main>

      {/* Mobile Detail Panel (Bottom Sheet equivalent) */}
      {showMobilePanel && selectedOrder && (
        <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end">
          <div 
            className="absolute inset-0 bg-qf-secondary/50 animate-fade-in" 
            onClick={() => setShowMobilePanel(false)}
          />
          <div className="relative w-full h-[90vh] bg-white rounded-t-2xl animate-slide-up flex flex-col">
            <OrderDetailPanel 
              order={selectedOrder} 
              onCloseMobile={() => setShowMobilePanel(false)} 
            />
          </div>
        </div>
      )}
    </div>
  )
}
