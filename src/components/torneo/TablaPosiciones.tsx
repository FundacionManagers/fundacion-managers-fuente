import { TeamCrest } from '@/components/torneo/TeamCrest';
import { getEquipo } from '@/lib/torneo-data';
import {
  COLUMNAS_TABLA,
  CRITERIOS_DESEMPATE,
  calcularPosiciones,
  jornadaActualDe,
} from '@/lib/liga';
import type { DatosLiga } from '@/lib/liga-supabase';
import { cn } from '@/lib/utils';

/**
 * Tabla de posiciones de la fase de grupos.
 *
 * Las cifras vienen de `calcularPosiciones()`, que las deriva de los
 * marcadores: la tabla no puede contradecir al calendario.
 *
 * En móvil la tabla se desplaza en horizontal dentro de su propio contenedor
 * — la página nunca se desplaza de lado — y las columnas de disciplina se
 * ocultan por debajo de `sm`, porque son las menos consultadas.
 */
export function TablaPosiciones({ datos }: { datos: DatosLiga }) {
  const posiciones = calcularPosiciones(datos.partidos, datos.disciplina);
  const jornadaActual = jornadaActualDe(datos.partidos);

  return (
    <div>
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="font-bufon text-sm font-bold uppercase tracking-[0.25em] text-naranja">
            Fase de grupos
          </p>
          <h2 className="mt-1 font-sport text-5xl uppercase leading-none text-neutral-50 md:text-6xl">
            Tabla de posiciones
          </h2>
        </div>
        <span className="hidden shrink-0 rounded-full border border-amarillo/40 bg-amarillo/10 px-4 py-1.5 font-bufon text-xs font-bold uppercase tracking-[0.15em] text-amarillo sm:block">
          Hasta la fecha {jornadaActual}
        </span>
      </div>
      <div className="energy-bar mt-5 h-1 w-full rounded-full opacity-70" />

      <div className="mt-8 overflow-x-auto rounded-2xl border border-white/10 bg-black/40">
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <caption className="sr-only">
            Tabla de posiciones de la fase de grupos hasta la fecha {jornadaActual}
          </caption>
          <thead>
            <tr className="border-b border-amarillo/30 bg-amarillo/10">
              <th
                scope="col"
                className="px-3 py-3 text-center font-bufon text-xs font-bold uppercase tracking-wider text-amarillo"
              >
                Pos
              </th>
              <th
                scope="col"
                className="px-3 py-3 text-left font-bufon text-xs font-bold uppercase tracking-wider text-amarillo"
              >
                Equipo
              </th>
              {COLUMNAS_TABLA.map((c) => (
                <th
                  key={c.key}
                  scope="col"
                  title={c.largo}
                  className={cn(
                    'px-2 py-3 text-center font-bufon text-xs font-bold uppercase tracking-wider text-amarillo',
                    (c.key === 'ta' || c.key === 'tr') && 'hidden sm:table-cell',
                    c.key === 'pts' && 'px-3',
                  )}
                >
                  <abbr title={c.largo} className="no-underline">
                    {c.corto}
                  </abbr>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {posiciones.map((fila) => {
              const eq = getEquipo(fila.equipo);
              return (
                <tr
                  key={fila.equipo}
                  className="border-b border-white/5 transition-colors last:border-0 hover:bg-white/[0.04]"
                >
                  <td className="px-3 py-3 text-center">
                    <span
                      className={cn(
                        'inline-flex h-7 w-7 items-center justify-center rounded-lg font-sport text-base',
                        fila.posicion <= 4
                          ? 'bg-gradient-to-b from-amarillo to-naranja text-carbon'
                          : 'text-neutral-500',
                      )}
                    >
                      {fila.posicion}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-3">
                      <TeamCrest slug={fila.equipo} size={32} />
                      <span className="whitespace-nowrap font-semibold text-neutral-100">
                        {eq?.nombre ?? fila.equipo}
                      </span>
                    </div>
                  </td>
                  {COLUMNAS_TABLA.map((c) => (
                    <td
                      key={c.key}
                      className={cn(
                        'px-2 py-3 text-center tabular-nums',
                        (c.key === 'ta' || c.key === 'tr') && 'hidden sm:table-cell',
                        c.key === 'pts'
                          ? 'px-3 font-sport text-lg text-amarillo'
                          : 'text-neutral-300',
                        c.key === 'dg' && fila.dg > 0 && 'text-emerald-400',
                        c.key === 'dg' && fila.dg < 0 && 'text-red-400',
                        c.key === 'ta' && 'text-amber-300/80',
                        c.key === 'tr' && 'text-red-400/80',
                      )}
                    >
                      {c.key === 'dg' && fila.dg > 0 ? `+${fila.dg}` : fila[c.key]}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <dl className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-xs text-neutral-500">
        {COLUMNAS_TABLA.map((c) => (
          <div key={c.key} className="flex gap-1.5">
            <dt className="font-bold text-neutral-400">{c.corto}:</dt>
            <dd>{c.largo}</dd>
          </div>
        ))}
      </dl>

      {/* Articulo 14 del reglamento. Se publica porque sin esto la tabla
          parece arbitraria: un club puede ir sobre otro con peor diferencia
          de gol, y quien mira no sabe por que. */}
      <div className="mt-6 rounded-xl border border-white/10 bg-black/30 px-5 py-4">
        <p className="font-bufon text-xs font-bold uppercase tracking-[0.2em] text-amarillo">
          Criterios de desempate · Artículo 14
        </p>
        <ol className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm text-neutral-300">
          {CRITERIOS_DESEMPATE.map((c, i) => (
            <li key={c} className="flex items-center gap-2">
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-md border border-white/15 font-mono text-[10px] text-neutral-400">
                {i + 1}
              </span>
              {c}
            </li>
          ))}
        </ol>
        <p className="mt-3 text-xs text-neutral-500">
          Se aplican en ese orden. El Fair Play pesa más que la diferencia de gol: ante igualdad de
          puntos, el club con menos tarjetas queda por encima aunque el otro tenga mejor diferencia.
          Es el criterio del reglamento, no la descripción de un cruce concreto de la tabla de hoy.
        </p>
      </div>
    </div>
  );
}
