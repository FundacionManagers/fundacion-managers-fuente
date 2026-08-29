import { GoldCoin } from '@/components/shared/GoldCoin';
import { TeamCrest } from '@/components/torneo/TeamCrest';
import {
  CUARTOS,
  FINAL,
  SEMIS,
  TERCER_PUESTO,
  ganadorDe,
  getEquipo,
  type Partido,
} from '@/lib/torneo-data';
import { cn } from '@/lib/utils';
import { EDICION_EN_CURSO, ordinalFemenino } from '@/lib/torneo';

function Slot({
  slug,
  goles,
  penales,
  ganador,
}: {
  slug: string | null;
  goles: number | null;
  penales?: number;
  ganador?: boolean;
}) {
  const eq = slug ? getEquipo(slug) : undefined;
  return (
    <div className="flex items-center justify-between gap-2 px-4 py-3">
      <span className="flex min-w-0 items-center gap-3">
        <TeamCrest slug={slug} size={34} />
        <span
          className={cn(
            'truncate text-sm font-bold',
            ganador ? 'text-amarillo' : 'text-neutral-100',
          )}
        >
          {eq?.nombre ?? 'Por definir'}
        </span>
      </span>
      <span className="flex items-baseline gap-1.5">
        {penales != null ? (
          <span className="font-mono text-[11px] text-neutral-500">({penales})</span>
        ) : null}
        <span
          className={cn(
            'font-sport text-2xl tabular-nums',
            ganador ? 'text-amarillo' : 'text-neutral-500',
          )}
        >
          {goles ?? '–'}
        </span>
      </span>
    </div>
  );
}

function Tie({ p, highlight = false }: { p: Partido; highlight?: boolean }) {
  const ganador = ganadorDe(p);
  return (
    <div
      className={cn(
        'sweep overflow-hidden rounded-2xl border bg-gradient-to-br from-[#15110a] via-[#0d1218] to-[#0b0f14] shadow-[0_18px_50px_rgba(0,0,0,0.55)]',
        highlight ? 'border-amarillo/60' : 'border-white/10',
      )}
    >
      <div className="border-white/8 relative flex items-center justify-between border-b px-4 py-2">
        <span className="font-bufon text-[11px] font-bold uppercase tracking-[0.15em] text-naranja">
          {p.etiqueta}
        </span>
        <span className="font-mono text-[10px] uppercase tracking-widest text-amarillo/80">
          {p.fecha} · {p.hora}
        </span>
      </div>
      <Slot
        slug={p.local}
        goles={p.golesLocal}
        penales={p.penales?.local}
        ganador={ganador != null && ganador === p.local}
      />
      <div className="mx-4 h-px bg-white/10" />
      <Slot
        slug={p.visitante}
        goles={p.golesVisitante}
        penales={p.penales?.visitante}
        ganador={ganador != null && ganador === p.visitante}
      />
      {p.penales ? (
        <p className="border-white/8 border-t px-4 py-1.5 text-center font-mono text-[10px] uppercase tracking-widest text-neutral-500">
          Definido por penales
        </p>
      ) : null}
    </div>
  );
}

function Connector() {
  return (
    <div aria-hidden className="relative hidden w-10 shrink-0 self-stretch lg:block">
      <span className="conn-pulse absolute left-0 top-1/2 h-0.5 w-full -translate-y-1/2 bg-white/10" />
    </div>
  );
}

/** Cuadro de eliminatorias estilo mundial: grande, con movimiento y glow. */
export function BracketView() {
  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex min-w-[1000px] items-stretch gap-0 lg:min-w-0">
        <div className="stagger-in flex flex-1 flex-col justify-around gap-6">
          <p className="mb-1 font-bufon text-sm font-bold uppercase tracking-[0.2em] text-naranja">
            Cuartos de final
          </p>
          {CUARTOS.map((p) => (
            <Tie key={p.id} p={p} />
          ))}
        </div>

        <Connector />

        <div className="stagger-in flex flex-1 flex-col justify-around gap-6">
          <p className="mb-1 font-bufon text-sm font-bold uppercase tracking-[0.2em] text-naranja">
            Semifinales
          </p>
          {SEMIS.map((p) => (
            <Tie key={p.id} p={p} />
          ))}
        </div>

        <Connector />

        <div className="flex flex-1 flex-col justify-center gap-6">
          <p className="mb-1 text-center font-bufon text-sm font-bold uppercase tracking-[0.2em] text-amarillo">
            Gran Final
          </p>
          <div className="relative">
            <span aria-hidden className="absolute -inset-6 rounded-3xl bg-amarillo/15 blur-2xl" />
            <div className="relative rounded-2xl bg-gradient-to-br from-amarillo/30 via-transparent to-transparent p-[2px]">
              <Tie p={FINAL} highlight />
            </div>
          </div>
          <div className="flex flex-col items-center gap-2 pt-3">
            <div className="float-y">
              <GoldCoin size={110} animate />
            </div>
            <p className="text-center font-serif text-base italic text-neutral-300">
              La {ordinalFemenino(EDICION_EN_CURSO.numero)} moneda dorada
            </p>
          </div>

          <div className="pt-2">
            <p className="mb-1 text-center font-bufon text-sm font-bold uppercase tracking-[0.2em] text-naranja">
              Tercer puesto
            </p>
            <Tie p={TERCER_PUESTO} />
          </div>
        </div>
      </div>
    </div>
  );
}
