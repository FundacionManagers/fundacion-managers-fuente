import type { Eje } from '@/lib/navigation';
import { cn } from '@/lib/utils';

interface EjeHeroProps {
  eje: Eje;
}

export function EjeHero({ eje }: EjeHeroProps) {
  const isDark = eje.theme === 'dark';

  return (
    <section
      className={cn(
        'border-b',
        isDark ? 'border-neutral-800 bg-carbon text-neutral-50' : 'border-neutral-200',
      )}
    >
      <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8 lg:py-32">
        <p className={cn('font-mono text-caption uppercase tracking-widest', eje.accent)}>
          {eje.tagline}
        </p>
        <h1
          className={cn(
            'mt-4 font-display text-display-lg md:text-display-xl',
            isDark ? 'text-neutral-50' : 'text-carbon',
          )}
        >
          {eje.nombre}
        </h1>
        <p
          className={cn('mt-6 max-w-2xl text-lg', isDark ? 'text-neutral-300' : 'text-neutral-700')}
        >
          {eje.descripcion}
        </p>
      </div>
    </section>
  );
}
