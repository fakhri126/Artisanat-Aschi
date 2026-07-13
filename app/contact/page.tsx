import { Navbar } from '@/components/site/navbar'
import { Footer } from '@/components/site/footer'
import { Contact } from '@/components/site/contact'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Contact — Artisanat Aschi",
  description: "Contactez l'atelier Artisanat Aschi pour une création sur-mesure, un devis ou une visite. Nous sommes à Sfax, Tunisie.",
}

export default function ContactPage() {
  return (
    <main className="overflow-x-hidden">
      <Navbar />
      <div className="pt-20">
        <Contact />
      </div>
      <Footer />
    </main>
  )
}
