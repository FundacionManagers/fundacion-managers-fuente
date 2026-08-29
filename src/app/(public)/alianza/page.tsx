import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight, Brain, Users } from 'lucide-react';
import { GoldCoin } from '@/components/shared/GoldCoin';
import { IconeBrand } from '@/components/shared/IconeBrand';
import { NeuralBg } from '@/components/shared/NeuralBg';
import { SectionBackdrop } from '@/components/shared/SectionBackdrop';
import { ALIANZA, APORTES, FLUJOS, ICONE_CYAN } from '@/lib/alianza';
import { NORTE } from '@/lib/strategy';

export const metadata: Metadata = {
  title: 'Managers Lab — powered by ICONE ialabs',
  description: ALIANZA.claim,
};

export default function AlianzaPage() {
  return (
    <div className="relative">
      <SectionBackdrop query="technology,network,abstract" seed={4} tint="#00D4FF" />
      <div className="relative z-10 text-neutral-200">
        {/* HERO */}
        <section className="grain relative overflow-hidden">
          <NeuralBg />
          <div className="relative mx-auto max-w-7xl px-6 py-24 lg:px-8 lg:py-32">
            <p className="font-mono text-caption uppercase tracking-[0.35em] text-gold">
              El laboratorio de la fundación
            </p>

            {/* Lockup — Managers Lab powered by ICONE ialabs (modelo Intel Inside) */}
            <div className="mt-6">
              <h1 className="font-serif text-[44px] font-bold leading-none text-neutral-50 md:text-[80px]">
                Managers <span className="text-gold-grad">Lab</span>
              </h1>
              <p className="mt-4 flex items-center gap-2 font-bufon text-sm font-semibold uppercase tracking-[0.2em] text-neutral-400">
                powered by
                <IconeBrand />
              </p>
            </div>

            <p className="mt-8 max-w-3xl font-serif text-2xl italic text-neutral-200">
              {ALIANZA.claim}
            </p>
            <p className="mt-5 max-w-2xl text-lg text-neutral-400">{ALIANZA.bajada}</p>

            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href="/contacto/"
                className="group inline-flex items-center gap-2 rounded-full bg-gold px-7 py-3.5 text-sm font-semibold text-carbon shadow-gold transition-all duration-200 ease-managers hover:-translate-y-0.5 hover:bg-gold-hover"
              >
                Quiero explorar la alianza
                <ArrowRight
                  size={18}
                  aria-hidden
                  className="transition-transform duration-200 ease-managers group-hover:translate-x-1"
                />
              </Link>
              <a
                href={ALIANZA.icone.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border px-7 py-3.5 text-sm font-semibold text-neutral-100 transition-colors duration-200 ease-managers"
                style={{ borderColor: ICONE_CYAN }}
              >
                Conoce&nbsp;
                <IconeBrand />
                <ArrowUpRight size={18} aria-hidden />
              </a>
            </div>

            <div className="relative mt-12 border-t border-white/10 pt-6">
              <p className="font-mono text-caption uppercase tracking-[0.3em] text-neutral-500">
                Mismo norte
              </p>
              <p className="mt-2 font-serif text-xl italic text-neutral-200">
                {NORTE} — ahora también con inteligencia artificial.
              </p>
            </div>
          </div>
        </section>

        {/* QUÉ APORTA CADA UNO */}
        <section className="grain relative overflow-hidden">
          <div className="relative mx-auto max-w-7xl px-6 py-24 lg:px-8">
            <p className="font-mono text-caption uppercase tracking-[0.3em] text-terracotta">
              No es fusión. Es suma.
            </p>
            <h2 className="mt-4 font-serif text-display-lg font-bold leading-[1.05] text-neutral-50">
              Cada marca pone lo que mejor hace.
            </h2>
            <p className="mt-4 max-w-2xl text-neutral-300">
              Como Alpina y Kellogg&apos;s con su producto conjunto: cada uno sigue operando bajo su
              propio concepto. Lo que se une es la oportunidad.
            </p>

            <ul className="mt-14 grid gap-6 lg:grid-cols-2">
              {APORTES.map((a) => (
                <li
                  key={a.marca}
                  className="rounded-3xl border border-white/10 bg-[#0d1218]/80 p-10"
                >
                  <h3 className="font-serif text-2xl font-bold text-neutral-50">{a.marca}</h3>
                  <ul className="mt-6 space-y-3">
                    {a.aporta.map((item) => (
                      <li key={item} className="flex items-start gap-3 text-neutral-300">
                        <span
                          aria-hidden
                          className="mt-2 h-1.5 w-5 shrink-0 rounded-full bg-gold"
                        />
                        {item}
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* CÓMO FLUYE LA OPORTUNIDAD */}
        <section className="grain relative overflow-hidden">
          <NeuralBg />
          <div className="relative mx-auto max-w-7xl px-6 py-24 lg:px-8">
            <p className="font-mono text-caption uppercase tracking-[0.3em] text-gold">
              La puerta funciona en doble vía
            </p>
            <h2 className="mt-4 font-serif text-display-lg font-bold text-neutral-50">
              Empieces donde empieces, no se pierde la oportunidad.
            </h2>

            <ul className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-white/10 lg:grid-cols-2">
              {FLUJOS.map((f, i) => (
                <li key={f.desde} className="bg-[#0d1218] p-10">
                  <span
                    aria-hidden
                    className="inline-flex h-12 w-12 items-center justify-center rounded-xl"
                    style={{
                      backgroundColor: i === 0 ? 'rgba(212,164,55,0.15)' : 'rgba(0,212,255,0.15)',
                      color: i === 0 ? '#D4A437' : ICONE_CYAN,
                    }}
                  >
                    {i === 0 ? <Users size={22} /> : <Brain size={22} />}
                  </span>
                  <p className="mt-6 font-serif text-xl font-bold text-neutral-50">{f.desde}</p>
                  <p className="mt-1 text-neutral-400">{f.hacia}</p>
                  <p className="mt-4 text-sm font-semibold text-gold">{f.resultado}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* CTA */}
        <section className="grain relative overflow-hidden">
          <div className="relative mx-auto max-w-7xl px-6 py-24 lg:px-8">
            <div className="relative overflow-hidden rounded-3xl p-12 lg:p-16">
              <div className="relative grid gap-10 lg:grid-cols-[1.4fr_0.6fr] lg:items-center">
                <div>
                  <p className="font-mono text-caption uppercase tracking-[0.3em] text-gold">
                    {ALIANZA.nombre}
                  </p>
                  <h2 className="mt-4 font-serif text-3xl font-bold text-neutral-50 md:text-4xl">
                    ¿Tienes una oportunidad que toca las dos marcas?
                  </h2>
                  <p className="mt-4 max-w-xl text-neutral-300">
                    Cuéntanos de dónde vienes y qué necesitas. La conectamos con el lado correcto de
                    la alianza.
                  </p>
                  <Link
                    href="/contacto/"
                    className="mt-8 inline-flex items-center gap-2 rounded-full bg-gold px-7 py-3.5 text-sm font-semibold text-carbon shadow-gold transition-colors duration-200 ease-managers hover:bg-gold-hover"
                  >
                    Hablar con la alianza
                    <ArrowRight size={18} aria-hidden />
                  </Link>
                </div>
                <div className="flex items-center justify-center">
                  <GoldCoin size={180} />
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
