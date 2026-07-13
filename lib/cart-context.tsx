'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { Product } from './api'

export interface CartItem {
  product: Product
  quantity: number
}

interface CartContextType {
  cartItems: CartItem[]
  addToCart: (product: Product) => void
  removeFromCart: (productId: number) => void
  updateQuantity: (productId: number, quantity: number) => void
  clearCart: () => void
  cartCount: number
  cartTotal: number
  hasPriceItems: boolean
  isCartOpen: boolean
  setIsCartOpen: (open: boolean) => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  // Load cart from localStorage on mount
  useEffect(() => {
    setIsMounted(true)
    const storedCart = localStorage.getItem('artisanat_aschi_cart')
    if (storedCart) {
      try {
        setCartItems(JSON.parse(storedCart))
      } catch (e) {
        console.error('Failed to parse cart items', e)
      }
    }
  }, [])

  // Save cart to localStorage when changed
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('artisanat_aschi_cart', JSON.stringify(cartItems))
    }
  }, [cartItems, isMounted])

  const addToCart = (product: Product) => {
    // Only allow available products to be added to cart
    if (product.type === 'CATALOGUE') return

    setCartItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id)
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }
      return [...prev, { product, quantity: 1 }]
    })
    setIsCartOpen(true)
  }

  const removeFromCart = (productId: number) => {
    setCartItems((prev) => prev.filter((item) => item.product.id !== productId))
  }

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId)
      return
    }
    setCartItems((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    )
  }

  const clearCart = () => {
    setCartItems([])
  }

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0)
  
  const cartTotal = cartItems.reduce((acc, item) => {
    const price = item.product.price || 0
    return acc + price * item.quantity
  }, 0)

  const hasPriceItems = cartItems.some((item) => item.product.price !== null)

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        cartTotal,
        hasPriceItems,
        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
