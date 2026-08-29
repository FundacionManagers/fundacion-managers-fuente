import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight, MessageCircle } from 'lucide-react';
import { IconeBrand } from '@/components/shared/IconeBrand';
import { SectionBackdrop } from '@/components/shared/SectionBackdrop';
import { visualDeEje } from '@/lib/eje-visual';
import { ALIANZA, ICONE_CYAN } from '@/lib/alianza';
import { EJE_CONTENT } from '@/lib/eje-content';
import { EJES, getEje } from '@/lib/navigation';
import { pilarDeEje } from '@/lib/strategy';

interface EjePageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return EJES.filter((e) => e.slug !== 'torneo').map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: EjePageProps): Promise<Metadata> {
  const { slug } = await params;
  const eje = getEje(slug);
  if (!eje) return {};
  return { title: eje.nombre, description: eje.descripcion };
}

export default async function EjePage({ params }: EjePageProps) {
  const { slug } = await params;
  const eje = getEje(slug);
  if (!eje) notFound();

  const content = EJE_CONTENT[eje.slug];
  const pilar = pilarDeEje(eje.slug);
  const Icon = eje.icon;
  const vis = visualDeEje(eje.slug);

  return (
    <div className="relative">
      <SectionBackdrop
        tint={vis.tint}
        image={`/fotos/seccion-${eje.slug}.jpg`}
        wide={['turismo', 'eventos', 'emprendimiento', 'rural'].includes(eje.slug)}
      />
      <div className="relative z-10 text-neutral-200">
        {/* HERO */}
        <section className="grain relative overflow-hidden">
          <div className="relative mx-auto max-w-7xl px-6 py-24 lg:px-8 lg:py-32">
            <div className="flex flex-wrap items-center gap-4">
              {pilar ? (
                <span className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-4 py-1.5 font-mono text-caption uppercase tracking-widest text-gold">
                  Pilar {pilar.numero} · {pilar.titulo}
                </span>
              ) : null}
            </div>

            <div className="mt-8 grid gap-12 lg:grid-cols-[1.3fr_0.7fr] lg:items-center">
              <div className="animate-fade-up">
                <p className="font-mono text-caption uppercase tracking-[0.3em] text-terracotta">
                  {eje.tagline}
                </p>
                <h1 className="mt-4 font-serif text-[42px] font-bold leading-[1.03] text-neutral-50 md:text-[64px]">
                  {eje.nombre}
                </h1>
                <p className="mt-6 max-w-2xl text-lg text-neutral-300">
                  {content?.intro ?? eje.descripcion}
                </p>
                {content?.cierre ? (
                  <p className="mt-6 max-w-xl border-l-2 border-gold/50 pl-5 font-serif text-lg italic text-neutral-300">
                    {content.cierre}
                  </p>
                ) : null}
              </div>

              <div className="flex items-center justify-center">
                <div className="float-y relative flex h-52 w-52 items-center justify-center rounded-full border border-gold/30 bg-white/5">
                  <Icon size={88} className="text-gold" aria-hidden strokeWidth={1.3} />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* VALUE PROPS */}
        {content?.valueProps?.length ? (
          <section className="grain relative overflow-hidden border-y border-white/10 bg-black/25 backdrop-blur-sm">
            <div className="relative mx-auto max-w-7xl px-6 py-24 lg:px-8">
              <p className="font-mono text-caption uppercase tracking-[0.3em] text-naranja">
                Qué hacemos
              </p>
              <h2 className="mt-4 font-serif text-display-lg font-bold text-neutral-50">
                Servicios y enfoques
              </h2>
              <ul className="stagger-in mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {content.valueProps.map((vp) => {
                  const VPIcon = vp.icon;
                  return (
                    <li
                      key={vp.title}
                      className="group flex h-full flex-col rounded-2xl border border-white/10 bg-[#0d1218]/80 p-8 transition-all duration-300 ease-managers hover:-translate-y-1.5 hover:border-gold/50 hover:shadow-[0_28px_70px_rgba(0,0,0,0.6)]"
                    >
                      <span
                        aria-hidden
                        className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 text-gold transition-colors duration-200 ease-managers group-hover:bg-gold group-hover:text-carbon"
                      >
                        <VPIcon size={22} />
                      </span>
                      <h3 className="mt-5 font-serif text-xl font-bold text-neutral-50">
                        {vp.title}
                      </h3>
                      <p className="mt-2 text-sm text-neutral-400">{vp.body}</p>
                    </li>
                  );
                })}
              </ul>
            </div>
          </section>
        ) : null}

        {/* PROCESO */}
        {content?.proceso?.length ? (
          <section className="grain relative overflow-hidden">
            <div className="relative mx-auto max-w-7xl px-6 py-24 lg:px-8">
              <p className="font-mono text-caption uppercase tracking-[0.3em] text-gold">
                Cómo trabajamos
              </p>
              <h2 className="mt-4 font-serif text-display-lg font-bold text-neutral-50">
                El proceso
              </h2>
              <ol className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-white/10 lg:grid-cols-3">
                {content.proceso.map((step) => (
                  <li key={step.numero} className="bg-[#0d1218]/80 p-10">
                    <span aria-hidden className="ghost-number text-6xl">
                      {step.numero}
                    </span>
                    <h3 className="mt-5 font-serif text-xl font-bold text-neutral-50">
                      {step.title}
                    </h3>
                    <p className="mt-2 text-sm text-neutral-400">{step.body}</p>
                  </li>
                ))}
              </ol>
            </div>
          </section>
        ) : null}

        {/* CTA */}
        <section className="grain relative overflow-hidden">
          <div className="relative mx-auto max-w-7xl px-6 py-24 lg:px-8">
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0d1218]/85 p-12 backdrop-blur-sm lg:p-16">
              <div className="relative grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:items-center">
                <div>
                  <p className="font-mono text-caption uppercase tracking-[0.3em] text-gold">
                    Conversemos
                  </p>
                  <h2 className="mt-4 font-serif text-3xl font-bold text-neutral-50 md:text-4xl">
                    {content?.ctaTitle ?? '¿Quieres conocer más?'}
                  </h2>
                  <p className="mt-4 max-w-xl text-neutral-300">
                    {content?.ctaBody ?? 'Escríbenos y te respondemos.'}
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
            {content?.labAngle ? (
              <Link
                href="/alianza/"
                className="group mt-10 flex flex-col gap-4 rounded-3xl border bg-[#0d1218]/85 p-8 backdrop-blur-sm transition-all duration-200 ease-managers hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(0,212,255,0.22)] sm:flex-row sm:items-center sm:justify-between"
                style={{ borderColor: 'rgba(0,212,255,0.35)' }}
              >
                <div>
                  <p
                    className="font-mono text-caption uppercase tracking-[0.3em]"
                    style={{ color: ICONE_CYAN }}
                  >
                    {ALIANZA.nombre} · powered by <IconeBrand className="text-xs" />
                  </p>
                  <p className="mt-2 font-serif text-xl font-bold text-neutral-50">
                    Esta solución se potencia con inteligencia artificial
                  </p>
                  <p className="mt-1 text-sm text-neutral-400">{content.labAngle}</p>
                </div>
                <span
                  className="inline-flex shrink-0 items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-carbon transition-transform duration-200 ease-managers group-hover:translate-x-1"
                  style={{ backgroundColor: ICONE_CYAN }}
                >
                  Ver la alianza
                  <ArrowRight size={18} aria-hidden />
                </span>
              </Link>
            ) : null}

            <p className="mt-8 text-center text-xs uppercase tracking-[0.2em] text-neutral-500">
              Contenido editorial preliminar — versión definitiva desde
              Managers_Especificaciones_v2.docx
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
