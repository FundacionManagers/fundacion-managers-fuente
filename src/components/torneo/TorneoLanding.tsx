import Link from 'next/link';
import { ArrowRight, Instagram, Star, Trophy } from 'lucide-react';
import { IconeBrand } from '@/components/shared/IconeBrand';
import { GoldCoin } from '@/components/shared/GoldCoin';
import { TorneoBackdrop } from '@/components/torneo/TorneoBackdrop';
import { TeamCrest } from '@/components/torneo/TeamCrest';
import { CampeonReveal } from '@/components/torneo/CampeonReveal';
import { TorneoNav } from '@/components/torneo/TorneoNav';
import { TablaPosiciones } from '@/components/torneo/TablaPosiciones';
import { RankingGoleadores } from '@/components/torneo/RankingGoleadores';
import { ALIANZA, ICONE_CYAN } from '@/lib/alianza';
import { jornadaActualDe, TOTAL_JORNADAS } from '@/lib/liga';
import { cargarLigaConAviso } from '@/lib/liga-supabase';
import {
  CAMPEON_VIGENTE,
  EDICIONES,
  EDICION_EN_CURSO,
  TORNEO_BIO,
  TORNEO_INSTAGRAM_URL,
} from '@/lib/torneo';
import { EQUIPOS, FINAL, ganadorDe, getEquipo } from '@/lib/torneo-data';

const STATS = [
  { v: String(EDICIONES.length), l: 'Ediciones' },
  { v: String(EQUIPOS.length), l: 'Equipos' },
  { v: '28+', l: 'Edad líderes' },
  { v: 'F7', l: 'Formato' },
] as const;

export async function TorneoLanding() {
  const datos = await cargarLigaConAviso();
  const jornadaActual = jornadaActualDe(datos.partidos);
  const campeonSlug = ganadorDe(FINAL);
  const campeon = campeonSlug ? getEquipo(campeonSlug) : undefined;
  const campeonVigente = EQUIPOS.find((e) => e.nombre === CAMPEON_VIGENTE.equipo);
  const loc = FINAL.local ? getEquipo(FINAL.local) : undefined;
  const vis = FINAL.visitante ? getEquipo(FINAL.visitante) : undefined;

  return (
    <div className="tournament-section relative">
      <TorneoBackdrop seed={24} query="stadium,floodlights,crowd" />
      {/* ===== HERO ===== */}
      <section className="grain relative z-10 overflow-hidden">
        <span
          aria-hidden
          className="pointer-events-none absolute -left-10 top-10 select-none font-sport text-[34vw] leading-none text-white/[0.035]"
        >
          2026
        </span>

        <div className="relative mx-auto max-w-7xl px-6 pb-16 pt-20 lg:px-8 lg:pt-24">
          {/* Cintillo torneo */}
          <div className="animate-fade-up flex flex-wrap items-center justify-between gap-4">
            <span className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amarillo to-naranja px-4 py-1.5 font-bufon text-xs font-bold uppercase tracking-[0.15em] text-carbon">
              <span className="pulse-live h-2 w-2 rounded-full bg-carbon" />
              Torneo Managers F7 · Cuarta edición 2026-2
            </span>
            <a
              href={TORNEO_INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-400 transition-colors hover:text-amarillo"
            >
              <Instagram size={16} aria-hidden />
              @torneo_managers
            </a>
          </div>

          {/* CAMPEÓN — revelación épica del vigente. La edición sale de
              EDICIONES, no escrita aquí: al cerrar la 4ª se actualiza sola. */}
          <CampeonReveal
            slug={campeon?.slug ?? FINAL.visitante ?? 'the-originals'}
            nombre={campeon?.nombre ?? 'The Originals'}
            scoreText={`${vis?.corto ?? 'ORI'} ${FINAL.golesVisitante}–${FINAL.golesLocal} ${loc?.corto ?? 'PIB'}`}
            edicion={`Edición ${CAMPEON_VIGENTE.edicion}° (${CAMPEON_VIGENTE.periodo})`}
          />

          <p className="mt-10 max-w-2xl text-lg text-neutral-300">{TORNEO_BIO}</p>
        </div>

        {/* Marquee de equipos */}
        <div className="relative border-y border-white/10 bg-black/30 py-5">
          <div className="marquee flex w-max gap-12 px-6">
            {[...EQUIPOS, ...EQUIPOS].map((e, i) => (
              <span
                key={`${e.slug}-${i}`}
                className="flex items-center gap-3 font-sport text-2xl uppercase tracking-wide text-neutral-500"
              >
                <TeamCrest slug={e.slug} size={28} />
                {e.nombre}
              </span>
            ))}
          </div>
        </div>
      </section>

      <TorneoNav active="/torneo/" />

      {/* ===== NÚMEROS ===== */}
      <section className="grain relative z-10 overflow-hidden border-y border-white/10 bg-black/30 backdrop-blur-sm">
        <div className="relative mx-auto grid max-w-7xl grid-cols-2 gap-y-12 px-6 py-20 lg:grid-cols-4 lg:px-8">
          {STATS.map((s) => (
            <div key={s.l} className="text-center">
              <div className="text-energy font-sport text-7xl leading-none lg:text-8xl">{s.v}</div>
              <div className="mt-3 font-mono text-xs uppercase tracking-[0.25em] text-neutral-500">
                {s.l}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== FASE DE GRUPOS: TABLA Y GOLEADORES ===== */}
      <section id="fase-de-grupos" className="grain relative z-10 scroll-mt-24 overflow-hidden">
        <div className="relative mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-28">
          <span className="inline-flex items-center gap-2 rounded-full border border-amarillo/40 bg-amarillo/10 px-4 py-1.5 font-bufon text-xs font-bold uppercase tracking-[0.15em] text-amarillo">
            <span className="pulse-live h-2 w-2 rounded-full bg-amarillo" />
            Cuarta edición en curso · Fecha {jornadaActual} de {TOTAL_JORNADAS}
          </span>

          <div className="mt-10 space-y-24">
            <TablaPosiciones datos={datos} />
            <RankingGoleadores datos={datos} />
          </div>
        </div>
      </section>

      {/* ===== CAMINO AL TÍTULO ===== */}
      <section className="grain relative z-10 overflow-hidden">
        <div className="relative mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-28">
          <p className="font-bufon text-sm font-bold uppercase tracking-[0.25em] text-naranja">
            Camino al título
          </p>
          <h2 className="mt-2 max-w-2xl font-serif text-4xl font-bold leading-tight text-neutral-50 md:text-5xl">
            Ocho clubes. Una sola moneda dorada.
          </h2>

          <ul className="mt-12 grid grid-cols-2 gap-6 sm:grid-cols-4">
            {EQUIPOS.map((e) => (
              <li key={e.slug}>
                <Link
                  href={`/torneo/equipos/${e.slug}/`}
                  className="group flex flex-col items-center gap-4 rounded-2xl border border-white/10 bg-[#0d1218]/70 p-6 transition-all duration-300 ease-managers hover:-translate-y-1.5 hover:border-amarillo/50 hover:bg-[#11161d]"
                >
                  <TeamCrest slug={e.slug} size={84} showStars />
                  <span className="text-center font-serif text-sm font-bold text-neutral-100">
                    {e.nombre}
                  </span>
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-12">
            <Link
              href="/torneo/bracket/"
              className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amarillo to-naranja px-7 py-3.5 text-sm font-bold text-carbon transition-all duration-200 ease-managers hover:-translate-y-0.5"
            >
              Ver el bracket completo
              <ArrowRight
                size={18}
                aria-hidden
                className="transition-transform duration-200 ease-managers group-hover:translate-x-1"
              />
            </Link>
          </div>
        </div>
      </section>

      {/* ===== CAMPEÓN VIGENTE ===== */}
      <section className="grain relative z-10 overflow-hidden">
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-6 py-24 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
          <div className="flex justify-center">
            {/* El escudo y la edición salen de EDICIONES, no escritos aquí:
                esta seccion llego a decir "3° Edición" a mano. */}
            <TeamCrest slug={campeonVigente?.slug ?? ''} size={220} showStars />
          </div>
          <div>
            <p className="flex items-center gap-2 font-bufon text-sm font-bold uppercase tracking-[0.25em] text-naranja">
              <Trophy size={18} aria-hidden /> Vigente Campeón · {CAMPEON_VIGENTE.edicion}° Edición
              ({CAMPEON_VIGENTE.periodo})
            </p>
            <h2 className="mt-3 font-sport text-6xl uppercase leading-none text-neutral-50 md:text-8xl">
              {CAMPEON_VIGENTE.equipo}
            </h2>
            <div className="mt-5 flex items-center gap-2">
              {Array.from({ length: CAMPEON_VIGENTE.titulos }, (_, i) => (
                <Star key={i} size={28} className="fill-amarillo text-amarillo" aria-hidden />
              ))}
            </div>
            <p className="mt-6 max-w-lg text-lg text-neutral-300">
              {CAMPEON_VIGENTE.descripcion} Defenderá su corona en la {EDICION_EN_CURSO.numero}°
              Edición ({EDICION_EN_CURSO.periodo}).
            </p>
            {/* El palmarés completo vive en su propia pestaña: estuvo como
                sección al final de esta página y ahí no lo encontraba nadie. */}
            <Link
              href="/torneo/palmares/"
              className="group mt-8 inline-flex items-center gap-2 rounded-full border border-amarillo/40 px-6 py-3 text-sm font-bold text-amarillo transition-all duration-200 ease-managers hover:-translate-y-0.5 hover:bg-amarillo/10"
            >
              Ver el palmarés de las {EDICIONES.length} ediciones
              <ArrowRight
                size={18}
                aria-hidden
                className="transition-transform duration-200 ease-managers group-hover:translate-x-1"
              />
            </Link>
          </div>
        </div>
      </section>

      {/* ===== MANAGERS LAB (alianza transversal) ===== */}
      <section className="grain relative z-10 overflow-hidden">
        <div className="relative mx-auto max-w-7xl px-6 py-16 lg:px-8">
          <Link
            href="/alianza/"
            className="group flex flex-col gap-5 rounded-3xl border bg-[#0d1218]/85 p-10 backdrop-blur-sm transition-all duration-200 ease-managers hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(0,212,255,0.22)] lg:flex-row lg:items-center lg:justify-between"
            style={{ borderColor: 'rgba(0,212,255,0.35)' }}
          >
            <div>
              <p
                className="font-mono text-caption uppercase tracking-[0.3em]"
                style={{ color: ICONE_CYAN }}
              >
                {ALIANZA.nombre} · powered by <IconeBrand className="text-xs" />
              </p>
              <h2 className="mt-3 font-serif text-3xl font-bold text-neutral-50 md:text-4xl">
                El torneo también decide con datos
              </h2>
              <p className="mt-3 max-w-2xl text-neutral-300">
                Analítica de rendimiento, lectura de partido y decisiones en cancha potenciadas con
                la inteligencia artificial de la alianza ICONE ialabs. El mismo músculo que se
                entrena jugando, amplificado con IA.
              </p>
            </div>
            <span
              className="inline-flex shrink-0 items-center gap-2 self-start rounded-full px-6 py-3 text-sm font-semibold text-carbon transition-transform duration-200 ease-managers group-hover:translate-x-1 lg:self-auto"
              style={{ backgroundColor: ICONE_CYAN }}
            >
              Conoce Managers Lab
              <ArrowRight size={18} aria-hidden />
            </span>
          </Link>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="grain relative z-10 overflow-hidden">
        <div className="relative mx-auto max-w-4xl px-6 py-28 text-center lg:px-8">
          <h2 className="font-sport text-5xl uppercase leading-[0.9] text-neutral-50 md:text-7xl">
            ¿Tu equipo quiere
            <br />
            <span className="text-energy">la cuarta moneda?</span>
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-neutral-300">
            Inscripciones de la Edición 4° (2026-2) llegan pronto. Déjanos tus datos y te avisamos
            primero.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link
              href="/torneo/inscripciones/"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amarillo to-naranja px-8 py-4 text-sm font-bold text-carbon shadow-[0_12px_40px_rgba(232,114,44,0.4)] transition-all duration-200 ease-managers hover:-translate-y-0.5"
            >
              <GoldCoin size={30} className="drop-shadow-none" ariaLabel="" />
              Inscribir un equipo
              <ArrowRight size={18} aria-hidden />
            </Link>
            <a
              href={TORNEO_INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-white/25 px-8 py-4 text-sm font-semibold text-neutral-100 transition-colors duration-200 ease-managers hover:border-amarillo hover:text-amarillo"
            >
              <Instagram size={18} aria-hidden />
              Síguenos
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
