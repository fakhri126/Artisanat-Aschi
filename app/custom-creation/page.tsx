import { Catalog } from '@/components/site/catalog'

export const metadata = {
  title: 'Créations sur Mesure - Artisanat Aschi',
  description: 'Catalogue d\'inspiration et nos créations passées.',
}

export default function CustomCreationPage() {
  return (
    <main className="min-h-screen bg-walnut pt-32 pb-24">
      <Catalog />
    </main>
  )
}
