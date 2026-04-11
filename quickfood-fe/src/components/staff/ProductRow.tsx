'use client'

import { useState } from 'react'
import { Pencil, Trash2, CheckCircle2, AlertTriangle, X } from 'lucide-react'
import { formatPrice } from '@/lib/format'

export interface ProductItem {
  id: number
  name: string
  price: number
  stock: number
  imageUrl: string | null
  available?: boolean
  isAvailable?: boolean
}

// Ensure proper derivation of availability based on various potential API bindings
export const isProdAvailable = (p: ProductItem) => p.available ?? p.isAvailable ?? true

interface ProductRowProps {
  product: ProductItem
  onEdit: (product: ProductItem) => void
  onDelete: (id: number) => Promise<void>
}

export default function ProductRow({ product, onEdit, onDelete }: ProductRowProps) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleted, setDeleted] = useState(false)

  const available = isProdAvailable(product)

  const handleDeleteConfirm = async () => {
    setDeleting(true)
    try {
      await onDelete(product.id)
      setDeleted(true)
    } catch {
      setDeleting(false)
      setConfirmDelete(false)
    }
  }

  // Animation for fading out when deleted optimistically
  if (deleted) {
    return (
      <div className="h-0 opacity-0 overflow-hidden transition-all duration-300 ease-out" />
    )
  }

  return (
    <div 
      className={`grid grid-cols-1 md:grid-cols-[60px_1fr_120px_120px_120px_100px] gap-4 items-center p-4 border-b transition-colors ${
        confirmDelete ? 'bg-red-50/50' : 'hover:bg-qf-bg bg-white border-qf-border'
      }`}
    >
      {/* Img/Fallback */}
      <div className="w-12 h-12 rounded-lg bg-qf-accent border border-qf-border overflow-hidden shrink-0 flex items-center justify-center">
        {product.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <span className="text-xl">🍜</span>
        )}
      </div>

      {/* Name */}
      <div className="font-medium text-qf-secondary truncate min-w-0 pr-4">
        {product.name}
      </div>

      {/* Price */}
      <div className="font-semibold" style={{ color: 'var(--color-qf-primary)' }}>
        {formatPrice(product.price)}
      </div>

      {/* Stock */}
      <div className="flex items-center gap-1.5 text-sm font-medium">
        {product.stock === 0 ? (
          <span className="text-red-500 bg-red-100 px-2 py-0.5 rounded text-xs flex items-center gap-1">Hết hàng</span>
        ) : product.stock <= 10 ? (
          <span className="text-amber-600 flex items-center gap-1.5"><AlertTriangle size={14} /> Sắp hết ({product.stock})</span>
        ) : (
          <span className="text-green-600 flex items-center gap-1.5"><CheckCircle2 size={14} /> {product.stock}</span>
        )}
      </div>

      {/* Status */}
      <div>
        {available ? (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-[#D1FAE5] text-[#065F46]">
            Đang bán
          </span>
        ) : (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
            Đã ẩn
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-2">
        {confirmDelete ? (
          <div className="flex items-center gap-1.5 animate-fade-in bg-white p-1 rounded-lg shadow-sm border border-red-100">
            <button 
              onClick={() => setConfirmDelete(false)}
              disabled={deleting}
              className="text-xs font-medium px-2 py-1.5 text-qf-muted hover:bg-qf-bg rounded disabled:opacity-50"
            >
              Hủy
            </button>
            <button 
              onClick={handleDeleteConfirm}
              disabled={deleting}
              className="text-xs font-medium px-2 py-1.5 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
            >
              {deleting ? '...' : 'Xóa'}
            </button>
          </div>
        ) : (
          <>
            <button 
              onClick={() => onEdit(product)}
              className="p-2 text-qf-muted hover:text-qf-primary hover:bg-qf-accent rounded-lg transition-colors"
              aria-label="Sửa"
            >
              <Pencil size={18} />
            </button>
            <button 
              onClick={() => setConfirmDelete(true)}
              className="p-2 text-qf-muted hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              aria-label="Xoá"
            >
              <Trash2 size={18} />
            </button>
          </>
        )}
      </div>
    </div>
  )
}
