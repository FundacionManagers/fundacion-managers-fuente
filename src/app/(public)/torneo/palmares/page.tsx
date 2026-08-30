import type { Metadata } from 'next';
import { CampeonReveal } from '@/components/torneo/CampeonReveal';
import { DetalleAncla } from '@/components/torneo/DetalleAncla';
import { MatchCard } from '@/components/torneo/MatchCard';
import { PalmaresTorneo } from '@/components/torneo/PalmaresTorneo';
import { TorneoShell } from '@/components/torneo/TorneoShell';
import {
  CAMPEON_VIGENTE,
  EDICIONES_DISPUTADAS,
  EDICION_ANTERIOR,
  ordinalFemenino,
  pillEdicion,
} from '@/lib/torneo';
import { CUARTOS, FINAL, SEMIS, TERCER_PUESTO, ganadorDe, getEquipo } from '@/lib/torneo-data';

export const metadata: Metadata = {
  title: 'Palmarés · Torneo Managers',
  description:
    'Todas las ediciones del Torneo Managers F7, con su campeón, la llave de la última edición jugada y los títulos acumulados por club.',
};

// Años que abarca el palmarés, sacados de los periodos: '2025-1' → 2025.
const ANIOS = EDICIONES_DISPUTADAS.map((e) => e.periodo.split('-')[0]);
const RANGO = ANIOS[0] === ANIOS[ANIOS.length - 1] ? ANIOS[0] : `${ANIOS[0]}-${ANIOS.at(-1)}`;

/**
 * La llave de la última edición jugada.
 *
 * Vivía dentro del Calendario, plegada bajo el fixture de la edición EN
 * CURSO, que es donde más confundía: quien entra al Calendario viene a ver
 * cuándo juega su equipo, no a mirar atrás. Y los dos enlaces que prometían
 * "ver la llave" desde aquí acababan o en la llave de otra edición o en un
 * acordeón cerrado de otra página. Su sitio es el palmarés: aquí es donde
 * alguien viene a buscar historia.
 */
const LLAVE_ANTERIOR = [
  { titulo: 'Cuartos de final', sub: 'Ronda 1', partidos: CUARTOS },
  { titulo: 'Semifinales', sub: 'Ronda 2', partidos: SEMIS },
  { titulo: 'Tercer puesto', sub: 'El bronce', partidos: [TERCER_PUESTO] },
  { titulo: 'Gran Final', sub: 'El título', partidos: [FINAL] },
] as const;

export default function PalmaresPage() {
  const campeon = getEquipo(ganadorDe(FINAL) ?? '');
  const loc = FINAL.local ? getEquipo(FINAL.local) : undefined;
  const vis = FINAL.visitante ? getEquipo(FINAL.visitante) : undefined;

  return (
    <TorneoShell
      eyebrow={`${EDICIONES_DISPUTADAS.length} ediciones · ${RANGO}`}
      title="Palmarés"
      active="/torneo/palmares/"
    >
      {/* La celebración del último campeón encabeza esta página, que es la
          de los títulos. Vivía en el hero del Resumen, donde lo primero que
          se leía era "Torneo finalizado" mientras la cuarta edición seguía
          en juego. */}
      <div className="mb-16">
        <CampeonReveal
          slug={campeon?.slug ?? FINAL.visitante ?? 'the-originals'}
          nombre={campeon?.nombre ?? CAMPEON_VIGENTE.equipo}
          scoreText={`${vis?.corto ?? 'ORI'} ${FINAL.golesVisitante}–${FINAL.golesLocal} ${loc?.corto ?? 'PIB'}`}
          // El ordinal se escribía con símbolo de grado —"Edición 3°"— y la
          // lista de abajo, en la misma página, usaba "3ª". Uno solo, y en
          // femenino, que es lo que pide "edición".
          edicion={pillEdicion(EDICION_ANTERIOR)}
          href="#llave-anterior"
        />
      </div>

      <PalmaresTorneo />

      {/* ===== LA LLAVE DE LA ÚLTIMA EDICIÓN JUGADA =====
          Plegada: quien viene al palmarés busca primero quién ganó qué, y el
          recorrido completo solo le interesa a quien lo abra. Es un <details>
          nativo, así que el buscador lo indexa igual y funciona con teclado. */}
      <DetalleAncla
        id="llave-anterior"
        className="group mt-16 scroll-mt-32 border-t border-white/10 pt-8"
        resumen={`La llave completa de la ${ordinalFemenino(EDICION_ANTERIOR.numero)} edición`}
      >
        <div className="mt-8">
          <p className="font-bufon text-xs font-bold uppercase tracking-[0.25em] text-neutral-500">
            {pillEdicion(EDICION_ANTERIOR)}
          </p>
          <p className="mt-2 max-w-2xl text-xs leading-relaxed text-neutral-500">
            Se jugó por eliminación directa, desde cuartos hasta la final. Es la última edición
            cerrada del torneo y el recorrido que dio el título a {CAMPEON_VIGENTE.equipo}.
          </p>

          <div className="mt-10 space-y-12">
            {LLAVE_ANTERIOR.map((b) => (
              <div key={b.titulo}>
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="font-bufon text-[10px] font-bold uppercase tracking-[0.25em] text-neutral-600">
                      {b.sub}
                    </p>
                    <h3 className="mt-1 font-sport text-2xl uppercase leading-none text-neutral-300">
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
      </DetalleAncla>
    </TorneoShell>
  );
}
