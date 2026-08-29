import type { Metadata } from 'next';
import { MatchCard } from '@/components/torneo/MatchCard';
import { FixtureLiga } from '@/components/torneo/FixtureLiga';
import { EliminatoriaLiga } from '@/components/torneo/EliminatoriaLiga';
import { TorneoShell } from '@/components/torneo/TorneoShell';
import { CUARTOS, SEMIS, TERCER_PUESTO, FINAL } from '@/lib/torneo-data';
import { EDICION_ACTUAL } from '@/lib/liga';
import { cargarLigaConAviso } from '@/lib/liga-supabase';
import { EDICION_ANTERIOR, EDICION_EN_CURSO, ordinalFemenino, pillEdicion } from '@/lib/torneo';

export const metadata: Metadata = {
  title: 'Calendario · Torneo Managers',
  description: `Fixture y resultados de la fase de grupos de la ${ordinalFemenino(EDICION_EN_CURSO.numero)} edición del Torneo Managers F7.`,
};

/** Llave de la 3ª edición, que queda como historial bajo el fixture actual. */
const HISTORIAL = [
  { titulo: 'Cuartos de final', sub: 'Ronda 1', partidos: CUARTOS },
  { titulo: 'Semifinales', sub: 'Ronda 2', partidos: SEMIS },
  { titulo: 'Tercer puesto', sub: 'El bronce', partidos: [TERCER_PUESTO] },
  { titulo: 'Gran Final', sub: 'El título', partidos: [FINAL] },
] as const;

export default async function CalendarioPage() {
  const datos = await cargarLigaConAviso();

  return (
    <TorneoShell
      eyebrow={pillEdicion(EDICION_EN_CURSO)}
      title="Calendario"
      active="/torneo/calendario/"
    >
      <FixtureLiga datos={datos} />

      {/* Fase final de la 4a edicion: aparece sola en cuanto existan cruces. */}
      {datos.eliminatoria.length > 0 ? (
        <div className="mt-20">
          <p className="font-bufon text-sm font-bold uppercase tracking-[0.25em] text-naranja">
            Fase final
          </p>
          <h2 className="mt-1 font-sport text-5xl uppercase leading-none text-neutral-50 md:text-6xl">
            La llave
          </h2>
          <div className="energy-bar mt-5 h-1 w-full rounded-full opacity-70" />
          <div className="mt-8">
            <EliminatoriaLiga partidos={datos.eliminatoria} />
          </div>
        </div>
      ) : null}

      {/* ===== Historial: la llave de la edición anterior ===== */}
      <div className="mt-24 border-t border-white/10 pt-16">
        <p className="font-bufon text-sm font-bold uppercase tracking-[0.25em] text-neutral-500">
          Historial
        </p>
        <h2 className="mt-1 font-sport text-4xl uppercase leading-none text-neutral-300 md:text-5xl">
          {pillEdicion(EDICION_ANTERIOR)}
        </h2>
        <p className="mt-3 max-w-2xl text-sm text-neutral-500">
          La edición {EDICION_ACTUAL - 1} se jugó por eliminación directa. Se conserva aquí el
          recorrido completo hasta la final.
        </p>

        <div className="mt-14 space-y-16 opacity-90">
          {HISTORIAL.map((b) => (
            <div key={b.titulo}>
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="font-bufon text-xs font-bold uppercase tracking-[0.25em] text-naranja">
                    {b.sub}
                  </p>
                  <h3 className="mt-1 font-sport text-4xl uppercase leading-none text-neutral-50 md:text-5xl">
                    {b.titulo}
                  </h3>
                </div>
                <span className="hidden font-sport text-2xl text-white/15 sm:block">
                  {String(b.partidos.length).padStart(2, '0')}
                </span>
              </div>
              <div className="energy-bar mt-4 h-1 w-full rounded-full opacity-50" />
              <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {b.partidos.map((p) => (
                  <MatchCard key={p.id} p={p} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </TorneoShell>
  );
}
