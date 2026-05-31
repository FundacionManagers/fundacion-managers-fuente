import type { Metadata } from 'next';
import { TorneoBackdrop } from '@/components/torneo/TorneoBackdrop';
import { TorneoNav } from '@/components/torneo/TorneoNav';
import { RosterForm } from '@/components/torneo/RosterForm';

export const metadata: Metadata = {
  title: 'Registra tu plantel · Torneo Managers',
  description: 'Paso 3: registra los jugadores de tu equipo y sus fotos para el Torneo Managers.',
  robots: { index: false, follow: false },
};

export default function EquipoPage() {
  return (
    <div className="tournament-section relative">
      <TorneoBackdrop seed={73} query="stadium,locker,team" />

      <div className="relative z-10">
        <section className="relative overflow-hidden grain">
          <div className="relative mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-20">
            <span className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amarillo to-naranja px-4 py-1.5 font-bufon text-xs font-bold uppercase tracking-[0.18em] text-carbon">
              Inscripción · Paso 3 de 5
            </span>
            <h1 className="mt-6 font-sport text-[12vw] uppercase leading-[0.85] text-neutral-50 drop-shadow-[0_6px_24px_rgba(0,0,0,0.7)] lg:text-[80px]">
              Registra
              <br />
              tu plantel
            </h1>
            <div className="mt-5 h-1.5 w-32 rounded-full energy-bar" />
            <p className="mt-6 max-w-2xl text-lg text-neutral-300">
              Diligencia los datos de cada jugador y sube su foto. Se guarda solo: puedes salir y
              continuar después con el mismo enlace.
            </p>
          </div>
        </section>

        <TorneoNav active="/torneo/inscripciones/" />

        <section className="relative grain">
          <div className="relative mx-auto max-w-4xl px-6 py-16 lg:px-8 lg:py-20">
            <RosterForm />
          </div>
        </section>
      </div>
    </div>
  );
}
