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
            {/* La clausula estaba vacia: decia "Por integrar — sujeto a
                revision legal", justo bajo un parrafo que afirma que quien
                navega acepta estos terminos. */}
            <p>
              La información de este sitio se ofrece con fines informativos. La Fundación Managers
              procura que los datos del torneo —tabla, calendario, llave y estadísticas— reflejen lo
              ocurrido en cancha, pero no responde por errores de digitación ni por decisiones
              tomadas únicamente con base en lo publicado aquí: la fuente oficial de un resultado es
              la planilla del partido.
            </p>
            <p>
              Tampoco respondemos por la disponibilidad de servicios de terceros enlazados desde el
              sitio, como la pasarela de pagos o las redes sociales, que se rigen por sus propias
              condiciones.
            </p>
            <h2 className="font-display text-xl font-bold text-carbon">Contacto</h2>
            <p>
              Cualquier consulta sobre estos términos: administracion@fundacionmanagers.com.
            </p>
            <div className="mt-10 rounded-md border border-dashed border-neutral-300 p-4 text-xs uppercase tracking-widest text-neutral-500">
              Última actualización: 12 de septiembre de 2026
            </div>
          </article>
        </div>
      </section>
    </>
  );
}
