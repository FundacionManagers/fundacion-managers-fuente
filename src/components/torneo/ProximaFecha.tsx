'use client';

import { useEffect, useState } from 'react';
import { CalendarClock } from 'lucide-react';
import { TeamCrest } from '@/components/torneo/TeamCrest';
import { isoDe, type PartidoLiga } from '@/lib/liga';

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
  jornada,
  etiqueta,
  partidos,
}: {
  jornada: number;
  etiqueta: string;
  partidos: readonly PartidoLiga[];
}) {
  // null hasta que monta en el navegador: en el servidor no hay "hoy" que
  // valga, y pintar uno provocaría un desajuste de hidratación.
  const [cuando, setCuando] = useState<string | null>(null);

  useEffect(() => {
    if (!partidos.length) return;

    function calcular() {
      const inicio = new Date(isoDe(partidos[0]!));
      const ahora = new Date();

      // Se comparan días de calendario, no milisegundos: a las 23:00 de la
      // víspera faltan 8 horas, pero para quien lo lee es "mañana".
      const soloDia = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
      const dias = Math.round((soloDia(inicio) - soloDia(ahora)) / 86400000);

      if (dias < 0) return 'En juego';
      if (dias === 0) return 'Hoy';
      if (dias === 1) return 'Mañana';
      if (dias < 7) return `En ${dias} días`;
      if (dias < 14) return 'La próxima semana';
      return `En ${Math.round(dias / 7)} semanas`;
    }

    setCuando(calcular());
    const id = setInterval(() => setCuando(calcular()), 60_000);
    return () => clearInterval(id);
  }, [partidos]);

  if (!partidos.length) return null;

  const horas = [...new Set(partidos.map((p) => p.hora))].sort();
  const inminente = cuando === 'Hoy' || cuando === 'Mañana' || cuando === 'En juego';

  return (
    <div
      className={`rounded-2xl border p-5 sm:p-6 ${
        inminente ? 'border-amarillo/50 bg-amarillo/[0.07]' : 'border-white/10 bg-black/40'
      }`}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
        <p className="flex items-center gap-2 font-bufon text-xs font-bold uppercase tracking-[0.25em] text-naranja">
          <CalendarClock size={16} aria-hidden />
          Próxima fecha
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
        Fecha {jornada}
      </h3>
      <p className="mt-1 text-sm text-neutral-400">
        {etiqueta} · {partidos.length} partidos desde las {horas[0]}
      </p>

      <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-3">
        {partidos.map((p) => (
          <li key={p.id} className="flex items-center gap-1.5">
            <TeamCrest slug={p.local} size={24} />
            <span className="font-bufon text-[11px] uppercase tracking-widest text-neutral-500">
              vs
            </span>
            <TeamCrest slug={p.visitante} size={24} />
            <span className="ml-1 font-mono text-[11px] text-neutral-500">{p.hora}</span>
          </li>
        ))}
      </ul>

      <a
        href={`#fecha-${jornada}`}
        className="mt-5 inline-flex items-center gap-1.5 text-xs font-bold text-amarillo transition-colors hover:text-naranja"
      >
        Ver los partidos de la Fecha {jornada} ↓
      </a>
    </div>
  );
}
