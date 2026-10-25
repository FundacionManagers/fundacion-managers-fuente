import Link from 'next/link';
import { ArrowRight, Instagram, Star, Trophy } from 'lucide-react';
import { IconeBrand } from '@/components/shared/IconeBrand';
import { GoldCoin } from '@/components/shared/GoldCoin';
import { TorneoBackdrop } from '@/components/torneo/TorneoBackdrop';
import { TeamCrest } from '@/components/torneo/TeamCrest';
import { TorneoNav } from '@/components/torneo/TorneoNav';
import { TablaPosiciones } from '@/components/torneo/TablaPosiciones';
import { RankingGoleadores } from '@/components/torneo/RankingGoleadores';
import { ProximaFecha } from '@/components/torneo/ProximaFecha';
import { ALIANZA, ICONE_CYAN } from '@/lib/alianza';
import {
  CALENDARIO_FASE_FINAL,
  COPAS,
  cruzarFaseFinal,
  jornadaActualDe,
  posicionesPorGrupo,
  proximoCompromiso,
  suspendidosDelCompromiso,
  TOTAL_JORNADAS,
} from '@/lib/liga';
import { cargarLigaConAviso } from '@/lib/liga-supabase';
import {
  CAMPEON_VIGENTE,
  EDICIONES_DISPUTADAS,
  EDICION_EN_CURSO,
  EDICION_INSCRIPCIONES,
  FINAL_ANTERIOR,
  TORNEO_BIO,
  TORNEO_INSTAGRAM_URL,
  ordinalFemenino,
  pillEdicion,
  rotuloEdicion,
} from '@/lib/torneo';
import { EQUIPOS, getEquipo, LETRAS_GRUPO } from '@/lib/torneo-data';

const SEMIFINALES = CALENDARIO_FASE_FINAL.find((r) => r.fase === 'semifinal');
const GRAN_FINAL = CALENDARIO_FASE_FINAL.find((r) => r.fase === 'final');

/**
 * Las cifras del formato de esta edición. Eran «Ediciones, Equipos, 28+ y
 * F7»: datos que no cambian nunca y que la bio y el pill ya decían dos líneas
 * más arriba. Lo nuevo de la 5ª es el formato, y salen todas del código.
 */
const STATS = [
  { v: String(LETRAS_GRUPO.length), l: 'Grupos' },
  { v: String(COPAS.length), l: 'Copas' },
  { v: String(TOTAL_JORNADAS), l: 'Fechas de grupos' },
  { v: GRAN_FINAL ? GRAN_FINAL.fecha.slice(0, 5) : '—', l: 'Gran Final' },
] as const;

export async function TorneoLanding() {
  const datos = await cargarLigaConAviso();
  const jornadaActual = jornadaActualDe(datos.partidos);
  const campeonVigente = EQUIPOS.find((e) => e.nombre === CAMPEON_VIGENTE.equipo);
  // Lo próximo que se juega: una fecha de grupos, o una ronda de la
  // fase final cuando ya no queden fechas por delante.
  // La disciplina va porque el desempate del Artículo 14 pone el fair play
  // antes que la diferencia de gol: sin ella los cruces saldrían en otro orden.
  const proximo = proximoCompromiso(datos.partidos, datos.eliminatoria, datos.disciplina);
  const suspendidos = proximo
    ? suspendidosDelCompromiso(proximo, datos.tarjetas, [...datos.partidos, ...datos.eliminatoria])
    : [];
  // Cómo se cruzarían las copas si la fase de grupos terminara hoy.
  const cruces = cruzarFaseFinal(posicionesPorGrupo(datos.partidos, datos.disciplina));

  return (
    <div className="tournament-section relative">
      <TorneoBackdrop />
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
              Torneo Managers F7 · {pillEdicion(EDICION_EN_CURSO)}
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

          {/* El hero abre con el torneo que se está jugando.
              Antes abría con la revelación del campeón de la 3ª edición: lo
              primero que se leía era "TORNEO FINALIZADO", justo debajo del
              pill que anuncia la cuarta edición en curso. Dos líneas seguidas
              diciendo lo contrario, y el estado real —Fecha 5 de 7— no
              aparecía hasta el 17% de la página. La celebración del campeón
              se mudó al Palmarés, que es su sitio. */}
          <h1 className="mt-10 font-sport text-[15vw] uppercase leading-[0.85] text-neutral-50 drop-shadow-[0_6px_24px_rgba(0,0,0,0.7)] lg:text-[120px]">
            Torneo
            <br />
            Managers
          </h1>
          <div className="energy-bar mt-6 h-1.5 w-40 rounded-full" />

          <p className="mt-8 max-w-2xl text-lg text-neutral-300">{TORNEO_BIO}</p>

          {/* La próxima fecha, en la portada. El Calendario ya la anunciaba y
              la pestaña titila, pero el Resumen era la única página que no
              sabía que mañana se juega. */}
          {proximo ? (
            <div className="mt-10 max-w-2xl">
              <ProximaFecha compromiso={proximo} suspendidos={suspendidos} />
            </div>
          ) : null}
        </div>

        {/* Marquee de equipos */}
        <div className="relative border-y border-white/10 bg-black/30 py-5">
          <div className="marquee flex w-max gap-12 px-6">
            {[...EQUIPOS, ...EQUIPOS].map((e, i) => (
              <span
                key={`${e.slug}-${i}`}
                // La segunda vuelta solo existe para que el bucle no se corte:
                // un lector de pantalla leía los ocho nombres dos veces.
                aria-hidden={i >= EQUIPOS.length || undefined}
                className="flex items-center gap-3 font-sport text-2xl uppercase tracking-wide text-neutral-300"
              >
                <TeamCrest slug={e.slug} size={28} />
                {e.nombre}
              </span>
            ))}
          </div>
        </div>
      </section>

      <TorneoNav active="/torneo/" avisoISO={proximo?.iso} />

      {/* ===== NÚMEROS ===== */}
      <section className="grain relative z-10 overflow-hidden border-y border-white/10 bg-black/30 backdrop-blur-sm">
        <div className="relative mx-auto grid max-w-7xl grid-cols-2 gap-y-12 px-6 py-20 lg:grid-cols-4 lg:px-8">
          {STATS.map((s) => (
            <div key={s.l} className="text-center">
              <div className="text-energy font-sport text-7xl leading-none lg:text-8xl">{s.v}</div>
              <div className="mt-3 font-mono text-xs uppercase tracking-[0.25em] text-neutral-300">
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
            {/* «Fecha 1 de 3» el día de la Fecha 2 se leía como que íbamos en la 1. */}
            {pillEdicion(EDICION_EN_CURSO)} en curso · {jornadaActual} de {TOTAL_JORNADAS} fechas
            jugadas
          </span>

          <div className="mt-10 space-y-24">
            <TablaPosiciones datos={datos} />
            {/* Top 10 y enlace: el ranking completo es la pestaña de
                Estadísticas, no un bloque que el Resumen deba copiar. */}
            <RankingGoleadores datos={datos} compacto />
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
            Dos copas. Así se cruzarían hoy.
          </h2>
          <p className="mt-4 max-w-2xl text-neutral-300">
            Los dos primeros de cada grupo van a la Copa Oro, que da el título; el tercero y el
            cuarto, a la Copa Plata. Los cruces se cierran con la última fecha de grupos.
          </p>

          {/* Era una cuadrícula con los ocho escudos, que la página ya muestra
              cuatro veces. El titular prometía un camino y no enseñaba
              ninguno, justo en la edición que estrena dos copas. */}
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {COPAS.map(({ copa, titulo }) => (
              <div
                key={copa}
                className={
                  copa === 'oro'
                    ? 'rounded-2xl border border-amarillo/40 bg-black/60 p-6'
                    : 'rounded-2xl border border-white/15 bg-black/60 p-6'
                }
              >
                <p
                  className={
                    copa === 'oro'
                      ? 'font-bufon text-sm font-bold uppercase tracking-[0.2em] text-amarillo'
                      : 'font-bufon text-sm font-bold uppercase tracking-[0.2em] text-neutral-200'
                  }
                >
                  {titulo} · Semifinales
                </p>
                <ul className="mt-4 space-y-3">
                  {cruces
                    .filter((c) => c.copa === copa)
                    .map((c) => (
                      <li key={c.id} className="rounded-xl border border-white/10 bg-black/30 p-3">
                        <p className="font-mono text-xs uppercase tracking-wider text-neutral-300">
                          {c.etiqueta}
                        </p>
                        {/* Un club por renglón: en el teléfono, los dos en la
                            misma línea partían «La Banda Cruzada FC» en tres. */}
                        {[c.local, c.visitante].map((slug, k) => (
                          <p
                            key={k}
                            className="mt-2 flex items-center gap-2 text-sm font-semibold text-neutral-100"
                          >
                            <TeamCrest slug={slug} size={24} />
                            {getEquipo(slug ?? '')?.nombre ?? 'Por definir'}
                          </p>
                        ))}
                      </li>
                    ))}
                </ul>
              </div>
            ))}
          </div>
          {SEMIFINALES?.etiqueta || GRAN_FINAL ? (
            <p className="mt-5 text-sm text-neutral-300">
              {SEMIFINALES?.etiqueta ? `Semifinales: ${SEMIFINALES.etiqueta}.` : ''}
              {GRAN_FINAL ? ` Tercer puesto y Gran Final: ${GRAN_FINAL.fecha}.` : ''}
            </p>
          ) : null}

          <div className="mt-10">
            <Link
              href="/torneo/bracket/"
              className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amarillo to-naranja px-7 py-3.5 text-sm font-bold text-carbon transition-all duration-200 ease-managers hover:-translate-y-0.5"
            >
              Ver la llave de las dos copas
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
            {/* El párrafo repetía el rótulo de arriba casi palabra por palabra.
                La final dice algo que el rótulo no dice. */}
            <p className="mt-6 max-w-lg text-lg text-neutral-300">
              {FINAL_ANTERIOR
                ? `Ganó la final a ${getEquipo(FINAL_ANTERIOR.rival)?.nombre ?? FINAL_ANTERIOR.rival}: ${FINAL_ANTERIOR.golesCampeon}–${FINAL_ANTERIOR.golesRival}${FINAL_ANTERIOR.penales ? ` y ${FINAL_ANTERIOR.penales.campeon}–${FINAL_ANTERIOR.penales.rival} en penales` : ''}. `
                : ''}
              Defiende la corona en la {ordinalFemenino(EDICION_EN_CURSO.numero)} edición.
            </p>
            {/* El palmarés completo vive en su propia pestaña: estuvo como
                sección al final de esta página y ahí no lo encontraba nadie. */}
            <Link
              href="/torneo/palmares/"
              className="group mt-8 inline-flex items-center gap-2 rounded-full border border-amarillo/40 px-6 py-3 text-sm font-bold text-amarillo transition-all duration-200 ease-managers hover:-translate-y-0.5 hover:bg-amarillo/10"
            >
              Ver el palmarés de las {EDICIONES_DISPUTADAS.length} ediciones
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
                la inteligencia artificial de la alianza ICONEialabs. El mismo músculo que se
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
          {/* La moneda y la edición son las de INSCRIPCIONES, no las de la
              edición en curso: quien llega aquí se apunta a la siguiente. */}
          <h2 className="font-sport text-5xl uppercase leading-[0.9] text-neutral-50 md:text-7xl">
            ¿Tu equipo quiere
            <br />
            <span className="text-energy">
              la {ordinalFemenino(EDICION_INSCRIPCIONES.numero)} moneda?
            </span>
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-neutral-300">
            Inscripciones de la {rotuloEdicion(EDICION_INSCRIPCIONES)} abiertas. Déjanos tus datos y
            te contamos los siguientes pasos.
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
