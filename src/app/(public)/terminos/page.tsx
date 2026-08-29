import type { Metadata } from 'next';
import { SimplePageHero } from '@/components/shared/SimplePageHero';

export const metadata: Metadata = {
  title: 'Términos de uso',
  description: 'Términos y condiciones del sitio de la Fundación Managers.',
};

export default function TerminosPage() {
  return (
    <>
      <SimplePageHero
        eyebrow="Legal"
        title="Términos de uso"
        description="Reglas y condiciones de uso del sitio web fundacionmanagers.org."
      />
      <section className="canvas-cream grain relative overflow-hidden">
        <div className="relative mx-auto max-w-3xl px-6 py-24 text-neutral-700 lg:px-8">
          <article className="space-y-6 text-sm leading-relaxed">
            <p>
              Al navegar este sitio aceptas los términos descritos a continuación. El contenido
              ofrecido tiene fines informativos y puede ser actualizado sin previo aviso.
            </p>
            <h2 className="font-display text-xl font-bold text-carbon">Propiedad intelectual</h2>
            <p>
              La marca Fundación Managers, su logo (moneda dorada) y los contenidos del sitio son
              propiedad de la fundación.
            </p>
            <h2 className="font-display text-xl font-bold text-carbon">
              Limitación de responsabilidad
            </h2>
            <p>Por integrar — sujeto a revisión legal.</p>
            <div className="mt-10 rounded-md border border-dashed border-neutral-300 p-4 text-xs uppercase tracking-widest text-neutral-500">
              Versión preliminar — texto definitivo por revisar con asesoría legal.
            </div>
          </article>
        </div>
      </section>
    </>
  );
}
