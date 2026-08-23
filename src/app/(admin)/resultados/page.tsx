import type { Metadata } from 'next';
import { GoldCoin } from '@/components/shared/GoldCoin';
import { NavAdmin } from '@/components/shared/NavAdmin';
import { TorneoBackdrop } from '@/components/torneo/TorneoBackdrop';
import { PanelTorneoCliente } from '@/components/torneo/PanelTorneoCliente';
import { EDICION_ACTUAL, PERIODO_ACTUAL } from '@/lib/liga';

export const metadata: Metadata = {
  title: 'Panel del torneo · Fundación Managers',
  description: 'Carga de marcadores, tarjetas y goleadores del Torneo Managers.',
  robots: { index: false, follow: false },
};

export default function ResultadosPage() {
  return (
    <div className="tournament-section relative min-h-screen">
      {/* Mismo estadio nocturno que las paginas publicas, para que el panel
          no parezca una herramienta ajena al torneo. */}
      <TorneoBackdrop />

      <div className="relative z-10 grain">
        <div className="mx-auto max-w-5xl px-6 py-12 lg:px-8 lg:py-16">
          <NavAdmin actual="/resultados/" />

          <div className="mt-10 flex flex-wrap items-center justify-between gap-8">
            <div className="animate-fade-up">
              <span className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amarillo to-naranja px-4 py-1.5 font-bufon text-xs font-bold uppercase tracking-[0.15em] text-carbon">
                <span className="h-2 w-2 rounded-full bg-carbon pulse-live" />
                Edición {EDICION_ACTUAL} · {PERIODO_ACTUAL}
              </span>
              <h1 className="mt-4 font-sport text-6xl uppercase leading-none text-neutral-50 md:text-7xl">
                Sala de
                <br />
                <span className="text-energy">resultados</span>
              </h1>
              <p className="mt-5 max-w-lg text-sm text-neutral-300">
                Marcadores, tarjetas y goleadores de cada fecha. La tabla de posiciones no se
                edita aquí: se calcula sola a partir de los marcadores, y por eso nunca puede
                contradecir al calendario.
              </p>
            </div>

            <GoldCoin size={190} animate className="hidden shrink-0 lg:block" />
          </div>

          <div className="mt-10 h-1 w-full rounded-full energy-bar opacity-80" />

          <div className="mt-12">
            <PanelTorneoCliente />
          </div>
        </div>
      </div>
    </div>
  );
}
