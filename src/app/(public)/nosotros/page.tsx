import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Award, Compass, Heart, Users } from 'lucide-react';
import { GoldCoin } from '@/components/shared/GoldCoin';
import { IconeBrand } from '@/components/shared/IconeBrand';
import { SectionBackdrop } from '@/components/shared/SectionBackdrop';
import { ALIANZA, ICONE_CYAN } from '@/lib/alianza';
import { CANTIDAD_EJES, CANTIDAD_EJES_CAP, EJES_VISIBLES } from '@/lib/navigation';
import { NORTE, OCIO_SERIO, PILARES } from '@/lib/strategy';
import { CAMPEON_VIGENTE, EDICION_EN_CURSO, ordinalFemenino } from '@/lib/torneo';

export const metadata: Metadata = {
  title: 'Ocio serio',
  description: 'La Fundación Managers: ocio serio para que los líderes tomen mejores decisiones.',
};

const VALORES = [
  {
    icon: Award,
    titulo: 'Triunfo',
    body: 'Buscamos resultados visibles, no procesos eternos. La moneda dorada se gana.',
  },
  {
    icon: Heart,
    titulo: 'Esfuerzo',
    body: 'Trabajamos al lado de las personas y las organizaciones, no por encima.',
  },
  {
    icon: Users,
    titulo: 'Reconocimiento',
    body: 'Celebramos a quien lo hace bien: equipos, líderes, comunidades, aliados.',
  },
] as const;

export default function NosotrosPage() {
  return (
    <div className="relative">
      <SectionBackdrop tint="#D4A437" image="/fotos/seccion-nosotros.jpg" />
      <div className="relative z-10 text-neutral-200">
        {/* HERO */}
        <section className="grain relative overflow-hidden">
          <div aria-hidden className="pointer-events-none absolute inset-0" />
          <div className="relative mx-auto grid max-w-7xl gap-12 px-6 py-24 lg:grid-cols-[1.2fr_0.8fr] lg:items-center lg:px-8 lg:py-32">
            <div className="animate-fade-up">
              <p className="font-mono text-caption uppercase tracking-[0.35em] text-gold">
                El concepto
              </p>
              <h1 className="mt-6 font-serif text-[42px] font-bold leading-[1.03] text-neutral-50 md:text-[68px]">
                {OCIO_SERIO.titulo}.
              </h1>
              <p className="mt-7 max-w-2xl font-serif text-2xl leading-snug text-neutral-200">
                {OCIO_SERIO.bajada}
              </p>
              <p className="mt-6 flex max-w-xl items-start gap-3 text-neutral-400">
                <Compass size={22} className="mt-1 shrink-0 text-gold" aria-hidden />
                {OCIO_SERIO.journey}
              </p>
            </div>
            <div className="flex items-center justify-center">
              <div className="float-y">
                <GoldCoin animate priority size={320} />
              </div>
            </div>
          </div>
          <div className="relative border-t border-white/10">
            <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-8 gap-y-3 px-6 py-6 lg:px-8">
              <span className="font-mono text-caption uppercase tracking-[0.3em] text-neutral-500">
                El norte
              </span>
              <span className="font-serif text-xl italic text-neutral-200">{NORTE}</span>
            </div>
          </div>
        </section>

        {/* 3 PILARES */}
        <section className="grain relative overflow-hidden">
          <div className="relative mx-auto max-w-7xl px-6 py-24 lg:px-8">
            <p className="font-mono text-caption uppercase tracking-[0.3em] text-terracotta">
              La arquitectura
            </p>
            <h2 className="mt-4 font-serif text-display-lg font-bold leading-[1.05] text-neutral-50">
              Tres pilares sostienen todo.
            </h2>
            <ol className="mt-14 grid gap-5 lg:grid-cols-3">
              {PILARES.map((p) => (
                <li
                  key={p.numero}
                  className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0d1218]/80 p-10"
                >
                  <span aria-hidden className="font-sport text-7xl leading-none text-gold/30">
                    {p.numero}
                  </span>
                  <h3 className="mt-5 font-serif text-2xl font-bold text-neutral-50">{p.titulo}</h3>
                  <p className="mt-2 text-sm font-semibold text-terracotta">{p.promesa}</p>
                  <ul className="mt-5 flex flex-wrap gap-2">
                    {p.componentes.map((c) => (
                      <li
                        key={c}
                        className="rounded-full border border-carbon/15 px-3 py-1 text-xs font-medium text-neutral-400"
                      >
                        {c}
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* VALORES */}
        <section className="grain relative overflow-hidden">
          <div className="relative mx-auto max-w-7xl px-6 py-24 lg:px-8">
            <p className="font-mono text-caption uppercase tracking-[0.3em] text-gold">
              Lo que nos mueve
            </p>
            <h2 className="mt-4 font-serif text-display-lg font-bold text-neutral-50">
              Tres valores. Una moneda.
            </h2>
            <ul className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-white/10 lg:grid-cols-3">
              {VALORES.map((v) => {
                const Icon = v.icon;
                return (
                  <li key={v.titulo} className="bg-[#0d1218] p-10">
                    <span
                      aria-hidden
                      className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gold/15 text-gold"
                    >
                      <Icon size={22} />
                    </span>
                    <h3 className="mt-5 font-serif text-2xl font-bold text-neutral-50">
                      {v.titulo}
                    </h3>
                    <p className="mt-2 text-sm text-neutral-400">{v.body}</p>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>

        {/* EJES */}
        <section className="grain relative overflow-hidden">
          <div className="relative mx-auto max-w-7xl px-6 py-24 lg:px-8">
            <p className="font-mono text-caption uppercase tracking-[0.3em] text-terracotta">
              {CANTIDAD_EJES_CAP} frentes de trabajo
            </p>
            <h2 className="mt-4 font-serif text-display-lg font-bold text-neutral-50">
              Una marca, {CANTIDAD_EJES} ejes
            </h2>
            <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {EJES_VISIBLES.map((eje) => {
                const Icon = eje.icon;
                return (
                  <li key={eje.slug}>
                    <Link
                      href={`/${eje.slug}/`}
                      className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-[#0d1218]/80 p-6 transition-all duration-200 ease-managers hover:-translate-y-1 hover:border-gold hover:shadow-[0_20px_50px_rgba(212,164,55,0.16)]"
                    >
                      <span
                        aria-hidden
                        className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/5 text-gold transition-colors duration-200 ease-managers group-hover:bg-gold group-hover:text-neutral-50"
                      >
                        <Icon size={20} />
                      </span>
                      <span className="flex-1">
                        <span className="block font-serif text-lg font-bold text-neutral-50">
                          {eje.nombre}
                        </span>
                        <span className="block text-xs text-neutral-500">{eje.tagline}</span>
                      </span>
                      <ArrowRight
                        size={16}
                        aria-hidden
                        className="text-neutral-300 transition-all duration-200 ease-managers group-hover:translate-x-1 group-hover:text-gold"
                      />
                    </Link>
                  </li>
                );
              })}
            </ul>

            <div className="mt-16 rounded-3xl border border-white/10 bg-[#0d1218]/80 p-10 lg:p-14">
              <p className="font-serif text-xl text-neutral-50 lg:text-2xl">
                Lo confirmado en cancha: el{' '}
                <Link href="/torneo/" className="font-bold text-gold hover:underline">
                  Torneo Managers
                </Link>{' '}
                va por su {ordinalFemenino(EDICION_EN_CURSO.numero)} edición, con{' '}
                {CAMPEON_VIGENTE.equipo} como campeón vigente. La historia, misión y equipo
                completos se integran desde el documento maestro en la Fase 1.
              </p>
              <Link
                href="/contacto/"
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-white/5 px-6 py-3 text-sm font-semibold text-neutral-50 transition-colors duration-200 ease-managers hover:bg-neutral-800"
              >
                Conversar con la fundación
                <ArrowRight size={16} aria-hidden />
              </Link>
            </div>
          </div>
        </section>

        {/* MANAGERS LAB — alianza transversal */}
        <section className="grain relative z-10 overflow-hidden border-t border-white/10">
          <div className="relative mx-auto max-w-7xl px-6 py-20 lg:px-8">
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
                  La IA es transversal a toda la fundación
                </h2>
                <p className="mt-3 max-w-2xl text-neutral-300">
                  Cada eje —consultoría, torneo, turismo, eventos, emprendimiento y campo— se
                  potencia con la inteligencia artificial de la alianza ICONE ialabs. No es un
                  servicio más: es la capa que sostiene mejores decisiones en todo lo que hacemos.
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
      </div>
    </div>
  );
}
