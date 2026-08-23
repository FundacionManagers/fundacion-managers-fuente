import Link from 'next/link';
import { ClipboardList, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Barra para saltar entre las pantallas de administración.
 *
 * Existe porque los dos paneles vivían en direcciones distintas sin nada que
 * los conectara, y había que recordarlas de memoria. La sesión es la misma en
 * ambos, así que cambiar de uno a otro no vuelve a pedir ingreso.
 */
const PANELES = [
  { href: '/inscripciones/', label: 'Inscripciones', icono: ClipboardList },
  { href: '/resultados/', label: 'Resultados del torneo', icono: Trophy },
] as const;

export function NavAdmin({ actual }: { actual: '/inscripciones/' | '/resultados/' }) {
  return (
    <nav aria-label="Paneles de administración" className="flex flex-wrap gap-2">
      {PANELES.map((p) => {
        const activo = p.href === actual;
        const Icono = p.icono;
        return (
          <Link
            key={p.href}
            href={p.href}
            aria-current={activo ? 'page' : undefined}
            className={cn(
              'inline-flex items-center gap-2 rounded-full px-4 py-2 font-bufon text-xs font-bold uppercase tracking-[0.12em] transition-colors',
              activo
                ? 'bg-gradient-to-r from-amarillo to-naranja text-carbon'
                : 'border border-white/15 text-neutral-400 hover:border-amarillo/50 hover:text-amarillo',
            )}
          >
            <Icono size={14} aria-hidden />
            {p.label}
          </Link>
        );
      })}
    </nav>
  );
}
