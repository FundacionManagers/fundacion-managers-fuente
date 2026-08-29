import { TeamCrest } from '@/components/torneo/TeamCrest';
import type { CruceCuartos } from '@/lib/liga';
import { getEquipo } from '@/lib/torneo-data';

function Lado({
  slug,
  posicion,
  alineacion,
}: {
  slug: string | null;
  posicion: number;
  alineacion: 'izquierda' | 'derecha';
}) {
  const equipo = slug ? getEquipo(slug) : undefined;
  const derecha = alineacion === 'derecha';

  return (
    <div className={`flex min-w-0 flex-1 items-center gap-3 ${derecha ? '' : 'flex-row-reverse'}`}>
      <TeamCrest slug={slug} size={40} />
      <div className={`min-w-0 ${derecha ? 'text-left' : 'text-right'}`}>
        <p className="truncate text-sm font-bold text-neutral-100">
          {equipo?.nombre ?? 'Por definir'}
        </p>
        <p className="font-mono text-[11px] uppercase tracking-widest text-neutral-500">
          {posicion}º de la tabla
        </p>
      </div>
    </div>
  );
}

/**
 * Los cuatro cruces de cuartos que salen de la tabla.
 *
 * `provisional` cambia el tono del bloque: mientras queden fechas por jugar
 * esto es una proyección y la página tiene que decirlo, porque un cruce
 * publicado como definitivo que después cambia es peor que no publicarlo.
 */
export function LlaveProyectada({
  cruces,
  provisional,
}: {
  cruces: readonly CruceCuartos[];
  provisional: boolean;
}) {
  return (
    <ul className="grid gap-4 lg:grid-cols-2">
      {cruces.map((c) => (
        <li
          key={c.id}
          className={`rounded-xl border px-5 py-5 ${
            provisional
              ? 'border-dashed border-white/15 bg-black/25'
              : 'border-amarillo/25 bg-black/50'
          }`}
        >
          <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-naranja">
            {c.etiqueta}
          </p>
          <div className="mt-3 flex items-center gap-3">
            <Lado slug={c.local} posicion={c.posicionLocal} alineacion="izquierda" />
            <span className="shrink-0 font-sport text-xl leading-none text-neutral-500">vs</span>
            <Lado slug={c.visitante} posicion={c.posicionVisitante} alineacion="derecha" />
          </div>
        </li>
      ))}
    </ul>
  );
}
