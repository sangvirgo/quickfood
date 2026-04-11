'use client'

import ProductRow, { ProductItem } from './ProductRow'

interface ProductTableProps {
  products: ProductItem[]
  loading: boolean
  onEdit: (product: ProductItem) => void
  onDelete: (id: number) => Promise<void>
}

function SkeletonRow() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-[60px_1fr_120px_120px_120px_100px] gap-4 items-center p-4 border-b border-qf-border animate-pulse bg-white">
      <div className="w-12 h-12 bg-qf-border rounded-lg" />
      <div className="h-5 bg-qf-border rounded w-1/2" />
      <div className="h-5 bg-qf-border rounded w-20" />
      <div className="h-5 bg-qf-border rounded w-16" />
      <div className="h-6 bg-qf-border rounded-full w-16" />
      <div className="flex gap-2 justify-end">
        <div className="w-8 h-8 rounded-lg bg-qf-border" />
        <div className="w-8 h-8 rounded-lg bg-qf-border" />
      </div>
    </div>
  )
}

export default function ProductTable({ products, loading, onEdit, onDelete }: ProductTableProps) {
  if (loading) {
    return (
      <div className="border border-qf-border rounded-xl overflow-hidden bg-white shadow-sm">
        <div className="hidden md:grid grid-cols-[60px_1fr_120px_120px_120px_100px] gap-4 p-4 bg-qf-accent text-sm font-bold text-qf-secondary uppercase tracking-wider">
          <div>Img</div>
          <div>Tên sản phẩm</div>
          <div>Giá</div>
          <div>Tồn kho</div>
          <div>Trạng thái</div>
          <div className="text-right">Thao tác</div>
        </div>
        {[1, 2, 3, 4, 5].map(n => <SkeletonRow key={n} />)}
      </div>
    )
  }

  return (
    <div className="border border-qf-border rounded-xl overflow-hidden bg-white shadow-sm">
      {/* Header */}
      <div className="hidden md:grid grid-cols-[60px_1fr_120px_120px_120px_100px] gap-4 p-4 bg-qf-accent text-xs font-bold text-qf-secondary uppercase tracking-wider">
        <div className="text-center">#</div>
        <div>Tên sản phẩm</div>
        <div>Giá</div>
        <div>Tồn kho</div>
        <div>Trạng thái</div>
        <div className="text-right pr-2">Thao tác</div>
      </div>
      
      {/* Body */}
      <div className="flex flex-col">
        {products.map(product => (
          <ProductRow 
            key={product.id} 
            product={product} 
            onEdit={onEdit} 
            onDelete={onDelete} 
          />
        ))}
      </div>
    </div>
  )
}
