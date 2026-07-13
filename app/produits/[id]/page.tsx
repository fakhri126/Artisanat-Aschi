'use client'

import { useEffect, useState, use } from 'react'
import Link from 'next/link';
import { publicApi, Product } from '@/lib/api'
import { cn } from '@/lib/utils'
import { Navbar } from '@/components/site/navbar'
import { Footer } from '@/components/site/footer'
import { ArrowLeft, Check, Ruler, Hammer, Sparkles, MessageCircle, AlertCircle, Calendar, X, ShoppingCart } from 'lucide-react'
import { useCart } from '@/lib/cart-context'

interface PageProps {
  params: Promise<{ id: string }>
}

export default function ProductDetailPage({ params }: PageProps) {
  const resolvedParams = use(params)
  const productId = parseInt(resolvedParams.id)
  
  const { addToCart } = useCart()
  
  const [product, setProduct] = useState<Product | null>(null)
  const [similarProducts, setSimilarProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Gallery active image
  const [activeImage, setActiveImage] = useState('')

  // Quote request modal states
  const [modalOpen, setModalOpen] = useState(false)
  const [isPersonalizing, setIsPersonalizing] = useState(false)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [personalizationDetails, setPersonalizationDetails] = useState('')
  const [message, setMessage] = useState('')
  const [submittingQuote, setSubmittingQuote] = useState(false)
  const [quoteSent, setQuoteSent] = useState(false)
  const [quoteError, setQuoteError] = useState<string | null>(null)

  useEffect(() => {
    async function loadProductData() {
      try {
        setLoading(true)
        const data = await publicApi.getProductById(productId)
        setProduct(data)
        if (data.images && data.images.length > 0) {
          setActiveImage(data.images[0].imageUrl)
        }

        // Fetch similar products
        const allInCategory = await publicApi.getProducts({ category: data.category.name })
        setSimilarProducts(allInCategory.filter(p => p.id !== productId).slice(0, 3))
      } catch (err: any) {
        setError(err.message || 'Impossible de charger ce produit.')
      } finally {
        setLoading(false)
      }
    }

    if (productId) {
      loadProductData()
    }
  }, [productId])

  const openQuoteModal = (personalize = false) => {
    setIsPersonalizing(personalize)
    setPersonalizationDetails(personalize ? "Exemple: Je souhaiterais modifier la largeur à 160cm et utiliser une patine bleu cérusé." : "")
    setMessage(personalize 
      ? `Bonjour, je souhaiterais obtenir une proposition de personnalisation pour le modèle « ${product?.name} ».`
      : `Bonjour, je souhaiterais obtenir un devis pour le produit « ${product?.name} ».`
    )
    setQuoteSent(false)
    setQuoteError(null)
    setModalOpen(true)
  }

  const handleQuoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmittingQuote(true)
    setQuoteError(null)

    try {
      await publicApi.submitQuoteRequest({
        fullName,
        email,
        phoneNumber: phone,
        productId: product?.id,
        personalizationDetails: isPersonalizing ? personalizationDetails : undefined,
        message,
      })
      setQuoteSent(true)
    } catch (err: any) {
      setQuoteError(err.message || "Une erreur s'est produite lors de l'envoi de votre demande.")
    } finally {
      setSubmittingQuote(false)
    }
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex h-screen items-center justify-center bg-walnut text-ivory">
          <div className="text-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-gold border-t-transparent mx-auto"></div>
            <p className="mt-4 text-xs uppercase tracking-[0.2em] text-gold font-light">Chargement de la création...</p>
          </div>
        </div>
        <Footer />
      </>
    )
  }

  if (error || !product) {
    return (
      <>
        <Navbar />
        <div className="min-h-[70vh] bg-secondary flex flex-col items-center justify-center p-6 text-center">
          <AlertCircle className="size-16 text-red-500 mb-4" />
          <h1 className="font-heading text-3xl font-light text-foreground">Création introuvable</h1>
          <p className="mt-3 text-muted-foreground max-w-md">{error || "Le produit recherché n'existe pas ou a été retiré."}</p>
          <Link href="/#catalogue" className="mt-8 rounded-full bg-walnut text-ivory hover:bg-bronze px-6 py-3 text-xs font-semibold uppercase tracking-wider transition-all">
            Retourner au catalogue
          </Link>
        </div>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Navbar />
      
      <main className="bg-secondary py-20 md:py-32">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          {/* Back button */}
          <Link 
            href="/#catalogue" 
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground hover:text-gold transition-colors mb-10"
          >
            <ArrowLeft className="size-4" /> Retourner au catalogue
          </Link>

          {/* Product main detail grid */}
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            {/* Gallery Section */}
            <div className="space-y-4">
              <div className="relative aspect-[4/5] bg-walnut/10 border border-border overflow-hidden rounded-lg">
                <img 
                  src={activeImage || '/placeholder.png'} 
                  alt={product.name} 
                  className="size-full object-cover transition-all duration-500" 
                />
                
                {product.type === 'PIECE_UNIQUE' && (
                  <span className="absolute left-6 top-6 rounded-full bg-gold px-4 py-1.5 text-xs font-medium uppercase tracking-[0.12em] text-walnut">
                    Pièce unique
                  </span>
                )}
              </div>
              
              {/* Secondary thumbnails */}
              {product.images && product.images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {product.images.map((img) => (
                    <button
                      key={img.id}
                      onClick={() => setActiveImage(img.imageUrl)}
                      className={`relative size-20 border rounded-lg overflow-hidden shrink-0 transition-all ${
                        activeImage === img.imageUrl ? 'border-gold ring-1 ring-gold' : 'border-border opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img.imageUrl} alt="" className="size-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Info Section */}
            <div className="flex flex-col justify-center text-left">
              <span className="text-xs uppercase tracking-[0.2em] text-gold font-semibold">
                {product.category?.name}
              </span>
              <h1 className="mt-3 font-heading text-4xl font-light text-foreground sm:text-5xl leading-tight">
                {product.name}
              </h1>
              
              <div className="mt-6 flex items-center gap-4 border-y border-border py-4">
                <p className="font-mono text-xl text-gold font-medium">
                  {product.type !== 'CATALOGUE' 
                    ? (product.price ? `${product.price.toLocaleString('fr-FR')} DT` : 'Prix sur demande')
                    : 'Prix sur devis'}
                </p>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
                  product.availability === 'Disponible' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/10' :
                  product.availability === 'Sur commande' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/10' :
                  'bg-red-500/10 text-red-500 border border-red-500/10'
                }`}>
                  {product.availability}
                </span>
              </div>

              <p className="mt-6 font-light leading-relaxed text-muted-foreground whitespace-pre-line text-pretty">
                {product.description || "Aucune description détaillée n'a été spécifiée pour cette création."}
              </p>

              {/* Specs */}
              <div className="mt-8 space-y-4 border-b border-border pb-6">
                <div className="flex items-center gap-3 text-sm">
                  <Ruler className="size-5 text-gold shrink-0" />
                  <p className="font-light text-muted-foreground">
                    <strong className="font-semibold text-foreground">Dimensions :</strong> {product.dimensions || 'Sur-mesure'}
                  </p>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Hammer className="size-5 text-gold shrink-0" />
                  <p className="font-light text-muted-foreground">
                    <strong className="font-semibold text-foreground">Matériaux :</strong> {product.materials || 'Bois noble'}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 flex flex-col gap-4">
                {product.type !== 'CATALOGUE' && (
                  <button
                    onClick={() => addToCart(product)}
                    className="w-full flex items-center justify-center gap-2 rounded-full bg-gold hover:bg-gold/95 py-4 text-xs font-bold uppercase tracking-[0.16em] text-walnut transition-all shadow"
                  >
                    <ShoppingCart className="size-4" /> Acheter ce produit (Ajouter au panier)
                  </button>
                )}
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={() => openQuoteModal(false)}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 rounded-full py-4 text-xs font-semibold uppercase tracking-wider transition-all",
                      product.type === 'CATALOGUE'
                        ? "bg-gold hover:bg-gold/95 text-walnut shadow"
                        : "border border-border hover:border-gold text-foreground hover:text-gold"
                    )}
                  >
                    <MessageCircle className="size-4" /> Demander un devis
                  </button>
                  <button
                    onClick={() => openQuoteModal(true)}
                    className="flex-1 flex items-center justify-center gap-2 rounded-full border border-border hover:border-gold py-4 text-xs font-semibold uppercase tracking-wider text-foreground hover:text-gold transition-all"
                  >
                    <Sparkles className="size-4 text-gold" /> Personnaliser ce modèle
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Similar Products Section */}
          {similarProducts.length > 0 && (
            <section className="mt-24 border-t border-border pt-16 text-left">
              <h3 className="font-heading text-3xl font-light text-foreground mb-8">Créations similaires</h3>
              <div className="grid gap-6 sm:grid-cols-3">
                {similarProducts.map((p) => (
                  <Link key={p.id} href={`/produits/${p.id}`} className="group block space-y-3">
                    <div className="aspect-[4/5] overflow-hidden rounded-lg bg-zinc-900 border border-border">
                      <img 
                        src={p.images[0]?.imageUrl || '/placeholder.png'} 
                        alt={p.name} 
                        className="size-full object-cover transition-transform duration-700 group-hover:scale-105" 
                      />
                    </div>
                    <div className="flex justify-between items-baseline">
                      <h4 className="font-heading text-lg font-medium text-foreground group-hover:text-gold transition-colors">{p.name}</h4>
                      <span className="text-xs uppercase tracking-wider text-gold">{p.category?.name}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>

      {/* Quote Request Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="bg-background border border-border w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <header className="p-6 border-b border-border flex items-center justify-between">
              <div className="text-left">
                <h2 className="font-heading text-xl font-medium text-foreground">
                  {isPersonalizing ? 'Demande de Personnalisation' : 'Demander un Devis'}
                </h2>
                <p className="text-xs text-gold font-medium">Pour : {product.name}</p>
              </div>
              <button onClick={() => setModalOpen(false)} className="p-1.5 text-muted-foreground hover:text-foreground">
                <X className="size-5" />
              </button>
            </header>

            {quoteSent ? (
              <div className="p-8 text-center space-y-4">
                <div className="size-12 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center mx-auto">
                  <Check className="size-6" />
                </div>
                <h3 className="font-heading text-2xl text-foreground">Demande envoyée</h3>
                <p className="text-sm font-light text-muted-foreground max-w-sm mx-auto">
                  Votre demande de devis pour le modèle « {product.name} » a été transmise à notre atelier. Nous vous contacterons par email ou par téléphone très rapidement.
                </p>
                <button
                  onClick={() => setModalOpen(false)}
                  className="mt-6 rounded-full bg-walnut text-ivory hover:bg-bronze px-6 py-2.5 text-xs font-semibold uppercase tracking-wider transition-all"
                >
                  Fermer
                </button>
              </div>
            ) : (
              <form onSubmit={handleQuoteSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 text-left">
                {quoteError && (
                  <div className="p-4 rounded-xl bg-red-950/20 border border-red-500/25 text-red-400 text-sm flex gap-2">
                    <AlertCircle className="size-5 shrink-0" />
                    <p>{quoteError}</p>
                  </div>
                )}
                
                <div className="space-y-1.5">
                  <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Nom complet</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Sonia Ben Miled"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-secondary/50 border border-border focus:border-gold/50 rounded-lg p-3 text-sm text-foreground outline-none"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Email</label>
                    <input
                      type="email"
                      required
                      placeholder="Ex: sonia@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-secondary/50 border border-border focus:border-gold/50 rounded-lg p-3 text-sm text-foreground outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Téléphone</label>
                    <input
                      type="tel"
                      required
                      placeholder="Ex: +216 22 222 222"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-secondary/50 border border-border focus:border-gold/50 rounded-lg p-3 text-sm text-foreground outline-none"
                    />
                  </div>
                </div>

                {isPersonalizing && (
                  <div className="space-y-1.5">
                    <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Détails de la Personnalisation (Dimensions, patines, ornements...)</label>
                    <textarea
                      required
                      rows={3}
                      placeholder="Indiquez les dimensions souhaitées, l'essence de bois ou la patine de finition..."
                      value={personalizationDetails}
                      onChange={(e) => setPersonalizationDetails(e.target.value)}
                      className="w-full bg-secondary/50 border border-border focus:border-gold/50 rounded-lg p-3 text-sm text-foreground outline-none"
                    />
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Message</label>
                  <textarea
                    required
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full bg-secondary/50 border border-border focus:border-gold/50 rounded-lg p-3 text-sm text-foreground outline-none"
                  />
                </div>

                <footer className="pt-4 border-t border-border flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="rounded-full border border-border px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-foreground hover:bg-secondary/40 transition-all"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={submittingQuote}
                    className="rounded-full bg-gold hover:bg-gold/95 px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-walnut transition-all disabled:opacity-50"
                  >
                    {submittingQuote ? 'Envoi en cours...' : 'Envoyer la demande'}
                  </button>
                </footer>
              </form>
            )}
          </div>
        </div>
      )}

      <Footer />
    </>
  )
}
