'use client';

import { useEffect, useState } from 'react';
import { CalendarClock } from 'lucide-react';
import { TeamCrest } from '@/components/torneo/TeamCrest';
import {
  diaCortoDe,
  diaRelativoDe,
  jornadaEnVariosDias,
  type Compromiso,
  type DiaRelativo,
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
export function ProximaFecha({ compromiso }: { compromiso: Compromiso }) {
  const { titulo, etiqueta, iso, partidos } = compromiso;
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
        {partidos.length ? ` · ${partidos.length} partidos desde las ${horas[0]}` : ''}
      </p>

      {/* Los cruces con su hora. Esta fecha ya no se repite abajo en el
          fixture, así que aquí va todo lo que hace falta para saber cuándo
          juega tu equipo.

          Una ronda de la fase final llega sin partidos hasta que termine la
          fase de grupos y se sorteen los cruces: entonces se dice eso, en
          vez de dejar el hueco vacío. */}
      {partidos.length ? (
        <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-3">
          {partidos.map((p) => (
            <li key={p.id} className="flex items-center gap-1.5">
              <TeamCrest slug={p.local} size={24} />
              <span className="font-bufon text-[11px] uppercase tracking-widest text-neutral-500">
                vs
              </span>
              <TeamCrest slug={p.visitante} size={24} />
              <span className="ml-1 whitespace-nowrap font-mono text-[11px] text-neutral-500">
                {variosDias ? `${diaCortoDe(p)} ` : ''}
                {p.hora}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-sm text-neutral-500">
          Equipos y horarios por definir. Los cruces salen de la tabla al cerrar la fase de grupos.
        </p>
      )}
    </div>
  );
}
