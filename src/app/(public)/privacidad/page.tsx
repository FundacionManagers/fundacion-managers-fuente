import type { Metadata } from 'next';
import { SimplePageHero } from '@/components/shared/SimplePageHero';

export const metadata: Metadata = {
  title: 'Política de privacidad',
  description: 'Política de tratamiento de datos personales de la Fundación Managers.',
};

export default function PrivacidadPage() {
  return (
    <>
      <SimplePageHero
        eyebrow="Legal"
        title="Política de privacidad"
        description="Tratamiento de datos personales conforme a la Ley 1581 de 2012 (Habeas Data, Colombia)."
      />
      <section className="canvas-cream grain relative overflow-hidden">
        <div className="relative mx-auto max-w-3xl px-6 py-24 text-neutral-700 lg:px-8">
          <article className="space-y-6 text-sm leading-relaxed">
            <p>
              La Fundación Managers recolecta y trata datos personales únicamente para los fines
              informados al titular en el momento de la recolección, y siempre con consentimiento
              explícito.
            </p>
            <h2 className="font-display text-xl font-bold text-carbon">Responsable</h2>
            <p>
              Fundación Managers, Bogotá, Colombia. Contacto: williammojica@fundacionmanagers.com.
            </p>
            <h2 className="font-display text-xl font-bold text-carbon">Finalidades</h2>
            <p>
              Por integrar — el documento maestro define los flujos de datos por eje (inscripciones,
              pagos, eventos, comunicaciones por WhatsApp y correo).
            </p>
            <h2 className="font-display text-xl font-bold text-carbon">Derechos del titular</h2>
            <p>
              Todo titular puede conocer, actualizar, rectificar y solicitar la supresión de sus
              datos escribiendo a williammojica@fundacionmanagers.com.
            </p>
            <div className="mt-10 rounded-md border border-dashed border-neutral-300 p-4 text-xs uppercase tracking-widest text-neutral-500">
              Versión preliminar — texto definitivo por revisar con asesoría legal.
            </div>
          </article>
        </div>
      </section>
    </>
  );
}
