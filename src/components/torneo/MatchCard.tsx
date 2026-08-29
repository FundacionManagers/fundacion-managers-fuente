import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { TeamCrest } from '@/components/torneo/TeamCrest';
import { etiquetaTitulos } from '@/lib/torneo';
import { type Partido, getEquipo } from '@/lib/torneo-data';
import { cn } from '@/lib/utils';

function Side({ slug, align }: { slug: string | null; align: 'left' | 'right' }) {
  const eq = slug ? getEquipo(slug) : undefined;
  return (
    <div
      className={cn(
        'flex flex-1 items-center gap-3',
        align === 'right' && 'flex-row-reverse text-right',
      )}
    >
      <TeamCrest slug={slug} size={48} />
      <div className={cn('min-w-0', align === 'right' && 'items-end')}>
        <p className="truncate font-serif text-base font-bold leading-tight text-neutral-50">
          {eq?.nombre ?? 'Por definir'}
        </p>
        <p className="text-[11px] uppercase tracking-widest text-neutral-500">
          {eq ? eq.corto : '—'}
        </p>
      </div>
    </div>
  );
}

export function MatchCard({ p }: { p: Partido }) {
  const enVivo = p.estado === 'en-vivo';
  const jugado = p.estado === 'jugado';

  return (
    <article className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#11161d] via-[#0d1218] to-[#0b0f14] transition-all duration-300 ease-managers hover:-translate-y-1 hover:border-gold/40 hover:shadow-[0_24px_60px_rgba(0,0,0,0.55)]">
      {/* halo */}
      <span
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-gold/10 blur-3xl"
      />
      <div className="relative flex items-center justify-between border-b border-white/5 px-5 py-2.5">
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-500">
          {p.etiqueta}
        </span>
        {enVivo ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amarillo to-naranja px-2.5 py-0.5 font-bufon text-[10px] font-bold text-carbon">
            <span className="pulse-live h-1.5 w-1.5 rounded-full bg-carbon" /> EN VIVO
          </span>
        ) : (
          <span
            className={cn(
              'rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide',
              jugado ? 'bg-white/10 text-neutral-300' : 'bg-gold/15 text-gold',
            )}
          >
            {jugado ? 'Final' : 'Programado'}
          </span>
        )}
      </div>

      <div className="relative flex items-center gap-3 px-5 py-6">
        <Side slug={p.local} align="left" />

        <div className="flex shrink-0 flex-col items-center px-1">
          <div className="flex items-center gap-2 font-sport text-4xl leading-none text-neutral-50">
            <span className="tabular-nums">{p.golesLocal ?? '–'}</span>
            <span className="text-lg text-gold">:</span>
            <span className="tabular-nums">{p.golesVisitante ?? '–'}</span>
          </div>
          {p.penales ? (
            <span className="mt-1 font-mono text-[10px] uppercase tracking-widest text-gold">
              Pen. {p.penales.local}-{p.penales.visitante}
            </span>
          ) : null}
          <span className="mt-1.5 font-mono text-[10px] uppercase tracking-widest text-neutral-500">
            {p.hora}
          </span>
        </div>

        <Side slug={p.visitante} align="right" />
      </div>

      <div className="relative flex items-center justify-between border-t border-white/5 px-5 py-2.5">
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-500">
          {p.fecha}
        </span>
        {p.placeholder ? (
          <span className="text-[10px] uppercase tracking-widest text-neutral-600">
            Marcador por confirmar
          </span>
        ) : null}
      </div>
    </article>
  );
}

export function TeamBadge({ slug }: { slug: string }) {
  const eq = getEquipo(slug);
  if (!eq) return null;
  return (
    <Link
      href={`/torneo/equipos/${eq.slug}/`}
      className="group relative flex items-center gap-4 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#11161d] to-[#0b0f14] p-5 transition-all duration-300 ease-managers hover:-translate-y-1 hover:border-gold/40 hover:shadow-[0_24px_60px_rgba(0,0,0,0.5)]"
    >
      <span
        aria-hidden
        className="pointer-events-none absolute -left-10 -top-10 h-32 w-32 rounded-full blur-3xl"
        style={{ backgroundColor: `${eq.color}33` }}
      />
      <TeamCrest slug={eq.slug} size={56} showStars />
      <div className="relative min-w-0 flex-1">
        <p className="truncate font-serif text-lg font-bold text-neutral-50">{eq.nombre}</p>
        <p className="mt-0.5 text-xs uppercase tracking-widest text-neutral-500">
          {etiquetaTitulos(eq.titulos)}
        </p>
      </div>
      <ChevronRight
        size={18}
        aria-hidden
        className="relative shrink-0 text-neutral-600 transition-all duration-200 ease-managers group-hover:translate-x-1 group-hover:text-gold"
      />
    </Link>
  );
}
