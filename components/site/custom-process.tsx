import { Lightbulb, Phone, PenTool, FileText, Hammer } from 'lucide-react'
import { Reveal } from './reveal'

const STEPS = [
  {
    icon: Lightbulb,
    title: "Choisir l'inspiration",
    text: 'Parcourez notre catalogue ou apportez votre propre vision.',
  },
  {
    icon: Phone,
    title: 'Contacter Aschi',
    text: 'Échangez avec nos artisans pour donner vie à votre idée.',
  },
  {
    icon: PenTool,
    title: 'Discuter les modifications',
    text: 'Dimensions, essences, motifs, finitions : tout est ajustable.',
  },
  {
    icon: FileText,
    title: 'Recevoir le devis',
    text: 'Une proposition claire et détaillée, sans engagement.',
  },
  {
    icon: Hammer,
    title: 'Création de la pièce',
    text: 'Nos mains façonnent votre pièce unique, étape par étape.',
  },
]

export function CustomProcess() {
  return (
    <section id="sur-mesure" className="bg-background py-24 md:py-36">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <Reveal className="mx-auto max-w-3xl text-center">
          <p className="text-xs uppercase tracking-luxury text-bronze">
            Création sur-mesure
          </p>
          <h2 className="mt-5 text-balance font-heading text-4xl font-light leading-tight text-foreground sm:text-5xl md:text-6xl">
            Votre vision, sculptée à la main
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-pretty text-base font-light leading-relaxed text-muted-foreground">
            Un accompagnement d&apos;exception, du premier croquis à la livraison.
            Cinq étapes pour transformer une inspiration en héritage.
          </p>
        </Reveal>

        <div className="mt-20 grid gap-y-12 sm:grid-cols-2 lg:grid-cols-5 lg:gap-x-4">
          {STEPS.map((step, i) => {
            const Icon = step.icon
            return (
              <Reveal key={step.title} delay={i * 120} className="relative">
                <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
                  <div className="flex items-center gap-4">
                    <span className="flex size-14 items-center justify-center rounded-full border border-accent/40 text-accent">
                      <Icon className="size-6" />
                    </span>
                    <span className="font-heading text-5xl font-light text-muted-foreground/30">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                  </div>
                  <h3 className="mt-6 font-heading text-2xl font-medium text-foreground">
                    {step.title}
                  </h3>
                  <p className="mt-3 max-w-[15rem] text-sm font-light leading-relaxed text-muted-foreground lg:max-w-none">
                    {step.text}
                  </p>
                </div>
              </Reveal>
            )
          })}
        </div>

        <Reveal delay={200} className="mt-16 text-center">
          <a
            href="#contact"
            className="inline-block rounded-full bg-walnut px-10 py-4 text-xs font-medium uppercase tracking-[0.18em] text-walnut-foreground transition-colors hover:bg-bronze"
          >
            Démarrer mon projet sur-mesure
          </a>
        </Reveal>
      </div>
    </section>
  )
}
