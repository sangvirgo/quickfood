'use client'

import { useState, useEffect, useMemo } from 'react'
import { Plus, Search } from 'lucide-react'
import { useToast } from '@/components/shared/Toast'
import { getToken } from '@/lib/auth'

import ProductTable from '@/components/staff/ProductTable'
import ProductModal, { ProductInput } from '@/components/staff/ProductModal'
import { ProductItem, isProdAvailable } from '@/components/staff/ProductRow'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

type FilterType = 'ALL' | 'IN_STOCK' | 'OUT_OF_STOCK'

export default function StaffProductsPage() {
  const toast = useToast()
  const [products, setProducts] = useState<ProductItem[]>([])
  const [loading, setLoading] = useState(true)
  
  // Search & Filter
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<FilterType>('ALL')

  // Modal
  const [modalOpen, setModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null)

  const fetchProducts = async () => {
    try {
      const token = getToken()
      const res = await fetch(`${API_BASE}/api/core/products`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) {
        let data: ProductItem[] = await res.json()
        data = data.sort((a, b) => b.id - a.id) // Newest first
        setProducts(data)
      } else {
        throw new Error('Failed to fetch')
      }
    } catch {
      toast.error('Không thể tải danh sách sản phẩm')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase())
      if (!matchesSearch) return false

      if (filter === 'IN_STOCK') return p.stock > 0 && isProdAvailable(p)
      if (filter === 'OUT_OF_STOCK') return p.stock === 0 || !isProdAvailable(p)
      return true
    })
  }, [products, search, filter])

  // Callbacks
  const handleSaveProduct = async (data: ProductInput, id?: number) => {
    const isEditing = !!id
    const url = isEditing 
      ? `${API_BASE}/api/core/products/${id}`
      : `${API_BASE}/api/core/products`
    
    const method = isEditing ? 'PUT' : 'POST'
    const token = getToken()

    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    })

    if (!res.ok) {
      const text = await res.text()
      throw new Error(text || 'Có lỗi xảy ra khi lưu')
    }

    toast.success(`✅ Sản phẩm đã được lưu`)
    fetchProducts() // Refresh to get the actual data from DB (with correct ID if creating)
  }

  const handleDeleteProduct = async (id: number) => {
    // 1. Optimistic Update
    const previousProducts = [...products]
    setProducts(prev => prev.filter(p => p.id !== id))

    // 2. Call API (Soft delete: DELETE method responds 204)
    try {
      const token = getToken()
      const res = await fetch(`${API_BASE}/api/core/products/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (!res.ok) {
        throw new Error('Xóa thất bại')
      }
      toast.info('🗑️ Đã xóa sản phẩm')
    } catch {
      // 3. Revert if fails
      setProducts(previousProducts)
      toast.error('Không thể xóa sản phẩm lúc này')
      throw new Error('Xóa thất bại')
    }
  }

  const handleOpenAdd = () => {
    setEditingProduct(null)
    setModalOpen(true)
  }

  const handleOpenEdit = (product: ProductItem) => {
    setEditingProduct(product)
    setModalOpen(true)
  }

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto min-h-screen flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <h1 className="text-3xl font-bold font-display text-qf-secondary">Quản lý sản phẩm</h1>
        <button 
          onClick={handleOpenAdd}
          className="qf-btn-primary !w-auto flex items-center justify-center gap-2 shadow-sm"
        >
          <Plus size={18} />
          Thêm sản phẩm
        </button>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-qf-muted pointer-events-none" />
          <input
            type="text"
            placeholder="Tìm theo tên sản phẩm..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="qf-input pl-10 h-10 text-sm"
          />
        </div>
        
        <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-qf-border w-fit">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${filter === 'ALL' ? 'bg-qf-accent text-qf-primary' : 'text-qf-muted hover:bg-qf-bg'}`}
          >
            Tất cả
          </button>
          <button
            onClick={() => setFilter('IN_STOCK')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${filter === 'IN_STOCK' ? 'bg-green-100 text-green-700' : 'text-qf-muted hover:bg-qf-bg'}`}
          >
            Còn hàng
          </button>
          <button
            onClick={() => setFilter('OUT_OF_STOCK')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${filter === 'OUT_OF_STOCK' ? 'bg-red-100 text-red-700' : 'text-qf-muted hover:bg-qf-bg'}`}
          >
            Hết hàng
          </button>
        </div>
      </div>

      {/* Table / Empty State */}
      {!loading && filteredProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white border border-qf-border rounded-xl shadow-sm text-center px-4">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-16 h-16 text-qf-border mb-4">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <line x1="3" y1="9" x2="21" y2="9" />
            <line x1="9" y1="21" x2="9" y2="9" />
          </svg>
          <p className="text-lg font-bold font-display text-qf-secondary mb-2">Không tìm thấy sản phẩm nào</p>
          {filter === 'ALL' && !search && (
            <button onClick={handleOpenAdd} className="text-sm font-medium text-qf-primary hover:underline mt-1">
              Thêm sản phẩm đầu tiên
            </button>
          )}
        </div>
      ) : (
        <ProductTable 
          products={filteredProducts} 
          loading={loading}
          onEdit={handleOpenEdit}
          onDelete={handleDeleteProduct}
        />
      )}

      {/* Modal */}
      <ProductModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveProduct}
        initialData={editingProduct}
      />
    </div>
  )
}
