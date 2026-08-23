import type { Metadata } from 'next';
import { PanelTorneoCliente } from '@/components/torneo/PanelTorneoCliente';
import { NavAdmin } from '@/components/shared/NavAdmin';

export const metadata: Metadata = {
  title: 'Panel del torneo · Fundación Managers',
  description: 'Carga de marcadores, tarjetas y goleadores del Torneo Managers.',
  robots: { index: false, follow: false },
};

export default function ResultadosPage() {
  return (
    <div className="relative min-h-screen bg-[#080b0f]">
      <div className="mx-auto max-w-5xl px-6 py-14 lg:px-8">
        <NavAdmin actual="/resultados/" />

        <p className="mt-8 font-bufon text-sm font-bold uppercase tracking-[0.25em] text-naranja">
          Administración
        </p>
        <h1 className="mt-1 font-sport text-5xl uppercase leading-none text-neutral-50 md:text-6xl">
          Panel del torneo
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-neutral-400">
          Cuarta edición. Carga aquí los marcadores de cada fecha, las tarjetas y los goleadores.
          La tabla de posiciones no se edita: se calcula sola a partir de los marcadores.
        </p>
        <div className="mt-10 h-1 w-full rounded-full energy-bar opacity-70" />

        <div className="mt-10">
          <PanelTorneoCliente />
        </div>
      </div>
    </div>
  );
}
