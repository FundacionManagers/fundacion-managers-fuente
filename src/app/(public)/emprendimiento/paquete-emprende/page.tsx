import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, MessageCircle } from 'lucide-react';
import { SectionBackdrop } from '@/components/shared/SectionBackdrop';
import { visualDeEje } from '@/lib/eje-visual';
import { ENTREGABLES, PAQUETE, enlaceWhatsApp } from '@/lib/emprendimiento';

/**
 * La página del paquete Emprende. Existe porque Jorge la pidió aparte: el
 * detalle del programa no cabía en una tarjeta de la sección y solo interesa
 * a quien ya decidió mirar la ruta 02. Se llega por el botón, no por el menú.
 */

export const metadata: Metadata = {
  title: 'Paquete Emprende',
  description:
    'Tres meses de acompañamiento, doce sesiones de mentoría y ocho entregables que se quedan contigo. El programa de incubación de la Fundación Managers.',
};

const MENSAJE_WHATSAPP =
  'Hola, vi el paquete Emprende en la página de la Fundación Managers y quiero iniciar el proceso.';

export default function PaqueteEmprendePage() {
  const vis = visualDeEje('emprendimiento');

  return (
    <div className="relative">
      <SectionBackdrop tint={vis.tint} image="/fotos/seccion-emprendimiento.jpg" wide />
      <div className="relative z-10">
        {/* HERO */}
        <section className="grain relative overflow-hidden text-neutral-200">
          <div className="relative mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-28">
            <Link
              href="/emprendimiento/"
              className="group inline-flex items-center gap-2 text-sm font-semibold text-neutral-400 transition-colors duration-200 ease-managers hover:text-gold"
            >
              <ArrowLeft
                size={16}
                aria-hidden
                className="transition-transform duration-200 ease-managers group-hover:-translate-x-1"
              />
              Emprendimiento
            </Link>

            <div className="mt-8 max-w-3xl animate-fade-up">
              <p className="font-mono text-caption uppercase tracking-[0.3em] text-terracotta">
                {PAQUETE.kicker}
              </p>
              <h1 className="mt-4 font-serif text-[42px] font-bold leading-[1.03] text-neutral-50 md:text-[60px]">
                {PAQUETE.nombre}
              </h1>
              <p className="mt-5 font-serif text-2xl italic leading-snug text-gold">
                {PAQUETE.titular}
              </p>
              <p className="mt-6 text-lg text-neutral-300">{PAQUETE.entrada}</p>
            </div>

            <dl className="mt-12 grid max-w-2xl gap-px overflow-hidden rounded-2xl border border-white/15 sm:grid-cols-3">
              {PAQUETE.duracion.map((d) => (
                <div key={d.etiqueta} className="bg-[#141a22]/90 p-7 text-center">
                  <dt className="sr-only">{d.etiqueta}</dt>
                  <dd>
                    <span className="block font-bufon text-5xl font-bold leading-none text-gold">
                      {d.valor}
                    </span>
                    <span className="mt-3 block font-mono text-caption uppercase tracking-widest text-neutral-400">
                      {d.etiqueta}
                    </span>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* LOS OCHO ENTREGABLES */}
        <section className="relative overflow-hidden border-y border-cream-deep bg-cream">
          <div className="relative mx-auto max-w-7xl px-6 py-24 lg:px-8">
            <div className="max-w-3xl">
              <p className="font-mono text-caption uppercase tracking-[0.3em] text-terracotta">
                Qué te llevas
              </p>
              <h2 className="mt-4 font-serif text-display-lg font-bold leading-[1.05] text-carbon">
                Ocho entregables. Todos son tuyos.
              </h2>
              <p className="mt-6 text-lg text-neutral-600">
                No se prestan ni se quedan en la fundación. Al terminar los tres meses, cada una de
                estas cosas está hecha, está en tus manos y la sigues usando.
              </p>
            </div>

            <ol className="mt-14 grid gap-6 md:grid-cols-2">
              {ENTREGABLES.map((e, i) => (
                <li
                  key={e.titulo}
                  className="flex h-full flex-col rounded-2xl border border-cream-deep bg-neutral-50 p-8 shadow-[0_10px_34px_rgba(15,20,25,0.07)] transition-all duration-300 ease-managers hover:-translate-y-1 hover:border-gold/60"
                >
                  <span
                    aria-hidden
                    className="font-bufon text-4xl font-bold leading-none text-gold"
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <h3 className="mt-4 font-serif text-xl font-bold text-carbon">{e.titulo}</h3>
                  <p className="mt-1 text-sm font-semibold text-terracotta">{e.resumen}</p>
                  <p className="mt-4 flex-1 text-sm leading-relaxed text-neutral-600">
                    {e.detalle}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* CIERRE + WHATSAPP */}
        <section className="grain relative overflow-hidden text-neutral-200">
          <div className="relative mx-auto max-w-7xl px-6 py-24 lg:px-8">
            <div className="overflow-hidden rounded-3xl border border-gold/35 bg-[#141a22]/92 p-12 backdrop-blur-sm lg:p-16">
              <div className="grid gap-10 lg:grid-cols-[1.3fr_1fr] lg:items-center">
                <div>
                  <p className="font-serif text-[32px] font-bold leading-tight text-gold md:text-[42px]">
                    {PAQUETE.cierre}
                  </p>
                  <p className="mt-6 max-w-xl text-lg text-neutral-300">
                    Los cupos de cada cohorte son contados, porque las doce sesiones son uno a uno.
                    Escríbenos y te contamos cuándo abre la siguiente y qué necesitas para entrar.
                  </p>
                </div>
                <div className="flex lg:justify-end">
                  <a
                    href={enlaceWhatsApp(MENSAJE_WHATSAPP)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-3 rounded-full bg-gold px-8 py-4 text-base font-bold text-carbon shadow-gold transition-all duration-200 ease-managers hover:-translate-y-0.5 hover:bg-gold-hover"
                  >
                    <MessageCircle size={20} aria-hidden />
                    Escríbenos por WhatsApp
                    <ArrowRight
                      size={18}
                      aria-hidden
                      className="transition-transform duration-200 ease-managers group-hover:translate-x-1"
                    />
                  </a>
                </div>
              </div>
            </div>

            <p className="mt-8 text-center text-sm text-neutral-500">
              ¿Todavía no sabes si el paquete es para ti?{' '}
              <Link
                href="/emprendedores.html"
                className="font-semibold text-gold underline-offset-4 hover:underline"
              >
                Haz primero el diagnóstico
              </Link>
              : son veinticinco minutos y sale con tu nombre.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
