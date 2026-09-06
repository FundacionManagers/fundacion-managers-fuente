import Link from 'next/link';
import { ArrowRight, ArrowUpRight, Compass } from 'lucide-react';
import { GoldCoin } from '@/components/shared/GoldCoin';
import { IconeBrand } from '@/components/shared/IconeBrand';
import { SectionBackdrop } from '@/components/shared/SectionBackdrop';
import { CANTIDAD_EJES_CAP, DIAGNOSTICO, EJES_VISIBLES, hrefDeEje } from '@/lib/navigation';
import { ALIANZA, ICONE_CYAN } from '@/lib/alianza';
import { NORTE, OCIO_SERIO, PILARES } from '@/lib/strategy';
import {
  CAMPEON_VIGENTE,
  EDICIONES_DISPUTADAS,
  MAXIMO_GANADOR,
  MAXIMO_GANADOR_ES_OTRO,
} from '@/lib/torneo';

export default function HomePage() {
  return (
    <div className="relative">
      <SectionBackdrop tint="#D4A437" image="/fotos/seccion-home.jpg" />

      <div className="relative z-10 text-neutral-200">
        {/* ===== HERO ===== */}
        <section className="grain relative overflow-hidden">
          <div className="relative mx-auto grid min-h-[64vh] max-w-7xl items-center gap-10 px-6 py-14 sm:py-20 lg:min-h-[78vh] lg:grid-cols-[1.2fr_0.8fr] lg:gap-14 lg:px-8 lg:py-24">
            <div className="animate-fade-up">
              <h1 className="font-serif text-[38px] font-bold leading-[1.05] text-neutral-50 drop-shadow-[0_6px_24px_rgba(0,0,0,0.7)] sm:text-[52px] md:text-[78px]">
                Ayudamos a líderes a <span className="text-energy">tomar mejores decisiones.</span>
              </h1>
              <p className="mt-7 max-w-xl text-lg text-neutral-300">
                Los líderes se entrenan jugando, aprendiendo y compitiendo. No es solo
                entretenimiento: es{' '}
                <span className="font-semibold text-neutral-100">ocio serio</span> para cumplir
                objetivos.
              </p>
              {/* El botón principal es el diagnóstico: en celular es lo único
                  que se ve sin hacer scroll, y hoy es la prioridad. El torneo
                  baja a segundo, y «ocio serio» queda como enlace, sin peso de
                  botón, para no llegar a tres botones apilados en móvil. */}
              <div className="mt-10 flex flex-wrap items-center gap-4">
                <Link
                  href={hrefDeEje(DIAGNOSTICO)}
                  className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amarillo to-naranja px-7 py-3.5 text-sm font-bold text-carbon shadow-[0_12px_40px_rgba(232,114,44,0.4)] transition-all duration-200 ease-managers hover:-translate-y-0.5"
                >
                  Haz el diagnóstico
                  <ArrowRight
                    size={18}
                    aria-hidden
                    className="transition-transform duration-200 ease-managers group-hover:translate-x-1"
                  />
                </Link>
                <Link
                  href="/torneo/"
                  className="inline-flex items-center gap-2 rounded-full border border-white/25 px-7 py-3.5 text-sm font-semibold text-neutral-100 transition-colors duration-200 ease-managers hover:border-gold hover:text-gold"
                >
                  Entra por el torneo
                </Link>
                <Link
                  href="/nosotros/"
                  className="inline-flex items-center gap-2 py-2 text-sm font-semibold text-neutral-400 underline-offset-4 transition-colors duration-200 ease-managers hover:text-gold hover:underline"
                >
                  Qué es el ocio serio
                </Link>
              </div>
            </div>

            <div className="relative flex items-center justify-center">
              <span
                aria-hidden
                className="absolute aspect-square w-[62vw] max-w-[420px] rounded-full bg-gold/20 blur-[120px]"
              />
              <div className="float-y">
                <GoldCoin size={400} animate priority />
              </div>
            </div>
          </div>

          <div className="relative border-y border-white/10 bg-black/40 backdrop-blur-sm">
            <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-8 gap-y-2 px-6 py-5 lg:px-8">
              <span className="font-mono text-caption uppercase tracking-[0.3em] text-neutral-500">
                El norte
              </span>
              <span className="font-serif text-xl italic text-neutral-100">{NORTE}</span>
            </div>
          </div>
        </section>

        {/* ===== DIAGNÓSTICO =====
            Va pegado al hero a propósito: en celular es la segunda pantalla,
            antes del ocio serio y de los pilares. Es la prioridad de este
            momento y no puede quedar a cuatro scrolls, dentro de una grilla. */}
        <section className="relative overflow-hidden border-y border-gold/25 bg-gradient-to-br from-[#1a140a] via-[#0d1218] to-[#0d1218]">
          <div className="relative mx-auto flex max-w-7xl flex-col gap-8 px-6 py-14 lg:flex-row lg:items-center lg:justify-between lg:px-8 lg:py-16">
            <div className="max-w-2xl">
              <p className="font-mono text-caption uppercase tracking-[0.3em] text-gold">
                {DIAGNOSTICO.tagline}
              </p>
              <h2 className="mt-4 font-serif text-display-lg font-bold leading-[1.05] text-neutral-50">
                ¿En qué punto está tu emprendimiento?
              </h2>
              <p className="mt-5 max-w-xl text-neutral-300">{DIAGNOSTICO.descripcion}</p>
            </div>
            <Link
              href={hrefDeEje(DIAGNOSTICO)}
              className="group inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-amarillo to-naranja px-8 py-4 text-sm font-bold text-carbon shadow-[0_12px_40px_rgba(232,114,44,0.4)] transition-all duration-200 ease-managers hover:-translate-y-0.5"
            >
              Haz el diagnóstico
              <ArrowRight
                size={18}
                aria-hidden
                className="transition-transform duration-200 ease-managers group-hover:translate-x-1"
              />
            </Link>
          </div>
        </section>

        {/* ===== OCIO SERIO ===== */}
        <section className="grain relative overflow-hidden">
          <div className="relative mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-24">
            <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
              <div>
                <p className="font-mono text-caption uppercase tracking-[0.3em] text-naranja">
                  El concepto
                </p>
                <h2 className="mt-4 font-serif text-display-lg font-bold leading-[1.05] text-neutral-50">
                  {OCIO_SERIO.titulo}
                </h2>
              </div>
              <div className="space-y-6">
                <p className="font-serif text-2xl leading-snug text-neutral-100">
                  {OCIO_SERIO.bajada}
                </p>
                <p className="flex items-start gap-3 text-neutral-300">
                  <Compass size={22} className="mt-1 shrink-0 text-gold" aria-hidden />
                  {OCIO_SERIO.journey}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ===== 3 PILARES ===== */}
        <section className="grain relative overflow-hidden border-y border-white/10 bg-black/25 backdrop-blur-sm">
          <div className="relative mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-24">
            <div className="max-w-3xl">
              <p className="font-mono text-caption uppercase tracking-[0.3em] text-gold">
                Cómo lo hacemos
              </p>
              <h2 className="mt-4 font-serif text-display-lg font-bold leading-[1.05] text-neutral-50">
                Tres pilares, un mismo destino.
              </h2>
            </div>
            <ol className="stagger-in mt-16 grid gap-px overflow-hidden rounded-2xl border border-white/10 lg:grid-cols-3">
              {PILARES.map((p) => (
                <li key={p.numero} className="bg-[#0d1218]/80 p-7 sm:p-10">
                  <span aria-hidden className="ghost-number text-7xl">
                    {p.numero}
                  </span>
                  <h3 className="mt-6 font-serif text-2xl font-bold text-neutral-50">{p.titulo}</h3>
                  <p className="mt-3 text-sm text-gold">{p.promesa}</p>
                  <ul className="mt-6 space-y-2">
                    {p.componentes.map((c) => (
                      <li key={c} className="flex items-center gap-2 text-sm text-neutral-300">
                        <span aria-hidden className="h-1 w-4 rounded-full bg-gold/60" />
                        {c}
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ===== EJES ===== */}
        <section className="grain relative overflow-hidden">
          <div className="relative mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-24">
            <div className="max-w-2xl">
              <p className="font-mono text-caption uppercase tracking-[0.3em] text-naranja">
                Por dónde entrar
              </p>
              <h2 className="mt-4 font-serif text-display-lg font-bold leading-[1.05] text-neutral-50">
                {CANTIDAD_EJES_CAP} ejes. Una sola comunidad.
              </h2>
            </div>
            <ul className="stagger-in mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {EJES_VISIBLES.map((eje) => {
                const Icon = eje.icon;
                return (
                  <li key={eje.slug}>
                    <Link
                      href={hrefDeEje(eje)}
                      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0d1218]/80 p-8 transition-all duration-300 ease-managers hover:-translate-y-1.5 hover:border-gold/50 hover:shadow-[0_28px_70px_rgba(0,0,0,0.6)]"
                    >
                      <div className="flex items-center justify-between">
                        <span
                          aria-hidden
                          className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 text-gold transition-colors duration-200 ease-managers group-hover:bg-gold group-hover:text-carbon"
                        >
                          <Icon size={22} />
                        </span>
                        <ArrowUpRight
                          size={20}
                          aria-hidden
                          className="text-neutral-600 transition-all duration-200 ease-managers group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-gold"
                        />
                      </div>
                      <p className="mt-6 font-mono text-caption uppercase tracking-widest text-neutral-500">
                        {eje.tagline}
                      </p>
                      <h3 className="mt-1 font-serif text-2xl font-bold text-neutral-50">
                        {eje.nombre}
                      </h3>
                      <p className="mt-3 flex-1 text-sm text-neutral-400">{eje.descripcion}</p>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>

        {/* ===== MANAGERS LAB ===== */}
        <section className="grain relative overflow-hidden border-y border-white/10 bg-black/25 backdrop-blur-sm">
          <div className="relative mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-24">
            <div
              className="overflow-hidden rounded-3xl border p-6 sm:p-10 lg:p-16"
              style={{ borderColor: 'rgba(0,212,255,0.35)' }}
            >
              <div className="grid gap-10 lg:grid-cols-[1.3fr_0.7fr] lg:items-center">
                <div>
                  <p
                    className="font-mono text-caption uppercase tracking-[0.3em]"
                    style={{ color: ICONE_CYAN }}
                  >
                    La alianza
                  </p>
                  <h2 className="mt-4 font-serif text-[40px] font-bold leading-[1.05] text-neutral-50 md:text-[60px]">
                    Managers <span className="text-energy">Lab</span>
                  </h2>
                  <p className="mt-3 flex items-center gap-2 font-bufon text-sm font-semibold uppercase tracking-[0.2em] text-neutral-400">
                    powered by <IconeBrand />
                  </p>
                  <p className="mt-6 max-w-xl text-lg text-neutral-300">{ALIANZA.claim}</p>
                  <Link
                    href="/alianza/"
                    className="group mt-8 inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold text-carbon transition-all duration-200 ease-managers hover:-translate-y-0.5"
                    style={{ backgroundColor: ICONE_CYAN }}
                  >
                    Conoce Managers Lab
                    <ArrowRight
                      size={18}
                      aria-hidden
                      className="transition-transform duration-200 ease-managers group-hover:translate-x-1"
                    />
                  </Link>
                </div>
                <div className="flex items-center justify-center">
                  <span
                    className="font-serif text-7xl font-bold md:text-8xl"
                    style={{ color: ICONE_CYAN }}
                    aria-hidden
                  >
                    IA
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===== TORNEO ===== */}
        <section className="grain relative overflow-hidden">
          <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-6 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:px-8 lg:py-24">
            <div>
              <p className="font-mono text-caption uppercase tracking-[0.3em] text-gold">
                Pilar 03 · Gestionar el esfuerzo
              </p>
              <h2 className="mt-4 font-serif text-display-lg font-bold leading-[1.05] text-neutral-50">
                El torneo no es fútbol.{' '}
                <span className="text-energy">Es decidir bajo presión.</span>
              </h2>
              {/* El maximo ganador solo se menciona si es otro club: mientras
                  coincida con el campeon vigente, nombrarlo dos veces con dos
                  rotulos distintos solo confunde. */}
              <p className="mt-6 max-w-xl text-neutral-300">
                F7 para líderes mayores de 28 años. {EDICIONES_DISPUTADAS.length} ediciones. Campeón
                vigente: {CAMPEON_VIGENTE.equipo}
                {MAXIMO_GANADOR_ES_OTRO ? (
                  <>
                    ; máximo ganador: {MAXIMO_GANADOR.equipo}, con {MAXIMO_GANADOR.titulos} títulos.
                  </>
                ) : (
                  '.'
                )}
              </p>
              <Link
                href="/torneo/"
                className="group mt-8 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amarillo to-naranja px-7 py-3.5 text-sm font-bold text-carbon shadow-[0_12px_40px_rgba(232,114,44,0.4)] transition-all duration-200 ease-managers hover:-translate-y-0.5"
              >
                Ver el torneo
                <ArrowRight size={18} aria-hidden />
              </Link>
            </div>
            <div className="flex items-center justify-center">
              <div className="float-y">
                <GoldCoin size={240} />
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
