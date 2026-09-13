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
        description="Aquí compartiremos historias, análisis y miradas desde los ejes de la fundación."
        image="/fotos/seccion-blog.jpg"
      />
      <section className="canvas-cream grain relative overflow-hidden">
        <div className="relative mx-auto max-w-3xl px-6 py-24 lg:px-8">
          <div className="rounded-3xl border border-carbon/10 bg-white p-12 text-center">
            <p className="font-serif text-3xl font-bold text-carbon">Próximamente</p>
            {/* Decia "se activa en la Fase 2 del roadmap": numeracion interna
                que a quien visita no le dice nada y deja el sitio con aire de
                obra sin terminar. Lo que si le sirve es qué va a encontrar. */}
            <p className="mt-4 text-neutral-600">
              Estamos preparando los primeros artículos: análisis firmados, organizados por pilar y
              con suscripción por correo. Mientras tanto, lo que pasa en la fundación se sigue en{' '}
              <a
                href="https://instagram.com/torneo_managers"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-carbon underline underline-offset-4"
              >
                @torneo_managers
              </a>
              .
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
