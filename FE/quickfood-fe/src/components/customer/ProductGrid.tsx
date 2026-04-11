'use client'

import ProductCard, { Product } from './ProductCard'

// Skeleton card
function SkeletonCard() {
  return (
    <div className="rounded-qf border overflow-hidden animate-pulse"
      style={{ borderColor: 'var(--color-qf-border)', backgroundColor: 'var(--color-qf-surface)' }}>
      <div className="w-full" style={{ paddingTop: '56.25%', backgroundColor: 'var(--color-qf-border)' }} />
      <div className="p-4 space-y-3">
        <div className="h-4 rounded" style={{ backgroundColor: 'var(--color-qf-border)', width: '70%' }} />
        <div className="h-5 rounded" style={{ backgroundColor: 'var(--color-qf-border)', width: '45%' }} />
        <div className="h-9 rounded-lg" style={{ backgroundColor: 'var(--color-qf-border)' }} />
      </div>
    </div>
  )
}

interface ProductGridProps {
  products: Product[]
  loading: boolean
  search: string
}

export default function ProductGrid({ products, loading, search }: ProductGridProps) {
  const filtered = search.trim()
    ? products.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase())
      )
    : products

  return (
    <section className="px-4 lg:px-8 py-6">
      {/* Section header */}
      <div className="flex items-baseline gap-3 mb-6">
        <h2
          className="text-xl font-semibold"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--color-qf-secondary)' }}
        >
          Thực Đơn Hôm Nay
        </h2>
        {!loading && (
          <span className="text-sm" style={{ color: 'var(--color-qf-muted)' }}>
            ({filtered.length} món)
          </span>
        )}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => <SkeletonCard key={n} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <span className="text-5xl">🍽️</span>
          <p className="text-base font-medium" style={{ color: 'var(--color-qf-muted)' }}>
            {search ? 'Không tìm thấy món phù hợp' : 'Chưa có món ăn nào'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </section>
  )
}
