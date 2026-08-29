import Link from 'next/link';
import { PuntoAviso } from '@/components/torneo/PuntoAviso';
import { TORNEO_TABS } from '@/lib/torneo-data';
import { cn } from '@/lib/utils';

interface TorneoNavProps {
  active: string;
  /**
   * Momento del próximo partido, en ISO. Enciende el punto de aviso en la
   * pestaña de Calendario cuando la fecha es hoy, mañana, o ya se jugó y
   * faltan los resultados. Si no se pasa, no hay punto.
   */
  avisoISO?: string;
}

/** Sub-navegación del hub del torneo (estilo Premier League). */
export function TorneoNav({ active, avisoISO }: TorneoNavProps) {
  return (
    <nav
      aria-label="Secciones del torneo"
      className="sticky top-16 z-30 border-b border-white/10 bg-[#0b0f14]/90 backdrop-blur-md"
    >
      <div className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-6 lg:px-8">
        {TORNEO_TABS.map((t) => {
          const isActive = t.href === active;
          const conAviso = avisoISO && t.href === '/torneo/calendario/';
          return (
            <Link
              key={t.href}
              href={t.href}
              className={cn(
                'relative whitespace-nowrap px-4 py-4 text-sm font-semibold transition-colors duration-200 ease-managers',
                isActive ? 'text-gold' : 'text-neutral-400 hover:text-neutral-100',
              )}
            >
              {t.label}
              {conAviso ? <PuntoAviso iso={avisoISO} /> : null}
              {isActive ? (
                <span
                  aria-hidden
                  className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-gold"
                />
              ) : null}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
