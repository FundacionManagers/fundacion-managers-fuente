import { cn } from '@/lib/utils';

interface PlaceholderSectionProps {
  title: string;
  bullets?: readonly string[];
  dark?: boolean;
}

/**
 * Bloque de contenido placeholder. Marca explícitamente que la información
 * definitiva sale del documento maestro y aún no está integrada.
 */
export function PlaceholderSection({ title, bullets, dark = false }: PlaceholderSectionProps) {
  return (
    <section
      className={cn(
        'mx-auto max-w-7xl px-6 py-16 lg:px-8',
        dark ? 'text-neutral-100' : 'text-carbon',
      )}
    >
      <h2 className="font-display text-2xl font-bold">{title}</h2>
      {bullets && bullets.length > 0 ? (
        <ul
          className={cn(
            'mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3',
            dark ? 'text-neutral-300' : 'text-neutral-700',
          )}
        >
          {bullets.map((b) => (
            <li
              key={b}
              className={cn(
                'rounded-md border p-6 text-sm',
                dark ? 'border-neutral-800 bg-neutral-900/50' : 'border-neutral-200 bg-white',
              )}
            >
              {b}
            </li>
          ))}
        </ul>
      ) : null}
      <p
        className={cn(
          'mt-8 rounded-md border border-dashed px-4 py-3 text-xs uppercase tracking-widest',
          dark ? 'border-neutral-700 text-neutral-500' : 'border-neutral-300 text-neutral-500',
        )}
      >
        Contenido por integrar desde Managers_Especificaciones_v2.docx
      </p>
    </section>
  );
}
