import { ChevronRight } from 'lucide-react';
import { TeamCrest } from '@/components/torneo/TeamCrest';
import { getEquipo } from '@/lib/torneo-data';
import {
  CANCHA,
  FORMATO_LIGA,
  JORNADAS_INFO,
  diaCortoDe,
  jornadaActualDe,
  jornadaEnVariosDias,
  partidosDeJornada,
  proximoPartidoDe,
  type PartidoLiga,
} from '@/lib/liga';
import type { DatosLiga } from '@/lib/liga-supabase';
import { cn } from '@/lib/utils';

/**
 * Nombre del club: completo desde `sm`, código corto en móvil.
 *
 * A 375 px el nombre completo no cabe y seis de los ocho clubes salían
 * cortados —"The Ori…", "La Band…", "Manage…"—, a veces en los dos lados del
 * mismo partido. El código corto ya existe en los datos de cada club y está
 * pensado justo para esto.
 */
function NombreClub({ slug, alinear }: { slug: string; alinear: 'izq' | 'der' }) {
  const eq = getEquipo(slug);
  return (
    <span
      className={cn(
        'min-w-0 text-sm font-semibold text-neutral-200 sm:text-base',
        alinear === 'der' ? 'text-right' : 'text-left',
      )}
    >
      <span className="sm:hidden">{eq?.corto ?? slug}</span>
      <span className="hidden truncate sm:inline">{eq?.nombre ?? slug}</span>
    </span>
  );
}

/** Marcador del partido, o la hora si todavía no se ha jugado. */
function Marcador({ p, mostrarDia }: { p: PartidoLiga; mostrarDia: boolean }) {
  const jugado = p.estado === 'jugado' && p.golesLocal != null && p.golesVisitante != null;
  const ganaLocal = jugado && p.golesLocal! > p.golesVisitante!;
  const ganaVisita = jugado && p.golesVisitante! > p.golesLocal!;

  return (
    <div className="flex shrink-0 flex-col items-center gap-1">
      {jugado ? (
        <span className="flex items-center gap-1 rounded-lg bg-white/[0.06] px-3 py-1.5">
          <span
            className={cn(
              'font-sport text-2xl leading-none',
              ganaLocal ? 'text-amarillo' : 'text-neutral-400',
            )}
          >
            {p.golesLocal}
          </span>
          <span className="font-sport text-lg leading-none text-neutral-600">–</span>
          <span
            className={cn(
              'font-sport text-2xl leading-none',
              ganaVisita ? 'text-amarillo' : 'text-neutral-400',
            )}
          >
            {p.golesVisitante}
          </span>
        </span>
      ) : (
        <span className="font-sport text-xl leading-none text-neutral-500">vs</span>
      )}

      {/* Cuándo se juega. El día solo cuando la fecha del torneo se reparte
          en varios días: si todos son el mismo, ya lo dice el encabezado y
          repetirlo cuatro veces es ruido. */}
      <span className="whitespace-nowrap font-bufon text-[10px] uppercase tracking-widest text-neutral-600">
        {mostrarDia ? `${diaCortoDe(p)} · ` : ''}
        {p.hora}
      </span>
    </div>
  );
}

function FilaPartido({ p, mostrarDia }: { p: PartidoLiga; mostrarDia: boolean }) {
  const jugado = p.estado === 'jugado';

  return (
    <li
      className={cn(
        'flex items-center gap-3 rounded-xl border px-3 py-3 sm:gap-4 sm:px-4',
        jugado ? 'border-white/10 bg-black/40' : 'border-dashed border-white/10 bg-black/20',
      )}
    >
      <div className="flex min-w-0 flex-1 items-center justify-end gap-2 sm:gap-3">
        <NombreClub slug={p.local} alinear="der" />
        <TeamCrest slug={p.local} size={34} />
      </div>

      <Marcador p={p} mostrarDia={mostrarDia} />

      <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
        <TeamCrest slug={p.visitante} size={34} />
        <NombreClub slug={p.visitante} alinear="izq" />
      </div>
    </li>
  );
}

function ListaPartidos({ partidos }: { partidos: PartidoLiga[] }) {
  const variosDias = jornadaEnVariosDias(partidos);
  return (
    <ul className="space-y-2.5">
      {partidos.map((p) => (
        <FilaPartido key={p.id} p={p} mostrarDia={variosDias} />
      ))}
    </ul>
  );
}

function etiquetaDe(jornada: number, partidos: PartidoLiga[]): string {
  return JORNADAS_INFO.find((j) => j.jornada === jornada)?.etiqueta ?? partidos[0]?.fecha ?? '';
}

/**
 * Fixture de la fase de grupos, ordenado por lo que importa hoy.
 *
 * Antes eran siete bloques idénticos del 1 al 7, y para llegar a lo actual
 * había que pasar por cinco jornadas viejas. Ahora la página se ordena sola:
 *
 *   1. La próxima fecha, que va en su tarjeta aparte, sobre este componente.
 *   2. La última fecha jugada, desplegada: es lo que la gente viene a mirar
 *      al día siguiente de jugar.
 *   3. Todas las demás, plegadas en acordeones. Se consultan, no se leen.
 *
 * Los tres bloques salen de los datos, así que al cargar una fecha nueva
 * todo se recoloca sin tocar el código: la que estaba desplegada se pliega y
 * la siguiente ocupa su lugar.
 */
export function FixtureLiga({ datos }: { datos: DatosLiga }) {
  const ultima = jornadaActualDe(datos.partidos);
  const proxima = proximoPartidoDe(datos.partidos)?.jornada ?? null;

  const jornadas = [...new Set(datos.partidos.map((p) => p.jornada))].sort((a, b) => a - b);
  const partidosUltima = ultima ? partidosDeJornada(ultima, datos.partidos) : [];

  // El resto: todo lo que no es ni la próxima ni la última. Incluye las
  // fechas futuras que no son la siguiente —hoy, la 7— para que ninguna
  // desaparezca de la página.
  const plegadas = jornadas.filter((j) => j !== ultima && j !== proxima);

  return (
    <div className="space-y-14">
      <p className="text-sm text-neutral-400">
        {FORMATO_LIGA} · {datos.partidos.length} partidos · Cancha {CANCHA}
      </p>

      {/* ===== La última fecha jugada, desplegada ===== */}
      {ultima ? (
        <section id={`fecha-${ultima}`} className="scroll-mt-32">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-sport text-4xl uppercase leading-none text-neutral-50 md:text-5xl">
                Fecha {ultima}
              </h3>
              <p className="mt-1 text-sm text-neutral-500">{etiquetaDe(ultima, partidosUltima)}</p>
            </div>
            <span className="rounded-full bg-gradient-to-r from-amarillo to-naranja px-3 py-1 font-bufon text-[10px] font-bold uppercase tracking-[0.15em] text-carbon">
              Última fecha
            </span>
          </div>
          <div className="mt-4 h-px w-full bg-gradient-to-r from-amarillo/40 to-transparent" />
          <div className="mt-5">
            <ListaPartidos partidos={partidosUltima} />
          </div>
        </section>
      ) : null}

      {/* ===== El resto, plegado ===== */}
      {plegadas.length ? (
        <section>
          <p className="font-bufon text-xs font-bold uppercase tracking-[0.25em] text-neutral-600">
            Las demás fechas
          </p>
          <div className="mt-4 space-y-2">
            {plegadas.map((jornada) => {
              const partidos = partidosDeJornada(jornada, datos.partidos);
              const jugada = partidos.every((p) => p.estado === 'jugado');
              return (
                <details
                  key={jornada}
                  id={`fecha-${jornada}`}
                  className="group scroll-mt-32 rounded-xl border border-white/10 bg-black/30"
                >
                  <summary className="flex cursor-pointer list-none items-center gap-3 px-4 py-3">
                    <ChevronRight
                      size={14}
                      aria-hidden
                      className="shrink-0 text-neutral-600 transition-transform duration-200 group-open:rotate-90"
                    />
                    <span className="font-sport text-xl uppercase leading-none text-neutral-300">
                      Fecha {jornada}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-xs text-neutral-600">
                      {etiquetaDe(jornada, partidos)}
                    </span>
                    <span
                      className={cn(
                        'shrink-0 rounded-full px-2.5 py-0.5 font-bufon text-[10px] font-bold uppercase tracking-[0.15em]',
                        jugada
                          ? 'border border-white/15 text-neutral-500'
                          : 'border border-dashed border-white/20 text-neutral-500',
                      )}
                    >
                      {jugada ? 'Jugada' : 'Programada'}
                    </span>
                  </summary>
                  <div className="border-t border-white/5 px-4 pb-4 pt-4">
                    <ListaPartidos partidos={partidos} />
                  </div>
                </details>
              );
            })}
          </div>
        </section>
      ) : null}
    </div>
  );
}
