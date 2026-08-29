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
      {/* Local */}
      <div className="flex min-w-0 flex-1 items-center justify-end gap-2 sm:gap-3">
        <NombreClub slug={p.local} alinear="der" />
        <TeamCrest slug={p.local} size={34} />
      </div>

      <Marcador p={p} mostrarDia={mostrarDia} />

      {/* Visitante */}
      <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
        <TeamCrest slug={p.visitante} size={34} />
        <NombreClub slug={p.visitante} alinear="izq" />
      </div>
    </li>
  );
}

/** Fixture completo de la fase de grupos, con marcador o con hora. */
export function FixtureLiga({ datos }: { datos: DatosLiga }) {
  const jornadaActual = jornadaActualDe(datos.partidos);
  const proxima = proximoPartidoDe(datos.partidos)?.jornada ?? null;

  // Las fechas salen de los partidos, no de una lista fija: si el panel carga
  // una jornada nueva, aparece sin tocar el codigo. El rotulo se busca en
  // JORNADAS_INFO y, si no esta, se arma con la fecha del primer partido.
  const jornadas = [...new Set(datos.partidos.map((p) => p.jornada))].sort((a, b) => a - b);

  return (
    <div className="space-y-14">
      <p className="text-sm text-neutral-400">
        {FORMATO_LIGA} · {datos.partidos.length} partidos · Cancha {CANCHA}
      </p>

      {jornadas.map((jornada) => {
        const partidos = partidosDeJornada(jornada, datos.partidos);
        const info = {
          jornada,
          etiqueta:
            JORNADAS_INFO.find((j) => j.jornada === jornada)?.etiqueta ?? partidos[0]?.fecha ?? '',
        };
        const jugada = partidos.every((p) => p.estado === 'jugado');
        const esActual = info.jornada === jornadaActual;
        const esProxima = info.jornada === proxima;
        const variosDias = jornadaEnVariosDias(partidos);

        return (
          <section key={info.jornada} id={`fecha-${info.jornada}`} className="scroll-mt-32">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-sport text-4xl uppercase leading-none text-neutral-50 md:text-5xl">
                  Fecha {info.jornada}
                </h3>
                <p className="mt-1 text-sm text-neutral-500">{info.etiqueta}</p>
              </div>
              {/* La próxima fecha se distingue de las demás programadas: era
                  lo único que la gente viene a buscar y salía igual que una
                  que falta un mes. */}
              <span
                className={cn(
                  'rounded-full px-3 py-1 font-bufon text-[10px] font-bold uppercase tracking-[0.15em]',
                  jugada
                    ? esActual
                      ? 'bg-gradient-to-r from-amarillo to-naranja text-carbon'
                      : 'border border-white/15 text-neutral-400'
                    : esProxima
                      ? 'border border-amarillo/60 bg-amarillo/10 text-amarillo'
                      : 'border border-dashed border-white/20 text-neutral-500',
                )}
              >
                {jugada
                  ? esActual
                    ? 'Última jugada'
                    : 'Jugada'
                  : esProxima
                    ? 'Próxima'
                    : 'Programada'}
              </span>
            </div>
            <div className="mt-4 h-px w-full bg-gradient-to-r from-amarillo/40 to-transparent" />

            <ul className="mt-5 space-y-2.5">
              {partidos.map((p) => (
                <FilaPartido key={p.id} p={p} mostrarDia={variosDias} />
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
