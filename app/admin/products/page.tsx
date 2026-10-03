'use client'

import { useEffect, useState } from 'react'
import { Sparkles, Plus, Camera, ShoppingBag } from 'lucide-react'
import { adminApi, publicApi, Product, Category } from '@/lib/api'
import { isBijouxOrHandleCategory, isBijouxOrHandleProduct } from '@/lib/utils'
import ProductsTab from './ProductsTab'
import OrdersTab from './OrdersTab'
import ProductModal from './ProductModal'

const DEFAULT_FURNITURE_CATEGORIES: Category[] = [
  { id: 1, name: 'Buffets', type: 'MOBILIER' },
  { id: 2, name: 'Meubles TV', type: 'MOBILIER' },
  { id: 3, name: 'Miroirs', type: 'DECORATION' },
  { id: 4, name: 'Portes', type: 'PORTES' },
  { id: 5, name: 'Coffres', type: 'MOBILIER' },
  { id: 6, name: 'Décoration', type: 'DECORATION' },
  { id: 7, name: 'Tables', type: 'MOBILIER' },
]

export default function AdminProductsPage() {
  const [activeTab, setActiveTab] = useState<'PRODUCTS' | 'ORDERS'>('PRODUCTS')
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>(DEFAULT_FURNITURE_CATEGORIES)
  const [loading, setLoading] = useState(true)
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0)

  // Modal states
  const [modalOpen, setModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      if (urlParams.get('tab') === 'orders') {
        setActiveTab('ORDERS')
      }
    }
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)

      // 1. Charge les catégories
      try {
        const catData = await publicApi.getCategories()
        if (Array.isArray(catData)) {
          const pureCats = catData.filter(c => !isBijouxOrHandleCategory(c.name))
          if (pureCats.length > 0) {
            setCategories(pureCats)
          }
        }
      } catch (catErr) {
        console.warn('Erreur chargement catégories:', catErr)
      }

      // 2. Charge les pièces en stock
      try {
        const prodData = await adminApi.getProducts()
        if (Array.isArray(prodData)) {
          setProducts(prodData.filter(p => p.type !== 'CATALOGUE' && !isBijouxOrHandleProduct(p)))
        }
      } catch (prodErr) {
        console.warn('Erreur chargement produits:', prodErr)
        setProducts([])
      }
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette pièce disponible ?')) return
    try {
      await adminApi.deleteProduct(id)
      setProducts(prev => prev.filter(p => p.id !== id))
      try {
        const cached = localStorage.getItem('aschi_latest_available_product')
        if (cached) {
          const parsed = JSON.parse(cached)
          if (parsed && parsed.id === id) {
            localStorage.removeItem('aschi_latest_available_product')
          }
        }
      } catch (_) {}
    } catch (err: any) {
      if (err?.message?.includes('not found') || err?.message?.includes('404')) {
        setProducts(prev => prev.filter(p => p.id !== id))
        return
      }
      alert(err.message || 'Erreur lors de la suppression.')
    }
  }
  return (
    <div className="p-6 md:p-10 space-y-8 text-left text-[#0F172A]">
      {/* ─── Header ─── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E8DFD4] pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAF0E6] border border-[#E8DFD4] text-[#C17D59] text-xs uppercase tracking-widest mb-2 font-semibold">
            <Sparkles className="size-3.5" /> Stock Showroom &amp; Pièces Disponibles
          </div>
          <h1 className="font-heading text-3xl md:text-4xl text-[#0F172A] font-bold">
            Pièces Disponibles
          </h1>
          <p className="text-sm text-[#475569] mt-1 font-normal">
            Gérez les créations réelles en noyer massif prêtes à la vente en atelier et les réservations clients.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingProduct(null)
            setModalOpen(true)
          }}
          className="inline-flex items-center gap-2 bg-[#0F172A] hover:bg-[#C8960C] text-white px-5 py-3 rounded-full text-xs font-bold uppercase tracking-wider transition-all shadow-md self-start md:self-auto cursor-pointer"
        >
          <Plus className="size-4" /> + Nouvelle Pièce Disponible
        </button>
      </div>

      {/* ─── Switcher des Onglets ─── */}
      <div className="flex gap-2 p-1.5 bg-[#EFECE6] border border-[#E2DBD0] rounded-xl w-fit">
        <button
          onClick={() => setActiveTab('PRODUCTS')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === 'PRODUCTS'
              ? 'bg-white text-[#0F172A] shadow-sm border border-[#E2DBD0]'
              : 'text-[#475569] hover:text-[#0F172A]'
          }`}
        >
          <Camera className="size-4" />
          <span>Pièces en Stock</span>
          <span className="ml-1 bg-[#FAF0E6] text-[#C17D59] text-[10px] font-bold rounded-full px-2 py-0.5 border border-[#E8DFD4]">
            {products.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('ORDERS')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === 'ORDERS'
              ? 'bg-[#C17D59] text-white shadow-sm'
              : 'text-[#475569] hover:text-[#0F172A]'
          }`}
        >
          <ShoppingBag className="size-4" />
          <span>Réservations &amp; Commandes</span>
          {pendingOrdersCount > 0 && (
            <span className="ml-1 bg-white text-[#C17D59] text-[10px] font-black rounded-full w-5 h-5 flex items-center justify-center shadow-xs">
              {pendingOrdersCount}
            </span>
          )}
        </button>
      </div>

      {/* ─── Contenu des Onglets ─── */}
      <div>
        {activeTab === 'PRODUCTS' && (
          <ProductsTab
            products={products}
            categories={categories}
            loading={loading}
            onRefresh={loadData}
            onEdit={(prod) => {
              setEditingProduct(prod)
              setModalOpen(true)
            }}
            onDelete={handleDelete}
            onCreate={() => {
              setEditingProduct(null)
              setModalOpen(true)
            }}
          />
        )}

        {activeTab === 'ORDERS' && (
          <OrdersTab onPendingCountChange={setPendingOrdersCount} />
        )}
      </div>

      {/* ─── Modale Création / Édition ─── */}
      <ProductModal
        isOpen={modalOpen}
        product={editingProduct}
        categories={categories}
        products={products}
        onClose={() => {
          setModalOpen(false)
          setEditingProduct(null)
        }}
        onSaved={loadData}
        onCategoryCreated={(cat) => setCategories(prev => [...prev, cat])}
      />
    </div>
  )
}
