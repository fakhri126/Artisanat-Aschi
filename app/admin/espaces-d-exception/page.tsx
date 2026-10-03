'use client'

import { useState, useEffect } from 'react'
import { Briefcase, InboxIcon } from 'lucide-react'
import DemandesTab from './DemandesTab'
import ProjectsTab from './ProjectsTab'

type Tab = 'projets' | 'demandes'

export default function AdminEspacesDExceptionPage() {
  const [activeTab, setActiveTab] = useState<Tab>('demandes')
  const [pendingCount, setPendingCount] = useState<number>(0)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      const tab = urlParams.get('tab')
      if (tab === 'projets' || tab === 'projects') {
        setActiveTab('projets')
      } else if (tab === 'demandes' || tab === 'quotes') {
        setActiveTab('demandes')
      }
    }
  }, [])

  return (
    <div className="p-6 md:p-10 space-y-8 text-left text-[#0F172A]">
      {/* ─── Header ─── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E8DFD4] pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAF0E6] border border-[#E8DFD4] text-[#C17D59] text-xs uppercase tracking-widest mb-2 font-semibold">
            <Briefcase className="size-3.5" /> Architecture Monumentale &amp; Projets Clés en Main
          </div>
          <h1 className="font-heading text-3xl md:text-4xl text-[#0F172A] font-bold">
            Espaces d&apos;Exception
          </h1>
          <p className="text-sm text-[#475569] mt-1 font-normal">
            Gérez séparément les demandes d&apos;études personnalisées des clients et votre portfolio de prestige.
          </p>
        </div>
      </div>

      {/* ─── Switcher des Onglets ─── */}
      <div className="flex gap-2 p-1.5 bg-[#EFECE6] border border-[#E2DBD0] rounded-xl w-fit">
        <button
          onClick={() => setActiveTab('demandes')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === 'demandes'
              ? 'bg-[#C17D59] text-white shadow-sm'
              : 'text-[#475569] hover:text-[#0F172A]'
          }`}
        >
          <InboxIcon className="size-4" />
          <span>Demandes Reçues</span>
          {pendingCount > 0 && (
            <span className="ml-1 bg-white text-[#C17D59] text-[10px] font-black rounded-full w-5 h-5 flex items-center justify-center shadow-xs">
              {pendingCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('projets')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === 'projets'
              ? 'bg-white text-[#0F172A] shadow-sm border border-[#E2DBD0]'
              : 'text-[#475569] hover:text-[#0F172A]'
          }`}
        >
          <Briefcase className="size-4" />
          <span>Mes Projets Clés en Main</span>
        </button>
      </div>

      {/* ─── Contenu des Onglets ─── */}
      <div>
        {activeTab === 'demandes' && <DemandesTab onPendingCountChange={setPendingCount} />}
        {activeTab === 'projets' && <ProjectsTab />}
      </div>
    </div>
  )
}
