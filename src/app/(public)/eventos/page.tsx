import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Calendar, MapPin, MessageCircle } from 'lucide-react';
import { SectionBackdrop } from '@/components/shared/SectionBackdrop';
import { asset } from '@/lib/asset';
import { EJE_CONTENT } from '@/lib/eje-content';
import { getEje } from '@/lib/navigation';
import { pilarDeEje } from '@/lib/strategy';
import { visualDeEje } from '@/lib/eje-visual';
import { EVENTOS } from '@/lib/eventos';

const EJE = getEje('eventos')!;
const CONTENT = EJE_CONTENT.eventos!;

export const metadata: Metadata = {
  title: EJE.nombre,
  description: CONTENT.intro,
};

export default function EventosPage() {
  const pilar = pilarDeEje('eventos');
  const Icon = EJE.icon;
  const vis = visualDeEje('eventos');

  return (
    <div className="relative">
      <SectionBackdrop tint={vis.tint} image="/fotos/seccion-eventos.webp" wide />

      <div className="relative z-10 text-neutral-200">
        {/* ===== HERO ===== */}
        <section className="grain relative overflow-hidden">
          <div className="relative mx-auto max-w-7xl px-6 py-24 lg:px-8 lg:py-32">
            <div className="flex flex-wrap items-center gap-4">
              {pilar && (
                <span className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-4 py-1.5 font-mono text-caption uppercase tracking-widest text-gold">
                  Pilar {pilar.numero} · {pilar.titulo}
                </span>
              )}
            </div>

            <div className="mt-8 grid gap-12 lg:grid-cols-[1.3fr_0.7fr] lg:items-center">
              <div className="animate-fade-up">
                <p className="font-mono text-caption uppercase tracking-[0.3em] text-terracotta">
                  {EJE.tagline}
                </p>
                <h1 className="mt-4 font-serif text-[42px] font-bold leading-[1.03] text-neutral-50 md:text-[64px]">
                  {EJE.nombre}
                </h1>
                <p className="mt-6 max-w-2xl text-lg text-neutral-300">{CONTENT.intro}</p>
                {CONTENT.cierre && (
                  <p className="mt-6 max-w-xl border-l-2 border-gold/50 pl-5 font-serif text-lg italic text-neutral-300">
                    {CONTENT.cierre}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-center">
                <div className="float-y relative flex h-52 w-52 items-center justify-center rounded-full border border-gold/30 bg-white/5">
                  <Icon size={88} className="text-gold" aria-hidden strokeWidth={1.3} />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===== ACTIVIDADES VIGENTES ===== */}
        <section className="grain relative overflow-hidden">
          <div className="relative mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-24">
            <p className="font-mono text-caption uppercase tracking-[0.3em] text-naranja">
              Calendario de actividades
            </p>
            <h2 className="mt-4 font-serif text-display-lg font-bold leading-[1.05] text-neutral-50">
              Actividades vigentes
            </h2>
            <p className="mt-4 max-w-2xl text-neutral-300">
              Torneos, amistosos y convocatorias abiertas. Entra al ritmo de la comunidad.
            </p>

            <ul className="stagger-in mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {EVENTOS.map((evento) => (
                <li key={evento.id}>
                  <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0d1218]/80 transition-all duration-300 ease-managers hover:-translate-y-1.5 hover:border-gold/50 hover:shadow-[0_28px_70px_rgba(0,0,0,0.6)]">
                    <div className="relative aspect-video overflow-hidden">
                      <Image
                        src={asset(evento.imagen)}
                        alt={evento.titulo}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>

                    <div className="flex flex-1 flex-col p-6">
                      <span className="font-mono text-caption uppercase tracking-[0.25em] text-naranja">
                        {evento.tipo}
                      </span>
                      <h3 className="mt-2 font-serif text-xl font-bold text-neutral-50">
                        {evento.titulo}
                      </h3>
                      <p className="mt-3 flex-1 text-sm text-neutral-400">{evento.bajada}</p>

                      <div className="mt-5 space-y-1.5 text-sm text-neutral-400">
                        <div className="flex items-center gap-2">
                          <Calendar size={13} className="shrink-0 text-gold" aria-hidden />
                          {evento.fecha}
                        </div>
                        {evento.lugar && (
                          <div className="flex items-center gap-2">
                            <MapPin size={13} className="shrink-0 text-gold" aria-hidden />
                            {evento.lugar}
                          </div>
                        )}
                        {evento.precio && (
                          <p className="font-semibold text-gold">{evento.precio}</p>
                        )}
                      </div>

                      <Link
                        href={evento.cta.href}
                        className="mt-6 inline-flex items-center gap-2 rounded-full border border-gold/40 px-5 py-2.5 text-sm font-semibold text-gold transition-all duration-200 ease-managers hover:bg-gold hover:text-carbon"
                      >
                        {evento.cta.etiqueta}
                        <ArrowRight
                          size={14}
                          aria-hidden
                          className="transition-transform duration-200 ease-managers group-hover:translate-x-1"
                        />
                      </Link>
                    </div>
                  </article>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ===== SERVICIOS ===== */}
        <section className="relative overflow-hidden border-y border-cream-deep bg-cream">
          <div className="relative mx-auto max-w-7xl px-6 py-24 lg:px-8">
            <p className="font-mono text-caption uppercase tracking-[0.3em] text-terracotta">
              Qué hacemos
            </p>
            <h2 className="mt-4 font-serif text-display-lg font-bold text-carbon">
              Producción de eventos
            </h2>
            <ul className="stagger-in mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {CONTENT.valueProps?.map((vp) => {
                const VPIcon = vp.icon;
                return (
                  <li
                    key={vp.title}
                    className="group flex h-full flex-col rounded-2xl border border-cream-deep bg-neutral-50 p-8 shadow-[0_10px_34px_rgba(15,20,25,0.07)] transition-all duration-300 ease-managers hover:-translate-y-1.5 hover:border-gold/60"
                  >
                    <span
                      aria-hidden
                      className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gold text-carbon"
                    >
                      <VPIcon size={22} />
                    </span>
                    <h3 className="mt-5 font-serif text-xl font-bold text-carbon">{vp.title}</h3>
                    <p className="mt-2 text-sm text-neutral-600">{vp.body}</p>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>

        {/* ===== CTA ===== */}
        <section className="grain relative overflow-hidden">
          <div className="relative mx-auto max-w-7xl px-6 py-24 lg:px-8">
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0d1218]/85 p-12 backdrop-blur-sm lg:p-16">
              <div className="relative grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:items-center">
                <div>
                  <p className="font-mono text-caption uppercase tracking-[0.3em] text-gold">
                    Conversemos
                  </p>
                  <h2 className="mt-4 font-serif text-3xl font-bold text-neutral-50 md:text-4xl">
                    {CONTENT.ctaTitle ?? '¿Tienes un evento en mente?'}
                  </h2>
                  <p className="mt-4 max-w-xl text-neutral-300">
                    {CONTENT.ctaBody ?? 'Cuéntanos la idea y te respondemos con una propuesta inicial.'}
                  </p>
                </div>
                <div className="flex lg:justify-end">
                  <Link
                    href="/contacto/"
                    className="group inline-flex items-center gap-2 rounded-full bg-gold px-7 py-3.5 text-sm font-semibold text-carbon shadow-gold transition-all duration-200 ease-managers hover:-translate-y-0.5 hover:bg-gold-hover"
                  >
                    <MessageCircle size={18} aria-hidden />
                    Hablar con la fundación
                    <ArrowRight size={18} aria-hidden />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
