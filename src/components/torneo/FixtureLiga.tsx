import { TeamCrest } from '@/components/torneo/TeamCrest';
import { getEquipo } from '@/lib/torneo-data';
import {
  CANCHA,
  FORMATO_LIGA,
  JORNADAS_INFO,
  JORNADA_ACTUAL,
  PARTIDOS_LIGA,
  partidosDeJornada,
  type PartidoLiga,
} from '@/lib/liga';
import { cn } from '@/lib/utils';

function Marcador({ p }: { p: PartidoLiga }) {
  if (p.estado !== 'jugado' || p.golesLocal == null || p.golesVisitante == null) {
    return (
      <div className="flex shrink-0 flex-col items-center">
        <span className="font-sport text-xl leading-none text-neutral-500">vs</span>
        <span className="mt-1 font-bufon text-[10px] uppercase tracking-widest text-neutral-600">
          {p.hora}
        </span>
      </div>
    );
  }

  const ganaLocal = p.golesLocal > p.golesVisitante;
  const ganaVisita = p.golesVisitante > p.golesLocal;

  return (
    <div className="flex shrink-0 items-center gap-1 rounded-lg bg-white/[0.06] px-3 py-1.5">
      <span className={cn('font-sport text-2xl leading-none', ganaLocal ? 'text-amarillo' : 'text-neutral-400')}>
        {p.golesLocal}
      </span>
      <span className="font-sport text-lg leading-none text-neutral-600">–</span>
      <span className={cn('font-sport text-2xl leading-none', ganaVisita ? 'text-amarillo' : 'text-neutral-400')}>
        {p.golesVisitante}
      </span>
    </div>
  );
}

function FilaPartido({ p }: { p: PartidoLiga }) {
  const local = getEquipo(p.local);
  const visitante = getEquipo(p.visitante);
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
        <span className="min-w-0 truncate text-right text-sm font-semibold text-neutral-200 sm:text-base">
          {local?.nombre ?? p.local}
        </span>
        <TeamCrest slug={p.local} size={34} />
      </div>

      <Marcador p={p} />

      {/* Visitante */}
      <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
        <TeamCrest slug={p.visitante} size={34} />
        <span className="min-w-0 truncate text-sm font-semibold text-neutral-200 sm:text-base">
          {visitante?.nombre ?? p.visitante}
        </span>
      </div>
    </li>
  );
}

/** Fixture completo de la fase de grupos: 7 fechas, con marcador o con hora. */
export function FixtureLiga() {
  return (
    <div className="space-y-14">
      <p className="text-sm text-neutral-400">
        {FORMATO_LIGA} · {PARTIDOS_LIGA.length} partidos · Cancha {CANCHA}
      </p>

      {JORNADAS_INFO.map((info) => {
        const partidos = partidosDeJornada(info.jornada);
        const jugada = partidos.every((p) => p.estado === 'jugado');
        const esActual = info.jornada === JORNADA_ACTUAL;

        return (
          <section key={info.jornada}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-sport text-4xl uppercase leading-none text-neutral-50 md:text-5xl">
                  Fecha {info.jornada}
                </h3>
                <p className="mt-1 text-sm text-neutral-500">{info.etiqueta}</p>
              </div>
              <span
                className={cn(
                  'rounded-full px-3 py-1 font-bufon text-[10px] font-bold uppercase tracking-[0.15em]',
                  jugada
                    ? esActual
                      ? 'bg-gradient-to-r from-amarillo to-naranja text-carbon'
                      : 'border border-white/15 text-neutral-400'
                    : 'border border-dashed border-white/20 text-neutral-500',
                )}
              >
                {jugada ? (esActual ? 'Última jugada' : 'Jugada') : 'Programada'}
              </span>
            </div>
            <div className="mt-4 h-px w-full bg-gradient-to-r from-amarillo/40 to-transparent" />

            <ul className="mt-5 space-y-2.5">
              {partidos.map((p) => (
                <FilaPartido key={p.id} p={p} />
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
