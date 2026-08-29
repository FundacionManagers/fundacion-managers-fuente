import type { Metadata } from 'next';
import { TorneoBackdrop } from '@/components/torneo/TorneoBackdrop';
import { TorneoNav } from '@/components/torneo/TorneoNav';
import { InscripcionForm } from '@/components/torneo/InscripcionForm';
import { EDICION_INSCRIPCIONES, ordinalFemenino, rotuloEdicion } from '@/lib/torneo';

// La edición a la que se inscribe un equipo NO es la que se está jugando.
// Sale de EDICIONES y cambia sola cuando se abre la siguiente.
const EDICION = rotuloEdicion(EDICION_INSCRIPCIONES);
const MONEDA = ordinalFemenino(EDICION_INSCRIPCIONES.numero);

export const metadata: Metadata = {
  title: 'Inscripciones · Torneo Managers',
  description: `Inscribe tu equipo al Torneo Managers F7 — ${EDICION}. Conoce el proceso paso a paso.`,
};

interface Paso {
  numero: number;
  titulo: string;
  detalle: string;
}

const PASOS: readonly Paso[] = [
  {
    numero: 1,
    titulo: 'Diligencia el formulario',
    detalle: 'Déjanos el nombre del capitán y el nombre del equipo. Es el primer contacto.',
  },
  {
    numero: 2,
    titulo: 'Te unimos al grupo de WhatsApp',
    detalle:
      'Te agregamos al grupo del torneo y te enviamos el link para inscribir oficialmente al equipo.',
  },
  {
    numero: 3,
    titulo: 'Confirma la inscripción',
    detalle:
      'Diligencias el link con el logo del equipo y la foto en fondo blanco de cada jugador.',
  },
  {
    numero: 4,
    titulo: 'Realiza el pago',
    detalle:
      'Una semana antes del arranque, pagas la inscripción de forma segura con el botón Bold.',
  },
  {
    numero: 5,
    titulo: 'Recibe la programación',
    detalle: 'Te enviamos el calendario, las reglas y todos los detalles para competir.',
  },
];

export default function InscripcionesPage() {
  return (
    <div className="tournament-section relative">
      <TorneoBackdrop seed={61} query="stadium,floodlights,night" />

      <div className="relative z-10">
        {/* HERO */}
        <section className="grain relative overflow-hidden">
          <div className="relative mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-28">
            <span className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amarillo to-naranja px-4 py-1.5 font-bufon text-xs font-bold uppercase tracking-[0.18em] text-carbon">
              Inscripciones · {EDICION}
            </span>
            <h1 className="mt-6 font-sport text-[14vw] uppercase leading-[0.85] text-neutral-50 drop-shadow-[0_6px_24px_rgba(0,0,0,0.7)] lg:text-[100px]">
              Inscribe
              <br />
              tu equipo
            </h1>
            <div className="energy-bar mt-5 h-1.5 w-32 rounded-full" />
            <p className="mt-6 max-w-2xl text-lg text-neutral-300">
              ¿Tu equipo va por la {MONEDA} moneda? Empieza dejándonos tus datos. Te unimos al grupo
              de WhatsApp y te guiamos en cada paso hasta la cancha.
            </p>
          </div>
        </section>

        <TorneoNav active="/torneo/inscripciones/" />

        <section className="grain relative">
          <div className="relative mx-auto grid max-w-7xl gap-16 px-6 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:px-8 lg:py-24">
            {/* PROCESO */}
            <div>
              <p className="font-bufon text-sm font-bold uppercase tracking-[0.25em] text-naranja">
                Cómo funciona
              </p>
              <h2 className="mt-2 font-sport text-5xl uppercase leading-none text-neutral-50 md:text-6xl">
                El proceso
              </h2>
              <div className="energy-bar mt-5 h-1 w-full rounded-full opacity-70" />

              <ol className="mt-10 space-y-5">
                {PASOS.map((p) => (
                  <li
                    key={p.numero}
                    className="flex gap-5 rounded-2xl border border-white/10 bg-[#0d1218]/70 p-6 backdrop-blur-sm"
                  >
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amarillo to-naranja font-sport text-2xl text-carbon">
                      {p.numero}
                    </span>
                    <div>
                      <h3 className="font-serif text-xl font-bold text-neutral-50">{p.titulo}</h3>
                      <p className="mt-1 text-sm text-neutral-300">{p.detalle}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            {/* FORMULARIO */}
            <div className="lg:sticky lg:top-28 lg:self-start">
              <div className="rounded-3xl border border-white/10 bg-[#0b0f14]/80 p-8 shadow-[0_40px_100px_rgba(0,0,0,0.6)] backdrop-blur-sm">
                <InscripcionForm />
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
