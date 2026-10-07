'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  User,
  Phone,
  Mail,
  MapPin,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  Clock,
  ChevronLeft,
  ChevronDown,
  MessageCircle,
  Package,
  Truck,
} from 'lucide-react'
import { useCart } from '@/lib/cart-context'
import { publicApi } from '@/lib/api'
import Image from 'next/image'
import { toast } from 'sonner'

const TUNISIAN_GOVERNORATES = [
  'Tunis',
  'Ariana',
  'Ben Arous',
  'Manouba',
  'Nabeul',
  'Zaghouan',
  'Bizerte',
  'Béja',
  'Jendouba',
  'Le Kef',
  'Siliana',
  'Sousse',
  'Monastir',
  'Mahdia',
  'Sfax',
  'Kairouan',
  'Kasserine',
  'Sidi Bouzid',
  'Gabès',
  'Médenine',
  'Tataouine',
  'Gafsa',
  'Tozeur',
  'Kébili',
  'Autre / International',
]

const SUGGESTION_TAGS = [
  { label: '🎨 Patine sur-mesure', text: 'Souhait de finition ou patine particulière' },
  { label: '📐 Dimensions adaptées', text: 'Ajustement de dimensions spécifiques' },
  { label: '⚡ Livraison rapide', text: 'Demande de livraison prioritaire' },
  { label: '✨ Gravure / Découpe', text: 'Personnalisation avec motif ou gravure' },
]

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
  const [isSummaryExpanded, setIsSummaryExpanded] = useState(false)
  const [orderReference, setOrderReference] = useState('')

  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    email: '',
    governorate: 'Tunis',
    address: '',
    contactPreference: 'whatsapp' as 'whatsapp' | 'phone',
    message: '',
  })

  const [errors, setErrors] = useState<{
    fullName?: string
    phoneNumber?: string
    email?: string
  }>({})

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  const handleAddTag = (tagText: string) => {
    setFormData((prev) => ({
      ...prev,
      message: prev.message ? `${prev.message} • ${tagText}` : tagText,
    }))
  }

  const validateForm = () => {
    const newErrors: typeof errors = {}
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Le nom et prénom sont obligatoires.'
    }
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Le numéro de téléphone est obligatoire.'
    } else if (formData.phoneNumber.trim().length < 8) {
      newErrors.phoneNumber = 'Veuillez saisir un numéro valide (min 8 chiffres).'
    }
    if (!formData.email.trim()) {
      newErrors.email = "L'adresse email est obligatoire."
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Veuillez saisir un email valide.'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const buildCartTextDetails = () => {
    return cartItems
      .map(
        (item) =>
          `- ${item.product.name} (Qté: ${item.quantity}, Prix: ${
            item.product.price ? `${item.product.price.toLocaleString()} DT` : 'Sur demande'
          })`
      )
      .join('\n')
  }

  const handleCheckout = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()

    if (!validateForm()) {
      toast.error('Veuillez compléter les informations obligatoires.')
      return
    }

    setLoading(true)
    const newRef = `ASCHI-${Math.floor(10000 + Math.random() * 90000)}`

    try {
      const cartDetails = buildCartTextDetails()
      const fullMessage = `COMMANDE PANIER EN LIGNE (Réf: ${newRef}) :
--------------------------------------------------
${cartDetails}

Total estimé : ${hasPriceItems ? `${cartTotal.toLocaleString()} DT` : 'Sur demande'}
Gouvernorat : ${formData.governorate}
Adresse : ${formData.address.trim() || 'Non renseignée'}
Canal de contact privilégié : ${
        formData.contactPreference === 'whatsapp' ? 'Discussion WhatsApp' : 'Appel Téléphonique'
      }

Remarques / Personnalisation :
${formData.message.trim() || 'Aucune remarque particulière.'}`

      const primaryProductId = cartItems.length === 1 ? cartItems[0].product.id : undefined

      await publicApi.submitQuoteRequest({
        fullName: formData.fullName.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        email: formData.email.trim(),
        productId: primaryProductId,
        personalizationDetails: `Commande Panier (${cartItems.length} article(s)) - ${formData.governorate}`,
        message: fullMessage,
      })

      setOrderReference(newRef)
      setCheckoutStep('success')
      clearCart()
      toast.success('Votre commande a été transmise avec succès !')
    } catch (err) {
      console.error(err)
      toast.error('Une erreur est survenue lors de la transmission. Veuillez réessayer.')
    } finally {
      setLoading(false)
    }
  }

  const handleWhatsAppDirectCheckout = async () => {
    if (!validateForm()) {
      toast.error('Veuillez indiquer vos coordonnées avant d’ouvrir WhatsApp.')
      return
    }

    setLoading(true)
    const newRef = `ASCHI-${Math.floor(10000 + Math.random() * 90000)}`

    try {
      const cartDetails = buildCartTextDetails()
      const fullMessage = `COMMANDE PANIER WHATSAPP (Réf: ${newRef}) :
--------------------------------------------------
${cartDetails}

Total estimé : ${hasPriceItems ? `${cartTotal.toLocaleString()} DT` : 'Sur demande'}
Gouvernorat : ${formData.governorate}
Adresse : ${formData.address.trim() || 'Non renseignée'}
Canal privilégié : WhatsApp

Remarques :
${formData.message.trim() || 'Aucune remarque particulière.'}`

      const primaryProductId = cartItems.length === 1 ? cartItems[0].product.id : undefined

      // Backup submission into system DB
      await publicApi.submitQuoteRequest({
        fullName: formData.fullName.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        email: formData.email.trim(),
        productId: primaryProductId,
        personalizationDetails: `Commande WhatsApp (${cartItems.length} art.) - ${formData.governorate}`,
        message: fullMessage,
      })

      // Compose WhatsApp text
      const waText = `🏛️ *COMMANDE ATELIER ASCHI* (Réf: ${newRef})
---------------------------------------
👤 *Client :* ${formData.fullName.trim()}
📞 *Tél :* +216 ${formData.phoneNumber.trim()}
📧 *Email :* ${formData.email.trim()}
📍 *Gouvernorat :* ${formData.governorate}
${formData.address.trim() ? `🏠 *Adresse :* ${formData.address.trim()}\n` : ''}
📦 *Articles commandés :*
${cartItems
  .map(
    (item) =>
      `• ${item.product.name} (x${item.quantity}) — ${
        item.product.price ? `${item.product.price.toLocaleString()} DT` : 'Sur demande'
      }`
  )
  .join('\n')}

💰 *Total Estimé :* ${hasPriceItems ? `${cartTotal.toLocaleString()} DT` : 'Sur devis'}
${formData.message.trim() ? `\n📝 *Remarques :* ${formData.message.trim()}\n` : ''}
Merci de me confirmer la disponibilité et les modalités de livraison.`

      setOrderReference(newRef)
      setCheckoutStep('success')
      clearCart()

      // Open WhatsApp in new tab
      window.open(`https://wa.me/21655743760?text=${encodeURIComponent(waText)}`, '_blank')
      toast.success('Redirection vers WhatsApp...')
    } catch (err) {
      console.error(err)
      toast.error('Erreur lors de la préparation WhatsApp.')
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
            className="fixed inset-0 z-50 bg-[#1A1512]/60 backdrop-blur-sm transition-opacity"
          />

          {/* Cart Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 240 }}
            className="fixed inset-y-0 right-0 z-50 flex h-full w-full max-w-md flex-col border-l border-[#E5DACD] bg-[#FCFAF7] text-[#2C1E16] shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#EADCC9]/70 bg-white/80 px-6 py-4.5 backdrop-blur-md">
              <div className="flex items-center gap-2.5">
                {checkoutStep === 'form' ? (
                  <button
                    onClick={() => setCheckoutStep('cart')}
                    className="flex size-8 items-center justify-center rounded-full bg-[#F5EFE6] text-[#C17D59] hover:bg-[#EADCC9] transition-colors mr-1"
                    title="Retour au panier"
                  >
                    <ChevronLeft className="size-5" />
                  </button>
                ) : (
                  <div className="flex size-8 items-center justify-center rounded-full bg-[#F5EFE6] text-[#C17D59]">
                    <ShoppingBag className="size-4.5" />
                  </div>
                )}

                <div>
                  <h2 className="font-heading text-xl font-medium tracking-wide text-[#2C1E16]">
                    {checkoutStep === 'cart' && 'Votre Panier'}
                    {checkoutStep === 'form' && 'Finaliser la Commande'}
                    {checkoutStep === 'success' && 'Confirmation'}
                  </h2>
                  <p className="text-[11px] text-[#3A2A1E]/60 uppercase tracking-wider">
                    {checkoutStep === 'cart' && `${cartItems.length} création(s) sélectionnée(s)`}
                    {checkoutStep === 'form' && 'Coordonnées & Livraison en Tunisie'}
                    {checkoutStep === 'success' && 'Demande prise en compte'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  setIsCartOpen(false)
                  setTimeout(() => setCheckoutStep('cart'), 300)
                }}
                className="flex size-8 items-center justify-center rounded-full text-[#3A2A1E]/60 hover:bg-[#F5EFE6] hover:text-[#C17D59] transition-colors"
                title="Fermer"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Stepper Progress Bar (when active items) */}
            {cartItems.length > 0 && checkoutStep !== 'success' && (
              <div className="flex items-center justify-between gap-2 border-b border-[#EADCC9]/50 bg-[#F9F5EE] px-6 py-2.5 text-[11px]">
                <div className="flex items-center gap-2">
                  <span
                    className={`flex size-4.5 items-center justify-center rounded-full text-[10px] font-bold ${
                      checkoutStep === 'cart'
                        ? 'bg-[#C17D59] text-white shadow-xs'
                        : 'bg-emerald-600 text-white'
                    }`}
                  >
                    {checkoutStep === 'cart' ? '1' : '✓'}
                  </span>
                  <span
                    className={`font-medium ${
                      checkoutStep === 'cart' ? 'text-[#2C1E16] font-semibold' : 'text-[#3A2A1E]/60'
                    }`}
                  >
                    Panier
                  </span>
                </div>

                <div className="h-px flex-1 bg-[#E2D8CC] mx-2" />

                <div className="flex items-center gap-2">
                  <span
                    className={`flex size-4.5 items-center justify-center rounded-full text-[10px] font-bold ${
                      checkoutStep === 'form'
                        ? 'bg-[#C17D59] text-white shadow-xs'
                        : 'bg-[#E5DACD] text-[#3A2A1E]/50'
                    }`}
                  >
                    2
                  </span>
                  <span
                    className={`font-medium ${
                      checkoutStep === 'form' ? 'text-[#2C1E16] font-semibold' : 'text-[#3A2A1E]/60'
                    }`}
                  >
                    Coordonnées &amp; Livraison
                  </span>
                </div>
              </div>
            )}

            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto px-5 py-4 sm:px-6">
              {/* STEP 1: CART ITEMS */}
              {checkoutStep === 'cart' && (
                <>
                  {cartItems.length === 0 ? (
                    <div className="flex h-full flex-col items-center justify-center text-center px-4 py-16">
                      <div className="mb-4 flex size-20 items-center justify-center rounded-full bg-[#F5EFE6] border border-[#EADCC9] text-[#C17D59]">
                        <ShoppingBag className="size-9 stroke-[1.5]" />
                      </div>
                      <h3 className="font-heading text-2xl font-light text-[#2C1E16]">
                        Votre panier est vide
                      </h3>
                      <p className="mt-2 text-xs text-[#3A2A1E]/60 max-w-xs leading-relaxed">
                        Parcourez notre collection d&apos;artisanat d&apos;art et sélectionnez des pièces
                        uniques pour votre intérieur.
                      </p>
                      <button
                        onClick={() => setIsCartOpen(false)}
                        className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#C17D59] px-6 py-2.5 text-xs font-bold uppercase tracking-[0.16em] text-white shadow-md hover:bg-[#A86442] transition-all"
                      >
                        <Sparkles className="size-3.5" />
                        <span>Explorer le Catalogue</span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3.5">
                      {cartItems.map((item) => {
                        const primaryImg =
                          item.product.images?.find((img) => img.isPrimary)?.imageUrl ||
                          item.product.images?.[0]?.imageUrl ||
                          '/placeholder-wood.png'

                        return (
                          <div
                            key={item.product.id}
                            className="group flex gap-3.5 rounded-2xl border border-[#E8DFD5] bg-white p-3.5 shadow-xs hover:border-[#C17D59]/40 transition-all duration-200"
                          >
                            {/* Product Thumbnail */}
                            <div className="relative size-18 overflow-hidden rounded-xl border border-[#E8DFD5] bg-[#F5EFE6] shrink-0 shadow-2xs">
                              <Image
                                src={primaryImg}
                                alt={item.product.name}
                                fill
                                className="object-cover transition-transform duration-300 group-hover:scale-105"
                              />
                            </div>

                            {/* Details */}
                            <div className="flex flex-1 flex-col justify-between min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0">
                                  <h3 className="text-sm font-medium leading-tight text-[#2C1E16] truncate">
                                    {item.product.name}
                                  </h3>
                                  <p className="text-[10px] uppercase tracking-wider text-[#C17D59] font-medium mt-0.5">
                                    {item.product.category?.name || 'Artisanat d’art'}
                                  </p>
                                </div>
                                <button
                                  onClick={() => removeFromCart(item.product.id)}
                                  className="text-[#3A2A1E]/30 hover:text-red-500 transition-colors p-1"
                                  title="Supprimer l'article"
                                >
                                  <Trash2 className="size-4" />
                                </button>
                              </div>

                              <div className="flex items-center justify-between mt-3 pt-1 border-t border-[#F5EFE6]">
                                {/* Stepper */}
                                <div className="flex items-center gap-2 rounded-lg bg-[#F5EFE6] border border-[#E5DACD] px-2 py-1 text-[#3A2A1E]">
                                  <button
                                    onClick={() =>
                                      updateQuantity(item.product.id, item.quantity - 1)
                                    }
                                    className="p-0.5 text-[#3A2A1E]/70 hover:text-[#C17D59] transition-colors"
                                    aria-label="Diminuer"
                                  >
                                    <Minus className="size-3" />
                                  </button>
                                  <span className="text-xs font-semibold w-5 text-center text-[#2C1E16]">
                                    {item.quantity}
                                  </span>
                                  <button
                                    onClick={() =>
                                      updateQuantity(item.product.id, item.quantity + 1)
                                    }
                                    className="p-0.5 text-[#3A2A1E]/70 hover:text-[#C17D59] transition-colors"
                                    aria-label="Augmenter"
                                  >
                                    <Plus className="size-3" />
                                  </button>
                                </div>

                                <div className="text-right">
                                  <span className="text-sm font-heading font-semibold text-[#C17D59]">
                                    {item.product.price
                                      ? `${(item.product.price * item.quantity).toLocaleString()} DT`
                                      : 'Sur demande'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        )
                      })}

                      {/* Micro assurance */}
                      <div className="mt-4 flex items-center justify-center gap-2 text-center text-[11px] text-[#3A2A1E]/60 pt-2">
                        <Truck className="size-3.5 text-[#C17D59]" />
                        <span>Livraison soignée partout en Tunisie</span>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* STEP 2: PROFESSIONAL ORDER FORM */}
              {checkoutStep === 'form' && (
                <form onSubmit={handleCheckout} className="space-y-4 pt-1">
                  {/* Collapsible Order Summary Banner */}
                  <div className="rounded-xl border border-[#E8DFD5] bg-white overflow-hidden shadow-xs">
                    <button
                      type="button"
                      onClick={() => setIsSummaryExpanded(!isSummaryExpanded)}
                      className="w-full flex items-center justify-between p-3.5 text-left bg-[#FAF7F2] hover:bg-[#F5EFE6] transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <Package className="size-4 text-[#C17D59]" />
                        <div>
                          <p className="text-xs font-semibold text-[#2C1E16]">
                            Articles commandés ({cartItems.length})
                          </p>
                          <p className="text-[11px] text-[#3A2A1E]/60">
                            Total estimé :{' '}
                            <span className="font-bold text-[#C17D59]">
                              {hasPriceItems ? `${cartTotal.toLocaleString()} DT` : 'Sur demande'}
                            </span>
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-[#C17D59] font-medium">
                        <span>{isSummaryExpanded ? 'Masquer' : 'Détail'}</span>
                        <ChevronDown
                          className={`size-4 transition-transform duration-200 ${
                            isSummaryExpanded ? 'rotate-180' : ''
                          }`}
                        />
                      </div>
                    </button>

                    <AnimatePresence>
                      {isSummaryExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="border-t border-[#E8DFD5] px-3.5 py-2.5 space-y-2 max-h-40 overflow-y-auto"
                        >
                          {cartItems.map((item) => (
                            <div
                              key={item.product.id}
                              className="flex items-center justify-between text-xs py-1"
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <span className="size-4.5 rounded-full bg-[#F5EFE6] text-[#C17D59] text-[10px] font-bold flex items-center justify-center shrink-0">
                                  {item.quantity}×
                                </span>
                                <span className="truncate text-[#2C1E16] font-medium">
                                  {item.product.name}
                                </span>
                              </div>
                              <span className="font-semibold text-[#C17D59] shrink-0 ml-2">
                                {item.product.price
                                  ? `${(item.product.price * item.quantity).toLocaleString()} DT`
                                  : 'Sur devis'}
                              </span>
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Field: Full Name */}
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-[#3A2A1E]/80 font-bold mb-1.5">
                      Nom &amp; Prénom <span className="text-[#C17D59]">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#C17D59]/70">
                        <User className="size-4" />
                      </div>
                      <input
                        type="text"
                        name="fullName"
                        required
                        value={formData.fullName}
                        onChange={handleInputChange}
                        placeholder="Ex: Mohamed Ben Ali"
                        className={`w-full pl-10 pr-4 py-2.5 rounded-xl border bg-white text-sm text-[#2C1E16] placeholder:text-[#3A2A1E]/35 focus:border-[#C17D59] focus:ring-2 focus:ring-[#C17D59]/15 focus:outline-none transition-all shadow-xs ${
                          errors.fullName ? 'border-red-400 bg-red-50/20' : 'border-[#E2D8CC]'
                        }`}
                      />
                    </div>
                    {errors.fullName && (
                      <p className="text-[11px] text-red-500 mt-1 font-medium">{errors.fullName}</p>
                    )}
                  </div>

                  {/* Field: Phone Number with Tunisia Flag Badge */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-[11px] uppercase tracking-wider text-[#3A2A1E]/80 font-bold">
                        Numéro de Téléphone <span className="text-[#C17D59]">*</span>
                      </label>
                      <span className="text-[10px] text-[#C17D59] font-medium">Validation &amp; Suivi</span>
                    </div>
                    <div className="relative flex">
                      <div className="inline-flex items-center gap-1.5 px-3 rounded-l-xl border border-r-0 border-[#E2D8CC] bg-[#F5EFE6] text-xs font-semibold text-[#3A2A1E] select-none">
                        <span>🇹🇳</span>
                        <span>+216</span>
                      </div>
                      <div className="relative flex-1">
                        <input
                          type="tel"
                          name="phoneNumber"
                          required
                          value={formData.phoneNumber}
                          onChange={handleInputChange}
                          placeholder="Ex: 98 000 000"
                          className={`w-full px-3.5 py-2.5 rounded-r-xl border bg-white text-sm text-[#2C1E16] placeholder:text-[#3A2A1E]/35 focus:border-[#C17D59] focus:ring-2 focus:ring-[#C17D59]/15 focus:outline-none transition-all shadow-xs ${
                            errors.phoneNumber ? 'border-red-400 bg-red-50/20' : 'border-[#E2D8CC]'
                          }`}
                        />
                      </div>
                    </div>
                    {errors.phoneNumber && (
                      <p className="text-[11px] text-red-500 mt-1 font-medium">
                        {errors.phoneNumber}
                      </p>
                    )}
                  </div>

                  {/* Field: Email */}
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-[#3A2A1E]/80 font-bold mb-1.5">
                      Adresse Email <span className="text-[#C17D59]">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#C17D59]/70">
                        <Mail className="size-4" />
                      </div>
                      <input
                        type="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="Ex: mohamed.ali@gmail.com"
                        className={`w-full pl-10 pr-4 py-2.5 rounded-xl border bg-white text-sm text-[#2C1E16] placeholder:text-[#3A2A1E]/35 focus:border-[#C17D59] focus:ring-2 focus:ring-[#C17D59]/15 focus:outline-none transition-all shadow-xs ${
                          errors.email ? 'border-red-400 bg-red-50/20' : 'border-[#E2D8CC]'
                        }`}
                      />
                    </div>
                    {errors.email && (
                      <p className="text-[11px] text-red-500 mt-1 font-medium">{errors.email}</p>
                    )}
                  </div>

                  {/* Fields: Governorate & Delivery City */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] uppercase tracking-wider text-[#3A2A1E]/80 font-bold mb-1.5">
                        Gouvernorat <span className="text-[#C17D59]">*</span>
                      </label>
                      <div className="relative">
                        <select
                          name="governorate"
                          value={formData.governorate}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2.5 rounded-xl border border-[#E2D8CC] bg-white text-xs text-[#2C1E16] font-medium focus:border-[#C17D59] focus:ring-2 focus:ring-[#C17D59]/15 focus:outline-none transition-all shadow-xs appearance-none pr-8 cursor-pointer"
                        >
                          {TUNISIAN_GOVERNORATES.map((gov) => (
                            <option key={gov} value={gov}>
                              {gov}
                            </option>
                          ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-[#3A2A1E]/50">
                          <ChevronDown className="size-4" />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] uppercase tracking-wider text-[#3A2A1E]/80 font-bold mb-1.5">
                        Adresse / Ville <span className="text-[#3A2A1E]/40 font-normal">(Optionnel)</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#C17D59]/70">
                          <MapPin className="size-3.5" />
                        </div>
                        <input
                          type="text"
                          name="address"
                          value={formData.address}
                          onChange={handleInputChange}
                          placeholder="Ex: La Marsa, Rue..."
                          className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-[#E2D8CC] bg-white text-xs text-[#2C1E16] placeholder:text-[#3A2A1E]/35 focus:border-[#C17D59] focus:ring-2 focus:ring-[#C17D59]/15 focus:outline-none transition-all shadow-xs"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Preferred Contact Method */}
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-[#3A2A1E]/80 font-bold mb-1.5">
                      Canal de contact privilégié
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({ ...prev, contactPreference: 'whatsapp' }))
                        }
                        className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                          formData.contactPreference === 'whatsapp'
                            ? 'border-emerald-600 bg-emerald-50 text-emerald-800 shadow-2xs ring-1 ring-emerald-600'
                            : 'border-[#E2D8CC] bg-white text-[#3A2A1E]/70 hover:bg-[#FAF7F2]'
                        }`}
                      >
                        <MessageCircle className="size-3.5 text-emerald-600" />
                        <span>Par WhatsApp</span>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({ ...prev, contactPreference: 'phone' }))
                        }
                        className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                          formData.contactPreference === 'phone'
                            ? 'border-[#C17D59] bg-[#F5EFE6] text-[#2C1E16] shadow-2xs ring-1 ring-[#C17D59]'
                            : 'border-[#E2D8CC] bg-white text-[#3A2A1E]/70 hover:bg-[#FAF7F2]'
                        }`}
                      >
                        <Phone className="size-3.5 text-[#C17D59]" />
                        <span>Par Appel Direct</span>
                      </button>
                    </div>
                  </div>

                  {/* Field: Customization / Remarks */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-[11px] uppercase tracking-wider text-[#3A2A1E]/80 font-bold">
                        Remarques ou Sur-mesure <span className="text-[#3A2A1E]/40 font-normal">(Optionnel)</span>
                      </label>
                    </div>

                    {/* Pro suggestion tags */}
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {SUGGESTION_TAGS.map((tag) => (
                        <button
                          key={tag.label}
                          type="button"
                          onClick={() => handleAddTag(tag.text)}
                          className="text-[10px] px-2.5 py-1 rounded-full bg-[#F5EFE6] hover:bg-[#EADCC9] text-[#3A2A1E] border border-[#E5DACD] transition-colors cursor-pointer"
                        >
                          {tag.label}
                        </button>
                      ))}
                    </div>

                    <textarea
                      name="message"
                      rows={3}
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder="Précisez ici vos souhaits de patine, ajustements de dimensions, date souhaitée ou toute question..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2D8CC] bg-white text-xs text-[#2C1E16] placeholder:text-[#3A2A1E]/35 focus:border-[#C17D59] focus:ring-2 focus:ring-[#C17D59]/15 focus:outline-none transition-all shadow-xs resize-none"
                    />
                  </div>

                  {/* Reassurance Guarantee Card */}
                  <div className="rounded-xl border border-[#E8DFD5] bg-[#FAF7F2] p-3.5 space-y-2.5">
                    <div className="flex items-start gap-2.5 text-xs text-[#3A2A1E]">
                      <ShieldCheck className="size-4.5 text-[#C17D59] shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-[11.5px] text-[#2C1E16]">
                          Zéro transaction bancaire requise ici
                        </p>
                        <p className="text-[10.5px] text-[#3A2A1E]/65 leading-tight">
                          Paiement à la livraison ou devis personnalisé. Notre équipe valide chaque pièce
                          avec vous avant confirmation.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5 text-xs text-[#3A2A1E]">
                      <Clock className="size-4.5 text-[#C17D59] shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-[11.5px] text-[#2C1E16]">
                          Validation humaine sous 24h
                        </p>
                        <p className="text-[10.5px] text-[#3A2A1E]/65 leading-tight">
                          Un artisan ou conseiller vous contacte par téléphone ou WhatsApp pour convenir de la
                          livraison et des détails.
                        </p>
                      </div>
                    </div>
                  </div>
                </form>
              )}

              {/* STEP 3: SUCCESS CONFIRMATION */}
              {checkoutStep === 'success' && (
                <div className="flex h-full flex-col items-center justify-center text-center px-2 py-6">
                  <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-emerald-100 border-2 border-emerald-500 text-emerald-600 shadow-sm">
                    <CheckCircle2 className="size-8" />
                  </div>

                  <span className="inline-block px-3 py-1 rounded-full bg-[#F5EFE6] text-[#C17D59] font-mono font-bold text-xs tracking-wider mb-2">
                    RÉFÉRENCE : {orderReference || 'ASCHI-DIRECT'}
                  </span>

                  <h3 className="font-heading text-2xl font-light text-[#2C1E16]">
                    Commande Enregistrée !
                  </h3>

                  <p className="mt-2 text-xs text-[#3A2A1E]/75 leading-relaxed max-w-sm">
                    Merci pour votre confiance envers la{' '}
                    <strong className="text-[#2C1E16]">Maison Artisanat Aschi</strong>. Votre demande a bien été
                    transmise à nos maîtres artisans.
                  </p>

                  {/* Summary card */}
                  <div className="w-full max-w-sm mt-5 rounded-2xl border border-[#E8DFD5] bg-white p-4 text-left space-y-3 shadow-xs">
                    <p className="text-[11px] uppercase tracking-wider text-[#C17D59] font-bold">
                      Prochaines étapes :
                    </p>

                    <div className="flex items-start gap-3 text-xs">
                      <span className="size-5 rounded-full bg-[#F5EFE6] text-[#C17D59] font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                        1
                      </span>
                      <div>
                        <p className="font-semibold text-[#2C1E16]">Validation de vos pièces</p>
                        <p className="text-[11px] text-[#3A2A1E]/60">
                          Réservation de vos créations dans notre atelier de La Goulette.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 text-xs">
                      <span className="size-5 rounded-full bg-[#F5EFE6] text-[#C17D59] font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                        2
                      </span>
                      <div>
                        <p className="font-semibold text-[#2C1E16]">Contact sous 24 heures</p>
                        <p className="text-[11px] text-[#3A2A1E]/60">
                          Échange par{' '}
                          {formData.contactPreference === 'whatsapp' ? 'WhatsApp' : 'appel direct'} (
                          {formData.phoneNumber || 'votre contact'}).
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 text-xs">
                      <span className="size-5 rounded-full bg-[#F5EFE6] text-[#C17D59] font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                        3
                      </span>
                      <div>
                        <p className="font-semibold text-[#2C1E16]">Livraison sécurisée</p>
                        <p className="text-[11px] text-[#3A2A1E]/60">
                          Transport soigné vers {formData.governorate}. Paiement à la réception.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Follow-up button via WhatsApp */}
                  <div className="w-full max-w-sm mt-5 space-y-2.5">
                    <a
                      href={`https://wa.me/21655743760?text=${encodeURIComponent(
                        `Bonjour Atelier Aschi, je viens d'enregistrer la commande réf ${orderReference}. Je souhaite faire le point sur la validation et la livraison.`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full py-3 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md"
                    >
                      <MessageCircle className="size-4" />
                      <span>Échanger directement sur WhatsApp</span>
                    </a>

                    <button
                      onClick={() => {
                        setIsCartOpen(false)
                        setCheckoutStep('cart')
                      }}
                      className="w-full rounded-full border border-[#E8DFD5] bg-white hover:bg-[#FAF7F2] py-2.5 text-xs font-semibold uppercase tracking-wider text-[#3A2A1E] transition-colors cursor-pointer"
                    >
                      Retour à la boutique
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Summary / Call to Actions */}
            {cartItems.length > 0 && checkoutStep !== 'success' && (
              <div className="border-t border-[#E8DFD5] bg-white/95 px-6 py-4.5 space-y-3.5 backdrop-blur-md">
                {/* Total */}
                <div className="flex items-center justify-between text-base">
                  <div className="flex flex-col">
                    <span className="text-xs uppercase tracking-wider text-[#3A2A1E]/60 font-medium">
                      Total Estimé :
                    </span>
                    <span className="text-[10px] text-[#3A2A1E]/40">Hors transport sur-mesure</span>
                  </div>
                  <span className="font-heading text-2xl font-bold text-[#C17D59]">
                    {hasPriceItems ? `${cartTotal.toLocaleString()} DT` : 'Sur demande'}
                  </span>
                </div>

                {checkoutStep === 'cart' ? (
                  <button
                    onClick={() => setCheckoutStep('form')}
                    className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#C17D59] via-[#B8734E] to-[#9F5A35] py-3.5 text-xs font-bold uppercase tracking-[0.18em] text-white transition-all duration-300 hover:shadow-lg hover:brightness-105 active:scale-[0.99] cursor-pointer"
                  >
                    <span>Continuer vers la commande</span>
                  </button>
                ) : (
                  <div className="space-y-2">
                    {/* Primary Button */}
                    <button
                      onClick={(e) => handleCheckout(e)}
                      disabled={loading}
                      className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#C17D59] via-[#B8734E] to-[#9F5A35] py-3.5 text-xs font-bold uppercase tracking-[0.16em] text-white shadow-md hover:shadow-lg hover:brightness-105 active:scale-[0.99] transition-all disabled:opacity-50 cursor-pointer"
                    >
                      {loading ? (
                        <>
                          <div className="size-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                          <span>Envoi en cours...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="size-4" />
                          <span>Valider la commande</span>
                        </>
                      )}
                    </button>

                    {/* Secondary WhatsApp Direct Option */}
                    <button
                      type="button"
                      onClick={handleWhatsAppDirectCheckout}
                      disabled={loading}
                      className="flex w-full items-center justify-center gap-2 rounded-full bg-emerald-600 hover:bg-emerald-700 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition-all shadow-xs cursor-pointer"
                    >
                      <MessageCircle className="size-3.5" />
                      <span>Commander via WhatsApp</span>
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
