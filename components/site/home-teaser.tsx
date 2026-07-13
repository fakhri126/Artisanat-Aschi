'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, Hammer, BookImage, Building2, Phone } from 'lucide-react'
import { FadeIn } from '@/components/motion/fade-in'

const SECTIONS = [
  {
    href: '/atelier',
    icon: Hammer,
    tag: 'Notre histoire',
    title: "L'Atelier",
    description: 'Soixante ans de passion, de transmission et de savoir-faire artisanal au cœur de la Tunisie.',
    image: '/story-founder.png',
    color: 'from-amber-900/60 to-walnut/90',
  },
  {
    href: '/creations',
    icon: BookImage,
    tag: 'Disponible',
    title: 'Créations',
    description: 'Pièces uniques et modèles reproductibles prêts à rejoindre votre demeure d\'exception.',
    image: '/creation-unique.png',
    color: 'from-stone-900/60 to-walnut/90',
  },
  {
    href: '/catalogue',
    icon: BookImage,
    tag: 'Inspiration',
    title: 'Catalogue',
    description: 'Parcourez nos réalisations passées et trouvez l\'inspiration pour votre projet sur-mesure.',
    image: '/cat-buffet.png',
    color: 'from-zinc-900/60 to-walnut/90',
  },
  {
    href: '/realisations',
    icon: Building2,
    tag: 'Projets',
    title: 'Réalisations',
    description: "Hôtels, villas, maisons d'hôtes et restaurants habillés par notre atelier depuis 1960.",
    image: '/project-hotel.png',
    color: 'from-neutral-900/60 to-walnut/90',
  },
]

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
}

const cardVariants = {
  hidden: { opacity: 0, y: 36, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] } },
}

export function HomeTeaser() {
  return (
    <section className="bg-background py-24 md:py-36">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        {/* Header */}
        <FadeIn className="text-center mb-16">
          <p className="text-xs uppercase tracking-luxury text-bronze">Explorez l&apos;atelier</p>
          <h2 className="mt-5 font-heading text-4xl font-light leading-tight sm:text-5xl md:text-6xl text-foreground text-balance max-w-3xl mx-auto">
            Tout ce que nous créons, pour vous
          </h2>
        </FadeIn>

        {/* Section cards */}
        <motion.div
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
        >
          {SECTIONS.map((s) => (
            <motion.div key={s.href} variants={cardVariants}>
              <Link
                href={s.href}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card h-full min-h-[340px] transition-shadow duration-300 hover:shadow-xl"
              >
                {/* Background image */}
                <div className="absolute inset-0">
                  <img
                    src={s.image}
                    alt={s.title}
                    className="size-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-110"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-t ${s.color}`} />
                </div>

                {/* Content */}
                <div className="relative z-10 flex h-full flex-col justify-end p-6 text-ivory">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-gold font-semibold mb-2">
                    {s.tag}
                  </p>
                  <h3 className="font-heading text-3xl font-medium">{s.title}</h3>
                  <p className="mt-2 text-sm font-light leading-relaxed text-ivory/70 line-clamp-3">
                    {s.description}
                  </p>
                  <div className="mt-5 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-gold transition-all group-hover:gap-3">
                    Découvrir <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA contact */}
        <FadeIn delay={0.3} className="mt-16 text-center">
          <p className="text-muted-foreground text-sm mb-5">Vous avez un projet en tête ?</p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-3 rounded-full bg-walnut px-8 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-walnut-foreground transition-all duration-300 hover:bg-walnut/80 hover:gap-4"
          >
            <Phone className="size-4" />
            Demander un devis gratuit
          </Link>
        </FadeIn>
      </div>
    </section>
  )
}
