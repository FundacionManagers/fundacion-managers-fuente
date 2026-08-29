import type { Metadata } from 'next';
import { PalmaresTorneo } from '@/components/torneo/PalmaresTorneo';
import { TorneoShell } from '@/components/torneo/TorneoShell';
import { EDICIONES_DISPUTADAS } from '@/lib/torneo';

export const metadata: Metadata = {
  title: 'Palmarés · Torneo Managers',
  description:
    'Todas las ediciones del Torneo Managers F7, con su campeón y los títulos acumulados por club.',
};

// Años que abarca el palmarés, sacados de los periodos: '2025-1' → 2025.
const ANIOS = EDICIONES_DISPUTADAS.map((e) => e.periodo.split('-')[0]);
const RANGO = ANIOS[0] === ANIOS[ANIOS.length - 1] ? ANIOS[0] : `${ANIOS[0]}-${ANIOS.at(-1)}`;

export default function PalmaresPage() {
  return (
    <TorneoShell
      eyebrow={`${EDICIONES_DISPUTADAS.length} ediciones · ${RANGO}`}
      title="Palmarés"
      active="/torneo/palmares/"
    >
      <PalmaresTorneo />
    </TorneoShell>
  );
}
