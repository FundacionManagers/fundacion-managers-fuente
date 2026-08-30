import type { Metadata } from 'next';
import Link from 'next/link';
import { CalendarDays, ListChecks, Trophy } from 'lucide-react';
import { TorneoBackdrop } from '@/components/torneo/TorneoBackdrop';
import { TorneoNav } from '@/components/torneo/TorneoNav';
import { ComprobanteInscripcion } from '@/components/torneo/ComprobanteInscripcion';
import { CelebracionTrofeo } from '@/components/torneo/CelebracionTrofeo';
import {
  GuardiaInscripcion,
  GuardiaInscripcionHero,
} from '@/components/torneo/GuardiaInscripcion';

export const metadata: Metadata = {
  title: 'Inscripción completa · Torneo Managers',
  description: 'Paso 5: inscripción completa. Consulta la programación del Torneo Managers.',
  robots: { index: false, follow: false },
};

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

export default function ListoPage() {
  return (
    <div className="tournament-section relative">
      <TorneoBackdrop seed={91} query="stadium,trophy,celebration" />

      <div className="relative z-10">
        {/* El guardián envuelve también el titular. Bloquear solo el cuerpo
            dejaba "¡Equipo inscrito! Completaste los 5 pasos" en letras
            enormes justo encima del aviso de "enlace no válido": la página se
            contradecía a sí misma en la misma pantalla. */}
        <GuardiaInscripcionHero>
          <section className="grain relative overflow-hidden">
            <div className="relative mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-20">
              <span className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amarillo to-naranja px-4 py-1.5 font-bufon text-xs font-bold uppercase tracking-[0.18em] text-carbon">
                Inscripción · Paso 5 de 5
              </span>
              <h1 className="mt-6 font-sport text-[12vw] uppercase leading-[0.85] text-neutral-50 drop-shadow-[0_6px_24px_rgba(0,0,0,0.7)] lg:text-[80px]">
                ¡Equipo
                <br />
                inscrito!
              </h1>
              <div className="energy-bar mt-5 h-1.5 w-32 rounded-full" />
              <p className="mt-6 max-w-2xl text-lg text-neutral-300">
                Completaste los 5 pasos. Ahora solo queda competir. Aquí sigues la programación del
                torneo en todo momento.
              </p>
            </div>
          </section>
        </GuardiaInscripcionHero>

        <TorneoNav active="/torneo/inscripciones/" />

        <section className="grain relative">
          <GuardiaInscripcion>
          <div className="relative mx-auto max-w-2xl px-6 py-16 lg:px-8 lg:py-20">
            {/* Stepper completo */}
            <div className="flex items-center justify-center gap-2" aria-hidden>
              {[1, 2, 3, 4, 5].map((n) => (
                <span
                  key={n}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-amarillo to-naranja text-sm font-bold text-carbon"
                >
                  ✓
                </span>
              ))}
            </div>

            <div className="mt-8 rounded-3xl border border-white/10 bg-[#0b0f14]/80 p-8 text-center">
              <Trophy size={48} className="mx-auto text-amarillo" />
              <h2 className="mt-3 font-sport text-3xl uppercase text-neutral-50">
                Paso 5 · Programación
              </h2>
              <p className="mt-4 text-sm text-neutral-300">
                Tu inscripción quedó completa. La{' '}
                <strong className="text-neutral-100">programación oficial</strong> (calendario,
                horarios y reglas) se publica en el sitio y te avisamos por el grupo de WhatsApp.
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <Link
                  href="/torneo/calendario/"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-amarillo to-naranja px-6 py-3.5 text-sm font-bold text-carbon transition-transform hover:-translate-y-0.5"
                >
                  <CalendarDays size={18} /> Ver calendario
                </Link>
                <Link
                  href="/torneo/bracket/"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 px-6 py-3.5 text-sm font-bold text-neutral-200 transition-colors hover:border-gold hover:text-gold"
                >
                  <ListChecks size={18} /> Ver la llave
                </Link>
              </div>

              <a
                href={`${BASE}/torneo/`}
                className="mt-4 inline-flex items-center justify-center gap-2 text-xs font-bold text-neutral-400 hover:text-gold"
              >
                Ir al inicio del torneo
              </a>

              <CelebracionTrofeo />

              <div className="border-t border-white/10 pt-6">
                <p className="text-xs uppercase tracking-wide text-neutral-400">
                  Tu comprobante de inscripción
                </p>
                <ComprobanteInscripcion />
              </div>
            </div>

            <p className="mt-6 text-center text-xs text-neutral-500">
              💡 Guarda el enlace de tu equipo en la pantalla de inicio de tu celular para volver
              cuando quieras.
            </p>
          </div>
          </GuardiaInscripcion>
        </section>
      </div>
    </div>
  );
}
