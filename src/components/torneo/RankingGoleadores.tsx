import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { TeamCrest } from '@/components/torneo/TeamCrest';
import { getEquipo } from '@/lib/torneo-data';
import {
  AUTOGOLES,
  beneficiadoDe,
  jornadaActualDe,
  posicionesCompartidas,
  tramosDeGoles,
} from '@/lib/liga';
import type { DatosLiga } from '@/lib/liga-supabase';
import { cn } from '@/lib/utils';

/** Una fila del ranking, ya con su puesto compartido resuelto. */
type GoleadorConPosicion = ReturnType<typeof posicionesCompartidas>[number];

/** Un autogol con el club al que acabó beneficiando. */
type AutogolPublicado = (typeof AUTOGOLES)[number] & {
  beneficiado: ReturnType<typeof beneficiadoDe>;
};

const METAL = [
  'from-amarillo to-naranja text-carbon',
  'from-neutral-300 to-neutral-500 text-carbon',
  'from-amber-700 to-amber-900 text-amber-50',
] as const;

/** Cuántos puestos, además del podio, se listan en la versión compacta. */
const TOPE_COMPACTO = 7;

/**
 * A partir de cuántos empatados se pliega la cola del ranking.
 *
 * Hoy son 21 jugadores con 1 gol: veintiuna filas idénticas seguidas que
 * hacían de Estadísticas la página más larga del torneo, 5.631 px en móvil.
 * El umbral se compara con el tramo, no con un puesto fijo, para que la cosa
 * siga teniendo sentido cuando el ranking cambie de forma.
 */
const COLA_PLEGABLE_DESDE = 8;

/**
 * Ranking de goleadores: podio de los tres primeros y tabla con el resto.
 *
 * En modo `compacto` se queda en el top 10 y remite a Estadísticas. El
 * Resumen publicaba el ranking completo de 46 anotadores —4.289 px, el 42%
 * de la página— exactamente igual que la pestaña de Estadísticas: una copia
 * entera de otra sección, que dejaba a esa pestaña sin razón de ser y hacía
 * que el Resumen no resumiera, sino que transcribiera.
 */
export function RankingGoleadores({
  datos,
  compacto = false,
}: {
  datos: DatosLiga;
  compacto?: boolean;
}) {
  // Puestos compartidos entre empatados: el ranking numeraba 1..N por orden
  // de llegada y el desempate real acababa siendo el alfabético.
  const goleadores = posicionesCompartidas(datos.goleadores);
  const tramos = tramosDeGoles(goleadores);
  const podio = tramos.slice(0, 3);
  const hayEmpates = goleadores.some((g) => g.empatados > 1);

  // La tabla arranca donde termina el podio, que ya no son tres filas fijas.
  const enPodio = podio.reduce((s, t) => s + t.jugadores.length, 0);
  const restoCompleto = goleadores.slice(enPodio);
  const resto = compacto ? restoCompleto.slice(0, TOPE_COMPACTO) : restoCompleto;

  /**
   * La cola —el último tramo de goles— se pliega si está muy poblada.
   *
   * En el Resumen no aplica: allí la tabla ya viene cortada en el top 10 y
   * plegar diez filas no ahorra nada.
   */
  const golesMinimos = resto.length ? resto[resto.length - 1]!.goles : 0;
  const cola = resto.filter((g) => g.goles === golesMinimos);
  const seDobla = !compacto && cola.length >= COLA_PLEGABLE_DESDE && cola.length < resto.length;
  const restoVisible = seDobla ? resto.slice(0, resto.length - cola.length) : resto;
  const restoPlegado = seDobla ? cola : [];
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

  /**
   * Un autogol solo se publica si CABE en el marcador.
   *
   * Los goleadores los carga la organización desde el panel, y los autogoles
   * viven en el repositorio: son dos fuentes que pueden desincronizarse un
   * rato. Si la planilla ya le puso autor a todos los goles, añadir el
   * autogol haría que la tabla sumara más goles de los que se marcaron. Ante
   * la duda no se inventa nada: se calla el autogol hasta que la planilla le
   * haga sitio, y en cuanto se lo haga aparece solo en la siguiente
   * publicación. Así la página nunca puede contradecirse a sí misma.
   */
  const autogolesCaben = totalGoles + AUTOGOLES.length <= golesJugados;
  const autogoles = autogolesCaben
    ? AUTOGOLES.map((a) => ({ ...a, beneficiado: beneficiadoDe(a, datos.partidos) }))
    : [];

  // La fila del autogol cierra la tabla completa. En la versión compacta la
  // tabla está cortada en el top 10, así que ahí no se pinta — pero la nota
  // de arriba sí lo sigue contando, porque los totales son los mismos.
  const filasAutogol = compacto ? [] : autogoles;

  const autogolesPorClub = autogoles.reduce<Record<string, number>>((acc, a) => {
    if (a.beneficiado) acc[a.beneficiado] = (acc[a.beneficiado] ?? 0) + 1;
    return acc;
  }, {});
  const beneficiados = Object.entries(autogolesPorClub);

  // Lo que no explica ni un goleador ni un autogol publicado. Si algún día no
  // fuera cero, la web lo dice en vez de callarlo.
  const sinExplicar = Math.max(0, golesJugados - totalGoles - autogoles.length);

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
          {autogoles.length > 0 ? (
            <>
              {' '}
              y {autogoles.length}{' '}
              {autogoles.length === 1 ? 'fue en propia puerta' : 'fueron en propia puerta'}, a favor
              de{' '}
              {beneficiados.map(([slug, n], i) => (
                <span key={slug}>
                  {i > 0 ? (i === beneficiados.length - 1 ? ' y ' : ', ') : ''}
                  {getEquipo(slug)?.nombre ?? slug}
                  {n > 1 ? ` (${n})` : ''}
                </span>
              ))}
              . Un gol en propia puerta cuenta para el club, no para la bota de oro.
            </>
          ) : null}
          {sinExplicar > 0 ? (
            <>
              {autogoles.length > 0 ? ' Quedan' : ' y quedan'} {sinExplicar} por atribuir: no se
              reparten a ojo, esperan a que la organización confirme la planilla.
            </>
          ) : null}
        </p>
      ) : null}

      {/* Podio por tramos de goles, no por las tres primeras filas.
          El bronce se lo llevaba uno de los siete jugadores empatados a 4
          goles, elegido por orden alfabético y sin decirlo: Andrés Ospina
          salía 3º y Wilson Rubiano 9º con los mismos goles. Cada escalón es
          ahora una cifra de goles, y si varios la comparten, salen todos. */}
      <div className="stagger-in mt-8 grid gap-5 sm:grid-cols-3">
        {podio.map((tramo, i) => (
          <div
            key={tramo.goles}
            className={cn(
              'relative overflow-hidden rounded-2xl border bg-black/50 p-5',
              i === 0 ? 'border-amarillo/50' : 'border-white/10',
            )}
          >
            <span
              aria-hidden
              className="pointer-events-none absolute -right-3 -top-6 select-none font-sport text-8xl leading-none text-white/[0.06]"
            >
              {tramo.posicion}
            </span>

            <div className="relative flex items-center gap-3">
              <span
                className={cn(
                  'inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-b font-sport text-lg',
                  METAL[i],
                )}
              >
                {tramo.posicion}
              </span>
              <p className="font-sport text-3xl leading-none text-amarillo">
                {tramo.goles}
                <span className="ml-2 font-bufon text-[10px] uppercase tracking-widest text-neutral-500">
                  {tramo.goles === 1 ? 'gol' : 'goles'}
                </span>
              </p>
            </div>

            {tramo.jugadores.length === 1 ? (
              <>
                <p className="relative mt-4 text-lg font-bold leading-tight text-neutral-50">
                  {tramo.jugadores[0]!.jugador}
                </p>
                <p className="relative mt-1 text-sm text-neutral-400">
                  {getEquipo(tramo.jugadores[0]!.equipo)?.nombre ?? tramo.jugadores[0]!.equipo} ·
                  dorsal {tramo.jugadores[0]!.numero}
                </p>
              </>
            ) : (
              <>
                <p className="relative mt-4 font-bufon text-[11px] uppercase tracking-widest text-neutral-500">
                  {tramo.jugadores.length} jugadores empatados
                </p>
                <ul className="relative mt-2 space-y-1.5">
                  {tramo.jugadores.map((g) => (
                    <li key={`${g.jugador}-${g.equipo}`} className="flex items-center gap-2">
                      <TeamCrest slug={g.equipo} size={20} />
                      <span className="truncate text-sm font-semibold text-neutral-200">
                        {g.jugador}
                      </span>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Se dice el criterio, igual que el Artículo 14 en la tabla: un orden
          que no explica su regla parece arbitrario. */}
      {hayEmpates ? (
        <p className="mt-4 text-xs text-neutral-500">
          Los jugadores con los mismos goles comparten puesto y van en orden alfabético. Tras un
          empate, el ranking salta al puesto que corresponde.
        </p>
      ) : null}

      {/* Resto de la tabla */}
      <TablaGoleadores
        filas={restoVisible}
        autogoles={filasAutogol}
        rotulo={`Ranking de goleadores hasta la fecha ${jornadaActual}`}
      />

      {/* La cola del ranking, plegada.
          Veintiún jugadores con un gol cada uno, en filas idénticas, eran el
          40% final de la página. Van en acordeón: quien busca un nombre lo
          abre, y quien viene a ver la bota de oro deja de tener que
          atravesarlos. Es un <details> nativo, así que el buscador los indexa
          igual y funciona con teclado. */}
      {restoPlegado.length > 0 ? (
        <details className="group mt-4">
          <summary className="flex cursor-pointer list-none items-center gap-2 rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-xs uppercase tracking-[0.15em] text-neutral-500 transition-colors hover:text-neutral-300">
            <ChevronRight
              size={13}
              aria-hidden
              className="shrink-0 transition-transform duration-200 group-open:rotate-90"
            />
            Ver {restoPlegado.length} jugadores más, con{' '}
            {restoPlegado[0]!.goles === 1 ? '1 gol' : `${restoPlegado[0]!.goles} goles`}
          </summary>
          <div className="mt-3">
            <TablaGoleadores filas={restoPlegado} autogoles={[]} rotulo="Resto del ranking" />
          </div>
        </details>
      ) : null}

      {/* El resto del ranking vive en Estadísticas, que es su pestaña. */}
      {compacto && restoCompleto.length > TOPE_COMPACTO ? (
        <Link
          href="/torneo/estadisticas/"
          className="group mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-amarillo transition-colors hover:text-naranja"
        >
          Ver los {goleadores.length} anotadores en Estadísticas
          <span aria-hidden className="transition-transform group-hover:translate-x-0.5">
            →
          </span>
        </Link>
      ) : null}
    </div>
  );
}

/** La tabla del ranking. Se usa dos veces: la parte visible y la plegada. */
function TablaGoleadores({
  filas,
  autogoles,
  rotulo,
}: {
  filas: readonly GoleadorConPosicion[];
  autogoles: readonly AutogolPublicado[];
  rotulo: string;
}) {
  return (
    <div className="mt-6 overflow-x-auto rounded-2xl border border-white/10 bg-black/40">
      <table className="w-full min-w-[520px] border-collapse text-sm">
        <caption className="sr-only">{rotulo}</caption>
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
            {filas.map((g) => {
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
            {autogoles.map((a, i) => {
              const autor = getEquipo(a.autor);
              const favorecido = a.beneficiado ? getEquipo(a.beneficiado) : undefined;
              return (
                <tr
                  key={`autogol-${a.autor}-${a.jornada}-${i}`}
                  className="border-t border-amarillo/20 bg-white/[0.02]"
                >
                  <td className="px-3 py-2.5 text-center text-neutral-600">—</td>
                  <td className="px-3 py-2.5">
                    <p className="whitespace-nowrap font-semibold italic text-neutral-400">
                      Gol en propia puerta
                    </p>
                    <p className="mt-0.5 whitespace-nowrap text-[11px] uppercase tracking-widest text-neutral-600">
                      Fecha {a.jornada} · lo marcó {autor?.nombre ?? a.autor}
                    </p>
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <TeamCrest slug={a.beneficiado ?? ''} size={22} />
                      <span className="whitespace-nowrap text-neutral-400">
                        {favorecido?.nombre ?? a.beneficiado ?? '—'}{' '}
                        <span className="text-[11px] uppercase tracking-widest text-neutral-600">
                          a favor
                        </span>
                      </span>
                    </div>
                  </td>
                  <td className="hidden px-3 py-2.5 text-center text-neutral-600 sm:table-cell">
                    —
                  </td>
                  <td className="px-3 py-2.5 text-center font-sport text-lg text-neutral-400">1</td>
                </tr>
              );
            })}
          </tbody>
        </table>
    </div>
  );
}
