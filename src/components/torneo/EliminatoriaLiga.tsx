import { TeamCrest } from '@/components/torneo/TeamCrest';
import { getEquipo } from '@/lib/torneo-data';
import type { FaseFinal, PartidoEliminatoria } from '@/lib/liga-supabase';
import { cn } from '@/lib/utils';

/** Orden y rótulo de cada instancia. */
const FASES: { key: FaseFinal; titulo: string; sub: string }[] = [
  { key: 'cuartos', titulo: 'Cuartos de final', sub: 'Ronda 1' },
  { key: 'semifinal', titulo: 'Semifinales', sub: 'Ronda 2' },
  { key: 'tercer-puesto', titulo: 'Tercer puesto', sub: 'El bronce' },
  { key: 'final', titulo: 'Gran Final', sub: 'El título' },
];

function Cruce({ p }: { p: PartidoEliminatoria }) {
  const local = getEquipo(p.local);
  const visitante = getEquipo(p.visitante);
  const jugado = p.estado === 'jugado' && p.golesLocal != null && p.golesVisitante != null;
  const ganaLocal = jugado && p.golesLocal! > p.golesVisitante!;
  const ganaVisita = jugado && p.golesVisitante! > p.golesLocal!;

  return (
    <li
      className={cn(
        'rounded-xl border px-4 py-4',
        jugado ? 'border-amarillo/25 bg-black/50' : 'border-dashed border-white/15 bg-black/25',
      )}
    >
      <p className="text-xs text-neutral-500">
        {p.fecha} · {p.hora}
      </p>
      <div className="mt-3 flex items-center gap-3">
        <div className="flex min-w-0 flex-1 items-center justify-end gap-2">
          <span
            className={cn(
              'min-w-0 truncate text-right text-sm font-semibold',
              ganaLocal ? 'text-amarillo' : 'text-neutral-200',
            )}
          >
            {local?.nombre ?? p.local}
          </span>
          <TeamCrest slug={p.local} size={32} />
        </div>

        {jugado ? (
          <div className="flex shrink-0 items-center gap-1 rounded-lg bg-white/[0.06] px-3 py-1.5">
            <span className={cn('font-sport text-2xl leading-none', ganaLocal ? 'text-amarillo' : 'text-neutral-400')}>
              {p.golesLocal}
            </span>
            <span className="font-sport text-lg leading-none text-neutral-600">–</span>
            <span className={cn('font-sport text-2xl leading-none', ganaVisita ? 'text-amarillo' : 'text-neutral-400')}>
              {p.golesVisitante}
            </span>
          </div>
        ) : (
          <span className="shrink-0 font-sport text-xl leading-none text-neutral-500">vs</span>
        )}

        <div className="flex min-w-0 flex-1 items-center gap-2">
          <TeamCrest slug={p.visitante} size={32} />
          <span
            className={cn(
              'min-w-0 truncate text-sm font-semibold',
              ganaVisita ? 'text-amarillo' : 'text-neutral-200',
            )}
          >
            {visitante?.nombre ?? p.visitante}
          </span>
        </div>
      </div>
    </li>
  );
}

/**
 * Llave de la fase final.
 *
 * Solo dibuja las instancias que existen: si aún no hay semifinales cargadas,
 * esa sección no aparece. Así la página se va llenando sola a medida que la
 * organización carga los cruces, sin tocar el código.
 */
export function EliminatoriaLiga({ partidos }: { partidos: readonly PartidoEliminatoria[] }) {
  return (
    <div className="space-y-12">
      {FASES.map((f) => {
        const dela = partidos.filter((p) => p.fase === f.key);
        if (dela.length === 0) return null;
        return (
          <section key={f.key}>
            <p className="font-bufon text-xs font-bold uppercase tracking-[0.25em] text-naranja">
              {f.sub}
            </p>
            <h3 className="mt-1 font-sport text-4xl uppercase leading-none text-neutral-50 md:text-5xl">
              {f.titulo}
            </h3>
            <ul className="mt-5 grid gap-3 lg:grid-cols-2">
              {dela.map((p) => (
                <Cruce key={p.id} p={p} />
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
