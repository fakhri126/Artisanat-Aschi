import { Navbar } from '@/components/site/navbar'
import { Footer } from '@/components/site/footer'
import { Story } from '@/components/site/story'
import { Workshop } from '@/components/site/workshop'
import { CustomProcess } from '@/components/site/custom-process'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: "L'Atelier — Artisanat Aschi",
  description: "Découvrez l'histoire de l'atelier Artisanat Aschi fondé en 1960 par Hechmi Aschi, le savoir-faire transmis de génération en génération et le processus de création sur-mesure.",
}

export default function AtelierPage() {
  return (
    <main className="overflow-x-hidden">
      <Navbar />
      <div className="pt-20">
        <Story />
        <Workshop />
        <CustomProcess />
      </div>
      <Footer />
    </main>
  )
}
