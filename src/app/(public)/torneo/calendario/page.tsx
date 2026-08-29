import type { Metadata } from 'next';
import { ChevronRight } from 'lucide-react';
import { MatchCard } from '@/components/torneo/MatchCard';
import { FixtureLiga } from '@/components/torneo/FixtureLiga';
import { EliminatoriaLiga } from '@/components/torneo/EliminatoriaLiga';
import { TorneoShell } from '@/components/torneo/TorneoShell';
import { CUARTOS, SEMIS, TERCER_PUESTO, FINAL } from '@/lib/torneo-data';
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

      {/* ===== Historial de la edición anterior, plegado =====

          Ocupaba media página con titulares del mismo tamaño que los de la
          edición en curso, y competía con lo único que la gente viene a ver
          aquí: el calendario de ahora. Va plegado, en letra pequeña y en gris,
          para que solo lo abra quien de verdad quiera mirar atrás.

          Es un <details> nativo: no necesita JavaScript, funciona con teclado
          y el buscador igual lo indexa. */}
      <details className="group mt-12 border-t border-white/5 pt-5">
        <summary className="flex cursor-pointer list-none items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-neutral-600 transition-colors hover:text-neutral-400">
          <ChevronRight
            size={12}
            aria-hidden
            className="shrink-0 transition-transform duration-200 group-open:rotate-90"
          />
          Historial · ¿quieres ver qué pasó en la {ordinalFemenino(EDICION_ANTERIOR.numero)}{' '}
          edición?
        </summary>

        <div className="mt-8">
          <p className="font-bufon text-xs font-bold uppercase tracking-[0.25em] text-neutral-600">
            Historial · {pillEdicion(EDICION_ANTERIOR)}
          </p>
          <p className="mt-2 max-w-2xl text-xs text-neutral-500">
            Esta edición ya terminó. Se jugó por eliminación directa y se conserva aquí el recorrido
            completo hasta la final. No forma parte del torneo en curso.
          </p>

          <div className="mt-10 space-y-12 opacity-80">
            {HISTORIAL.map((b) => (
              <div key={b.titulo}>
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="font-bufon text-[10px] font-bold uppercase tracking-[0.25em] text-neutral-600">
                      {b.sub}
                    </p>
                    <h3 className="mt-1 font-sport text-2xl uppercase leading-none text-neutral-400">
                      {b.titulo}
                    </h3>
                  </div>
                  <span className="hidden font-sport text-xl text-white/10 sm:block">
                    {String(b.partidos.length).padStart(2, '0')}
                  </span>
                </div>
                <div className="mt-3 h-px w-full bg-white/10" />
                <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {b.partidos.map((p) => (
                    <MatchCard key={p.id} p={p} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </details>
    </TorneoShell>
  );
}
