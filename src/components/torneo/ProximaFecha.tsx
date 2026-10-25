'use client';

import { useEffect, useState } from 'react';
import { CalendarClock } from 'lucide-react';
import { TeamCrest } from '@/components/torneo/TeamCrest';
import { getEquipo } from '@/lib/torneo-data';
import {
  TITULO_COPA,
  diaCortoDe,
  diaRelativoDe,
  grupoDePartido,
  jornadaEnVariosDias,
  type Compromiso,
  type DiaRelativo,
  type Suspension,
} from '@/lib/liga';

/**
 * Tarjeta de la próxima fecha, arriba del fixture.
 *
 * Por qué existe: para llegar a la fecha que viene había que bajar hasta el
 * 58% de la página, pasando por cinco jornadas ya jugadas, y una que se
 * juega mañana se veía igual que otra que falta un mes — las dos decían
 * "Programada". Lo que la gente entra a buscar estaba enterrado.
 *
 * Por qué es un componente de cliente: el sitio es estático y se recompila
 * solo cuando cambian los datos, así que un "faltan 2 días" calculado en el
 * build se quedaría congelado y mentiría a los pocos días. La cuenta se hace
 * en el navegador de quien mira, contra su reloj.
 */
export function ProximaFecha({
  compromiso,
  suspendidos = [],
}: {
  compromiso: Compromiso;
  /** Quién no puede jugar por una roja. Sale de las tarjetas, no se escribe. */
  suspendidos?: readonly Suspension[];
}) {
  const { titulo, etiqueta, iso, partidos, cruces } = compromiso;
  // null hasta que monta en el navegador: en el servidor no hay "hoy" que
  // valga, y pintar uno provocaría un desajuste de hidratación.
  const [cuando, setCuando] = useState<DiaRelativo>(null);

  // La cuenta vive en `diaRelativoDe`, en la librería, porque la comparten
  // esta tarjeta y la ficha de cada club: una sola de las dos equivocándose
  // sería peor que ninguna.
  useEffect(() => {
    const calcular = () => diaRelativoDe(iso, new Date());
    setCuando(calcular());
    const id = setInterval(() => setCuando(calcular()), 60_000);
    return () => clearInterval(id);
  }, [iso]);

  const horas = [...new Set(partidos.map((p) => p.hora))].sort();
  const variosDias = jornadaEnVariosDias(partidos);
  const pendiente = cuando === 'Resultados en camino';
  const inminente = cuando === 'Hoy' || cuando === 'Mañana' || pendiente;
  const rotulo = pendiente ? 'Última fecha' : 'Próxima fecha';

  return (
    <div
      className={`rounded-2xl border p-5 sm:p-6 ${
        inminente ? 'border-amarillo/50 bg-amarillo/[0.07]' : 'border-white/10 bg-black/40'
      }`}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
        <p className="flex items-center gap-2 font-bufon text-xs font-bold uppercase tracking-[0.25em] text-naranja">
          <CalendarClock size={16} aria-hidden />
          {rotulo}
        </p>
        {/* Reserva el hueco antes de saber el día, para que la tarjeta no
            dé un salto al montar. */}
        <span
          className={`font-sport text-2xl uppercase leading-none ${
            inminente ? 'text-amarillo' : 'text-neutral-300'
          }`}
        >
          {cuando ?? ' '}
        </span>
      </div>

      <h3 className="mt-3 font-sport text-4xl uppercase leading-none text-neutral-50 md:text-5xl">
        {titulo}
      </h3>
      <p className="mt-1 text-sm text-neutral-400">
        {etiqueta}
        {partidos.length
          ? ` · ${partidos.length} ${partidos.length === 1 ? 'partido' : 'partidos'} desde las ${horas[0]}`
          : ''}
      </p>

      {/* Los cruces con su hora. Esta fecha ya no se repite abajo en el
          fixture, así que aquí va todo lo que hace falta para saber cuándo
          juega tu equipo.

          Una ronda de la fase final llega sin partidos hasta que termine la
          fase de grupos y se sorteen los cruces: entonces se dice eso, en
          vez de dejar el hueco vacío. */}
      {partidos.length ? (
        <ul className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {partidos.map((p) => (
            <li
              key={p.id}
              className="rounded-xl border border-white/10 bg-black/25 px-3 py-3 text-center"
            >
              <p className="font-mono text-sm font-semibold text-amarillo">
                {variosDias ? `${diaCortoDe(p)} ` : ''}
                {p.hora}
              </p>
              {/* De qué es el partido: el grupo en la fase de grupos, la copa
                  en la final. Las dos copas juegan la misma ronda las mismas
                  noches, y sin esto no se distingue una semifinal de otra. */}
              <p className="mt-0.5 font-bufon text-[10px] uppercase tracking-[0.2em] text-neutral-500">
                {p.copa
                  ? TITULO_COPA[p.copa]
                  : grupoDePartido(p)
                    ? `Grupo ${grupoDePartido(p)}`
                    : ''}
              </p>
              <div className="mt-2 space-y-1.5">
                <Rival slug={p.local} />
                <Rival slug={p.visitante} />
              </div>
            </li>
          ))}
        </ul>
      ) : cruces?.length ? (
        <>
          <ul className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {cruces.map((c) => (
              <li
                key={c.id}
                className="rounded-xl border border-white/10 bg-black/25 px-3 py-3 text-center"
              >
                <p className="font-mono text-sm font-semibold text-neutral-400">{c.etiqueta}</p>
                <p className="mt-0.5 font-bufon text-[10px] uppercase tracking-[0.2em] text-neutral-500">
                  {TITULO_COPA[c.copa]}
                </p>
                <div className="mt-2 space-y-1.5">
                  <Rival slug={c.local} />
                  <Rival slug={c.visitante} />
                </div>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm text-neutral-500">
            Horarios por confirmar. Los cruces salen de las tablas de grupo: el mejor ubicado hace
            de local.
          </p>
        </>
      ) : (
        <p className="mt-4 text-sm text-neutral-500">
          Equipos y horarios por definir. Los cruces salen de las tablas al cerrar la fase de
          grupos.
        </p>
      )}

      {/* Los suspendidos de esta fecha. El documento de la organización los
          anuncia aparte, «Suspendidos para la Fecha 2 por tarjeta roja», y es
          justo lo que un capitán necesita saber antes de armar el equipo. */}
      {suspendidos.length ? (
        <div className="mt-5 rounded-xl border border-red-500/30 bg-red-500/[0.07] px-4 py-3">
          <p className="flex items-center gap-2 font-bufon text-[11px] font-bold uppercase tracking-[0.2em] text-red-300">
            <span className="inline-block h-3.5 w-2.5 rounded-[2px] bg-red-600" aria-hidden />
            Suspendidos por tarjeta roja
          </p>
          <ul className="mt-2 flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-neutral-200">
            {suspendidos.map((s) => (
              <li key={`${s.equipo}-${s.numero}-${s.origen}`} className="flex items-center gap-2">
                <TeamCrest slug={s.equipo} size={22} />
                <span>
                  <strong>#{s.numero}</strong> de {getEquipo(s.equipo)?.nombre ?? s.equipo}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

/**
 * Un club dentro de la tarjeta: escudo y, sobre todo, su nombre escrito.
 *
 * Antes cada cruce eran dos escudos de 24 px con la hora en gris tenue de
 * 11 px. En la portada —que es donde llega casi todo el mundo— no se
 * distinguia quien jugaba contra quien sin acercar la cara a la pantalla.
 * Un escudo pequeño no sustituye a un nombre: hay que escribirlo.
 *
 * El nombre va completo y puede partirse en dos lineas. No se recorta: en
 * la llave se veian "Los Pibes del B..." y "La Banda Cru...", que es
 * exactamente lo que se corrigio en Palmares en su momento.
 */
function Rival({ slug }: { slug: string | null }) {
  const eq = slug ? getEquipo(slug) : undefined;
  return (
    <p className="flex items-center gap-2 text-left">
      <TeamCrest slug={slug} size={32} />
      <span className="text-[13px] font-semibold leading-tight text-neutral-200">
        {eq?.nombre ?? 'Por definir'}
      </span>
    </p>
  );
}
