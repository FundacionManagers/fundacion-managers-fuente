import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { GoldCoin } from '@/components/shared/GoldCoin';
import { TorneoBackdrop } from '@/components/torneo/TorneoBackdrop';
import { GuiaPanel } from '@/components/torneo/GuiaPanel';

export const metadata: Metadata = {
  title: 'Cómo usar el panel · Fundación Managers',
  description: 'Guía paso a paso para cargar resultados del Torneo Managers.',
  robots: { index: false, follow: false },
};

export default function GuiaPage() {
  return (
    <div className="tournament-section relative min-h-screen">
      <TorneoBackdrop />

      <div className="grain relative z-10">
        <div className="mx-auto max-w-3xl px-6 py-12 lg:py-16">
          <Link
            href="/resultados/"
            className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 font-bufon text-xs font-bold uppercase tracking-[0.12em] text-neutral-300 transition-colors hover:border-amarillo/50 hover:text-amarillo"
          >
            <ArrowLeft size={14} aria-hidden />
            Volver al panel
          </Link>

          <div className="mt-10 flex flex-wrap items-center justify-between gap-6">
            <div className="animate-fade-up">
              <p className="font-bufon text-sm font-bold uppercase tracking-[0.25em] text-naranja">
                Guía de uso
              </p>
              <h1 className="mt-2 font-sport text-5xl uppercase leading-none text-neutral-50 md:text-6xl">
                Cómo cargar
                <br />
                <span className="text-energy">una fecha</span>
              </h1>
              <p className="mt-5 max-w-lg text-sm text-neutral-300">
                Seis pasos, de principio a fin. Toca cada uno para desplegarlo. No hace falta
                leerlos todos: la mayoría de las veces solo usarás el 2 y el 6.
              </p>
            </div>

            <GoldCoin size={130} className="hidden shrink-0 sm:block" />
          </div>

          <div className="energy-bar mt-10 h-1 w-full rounded-full opacity-80" />

          <div className="mt-10">
            <GuiaPanel />
          </div>

          <p className="mt-14 border-t border-white/10 pt-6 text-xs text-neutral-500">
            Todo lo que hagas en el panel se puede deshacer. Si algo no cuadra, el propio panel te
            avisa antes de que salga a la web.
          </p>
        </div>
      </div>
    </div>
  );
}
