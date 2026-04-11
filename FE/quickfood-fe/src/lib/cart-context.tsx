'use client'

import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from 'react'

export interface CartItem {
  productId: number
  name: string
  price: number
  quantity: number
  imageUrl?: string
}

interface CartContextValue {
  items: CartItem[]
  deliveryAddress: string
  setDeliveryAddress: (addr: string) => void
  total: number
  count: number
  addItem: (product: { id: number; name: string; price: number; imageUrl?: string | null }) => void
  removeItem: (productId: number) => void
  updateQuantity: (productId: number, qty: number) => void
  clearCart: () => void
}

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [deliveryAddress, setDeliveryAddress] = useState('')

  const addItem = useCallback(
    (product: { id: number; name: string; price: number; imageUrl?: string | null }) => {
      setItems((prev) => {
        const existing = prev.find((i) => i.productId === product.id)
        if (existing) {
          return prev.map((i) =>
            i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i
          )
        }
        return [
          ...prev,
          {
            productId: product.id,
            name: product.name,
            price: product.price,
            quantity: 1,
            imageUrl: product.imageUrl ?? undefined,
          },
        ]
      })
    },
    []
  )

  const removeItem = useCallback((productId: number) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId))
  }, [])

  const updateQuantity = useCallback((productId: number, qty: number) => {
    if (qty <= 0) {
      setItems((prev) => prev.filter((i) => i.productId !== productId))
    } else {
      setItems((prev) =>
        prev.map((i) => (i.productId === productId ? { ...i, quantity: qty } : i))
      )
    }
  }, [])

  const clearCart = useCallback(() => {
    setItems([])
    setDeliveryAddress('')
  }, [])

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0)
  const count = items.reduce((sum, i) => sum + i.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        items,
        deliveryAddress,
        setDeliveryAddress,
        total,
        count,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
