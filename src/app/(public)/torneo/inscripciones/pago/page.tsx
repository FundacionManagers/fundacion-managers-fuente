import type { Metadata } from 'next';
import { TorneoBackdrop } from '@/components/torneo/TorneoBackdrop';
import { TorneoNav } from '@/components/torneo/TorneoNav';
import { PagoBold } from '@/components/torneo/PagoBold';

export const metadata: Metadata = {
  title: 'Pago de inscripción · Torneo Managers',
  description: 'Paso 4: paga la inscripción de tu equipo al Torneo Managers de forma segura.',
  robots: { index: false, follow: false },
};

export default function PagoPage() {
  return (
    <div className="tournament-section relative">
      <TorneoBackdrop seed={88} query="stadium,lights,night" />

      <div className="relative z-10">
        <section className="relative overflow-hidden grain">
          <div className="relative mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-20">
            <span className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amarillo to-naranja px-4 py-1.5 font-bufon text-xs font-bold uppercase tracking-[0.18em] text-carbon">
              Inscripción · Paso 4 de 5
            </span>
            <h1 className="mt-6 font-sport text-[12vw] uppercase leading-[0.85] text-neutral-50 drop-shadow-[0_6px_24px_rgba(0,0,0,0.7)] lg:text-[80px]">
              Asegura
              <br />
              tu cupo
            </h1>
            <div className="mt-5 h-1.5 w-32 rounded-full energy-bar" />
            <p className="mt-6 max-w-2xl text-lg text-neutral-300">
              Último impulso: paga la inscripción de tu equipo y déjalo listo para competir.
            </p>
          </div>
        </section>

        <TorneoNav active="/torneo/inscripciones/" />

        <section className="relative grain">
          <div className="relative mx-auto max-w-4xl px-6 py-16 lg:px-8 lg:py-20">
            <PagoBold />
          </div>
        </section>
      </div>
    </div>
  );
}
