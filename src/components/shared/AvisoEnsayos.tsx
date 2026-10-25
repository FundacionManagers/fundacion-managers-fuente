import { FlaskConical } from 'lucide-react';
import { EDICION_DATOS, ES_ENSAYOS } from '@/lib/entorno';

/**
 * Franja que grita «esto no es el sitio real».
 *
 * No va fija: al deslizar tapaba la mitad de la barra de pestañas del torneo,
 * que sí lo es. Sale arriba de cada página, que es donde se mira primero.
 *
 * Por qué es tan fea a propósito: el peor fallo posible de un entorno de
 * ensayos es que alguien cargue ahí el marcador de un partido de verdad,
 * lo dé por publicado y se entere el lunes. Una réplica idéntica a la real
 * invita justo a ese error. Naranja, arriba y en todas las páginas
 * —también en el panel— sale más barato que el susto.
 *
 * En producción no renderiza nada: ni un div vacío.
 */
export function AvisoEnsayos() {
  if (!ES_ENSAYOS) return null;

  return (
    <div
      role="status"
      className="relative z-[100] flex flex-wrap items-center justify-center gap-x-3 gap-y-1 bg-naranja px-4 py-2 text-center text-carbon"
    >
      <FlaskConical size={15} className="shrink-0" aria-hidden />
      <span className="font-bufon text-xs font-bold uppercase tracking-[0.15em]">
        Sitio de ensayos
      </span>
      <span className="text-xs font-medium">
        El torneo es una copia (edición {EDICION_DATOS}): lo que cargues aquí no sale en la web
        real. Las inscripciones están apagadas.
      </span>
      <a
        href="https://fundacionmanagers.com"
        className="text-xs font-bold underline underline-offset-2 hover:opacity-70"
      >
        Ir al sitio real
      </a>
    </div>
  );
}
