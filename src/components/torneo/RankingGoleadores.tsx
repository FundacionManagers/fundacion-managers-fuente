import { TeamCrest } from '@/components/torneo/TeamCrest';
import { getEquipo } from '@/lib/torneo-data';
import { AUTOGOLES, jornadaActualDe } from '@/lib/liga';
import type { DatosLiga } from '@/lib/liga-supabase';
import { cn } from '@/lib/utils';

const METAL = [
  'from-amarillo to-naranja text-carbon',
  'from-neutral-300 to-neutral-500 text-carbon',
  'from-amber-700 to-amber-900 text-amber-50',
] as const;

/** Ranking de goleadores: podio de los tres primeros y tabla con el resto. */
export function RankingGoleadores({ datos }: { datos: DatosLiga }) {
  const goleadores = datos.goleadores;
  const podio = goleadores.slice(0, 3);
  const resto = goleadores.slice(3);
  const totalGoles = goleadores.reduce((s, g) => s + g.goles, 0);
  const jornadaActual = jornadaActualDe(datos.partidos);

  // Los goles del ranking y los del marcador no tienen por qué cuadrar: un
  // autogol suma al equipo pero no a ningún goleador. Se cuentan los dos y se
  // publica la diferencia, en vez de titular con el número menor como si
  // fuera el total.
  const golesJugados = datos.partidos.reduce(
    (s, p) => (p.estado === 'jugado' ? s + (p.golesLocal ?? 0) + (p.golesVisitante ?? 0) : s),
    0,
  );

  // Cuántos autogoles se llevó cada club, para nombrar a los beneficiados.
  const autogolesPorClub = AUTOGOLES.reduce<Record<string, number>>((acc, a) => {
    acc[a.equipo] = (acc[a.equipo] ?? 0) + 1;
    return acc;
  }, {});
  const beneficiados = Object.entries(autogolesPorClub);

  // Lo que aún no explica ni un goleador ni un autogol registrado. Hoy es 0;
  // si algún día no lo fuera, la web lo dice en vez de callarlo.
  const sinExplicar = Math.max(0, golesJugados - totalGoles - AUTOGOLES.length);

  return (
    <div>
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="font-bufon text-sm font-bold uppercase tracking-[0.25em] text-naranja">
            Goleadores
          </p>
          <h2 className="mt-1 font-sport text-5xl uppercase leading-none text-neutral-50 md:text-6xl">
            La bota de oro
          </h2>
        </div>
        <span className="hidden shrink-0 rounded-full border border-amarillo/40 bg-amarillo/10 px-4 py-1.5 font-bufon text-xs font-bold uppercase tracking-[0.15em] text-amarillo sm:block">
          {goleadores.length} anotadores · {golesJugados} goles
        </span>
      </div>
      <div className="energy-bar mt-5 h-1 w-full rounded-full opacity-70" />

      {golesJugados > totalGoles ? (
        <p className="mt-4 max-w-3xl text-xs leading-relaxed text-neutral-500">
          {totalGoles} los marcó un jugador
          {AUTOGOLES.length > 0 ? (
            <>
              {' '}
              y {AUTOGOLES.length}{' '}
              {AUTOGOLES.length === 1 ? 'fue en propia puerta' : 'fueron en propia puerta'}, a favor
              de{' '}
              {beneficiados.map(([slug, n], i) => (
                <span key={slug}>
                  {i > 0 ? (i === beneficiados.length - 1 ? ' y ' : ', ') : ''}
                  {getEquipo(slug)?.nombre ?? slug}
                  {n > 1 ? ` (${n})` : ''}
                </span>
              ))}
            </>
          ) : null}
          . Un gol en propia puerta cuenta para el club, no para la bota de oro.
          {sinExplicar > 0 ? (
            <>
              {' '}
              Quedan {sinExplicar} sin atribuir: no se reparten a ojo, esperan a que la organización
              los confirme.
            </>
          ) : null}
        </p>
      ) : null}

      {/* Podio */}
      <div className="stagger-in mt-8 grid gap-5 sm:grid-cols-3">
        {podio.map((g, i) => {
          const eq = getEquipo(g.equipo);
          return (
            <div
              key={`${g.jugador}-${g.equipo}`}
              className={cn(
                'relative overflow-hidden rounded-2xl border bg-black/50 p-5',
                i === 0 ? 'border-amarillo/50' : 'border-white/10',
              )}
            >
              <span
                aria-hidden
                className="pointer-events-none absolute -right-3 -top-6 select-none font-sport text-8xl leading-none text-white/[0.06]"
              >
                {g.posicion}
              </span>
              <div className="relative flex items-center gap-3">
                <span
                  className={cn(
                    'inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-b font-sport text-lg',
                    METAL[i],
                  )}
                >
                  {g.posicion}
                </span>
                <TeamCrest slug={g.equipo} size={36} />
              </div>
              <p className="relative mt-4 text-lg font-bold leading-tight text-neutral-50">
                {g.jugador}
              </p>
              <p className="relative mt-1 text-sm text-neutral-400">
                {eq?.nombre ?? g.equipo} · dorsal {g.numero}
              </p>
              <p className="relative mt-4 font-sport text-4xl leading-none text-amarillo">
                {g.goles}
                <span className="ml-2 font-bufon text-xs uppercase tracking-widest text-neutral-500">
                  {g.goles === 1 ? 'gol' : 'goles'}
                </span>
              </p>
            </div>
          );
        })}
      </div>

      {/* Resto de la tabla */}
      <div className="mt-6 overflow-x-auto rounded-2xl border border-white/10 bg-black/40">
        <table className="w-full min-w-[520px] border-collapse text-sm">
          <caption className="sr-only">
            Ranking completo de goleadores hasta la fecha {jornadaActual}
          </caption>
          <thead>
            <tr className="border-b border-amarillo/30 bg-amarillo/10">
              <th
                scope="col"
                className="px-3 py-3 text-center font-bufon text-xs font-bold uppercase tracking-wider text-amarillo"
              >
                #
              </th>
              <th
                scope="col"
                className="px-3 py-3 text-left font-bufon text-xs font-bold uppercase tracking-wider text-amarillo"
              >
                Jugador
              </th>
              <th
                scope="col"
                className="px-3 py-3 text-left font-bufon text-xs font-bold uppercase tracking-wider text-amarillo"
              >
                Equipo
              </th>
              <th
                scope="col"
                className="hidden px-3 py-3 text-center font-bufon text-xs font-bold uppercase tracking-wider text-amarillo sm:table-cell"
              >
                Dorsal
              </th>
              <th
                scope="col"
                className="px-3 py-3 text-center font-bufon text-xs font-bold uppercase tracking-wider text-amarillo"
              >
                Goles
              </th>
            </tr>
          </thead>
          <tbody>
            {resto.map((g) => {
              const eq = getEquipo(g.equipo);
              return (
                <tr
                  key={`${g.jugador}-${g.equipo}-${g.numero}`}
                  className="border-b border-white/5 transition-colors last:border-0 hover:bg-white/[0.04]"
                >
                  <td className="px-3 py-2.5 text-center tabular-nums text-neutral-500">
                    {g.posicion}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5 font-semibold text-neutral-100">
                    {g.jugador}
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <TeamCrest slug={g.equipo} size={22} />
                      <span className="whitespace-nowrap text-neutral-400">
                        {eq?.nombre ?? g.equipo}
                      </span>
                    </div>
                  </td>
                  <td className="hidden px-3 py-2.5 text-center tabular-nums text-neutral-500 sm:table-cell">
                    {g.numero}
                  </td>
                  <td className="px-3 py-2.5 text-center font-sport text-lg text-amarillo">
                    {g.goles}
                  </td>
                </tr>
              );
            })}

            {/* Los autogoles cierran la tabla. Van sin número de posición
                —no compiten por la bota de oro— pero sí con el club que se
                los llevó, para que la suma cuadre con los goles del
                marcador y nadie tenga que preguntar por el gol que falta. */}
            {beneficiados.map(([slug, n]) => {
              const eq = getEquipo(slug);
              return (
                <tr key={`autogol-${slug}`} className="border-t border-amarillo/20 bg-white/[0.02]">
                  <td className="px-3 py-2.5 text-center text-neutral-600">—</td>
                  <td className="whitespace-nowrap px-3 py-2.5 font-semibold italic text-neutral-400">
                    Gol en propia puerta
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <TeamCrest slug={slug} size={22} />
                      <span className="whitespace-nowrap text-neutral-400">
                        {eq?.nombre ?? slug}{' '}
                        <span className="text-[11px] uppercase tracking-widest text-neutral-600">
                          a favor
                        </span>
                      </span>
                    </div>
                  </td>
                  <td className="hidden px-3 py-2.5 text-center text-neutral-600 sm:table-cell">
                    —
                  </td>
                  <td className="px-3 py-2.5 text-center font-sport text-lg text-neutral-400">
                    {n}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
