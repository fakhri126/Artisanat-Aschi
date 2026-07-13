import { Reveal } from './reveal'

const STEPS = [
  {
    num: '01',
    title: 'La sélection du bois',
    image: '/wood-selection.png',
    text: "Tout commence par le choix du noyer. L'artisan lit le grain, devine la veine, écoute la matière. Seules les pièces les plus nobles méritent d'être travaillées.",
  },
  {
    num: '02',
    title: 'La sculpture à la main',
    image: '/carving.png',
    text: "Le ciseau danse sur le bois. Arabesques, motifs floraux, géométries ancestrales : chaque entaille est guidée par une main sûre et des décennies de mémoire.",
  },
  {
    num: '03',
    title: 'La peinture & la dorure',
    image: '/painting.png',
    text: "La feuille d'or et les pigments chauds révèlent les reliefs. Un travail de patience qui donne à la pièce sa lumière et sa profondeur.",
  },
  {
    num: '04',
    title: 'La finition',
    image: '/finishing.png',
    text: "Huilé, poli, caressé : le bois prend vie une dernière fois. La pièce achevée porte en elle la chaleur de la main qui l'a façonnée.",
  },
]

export function Workshop() {
  return (
    <section id="atelier" className="bg-background py-24 md:py-36">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <Reveal className="mx-auto max-w-3xl text-center">
          <p className="text-xs uppercase tracking-luxury text-bronze">
            L&apos;expérience de l&apos;atelier
          </p>
          <h2 className="mt-5 text-balance font-heading text-4xl font-light leading-tight text-foreground sm:text-5xl md:text-6xl">
            Le geste, transmis et répété, devient un art
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-pretty text-base font-light leading-relaxed text-muted-foreground">
            Du tronc brut à la pièce achevée, chaque création traverse les mains
            de nos maîtres artisans. Un savoir-faire entièrement manuel, fidèle aux
            traditions tunisiennes.
          </p>
        </Reveal>

        <div className="mt-20 flex flex-col gap-20 md:gap-28">
          {STEPS.map((step, i) => (
            <div
              key={step.num}
              className="grid items-center gap-8 md:grid-cols-2 md:gap-16"
            >
              <Reveal
                slow
                className={i % 2 === 1 ? 'md:order-2' : ''}
              >
                <div className="relative overflow-hidden">
                  <img
                    src={step.image || '/placeholder.svg'}
                    alt={step.title}
                    className="aspect-[5/4] w-full object-cover transition-transform duration-[1.4s] hover:scale-105"
                  />
                  <span className="pointer-events-none absolute bottom-4 left-5 font-heading text-6xl font-light text-ivory/85 text-shadow-cinematic">
                    {step.num}
                  </span>
                </div>
              </Reveal>

              <Reveal delay={120} className={i % 2 === 1 ? 'md:order-1' : ''}>
                <span className="font-mono text-sm tracking-widest text-bronze">
                  Étape {step.num}
                </span>
                <h3 className="mt-3 font-heading text-3xl font-medium text-foreground sm:text-4xl md:text-5xl">
                  {step.title}
                </h3>
                <div className="mt-5 h-px w-16 bg-accent" />
                <p className="mt-6 max-w-md text-pretty text-base font-light leading-relaxed text-muted-foreground">
                  {step.text}
                </p>
              </Reveal>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
