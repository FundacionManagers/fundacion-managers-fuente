'use client';

import { PuertaAdmin } from '@/components/shared/PuertaAdmin';
import { PanelResultados } from '@/components/torneo/PanelResultados';

/**
 * Une la puerta de acceso con el panel.
 *
 * Existe como componente aparte porque `PuertaAdmin` recibe sus hijos como
 * función —para pasarles el `salir`— y una función no puede cruzar la
 * frontera desde un componente de servidor. Así la página sigue siendo de
 * servidor y conserva su `metadata`.
 */
export function PanelTorneoCliente() {
  return (
    <PuertaAdmin titulo="Panel del torneo">
      {(salir) => <PanelResultados salir={salir} />}
    </PuertaAdmin>
  );
}
