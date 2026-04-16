'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/customer/Header'
import ProductGrid from '@/components/customer/ProductGrid'
import CartSidebar from '@/components/customer/CartSidebar'
import CartBottomSheet from '@/components/customer/CartBottomSheet'
import { useToast } from '@/components/shared/Toast'
import { useCart } from '@/lib/cart-context'
import { Product } from '@/components/customer/ProductCard'
import { getToken, getUser } from '@/lib/auth'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

export default function CustomerHomePage() {
  const router = useRouter()
  const toast = useToast()
  const { items, clearCart, deliveryAddress } = useCart()

  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [ordering, setOrdering] = useState(false)
  const [authChecked, setAuthChecked] = useState(false)

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

    async function fetchProducts() {
      try {
        const token = getToken()
        const headers: HeadersInit = {}
        if (token) headers['Authorization'] = `Bearer ${token}`
        const res = await fetch(`${API_BASE}/api/core/products`, { headers })
        if (res.ok) {
          const data = await res.json()
          setProducts(data)
        } else {
          throw new Error('Failed to fetch products')
        }
      } catch {
        toast.error('Không thể tải danh sách sản phẩm')
      } finally {
        setTimeout(() => setLoading(false), 300)
      }
    }

    fetchProducts()
  }, [authChecked, toast])

  const handleOrder = async () => {
    if (items.length === 0) return
    if (!deliveryAddress.trim()) {
      toast.error('Vui lòng nhập địa chỉ giao hàng')
      return
    }

    setOrdering(true)
    try {
      const token = getToken()
      const body = {
        deliveryAddress,
        items: items.map(i => ({ productId: i.productId, quantity: i.quantity }))
      }
      const res = await fetch(`${API_BASE}/api/core/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      })
      if (!res.ok) throw new Error('Đặt hàng thất bại')
      clearCart()
      setSidebarOpen(false)
      toast.success('✅ Đặt hàng thành công! Đơn hàng đang được chuẩn bị')
      setTimeout(() => router.push('/orders'), 2000)
    } catch {
      toast.error('Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại sau.')
    } finally {
      setOrdering(false)
    }
  }

  if (!authChecked) return null

  return (
    <div className="min-h-screen bg-qf-bg flex flex-col">
      <Header
        onCartClick={() => setSidebarOpen(true)}
        search={search}
        onSearch={setSearch}
      />

      <div
        className="flex flex-col justify-center items-center px-4"
        style={{
          height: '160px',
          background: 'linear-gradient(to bottom, var(--color-qf-accent), var(--color-qf-bg))'
        }}
      >
        <h1
          className="text-2xl md:text-4xl font-bold mb-2 text-center"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--color-qf-secondary)' }}
        >
          Hôm nay ăn gì?
        </h1>
        <p className="text-sm md:text-base text-center" style={{ color: 'var(--color-qf-muted)' }}>
          Đặt ngay, giao trong 30 phút
        </p>
      </div>

      <main className="flex-1 max-w-7xl w-full mx-auto pb-24 lg:pb-8">
        <ProductGrid products={products} loading={loading} search={search} />
      </main>

      <CartSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onOrder={handleOrder}
        ordering={ordering}
      />

      <CartBottomSheet
        onOrder={handleOrder}
        ordering={ordering}
      />
    </div>
  )
}