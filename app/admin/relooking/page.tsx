'use client'

import { useEffect, useState } from 'react'
import { ArrowLeftRight, Plus, InboxIcon } from 'lucide-react'
import { adminApi, Relooking } from '@/lib/api'
import RelookingsTab from './RelookingsTab'
import RelookingQuotesTab from './RelookingQuotesTab'
import RelookingModal from './RelookingModal'

export default function AdminRelookingPage() {
  const [activeTab, setActiveTab] = useState<'RELOOKINGS' | 'QUOTES'>('RELOOKINGS')
  const [relookings, setRelookings] = useState<Relooking[]>([])
  const [loading, setLoading] = useState(true)
  const [pendingQuotesCount, setPendingQuotesCount] = useState(0)

  // Modal states
  const [modalOpen, setModalOpen] = useState(false)
  const [editingRelooking, setEditingRelooking] = useState<Relooking | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      if (urlParams.get('tab') === 'quotes' || urlParams.get('tab') === 'devis') {
        setActiveTab('QUOTES')
      }
    }
    loadRelookings()
  }, [])

  const loadRelookings = async () => {
    try {
      setLoading(true)
      const data = await adminApi.getRelookings()
      setRelookings(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Erreur chargement relookings:', err)
      setRelookings([])
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette restauration ?')) return
    try {
      await adminApi.deleteRelooking(id)
      setRelookings(prev => prev.filter(r => r.id !== id))
    } catch (err: any) {
      alert(err.message || 'Erreur lors de la suppression.')
    }
  }

  return (
    <div className="p-6 md:p-10 space-y-8 text-left text-[#0F172A]">
      {/* ─── Header ─── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E8DFD4] pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAF0E6] border border-[#E8DFD4] text-[#C17D59] text-xs uppercase tracking-widest mb-2 font-semibold">
            <ArrowLeftRight className="size-3.5" /> Ébénisterie &amp; Restauration d&apos;Art
          </div>
          <h1 className="font-heading text-3xl md:text-4xl text-[#0F172A] font-bold">
            Gestion des Relookings
          </h1>
          <p className="text-sm text-[#475569] mt-1 font-normal">
            Gérez les projets Avant / Après et le traitement commercial des demandes de devis de restauration.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingRelooking(null)
            setModalOpen(true)
          }}
          className="inline-flex items-center gap-2 bg-[#0F172A] hover:bg-[#C8960C] text-white px-5 py-3 rounded-full text-xs font-bold uppercase tracking-wider transition-all shadow-md self-start md:self-auto cursor-pointer"
        >
          <Plus className="size-4" /> Nouveau Relooking
        </button>
      </div>

      {/* ─── Switcher des Onglets ─── */}
      <div className="flex gap-2 p-1.5 bg-[#EFECE6] border border-[#E2DBD0] rounded-xl w-fit">
        <button
          onClick={() => setActiveTab('RELOOKINGS')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === 'RELOOKINGS'
              ? 'bg-white text-[#0F172A] shadow-sm border border-[#E2DBD0]'
              : 'text-[#475569] hover:text-[#0F172A]'
          }`}
        >
          <ArrowLeftRight className="size-4" />
          <span>Mes Restaurations (Avant / Après)</span>
          <span className="ml-1 bg-[#FAF0E6] text-[#C17D59] text-[10px] font-bold rounded-full px-2 py-0.5 border border-[#E8DFD4]">
            {relookings.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('QUOTES')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === 'QUOTES'
              ? 'bg-[#C17D59] text-white shadow-sm'
              : 'text-[#475569] hover:text-[#0F172A]'
          }`}
        >
          <InboxIcon className="size-4" />
          <span>Demandes de Devis Relooking</span>
          {pendingQuotesCount > 0 && (
            <span className="ml-1 bg-white text-[#C17D59] text-[10px] font-black rounded-full w-5 h-5 flex items-center justify-center shadow-xs">
              {pendingQuotesCount}
            </span>
          )}
        </button>
      </div>

      {/* ─── Contenu des Onglets ─── */}
      <div>
        {activeTab === 'RELOOKINGS' && (
          <RelookingsTab
            relookings={relookings}
            loading={loading}
            onRefresh={loadRelookings}
            onEdit={(r) => {
              setEditingRelooking(r)
              setModalOpen(true)
            }}
            onDelete={handleDelete}
            onCreate={() => {
              setEditingRelooking(null)
              setModalOpen(true)
            }}
          />
        )}

        {activeTab === 'QUOTES' && (
          <RelookingQuotesTab onPendingCountChange={setPendingQuotesCount} />
        )}
      </div>

      {/* ─── Modale Création / Édition ─── */}
      <RelookingModal
        isOpen={modalOpen}
        relooking={editingRelooking}
        onClose={() => {
          setModalOpen(false)
          setEditingRelooking(null)
        }}
        onSaved={loadRelookings}
      />
    </div>
  )
}
