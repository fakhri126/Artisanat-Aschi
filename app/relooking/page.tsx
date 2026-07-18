import { Navbar } from "@/components/site/navbar"
import { Footer } from "@/components/site/footer"

export default function RelookingPage() {
  return (
    <main className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 flex flex-col items-center justify-center text-center px-6 pt-32 pb-20">
        <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl text-walnut mb-6">Service Rebooking & Relooking</h1>
        <p className="text-walnut-foreground/80 max-w-2xl text-lg mb-8">
          Découvrez notre nouveau service de relooking de meubles. Nous redonnons vie à vos anciennes pièces grâce à notre expertise artisanale.
        </p>
        <div className="w-full max-w-4xl aspect-[16/9] relative rounded-2xl overflow-hidden shadow-xl mb-12">
          {/* Using a standard img tag with an absolute path just for the stub, next/image would be better but requires size */}
          <img src="/relooking_service.jpg" alt="Relooking service" className="w-full h-full object-cover" />
        </div>
        <p className="text-walnut-foreground/80 max-w-2xl text-lg">
          Cette page est en cours de construction. Bientôt, vous y trouverez tous les détails sur notre processus de restauration et de relooking sur-mesure.
        </p>
      </div>
      <Footer />
    </main>
  )
}
