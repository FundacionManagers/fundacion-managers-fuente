import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Star, Trophy } from 'lucide-react';
import { TeamCrest } from '@/components/torneo/TeamCrest';
import { TorneoShell } from '@/components/torneo/TorneoShell';
import {
  CAMPEON_VIGENTE,
  EDICION_EN_CURSO,
  MAXIMO_GANADOR,
  MAXIMO_GANADOR_ES_OTRO,
  ordinalFemenino,
  pillEdicion,
} from '@/lib/torneo';
import { EQUIPOS } from '@/lib/torneo-data';

export const metadata: Metadata = {
  title: 'Equipos · Torneo Managers',
  description: `Los ocho clubes de la ${ordinalFemenino(EDICION_EN_CURSO.numero)} edición del Torneo Managers F7.`,
};

export default function EquiposPage() {
  // El destacado es el campeon VIGENTE, no el club con mas titulos: son dos
  // cosas distintas y la pagina llego a confundirlas.
  const campeon = EQUIPOS.find((e) => e.nombre === CAMPEON_VIGENTE.equipo)!;
  const resto = EQUIPOS.filter((e) => e.slug !== campeon.slug);

  // El maximo ganador solo tiene bloque propio si es OTRO club. Hoy el unico
  // palmares demostrable con una final publicada es el de The Originals, asi
  // que coincide con el campeon vigente y el bloque no se pinta.
  const maximoGanador = MAXIMO_GANADOR_ES_OTRO
    ? EQUIPOS.find((e) => e.nombre === MAXIMO_GANADOR.equipo)
    : undefined;

  return (
    <TorneoShell eyebrow={pillEdicion(EDICION_EN_CURSO)} title="Clubes" active="/torneo/equipos/">
      {/* Campeón vigente destacado */}
      <Link
        href={`/torneo/equipos/${campeon.slug}/`}
        className="sweep group relative block overflow-hidden rounded-3xl border border-amarillo/40 bg-gradient-to-br from-[#1a1308] via-[#0d1218] to-[#0b0f14] p-8 shadow-[0_30px_80px_rgba(0,0,0,0.6)] lg:p-12"
      >
        <span
          aria-hidden
          className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-amarillo/15 blur-3xl"
        />
        <div className="relative flex flex-col items-center gap-8 sm:flex-row sm:gap-12">
          <TeamCrest slug={campeon.slug} size={170} showStars />
          <div className="text-center sm:text-left">
            <p className="flex items-center justify-center gap-2 font-bufon text-sm font-bold uppercase tracking-[0.25em] text-naranja sm:justify-start">
              <Trophy size={18} aria-hidden /> Campeón vigente
            </p>
            <h2 className="mt-2 font-sport text-6xl uppercase leading-none text-neutral-50 md:text-8xl">
              {campeon.nombre}
            </h2>
            <div className="mt-4 flex items-center justify-center gap-2 sm:justify-start">
              {Array.from({ length: campeon.titulos }, (_, i) => (
                <Star key={i} size={24} className="fill-amarillo text-amarillo" aria-hidden />
              ))}
              <span className="ml-2 font-mono text-xs uppercase tracking-widest text-neutral-500">
                {CAMPEON_VIGENTE.edicion}ª edición · {CAMPEON_VIGENTE.periodo}
              </span>
            </div>
            <p className="mt-4 max-w-md text-sm text-neutral-400">
              Defiende la corona en la {ordinalFemenino(EDICION_EN_CURSO.numero)} edición.
            </p>
          </div>
        </div>
      </Link>

      {/* Máximo ganador: el otro título honorífico, que no es lo mismo */}
      {maximoGanador ? (
        <Link
          href={`/torneo/equipos/${maximoGanador.slug}/`}
          className="group mt-5 flex items-center gap-5 rounded-2xl border border-white/10 bg-black/30 px-6 py-5 transition-colors hover:border-amarillo/40"
        >
          <TeamCrest slug={maximoGanador.slug} size={56} />
          <div className="min-w-0">
            <p className="font-bufon text-xs font-bold uppercase tracking-[0.25em] text-neutral-500">
              Máximo ganador
            </p>
            <p className="mt-1 font-sport text-3xl uppercase leading-none text-neutral-100">
              {maximoGanador.nombre}
            </p>
          </div>
          <span className="ml-auto flex shrink-0 items-center gap-1">
            {Array.from({ length: MAXIMO_GANADOR.titulos }, (_, i) => (
              <Star key={i} size={18} className="fill-amarillo/70 text-amarillo/70" aria-hidden />
            ))}
            <span className="ml-2 font-mono text-xs uppercase tracking-widest text-neutral-500">
              {MAXIMO_GANADOR.titulos} títulos
            </span>
          </span>
        </Link>
      ) : null}

      {/* Resto de clubes */}
      <h3 className="mt-16 font-sport text-4xl uppercase leading-none text-neutral-50 md:text-5xl">
        Los retadores
      </h3>
      <div className="energy-bar mt-4 h-1 w-full rounded-full opacity-70" />

      <ul className="stagger-in mt-10 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
        {resto.map((e) => (
          <li key={e.slug}>
            <Link
              href={`/torneo/equipos/${e.slug}/`}
              className="group flex h-full flex-col items-center gap-5 rounded-2xl border border-white/10 bg-gradient-to-br from-[#11161d] to-[#0b0f14] p-7 transition-all duration-300 ease-managers hover:-translate-y-2 hover:border-amarillo/50 hover:shadow-[0_28px_70px_rgba(0,0,0,0.6)]"
            >
              <TeamCrest slug={e.slug} size={92} />
              <span className="text-center font-serif text-base font-bold text-neutral-100">
                {e.nombre}
              </span>
              <span className="mt-auto inline-flex items-center gap-1 text-xs font-semibold text-neutral-500 transition-colors group-hover:text-amarillo">
                Ver club
                <ArrowRight
                  size={14}
                  aria-hidden
                  className="transition-transform duration-200 ease-managers group-hover:translate-x-1"
                />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </TorneoShell>
  );
}
