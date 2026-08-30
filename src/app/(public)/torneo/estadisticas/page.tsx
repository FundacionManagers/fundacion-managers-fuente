import type { Metadata } from 'next';
import Link from 'next/link';
import { Trophy } from 'lucide-react';
import { RankingGoleadores } from '@/components/torneo/RankingGoleadores';
import { TeamCrest } from '@/components/torneo/TeamCrest';
import { TorneoShell } from '@/components/torneo/TorneoShell';
import {
  EDICION_ACTUAL,
  calcularPosiciones,
  cifrasDeEdicion,
  jornadaActualDe,
  mejorDefensa,
  puntosJuegoLimpio,
  tablaJuegoLimpio,
} from '@/lib/liga';
import { cargarLigaConAviso } from '@/lib/liga-supabase';
import { getEquipo } from '@/lib/torneo-data';
import { EDICION_EN_CURSO, ordinalFemenino, pillEdicion } from '@/lib/torneo';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Estadísticas · Torneo Managers',
  description: `Goleadores, juego limpio y cifras de la ${ordinalFemenino(EDICION_EN_CURSO.numero)} edición del Torneo Managers F7.`,
};

/**
 * Estadísticas lee exactamente la misma fuente que el Resumen
 * (`cargarLigaConAviso`), no un dataset propio.
 *
 * Esta página llegó a publicar "Por confirmar" en el podio y un MVP sin
 * nombre mientras la portada ya mostraba los 45 goleadores con dorsal y
 * goles: eran dos fuentes distintas para el mismo dato. Ahora hay una sola,
 * así que no pueden volver a contradecirse. Las cifras de abajo salen del
 * mismo calendario que la tabla por la misma razón.
 */
export default async function EstadisticasPage() {
  const datos = await cargarLigaConAviso();
  const lider = datos.goleadores[0] ?? null;
  const equipoLider = lider ? getEquipo(lider.equipo) : undefined;
  const jornada = jornadaActualDe(datos.partidos);

  const posiciones = calcularPosiciones(datos.partidos, datos.disciplina);
  const juegoLimpio = tablaJuegoLimpio(posiciones);
  const cifras = cifrasDeEdicion(datos.partidos);
  const defensa = mejorDefensa(posiciones);

  const goleado = cifras.masGoleado;
  const localGoleado = goleado ? getEquipo(goleado.local) : undefined;
  const visitaGoleada = goleado ? getEquipo(goleado.visitante) : undefined;

  return (
    <TorneoShell
      eyebrow={pillEdicion(EDICION_EN_CURSO)}
      title="Estadísticas"
      active="/torneo/estadisticas/"
    >
      {/* Líder de la bota de oro: el dato real, no un MVP sin nombre.
          Ocupaba casi una pantalla entera para decir exactamente lo que el
          podio repite ocho líneas más abajo —mismo jugador, mismo club, mismo
          dorsal, mismos goles—, así que va compacto. */}
      {lider ? (
        <div className="sweep relative overflow-hidden rounded-2xl border border-amarillo/40 bg-gradient-to-br from-[#1a1308] via-[#0d1218] to-[#0b0f14] p-6 lg:p-8">
          <span
            aria-hidden
            className="pointer-events-none absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-naranja/15 blur-3xl"
          />
          <div className="relative flex flex-wrap items-center gap-x-6 gap-y-4">
            <TeamCrest slug={lider.equipo} size={72} />
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-2 font-bufon text-xs font-bold uppercase tracking-[0.25em] text-naranja">
                <Trophy size={15} aria-hidden /> Líder de la bota de oro
              </p>
              {/* El nombre del jugador iba como <h2>, por encima del título de
                  la sección que lo contiene. Ahora la jerarquía la marcan las
                  secciones, no las personas. */}
              <p className="mt-1.5 font-sport text-4xl uppercase leading-none text-neutral-50 md:text-5xl">
                {lider.jugador}
              </p>
              <p className="mt-2 text-sm text-neutral-400">
                {equipoLider?.nombre ?? lider.equipo} · dorsal {lider.numero}
              </p>
            </div>
            <p className="font-sport text-5xl leading-none text-amarillo">
              {lider.goles}
              <span className="ml-2 font-bufon text-[10px] uppercase tracking-widest text-neutral-500">
                {lider.goles === 1 ? 'gol' : 'goles'}
              </span>
            </p>
          </div>
        </div>
      ) : null}

      {/* ===== CIFRAS DE LA EDICIÓN =====
          La página se llamaba "Estadísticas" y solo tenía goleadores. Todo
          esto sale del calendario y de la tabla, así que no puede
          contradecirlas. */}
      <section className="mt-16">
        <p className="font-bufon text-sm font-bold uppercase tracking-[0.25em] text-naranja">
          La edición en números
        </p>
        <h2 className="mt-1 font-sport text-4xl uppercase leading-none text-neutral-50 md:text-5xl">
          Cómo va la {ordinalFemenino(EDICION_ACTUAL)}
        </h2>
        <div className="energy-bar mt-5 h-1 w-full rounded-full opacity-70" />

        {/* Las dos primeras son un número y una línea: en un móvil caben de
            dos en dos. Las otras llevan club o marcador y se quedan el ancho
            entero hasta que hay sitio de sobra. */}
        <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
            <p className="font-sport text-4xl leading-none text-amarillo">{cifras.goles}</p>
            <p className="mt-2 font-mono text-[11px] uppercase tracking-widest text-neutral-500">
              Goles en {cifras.partidos} partidos
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
            <p className="font-sport text-4xl leading-none text-amarillo">
              {cifras.promedio?.toFixed(2).replace('.', ',') ?? '—'}
            </p>
            <p className="mt-2 font-mono text-[11px] uppercase tracking-widest text-neutral-500">
              Goles por partido
            </p>
          </div>

          {defensa ? (
            <Link
              href={`/torneo/equipos/${defensa.equipo}/`}
              className="group col-span-2 rounded-2xl border border-white/10 bg-black/30 p-5 transition-colors hover:border-amarillo/40 lg:col-span-1"
            >
              <p className="font-sport text-4xl leading-none text-amarillo">{defensa.gc}</p>
              <p className="mt-2 font-mono text-[11px] uppercase tracking-widest text-neutral-500">
                Goles en contra · la valla menos vencida
              </p>
              <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-neutral-200">
                <TeamCrest slug={defensa.equipo} size={22} />
                {getEquipo(defensa.equipo)?.nombre ?? defensa.equipo}
              </p>
            </Link>
          ) : null}

          {goleado ? (
            <div className="col-span-2 rounded-2xl border border-white/10 bg-black/30 p-5 lg:col-span-1">
              <p className="font-sport text-4xl leading-none text-amarillo">
                {(goleado.golesLocal ?? 0) + (goleado.golesVisitante ?? 0)}
              </p>
              <p className="mt-2 font-mono text-[11px] uppercase tracking-widest text-neutral-500">
                Goles · el partido más goleado
              </p>
              <p className="mt-2 text-sm font-semibold leading-tight text-neutral-200">
                {localGoleado?.nombre ?? goleado.local} {goleado.golesLocal}–
                {goleado.golesVisitante} {visitaGoleada?.nombre ?? goleado.visitante}
              </p>
              <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-neutral-600">
                Fecha {goleado.jornada}
              </p>
            </div>
          ) : null}
        </div>
      </section>

      {/* ===== JUEGO LIMPIO =====
          Se publicaba solo al ganador —"4 amarillas · 0 rojas"— sin nadie con
          quien compararlo, y encima se leía como una contradicción: quien
          gana puede tener más amarillas que otro y ganar igual, porque una
          roja pesa como tres amarillas. Con los ocho delante, la regla se
          explica sola. Tampoco tenía título de sección: flotaba entre la
          tarjeta del líder y el ranking. */}
      <section className="mt-20">
        <p className="font-bufon text-sm font-bold uppercase tracking-[0.25em] text-naranja">
          Disciplina · Artículo 14
        </p>
        <h2 className="mt-1 font-sport text-4xl uppercase leading-none text-neutral-50 md:text-5xl">
          Juego limpio
        </h2>
        <div className="energy-bar mt-5 h-1 w-full rounded-full opacity-70" />
        <p className="mt-4 max-w-3xl text-xs leading-relaxed text-neutral-500">
          Se cuenta una tarjeta por amarilla y tres por roja, así que un club con menos amarillas
          puede quedar por debajo de otro que tenga más. Con la misma puntuación manda quien vaya
          mejor en la tabla. Es el segundo criterio de desempate del Artículo 14, justo después de
          los puntos.
        </p>

        <ul className="mt-8 space-y-2.5">
          {juegoLimpio.map((f, i) => {
            const eq = getEquipo(f.equipo);
            return (
              <li key={f.equipo}>
                <Link
                  href={`/torneo/equipos/${f.equipo}/`}
                  className={cn(
                    'flex items-center gap-3 rounded-xl border px-4 py-3 transition-colors hover:border-amarillo/50',
                    i === 0 ? 'border-amarillo/40 bg-amarillo/[0.06]' : 'border-white/10 bg-black/30',
                  )}
                >
                  <span
                    className={cn(
                      'w-6 shrink-0 text-center font-mono text-[11px]',
                      i === 0 ? 'text-amarillo' : 'text-neutral-600',
                    )}
                  >
                    {i + 1}
                  </span>
                  <TeamCrest slug={f.equipo} size={30} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-neutral-200">
                      {eq?.nombre ?? f.equipo}
                    </span>
                    <span className="block font-mono text-[10px] uppercase leading-relaxed tracking-widest text-neutral-500">
                      {f.posicion}º en la tabla · {f.ta} {f.ta === 1 ? 'amarilla' : 'amarillas'} ·{' '}
                      {f.tr} {f.tr === 1 ? 'roja' : 'rojas'}
                    </span>
                  </span>
                  <span
                    className={cn(
                      'shrink-0 font-sport text-2xl leading-none',
                      i === 0 ? 'text-amarillo' : 'text-neutral-500',
                    )}
                  >
                    {puntosJuegoLimpio(f)}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <div className="mt-20">
        <RankingGoleadores datos={datos} />
      </div>

      <p className="mt-8 border-t border-white/5 pt-5 text-xs leading-relaxed text-neutral-600">
        Todo lo de esta página se calcula desde los resultados que carga la organización, hasta la
        fecha {jornada}. Sale de la misma fuente que{' '}
        <Link href="/torneo/#fase-de-grupos" className="text-neutral-400 hover:text-amarillo">
          la tabla de posiciones
        </Link>
        , así que no pueden contradecirse.
      </p>
    </TorneoShell>
  );
}
