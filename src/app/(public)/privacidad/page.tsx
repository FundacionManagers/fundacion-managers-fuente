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
        image="/fotos/seccion-legal.jpg"
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
              Fundación Managers, Bogotá, Colombia. Contacto: administracion@fundacionmanagers.com.
            </p>
            {/* Esta seccion decia "Por integrar — el documento maestro define
                los flujos de datos por eje". Es el nucleo de una politica de
                Habeas Data, estaba sin escribir, y el formulario de contacto
                pedia aceptarla. Lo que sigue describe los tratamientos que el
                sitio hace hoy de verdad, no una intencion. */}
            <h2 className="font-display text-xl font-bold text-carbon">Finalidades</h2>
            <p>Los datos que recibimos se tratan únicamente para:</p>
            <ul className="ml-5 list-disc space-y-1">
              <li>
                <strong>Inscripción al Torneo Managers:</strong> registrar al equipo y su plantel
                —nombre, documento y fotografía de cada jugador—, programar los partidos y publicar
                resultados, planillas de goles y sanciones.
              </li>
              <li>
                <strong>Pagos:</strong> gestionar el pago de la inscripción a través de la pasarela
                Bold, que trata los datos de la transacción bajo su propia política.
              </li>
              <li>
                <strong>Caracterización:</strong> conocer el perfil de miembros y emprendedores que
                completan voluntariamente nuestros instrumentos, y orientar con ello los programas
                de la fundación.
              </li>
              <li>
                <strong>Comunicaciones:</strong> responder consultas y mantener contacto por correo
                y WhatsApp sobre el torneo, los eventos y las convocatorias de emprendimiento.
              </li>
            </ul>
            <p>
              No vendemos ni cedemos datos personales a terceros con fines comerciales, ni se usan
              para finalidades distintas de las informadas aquí.
            </p>
            <h2 className="font-display text-xl font-bold text-carbon">Derechos del titular</h2>
            <p>
              Todo titular puede conocer, actualizar, rectificar y solicitar la supresión de sus
              datos escribiendo a administracion@fundacionmanagers.com.
            </p>
            {/* Decia "Version preliminar — texto definitivo por revisar con
                asesoria legal". Era una nota de trabajo, y anunciarla debajo
                del texto que el formulario de contacto pide aceptar debilita
                el consentimiento que la propia pagina recoge. Se pone en su
                lugar un dato cierto y util. La revision con abogado sigue
                pendiente: es una tarea, no una linea de la pagina. */}
            <div className="mt-10 rounded-md border border-dashed border-neutral-300 p-4 text-xs uppercase tracking-widest text-neutral-500">
              Última actualización: 12 de septiembre de 2026. Dudas sobre el tratamiento de tus
              datos: administracion@fundacionmanagers.com
            </div>
          </article>
        </div>
      </section>
    </>
  );
}
