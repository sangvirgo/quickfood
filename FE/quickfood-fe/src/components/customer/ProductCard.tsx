'use client'

import { Plus, Minus } from 'lucide-react'
import { useCart } from '@/lib/cart-context'
import { formatPrice } from '@/lib/format'

export interface Product {
  id: number
  name: string
  price: number
  stock: number
  imageUrl: string | null
  isAvailable?: boolean
  available?: boolean
}

function isAvailable(p: Product): boolean {
  // Handle both `isAvailable` and `available` keys from API
  return p.isAvailable !== undefined ? p.isAvailable : (p.available ?? true)
}

export default function ProductCard({ product }: { product: Product }) {
  const { items, addItem, updateQuantity } = useCart()
  const cartItem = items.find((i) => i.productId === product.id)
  const qty = cartItem?.quantity ?? 0

  const outOfStock = product.stock === 0 || !isAvailable(product)
  const hasImage = product.imageUrl && product.imageUrl.length > 0

  return (
    <article
      className="flex flex-col rounded-qf border overflow-hidden transition-all duration-200"
      style={{
        backgroundColor: 'var(--color-qf-surface)',
        borderColor: 'var(--color-qf-border)',
        boxShadow: '0 2px 8px rgba(28, 25, 23, 0.06)',
        opacity: outOfStock ? 0.6 : 1,
      }}
      onMouseEnter={(e) => {
        if (!outOfStock) {
          ;(e.currentTarget as HTMLElement).style.boxShadow =
            '0 4px 16px rgba(28, 25, 23, 0.12)'
          ;(e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'
        }
      }}
      onMouseLeave={(e) => {
        ;(e.currentTarget as HTMLElement).style.boxShadow =
          '0 2px 8px rgba(28, 25, 23, 0.06)'
        ;(e.currentTarget as HTMLElement).style.transform = 'translateY(0)'
      }}
    >
      {/* Image 16:9 */}
      <div
        className="relative w-full overflow-hidden"
        style={{ paddingTop: '56.25%' /* 16:9 */ }}
      >
        {hasImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.imageUrl!}
            alt={product.name}
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div
            className="absolute inset-0 flex items-center justify-center text-5xl"
            style={{ backgroundColor: 'var(--color-qf-accent)' }}
          >
            🍜
          </div>
        )}

        {/* Out of stock overlay */}
        {outOfStock && (
          <div className="absolute inset-0 flex items-center justify-center"
            style={{ backgroundColor: 'rgba(28,25,23,0.35)' }}>
            <span className="text-white text-sm font-semibold bg-black/50 px-3 py-1 rounded-full">
              Hết hàng
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col gap-2 p-4 flex-1">
        <h3
          className="font-medium text-base leading-snug line-clamp-2"
          style={{ color: 'var(--color-qf-secondary)', fontFamily: 'var(--font-sans)' }}
        >
          {product.name}
        </h3>

        <p
          className="text-lg font-semibold"
          style={{
            fontFamily: 'var(--font-display)',
            color: 'var(--color-qf-primary)',
          }}
        >
          {formatPrice(product.price)}
        </p>

        {/* Stock badge */}
        {product.stock > 0 && (
          <span
            className="inline-flex items-center text-xs px-2 py-0.5 rounded-full w-fit"
            style={{
              backgroundColor: 'var(--color-qf-accent)',
              color: 'var(--color-qf-primary)',
              fontWeight: 500,
            }}
          >
            Còn {product.stock} phần
          </span>
        )}

        {/* Add to cart button or counter */}
        <div className="mt-auto pt-2">
          {qty === 0 ? (
            <button
              id={`btn-add-${product.id}`}
              disabled={outOfStock}
              onClick={() => addItem(product)}
              className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium text-white transition-all duration-150 active:scale-[0.97]"
              style={{
                backgroundColor: outOfStock
                  ? 'var(--color-qf-muted)'
                  : 'var(--color-qf-primary)',
                cursor: outOfStock ? 'not-allowed' : 'pointer',
              }}
            >
              <Plus size={15} />
              {outOfStock ? 'Hết hàng' : 'Thêm vào giỏ'}
            </button>
          ) : (
            <div
              className="flex items-center justify-between rounded-lg border px-1"
              style={{ borderColor: 'var(--color-qf-primary)' }}
            >
              <button
                id={`btn-dec-${product.id}`}
                onClick={() => updateQuantity(product.id, qty - 1)}
                className="p-2 transition-colors hover:bg-qf-accent rounded-lg"
                style={{ color: 'var(--color-qf-primary)' }}
                aria-label="Bớt"
              >
                <Minus size={15} />
              </button>
              <span
                className="text-sm font-semibold min-w-[24px] text-center"
                style={{ color: 'var(--color-qf-primary)' }}
              >
                {qty}
              </span>
              <button
                id={`btn-inc-${product.id}`}
                onClick={() => updateQuantity(product.id, qty + 1)}
                disabled={qty >= product.stock}
                className="p-2 transition-colors hover:bg-qf-accent rounded-lg disabled:opacity-40"
                style={{ color: 'var(--color-qf-primary)' }}
                aria-label="Thêm"
              >
                <Plus size={15} />
              </button>
            </div>
          )}
        </div>
      </div>
    </article>
  )
}
