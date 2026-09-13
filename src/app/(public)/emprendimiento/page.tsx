import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, MessageCircle } from 'lucide-react';
import { IconeBrand } from '@/components/shared/IconeBrand';
import { SectionBackdrop } from '@/components/shared/SectionBackdrop';
import { asset } from '@/lib/asset';
import { visualDeEje } from '@/lib/eje-visual';
import { ALIANZA, ICONE_CYAN } from '@/lib/alianza';
import { EJE_CONTENT } from '@/lib/eje-content';
import { COMPROMISO, DIAGNOSTICO_BLOQUE, RUTAS } from '@/lib/emprendimiento';
import { DIAGNOSTICO, getEje, hrefDeEje } from '@/lib/navigation';
import { pilarDeEje } from '@/lib/strategy';

/**
 * Emprendimiento tiene página propia, como el torneo, y por eso `[slug]` la
 * excluye de sus rutas. Dejó de caber en la plantilla genérica de los ejes el
 * día que tuvo dos rutas desplegables, un paquete de ocho entregables y el
 * diagnóstico como cierre.
 *
 * Se quitaron «Servicios y enfoques» y «El proceso», que decían en genérico
 * —mentoría, red, ruta de validación; postular, construir, lanzar— lo que las
 * dos rutas ahora dicen con nombre, duración y entregables. Repetirlo restaba.
 */

/**
 * Si alguien renombra el eje o le borra el contenido, que reviente al construir
 * el sitio y no que la página salga a producción con huecos donde va el texto.
 */
function exigir<T>(valor: T | undefined, que: string): T {
  if (!valor) throw new Error(`Falta ${que}. La página de Emprendimiento lo necesita.`);
  return valor;
}

const EJE = exigir(getEje('emprendimiento'), 'el eje «emprendimiento» en navigation.ts');
const CONTENT = exigir(EJE_CONTENT.emprendimiento, 'el contenido de emprendimiento en eje-content.ts');

export const metadata: Metadata = {
  title: EJE.nombre,
  description:
    'Dos rutas para tu emprendimiento: el directorio de la fundación, y el paquete Emprende de tres meses que te lleva hasta tu primera facturación.',
};

export default function EmprendimientoPage() {
  const pilar = pilarDeEje('emprendimiento');
  const vis = visualDeEje('emprendimiento');
  const Icon = EJE.icon;

  return (
    <div className="relative">
      <SectionBackdrop tint={vis.tint} image="/fotos/seccion-emprendimiento.jpg" wide />
      <div className="relative z-10 text-neutral-200">
        {/* HERO */}
        <section className="grain relative overflow-hidden">
          <div className="relative mx-auto max-w-7xl px-6 py-24 lg:px-8 lg:py-32">
            {pilar ? (
              <span className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-4 py-1.5 font-mono text-caption uppercase tracking-widest text-gold">
                Pilar {pilar.numero} · {pilar.titulo}
              </span>
            ) : null}

            <div className="mt-8 grid gap-12 lg:grid-cols-[1.3fr_0.7fr] lg:items-center">
              <div className="animate-fade-up">
                <p className="font-mono text-caption uppercase tracking-[0.3em] text-terracotta">
                  {EJE.tagline}
                </p>
                <h1 className="mt-4 font-serif text-[42px] font-bold leading-[1.03] text-neutral-50 md:text-[64px]">
                  {EJE.nombre}
                </h1>
                <p className="mt-6 max-w-2xl text-lg text-neutral-300">{CONTENT.intro}</p>
              </div>

              <div className="flex items-center justify-center">
                <div className="float-y relative flex h-52 w-52 items-center justify-center rounded-full border border-gold/30 bg-white/5">
                  <Icon size={88} className="text-gold" aria-hidden strokeWidth={1.3} />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* COMPROMISO + LAS DOS RUTAS */}
        <section className="grain relative overflow-hidden border-y border-white/10 bg-black/25 backdrop-blur-sm">
          <div className="relative mx-auto max-w-7xl px-6 py-24 lg:px-8">
            <div className="max-w-3xl">
              <p className="font-mono text-caption uppercase tracking-[0.3em] text-naranja">
                {COMPROMISO.kicker}
              </p>
              <h2 className="mt-4 font-serif text-display-lg font-bold leading-[1.05] text-neutral-50">
                {COMPROMISO.titulo}
              </h2>
              <p className="mt-6 text-lg text-neutral-300">{COMPROMISO.cuerpo}</p>
            </div>

            {/* Las dos rutas. Son <details>: se abren sin una línea de
                JavaScript, funcionan con teclado y con lector de pantalla, y
                su contenido está en el HTML aunque estén cerradas —así lo lee
                el buscador y así sale impreso—. */}
            <div className="mt-14 grid gap-5 lg:grid-cols-2 lg:items-start">
              {RUTAS.map((ruta) => {
                const RutaIcon = ruta.icon;
                return (
                  <details
                    key={ruta.numero}
                    className="group overflow-hidden rounded-2xl border border-white/10 bg-[#0d1218]/85 transition-colors duration-300 ease-managers hover:border-gold/40 open:border-gold/45"
                  >
                    <summary className="flex cursor-pointer list-none items-start gap-5 p-8 [&::-webkit-details-marker]:hidden">
                      <span
                        aria-hidden
                        className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/5 text-gold transition-colors duration-200 ease-managers group-open:bg-gold group-open:text-carbon"
                      >
                        <RutaIcon size={22} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="font-mono text-caption uppercase tracking-widest text-neutral-500">
                          Ruta {ruta.numero} · {ruta.etapa}
                        </span>
                        <span className="mt-1 block font-serif text-2xl font-bold text-neutral-50">
                          {ruta.titulo}
                        </span>
                        <span className="mt-2 block text-sm text-neutral-400">{ruta.resumen}</span>
                        <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-gold">
                          <span className="group-open:hidden">Ver de qué se trata</span>
                          <span className="hidden group-open:inline">Cerrar</span>
                          <ArrowRight
                            size={16}
                            aria-hidden
                            className="transition-transform duration-200 ease-managers group-open:rotate-90"
                          />
                        </span>
                      </span>
                    </summary>

                    <div className="border-t border-white/10 px-8 pb-8 pt-6">
                      <p className="text-neutral-300">{ruta.cuerpo}</p>

                      {ruta.entregables ? (
                        <ol className="mt-7 grid gap-px overflow-hidden rounded-xl border border-white/10">
                          {ruta.entregables.map((e, i) => (
                            <li key={e.titulo} className="flex gap-4 bg-[#0b0f14]/80 p-5">
                              <span
                                aria-hidden
                                className="font-mono text-caption font-bold tracking-widest text-gold"
                              >
                                {String(i + 1).padStart(2, '0')}
                              </span>
                              <span>
                                <strong className="block text-sm font-semibold text-neutral-50">
                                  {e.titulo}
                                </strong>
                                <span className="mt-1 block text-sm text-neutral-400">
                                  {e.detalle}
                                </span>
                              </span>
                            </li>
                          ))}
                        </ol>
                      ) : null}

                      {ruta.cierre ? (
                        <p className="mt-7 border-l-2 border-gold pl-5 font-serif text-xl font-bold italic text-gold">
                          {ruta.cierre}
                        </p>
                      ) : null}
                    </div>
                  </details>
                );
              })}
            </div>
          </div>
        </section>

        {/* EL DIAGNÓSTICO */}
        <section className="grain relative overflow-hidden">
          <div className="relative mx-auto max-w-7xl px-6 py-24 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-[1fr_0.85fr] lg:items-center">
              <div>
                <p className="font-mono text-caption uppercase tracking-[0.3em] text-gold">
                  {DIAGNOSTICO_BLOQUE.kicker}
                </p>
                <h2 className="mt-4 font-serif text-display-lg font-bold leading-[1.05] text-neutral-50">
                  {DIAGNOSTICO_BLOQUE.pregunta}
                </h2>
                <p className="mt-6 max-w-xl text-lg text-neutral-300">
                  {DIAGNOSTICO_BLOQUE.cuerpo}
                </p>
                <p className="mt-5 max-w-xl border-l-2 border-gold/50 pl-5 text-neutral-300">
                  {DIAGNOSTICO_BLOQUE.entrega}
                </p>
                <Link
                  href={hrefDeEje(DIAGNOSTICO)}
                  className="group mt-9 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amarillo to-naranja px-7 py-3.5 text-sm font-bold text-carbon shadow-[0_12px_40px_rgba(232,114,44,0.4)] transition-all duration-200 ease-managers hover:-translate-y-0.5"
                >
                  <span className="text-left">
                    ¿Tienes un emprendimiento?{' '}
                    <span className="whitespace-nowrap">Haz el diagnóstico</span>
                  </span>
                  <ArrowRight
                    size={18}
                    aria-hidden
                    className="transition-transform duration-200 ease-managers group-hover:translate-x-1"
                  />
                </Link>
              </div>

              {/* Así se ve lo que recibe. Es una captura del diagnóstico real,
                  con un emprendimiento de ejemplo: prometer con una ilustración
                  genérica lo que llega como informe sería vender otra cosa. */}
              <figure className="m-0">
                <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0d1218]/85 p-3 shadow-[0_28px_70px_rgba(0,0,0,0.55)]">
                  <Image
                    src={asset('/fotos/diagnostico-ejemplo.webp')}
                    alt="Ejemplo del diagnóstico que se entrega: la etapa del emprendimiento, lo que ya tiene a favor, el mapa de madurez por frentes y los retos priorizados."
                    width={1000}
                    height={1304}
                    sizes="(max-width: 1024px) 100vw, 440px"
                    className="h-auto w-full rounded-xl"
                  />
                </div>
                <figcaption className="mt-4 text-center text-sm text-neutral-500">
                  Un ejemplo real del informe. El tuyo sale con tus respuestas, al terminar.
                </figcaption>
              </figure>
            </div>
          </div>
        </section>

        {/* CTA + ALIANZA */}
        <section className="grain relative overflow-hidden border-t border-white/10">
          <div className="relative mx-auto max-w-7xl px-6 py-24 lg:px-8">
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0d1218]/85 p-12 backdrop-blur-sm lg:p-16">
              <div className="relative grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:items-center">
                <div>
                  <p className="font-mono text-caption uppercase tracking-[0.3em] text-gold">
                    Conversemos
                  </p>
                  <h2 className="mt-4 font-serif text-3xl font-bold text-neutral-50 md:text-4xl">
                    {CONTENT.ctaTitle}
                  </h2>
                  <p className="mt-4 max-w-xl text-neutral-300">{CONTENT.ctaBody}</p>
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
                <p className="mt-1 text-sm text-neutral-400">{CONTENT.labAngle}</p>
              </div>
              <span
                className="inline-flex shrink-0 items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-carbon transition-transform duration-200 ease-managers group-hover:translate-x-1"
                style={{ backgroundColor: ICONE_CYAN }}
              >
                Ver la alianza
                <ArrowRight size={18} aria-hidden />
              </span>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
