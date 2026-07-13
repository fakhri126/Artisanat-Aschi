'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Trash2, Plus, Minus, ShoppingBag, Send } from 'lucide-react'
import { useCart } from '@/lib/cart-context'
import { publicApi } from '@/lib/api'
import Image from 'next/image'

export function CartSheet() {
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartTotal,
    hasPriceItems,
    isCartOpen,
    setIsCartOpen,
  } = useCart()

  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'form' | 'success'>('cart')
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    email: '',
    message: '',
  })
  const [error, setError] = useState('')

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.fullName || !formData.phoneNumber || !formData.email) {
      setError('Veuillez remplir tous les champs obligatoires.')
      return
    }

    setLoading(true)
    setError('')

    try {
      // Build a detailed message listing all products in the cart
      const cartDetails = cartItems
        .map(
          (item) =>
            `- ${item.product.name} (Quantité: ${item.quantity}, Prix: ${
              item.product.price ? `${item.product.price.toLocaleString()} DT` : 'Sur demande'
            })`
        )
        .join('\n')

      const fullMessage = `COMMANDE PANIER :\n${cartDetails}\n\nTotal estimé : ${
        hasPriceItems ? `${cartTotal.toLocaleString()} DT` : 'Sur demande'
      }\n\nMessage du client :\n${formData.message || 'Aucun message particulier.'}`

      // Submit quote request
      // If there is only 1 item, we can link it directly in the DB. Otherwise, send with primary product or null.
      const primaryProductId = cartItems.length === 1 ? cartItems[0].product.id : undefined

      await publicApi.submitQuoteRequest({
        fullName: formData.fullName,
        phoneNumber: formData.phoneNumber,
        email: formData.email,
        productId: primaryProductId,
        personalizationDetails: `Commande via Panier (${cartItems.length} article(s))`,
        message: fullMessage,
      })

      setCheckoutStep('success')
      clearCart()
    } catch (err) {
      console.error(err)
      setError("Une erreur est survenue lors de la validation. Veuillez réessayer.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />

          {/* Cart Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 z-50 flex h-full w-full max-w-md flex-col border-l border-gold/10 bg-walnut-deep text-ivory shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gold/10 px-6 py-5">
              <div className="flex items-center gap-2">
                <ShoppingBag className="size-5 text-gold" />
                <h2 className="font-heading text-2xl font-light tracking-wide">Votre Panier</h2>
              </div>
              <button
                onClick={() => {
                  setIsCartOpen(false)
                  // Reset steps when closing
                  setTimeout(() => setCheckoutStep('cart'), 300)
                }}
                className="rounded-full p-1 text-ivory/70 transition-colors hover:bg-gold/10 hover:text-gold"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {checkoutStep === 'cart' && (
                <>
                  {cartItems.length === 0 ? (
                    <div className="flex h-full flex-col items-center justify-center text-center">
                      <ShoppingBag className="mb-4 size-12 text-ivory/20" />
                      <p className="text-lg font-light text-ivory/60">Votre panier est vide</p>
                      <p className="mt-2 text-sm text-ivory/40">
                        Parcourez nos créations disponibles pour ajouter des pièces uniques à votre panier.
                      </p>
                      <button
                        onClick={() => setIsCartOpen(false)}
                        className="mt-6 rounded-full bg-gold px-6 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-walnut transition-all hover:bg-gold/90"
                      >
                        Voir les créations
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {cartItems.map((item) => {
                        const primaryImg =
                          item.product.images?.find((img) => img.isPrimary)?.imageUrl ||
                          item.product.images?.[0]?.imageUrl ||
                          '/placeholder-wood.png'

                        return (
                          <div
                            key={item.product.id}
                            className="flex gap-4 rounded-xl border border-gold/10 bg-black/20 p-3"
                          >
                            <div className="relative size-16 overflow-hidden rounded-lg border border-gold/10 bg-stone-900 shrink-0">
                              <Image
                                src={primaryImg}
                                alt={item.product.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div className="flex flex-1 flex-col justify-between">
                              <div>
                                <h3 className="text-sm font-medium leading-snug text-ivory">
                                  {item.product.name}
                                </h3>
                                <p className="text-[10px] text-gold uppercase tracking-[0.12em] mt-0.5">
                                  {item.product.category?.name}
                                </p>
                              </div>
                              <div className="flex items-center justify-between mt-2">
                                <div className="flex items-center gap-2 rounded-md bg-stone-900 px-2 py-1">
                                  <button
                                    onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                                    className="text-ivory/70 hover:text-gold"
                                  >
                                    <Minus className="size-3" />
                                  </button>
                                  <span className="text-xs w-4 text-center">{item.quantity}</span>
                                  <button
                                    onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                                    className="text-ivory/70 hover:text-gold"
                                  >
                                    <Plus className="size-3" />
                                  </button>
                                </div>
                                <span className="text-sm font-heading font-semibold text-gold">
                                  {item.product.price
                                    ? `${(item.product.price * item.quantity).toLocaleString()} DT`
                                    : 'Sur demande'}
                                </span>
                              </div>
                            </div>
                            <button
                              onClick={() => removeFromCart(item.product.id)}
                              className="text-ivory/30 hover:text-red-400 self-start p-1"
                            >
                              <Trash2 className="size-4" />
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </>
              )}

              {checkoutStep === 'form' && (
                <form onSubmit={handleCheckout} className="space-y-4 pt-2">
                  <h3 className="font-heading text-lg text-gold font-light tracking-wide mb-3">
                    Informations de Devis & Commande
                  </h3>

                  {error && (
                    <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-400">
                      {error}
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="text-xs uppercase tracking-wider text-ivory/60">Nom Complet *</label>
                    <input
                      type="text"
                      name="fullName"
                      required
                      value={formData.fullName}
                      onChange={handleInputChange}
                      placeholder="Ex: Mohamed Ben Ali"
                      className="w-full rounded-lg border border-gold/20 bg-stone-900 px-4 py-2.5 text-sm text-ivory focus:border-gold focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs uppercase tracking-wider text-ivory/60">Téléphone *</label>
                    <input
                      type="tel"
                      name="phoneNumber"
                      required
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      placeholder="Ex: +216 99 999 999"
                      className="w-full rounded-lg border border-gold/20 bg-stone-900 px-4 py-2.5 text-sm text-ivory focus:border-gold focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs uppercase tracking-wider text-ivory/60">Email *</label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Ex: mohamed.ali@gmail.com"
                      className="w-full rounded-lg border border-gold/20 bg-stone-900 px-4 py-2.5 text-sm text-ivory focus:border-gold focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs uppercase tracking-wider text-ivory/60">Remarques ou Dimensions sur-mesure</label>
                    <textarea
                      name="message"
                      rows={4}
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder="Entrez vos remarques, souhaits de patine, ajustements de dimensions..."
                      className="w-full rounded-lg border border-gold/20 bg-stone-900 px-4 py-2.5 text-sm text-ivory focus:border-gold focus:outline-none resize-none"
                    />
                  </div>

                  <p className="text-[11px] text-ivory/40 leading-relaxed pt-2">
                    * Nos créations artisanales nécessitent des ajustements personnalisés de transport et parfois de fabrication. Aucune transaction bancaire n&apos;est requise ici. Notre équipe vous contactera directement pour finaliser.
                  </p>
                </form>
              )}

              {checkoutStep === 'success' && (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-gold/10 text-gold">
                    <Send className="size-6 animate-pulse" />
                  </div>
                  <h3 className="font-heading text-2xl font-light text-gold">Demande envoyée !</h3>
                  <p className="mt-3 text-sm text-ivory/70 leading-relaxed px-2">
                    Merci pour votre intérêt envers l&apos;Atelier Aschi. 
                  </p>
                  <p className="mt-2 text-xs text-ivory/50 leading-relaxed px-2">
                    Votre panier a été transmis avec succès. Notre maître artisan ou notre chargé de clientèle vous contactera par téléphone d&apos;ici 24 heures pour valider votre commande et organiser le transport.
                  </p>
                  <button
                    onClick={() => {
                      setIsCartOpen(false)
                      setCheckoutStep('cart')
                    }}
                    className="mt-8 rounded-full border border-gold px-8 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-gold transition-all hover:bg-gold hover:text-walnut"
                  >
                    Retour à la boutique
                  </button>
                </div>
              )}
            </div>

            {/* Footer Summary / Actions */}
            {cartItems.length > 0 && checkoutStep !== 'success' && (
              <div className="border-t border-gold/10 bg-black/40 px-6 py-6 space-y-4">
                <div className="flex items-center justify-between text-base">
                  <span className="font-light text-ivory/70">Total Estimé :</span>
                  <span className="font-heading text-2xl font-semibold text-gold">
                    {hasPriceItems ? `${cartTotal.toLocaleString()} DT` : 'Sur demande'}
                  </span>
                </div>

                {checkoutStep === 'cart' ? (
                  <button
                    onClick={() => setCheckoutStep('form')}
                    className="flex w-full items-center justify-center gap-2 rounded-full bg-gold py-4 text-xs font-bold uppercase tracking-[0.18em] text-walnut transition-all duration-300 hover:bg-gold/90 hover:shadow-lg"
                  >
                    Finaliser la demande
                  </button>
                ) : (
                  <div className="flex gap-3">
                    <button
                      onClick={() => setCheckoutStep('cart')}
                      className="flex-1 rounded-full border border-gold/30 py-3 text-xs uppercase tracking-[0.14em] text-gold hover:bg-gold/5"
                    >
                      Retour panier
                    </button>
                    <button
                      onClick={handleCheckout}
                      disabled={loading}
                      className="flex-[2] flex items-center justify-center gap-2 rounded-full bg-gold py-3 text-xs font-bold uppercase tracking-[0.14em] text-walnut hover:bg-gold/90 disabled:opacity-50"
                    >
                      {loading ? 'Envoi...' : 'Valider la commande'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
