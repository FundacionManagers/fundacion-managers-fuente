import type { Metadata } from 'next';
import { CampeonReveal } from '@/components/torneo/CampeonReveal';
import { PalmaresTorneo } from '@/components/torneo/PalmaresTorneo';
import { TorneoShell } from '@/components/torneo/TorneoShell';
import { CAMPEON_VIGENTE, EDICIONES_DISPUTADAS } from '@/lib/torneo';
import { FINAL, ganadorDe, getEquipo } from '@/lib/torneo-data';

export const metadata: Metadata = {
  title: 'Palmarés · Torneo Managers',
  description:
    'Todas las ediciones del Torneo Managers F7, con su campeón y los títulos acumulados por club.',
};

// Años que abarca el palmarés, sacados de los periodos: '2025-1' → 2025.
const ANIOS = EDICIONES_DISPUTADAS.map((e) => e.periodo.split('-')[0]);
const RANGO = ANIOS[0] === ANIOS[ANIOS.length - 1] ? ANIOS[0] : `${ANIOS[0]}-${ANIOS.at(-1)}`;

export default function PalmaresPage() {
  const campeon = getEquipo(ganadorDe(FINAL) ?? '');
  const loc = FINAL.local ? getEquipo(FINAL.local) : undefined;
  const vis = FINAL.visitante ? getEquipo(FINAL.visitante) : undefined;

  return (
    <TorneoShell
      eyebrow={`${EDICIONES_DISPUTADAS.length} ediciones · ${RANGO}`}
      title="Palmarés"
      active="/torneo/palmares/"
    >
      {/* La celebración del último campeón encabeza esta página, que es la
          de los títulos. Vivía en el hero del Resumen, donde lo primero que
          se leía era "Torneo finalizado" mientras la cuarta edición seguía
          en juego. */}
      <div className="mb-16">
        <CampeonReveal
          slug={campeon?.slug ?? FINAL.visitante ?? 'the-originals'}
          nombre={campeon?.nombre ?? CAMPEON_VIGENTE.equipo}
          scoreText={`${vis?.corto ?? 'ORI'} ${FINAL.golesVisitante}–${FINAL.golesLocal} ${loc?.corto ?? 'PIB'}`}
          edicion={`Edición ${CAMPEON_VIGENTE.edicion}° (${CAMPEON_VIGENTE.periodo})`}
        />
      </div>

      <PalmaresTorneo />
    </TorneoShell>
  );
}
