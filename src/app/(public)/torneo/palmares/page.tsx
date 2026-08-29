import type { Metadata } from 'next';
import { PalmaresTorneo } from '@/components/torneo/PalmaresTorneo';
import { TorneoShell } from '@/components/torneo/TorneoShell';
import { EDICIONES } from '@/lib/torneo';

export const metadata: Metadata = {
  title: 'Palmarés · Torneo Managers',
  description:
    'Todas las ediciones del Torneo Managers F7, con su campeón y los títulos acumulados por club.',
};

export default function PalmaresPage() {
  return (
    <TorneoShell
      eyebrow={`${EDICIONES.length} ediciones · 2025-2026`}
      title="Palmarés"
      active="/torneo/palmares/"
    >
      <PalmaresTorneo />
    </TorneoShell>
  );
}
