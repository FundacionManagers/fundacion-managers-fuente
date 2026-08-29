import type { Metadata } from 'next';
import { Trophy } from 'lucide-react';
import { RankingGoleadores } from '@/components/torneo/RankingGoleadores';
import { TeamCrest } from '@/components/torneo/TeamCrest';
import { TorneoShell } from '@/components/torneo/TorneoShell';
import { EDICION_ACTUAL, jornadaActualDe, puntosJuegoLimpio, calcularPosiciones } from '@/lib/liga';
import { cargarLigaConAviso } from '@/lib/liga-supabase';
import { getEquipo } from '@/lib/torneo-data';

export const metadata: Metadata = {
  title: 'Estadísticas · Torneo Managers',
  description: 'Goleadores y juego limpio de la cuarta edición del Torneo Managers F7.',
};

/**
 * Estadísticas lee exactamente la misma fuente que el Resumen
 * (`cargarLigaConAviso`), no un dataset propio.
 *
 * Esta página llegó a publicar "Por confirmar" en el podio y un MVP sin
 * nombre mientras la portada ya mostraba los 45 goleadores con dorsal y
 * goles: eran dos fuentes distintas para el mismo dato. Ahora hay una sola,
 * así que no pueden volver a contradecirse.
 */
export default async function EstadisticasPage() {
  const datos = await cargarLigaConAviso();
  const lider = datos.goleadores[0] ?? null;
  const equipoLider = lider ? getEquipo(lider.equipo) : undefined;
  const jornada = jornadaActualDe(datos.partidos);

  // El más limpio de la tabla: menos tarjetas ponderadas (roja = 3 amarillas).
  const posiciones = calcularPosiciones(datos.partidos, datos.disciplina);
  const masLimpio = posiciones.reduce(
    (mejor, f) => (puntosJuegoLimpio(f) < puntosJuegoLimpio(mejor) ? f : mejor),
    posiciones[0]!,
  );
  const equipoLimpio = masLimpio ? getEquipo(masLimpio.equipo) : undefined;

  return (
    <TorneoShell
      eyebrow="Cuarta edición · 2026-2"
      title="Estadísticas"
      active="/torneo/estadisticas/"
    >
      {/* Líder de la bota de oro: el dato real, no un MVP sin nombre */}
      {lider ? (
        <div className="sweep relative overflow-hidden rounded-3xl border border-amarillo/40 bg-gradient-to-br from-[#1a1308] via-[#0d1218] to-[#0b0f14] p-10 lg:p-16">
          <span
            aria-hidden
            className="pointer-events-none absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-naranja/15 blur-3xl"
          />
          <div className="relative flex flex-col items-center gap-8 text-center sm:flex-row sm:gap-12 sm:text-left">
            <TeamCrest slug={lider.equipo} size={150} showStars />
            <div>
              <p className="flex items-center justify-center gap-2 font-bufon text-sm font-bold uppercase tracking-[0.25em] text-naranja sm:justify-start">
                <Trophy size={18} aria-hidden /> Líder de la bota de oro
              </p>
              <h2 className="mt-3 font-sport text-5xl uppercase leading-none text-neutral-50 md:text-7xl">
                {lider.jugador}
              </h2>
              <p className="mt-4 text-lg font-semibold text-neutral-100">
                {equipoLider?.nombre ?? lider.equipo} · dorsal {lider.numero}
              </p>
              <p className="mt-1 font-sport text-4xl leading-none text-amarillo">
                {lider.goles}
                <span className="ml-2 font-bufon text-xs uppercase tracking-widest text-neutral-500">
                  {lider.goles === 1 ? 'gol' : 'goles'}
                </span>
              </p>
              <p className="mt-4 max-w-md text-xs text-neutral-500">
                Acumulado de la {EDICION_ACTUAL}ª edición hasta la fecha {jornada}. Se actualiza con
                cada resultado que carga la organización.
              </p>
            </div>
          </div>
        </div>
      ) : null}

      {/* Juego limpio: el otro criterio que decide la tabla (Artículo 14) */}
      {masLimpio ? (
        <div className="mt-6 flex flex-wrap items-center gap-5 rounded-2xl border border-white/10 bg-black/30 px-6 py-5">
          <TeamCrest slug={masLimpio.equipo} size={56} />
          <div className="min-w-0">
            <p className="font-bufon text-xs font-bold uppercase tracking-[0.25em] text-neutral-500">
              Juego limpio · Artículo 14
            </p>
            <p className="mt-1 font-sport text-3xl uppercase leading-none text-neutral-100">
              {equipoLimpio?.nombre ?? masLimpio.equipo}
            </p>
          </div>
          <span className="ml-auto font-mono text-xs uppercase tracking-widest text-neutral-500">
            {masLimpio.ta} amarillas · {masLimpio.tr} rojas
          </span>
        </div>
      ) : null}

      <div className="mt-20">
        <RankingGoleadores datos={datos} />
      </div>
    </TorneoShell>
  );
}
