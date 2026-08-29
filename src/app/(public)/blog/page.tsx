import type { Metadata } from 'next';
import { SimplePageHero } from '@/components/shared/SimplePageHero';

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Ideas, historias y aprendizajes de la Fundación Managers.',
};

export default function BlogPage() {
  return (
    <>
      <SimplePageHero
        eyebrow="Blog"
        title="Ideas y aprendizajes"
        description="Aquí compartiremos historias, análisis y miradas desde los seis ejes de la fundación."
      />
      <section className="canvas-cream grain relative overflow-hidden">
        <div className="relative mx-auto max-w-3xl px-6 py-24 lg:px-8">
          <div className="rounded-3xl border border-carbon/10 bg-white p-12 text-center">
            <p className="font-serif text-3xl font-bold text-carbon">Próximamente</p>
            <p className="mt-4 text-neutral-600">
              El blog se activa en la Fase 2 del roadmap. Volverá con artículos firmados, categorías
              por pilar y suscripción por correo.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
