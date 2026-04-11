'use client'

import { useState, useEffect, FormEvent } from 'react'
import { X, Loader2, Image as ImageIcon } from 'lucide-react'

export interface ProductInput {
  name: string
  price: number
  stock: number
  imageUrl: string | null
}

interface ProductModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: ProductInput, id?: number) => Promise<void>
  initialData?: ProductInput & { id: number } | null
}

export default function ProductModal({ isOpen, onClose, onSave, initialData }: ProductModalProps) {
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [stock, setStock] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [imgError, setImgError] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setName(initialData?.name || '')
      setPrice(initialData?.price.toString() || '')
      setStock(initialData?.stock.toString() || '')
      setImageUrl(initialData?.imageUrl || '')
      setError('')
      setImgError(false)
      setLoading(false)
    }
  }, [isOpen, initialData])

  if (!isOpen) return null

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (!name.trim()) return setError('Tên sản phẩm không được trống')
    const parsedPrice = Number(price)
    if (isNaN(parsedPrice) || parsedPrice <= 0) return setError('Giá phải lớn hơn 0')
    const parsedStock = Number(stock)
    if (isNaN(parsedStock) || parsedStock < 0) return setError('Tồn kho phải lớn hơn hoặc bằng 0')

    setLoading(true)
    try {
      await onSave({
        name: name.trim(),
        price: parsedPrice,
        stock: parsedStock,
        imageUrl: imageUrl.trim() || null
      }, initialData?.id)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi khi lưu sản phẩm')
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-qf-secondary/60 backdrop-blur-sm animate-fade-in" 
        onClick={() => !loading && onClose()}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl flex flex-col animate-scale-in max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-qf-border shrink-0">
          <h2 className="text-xl font-bold font-display text-qf-secondary">
            {initialData ? 'Sửa sản phẩm' : 'Thêm sản phẩm mới'}
          </h2>
          <button 
            onClick={onClose}
            disabled={loading}
            className="p-1.5 rounded-lg hover:bg-qf-accent text-qf-muted transition-colors disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto w-full p-6" style={{ scrollbarWidth: 'thin' }}>
          <form id="product-form" onSubmit={handleSubmit} className="space-y-5">
            
            {/* Image Preview & URL */}
            <div>
              <label className="block text-sm font-medium text-qf-secondary mb-2">Hình ảnh sản phẩm</label>
              <div className="flex gap-4">
                <div className="w-[120px] h-[120px] rounded-xl border border-qf-border bg-qf-bg overflow-hidden flex items-center justify-center shrink-0">
                  {imageUrl && !imgError ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img 
                      src={imageUrl} 
                      alt="Preview" 
                      className="w-full h-full object-cover"
                      onError={() => setImgError(true)}
                    />
                  ) : (
                    <div className="text-center text-qf-muted">
                      {imgError ? <span className="text-2xl">⚠️</span> : <ImageIcon className="mx-auto opacity-40 mb-1" size={24} />}
                      <span className="text-[10px] uppercase font-bold tracking-wide opacity-50">
                        {imgError ? 'Lỗi ảnh' : 'Preview'}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex-1 flex flex-col justify-end">
                  <input
                    type="url"
                    placeholder="https://example.com/image.jpg"
                    value={imageUrl}
                    onChange={(e) => {
                      setImageUrl(e.target.value)
                      setImgError(false)
                    }}
                    disabled={loading}
                    className="qf-input w-full text-sm"
                  />
                  <p className="text-xs text-qf-muted mt-1.5">Để trống sẽ dùng placeholder 🍜</p>
                </div>
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-qf-secondary mb-1.5">
                Tên sản phẩm <span className="text-qf-primary">*</span>
              </label>
              <input
                type="text"
                placeholder="Ví dụ: Burger Phô Mai"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
                className="qf-input"
                required
              />
            </div>

            {/* Price & Stock Row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-qf-secondary mb-1.5">
                  Giá (đ) <span className="text-qf-primary">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  placeholder="0"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  disabled={loading}
                  className="qf-input"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-qf-secondary mb-1.5">
                  Tồn kho <span className="text-qf-primary">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  placeholder="0"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  disabled={loading}
                  className="qf-input"
                  required
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="text-sm px-4 py-2.5 bg-red-50 text-red-600 rounded-lg border border-red-200">
                ⚠️ {error}
              </div>
            )}
          </form>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-qf-border flex justify-end gap-3 bg-qf-bg shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-5 py-2.5 rounded-lg font-medium text-qf-secondary hover:bg-qf-border/50 border border-qf-border transition-colors disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            type="submit"
            form="product-form"
            disabled={loading}
            className="qf-btn-primary !w-auto flex items-center justify-center gap-2 px-6 shadow-sm"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            {loading ? 'Đang lưu...' : 'Lưu sản phẩm'}
          </button>
        </div>
      </div>
    </div>
  )
}
