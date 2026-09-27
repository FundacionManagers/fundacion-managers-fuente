import { Award, Crown, Medal, ShieldCheck, Star, Target, Trophy } from 'lucide-react';
import { TeamCrest } from '@/components/torneo/TeamCrest';
import {
  equipoMasGoleador,
  podioDeEdicion,
  puntosJuegoLimpio,
  tablaJuegoLimpio,
  totalesDeEdicion,
  vallaMenosVencida,
} from '@/lib/liga';
import type { DatosLiga } from '@/lib/liga-supabase';
import { calcularPosiciones } from '@/lib/liga';
import { getEquipo } from '@/lib/torneo-data';
import { cn } from '@/lib/utils';

/**
 * El panel de premios de la clausura.
 *
 * DECISIÓN DE DISEÑO, y es la que importa: **todo se cuenta sobre la edición
 * completa**, no sobre la fase de grupos. La tabla de posiciones sí es de la
 * fase regular —es la que reparte puntos— pero los premios se entregan por
 * lo que hizo el club en los nueve o diez partidos que jugó.
 *
 * No es un matiz. Con la cifra de la fase de grupos, «la valla menos
 * vencida» la ganaba un club y con la de la edición completa, otro: el
 * premio se habría entregado al equipo equivocado.
 *
 * Nada de esto se escribe a mano. El campeón sale de la Gran Final, el
 * goleador del ranking, la valla de los goles recibidos. Lo único que se
 * carga a mano es el MVP, porque no hay dato en el sistema que lo sustente.
 * Mientras un premio no se pueda demostrar, dice «Por definir» en vez de
 * adelantar un nombre.
 */

interface Casilla {
  rotulo: string;
  icono: React.ComponentType<{ size?: number; className?: string }>;
  /** Club ganador, si ya se sabe. */
  equipo?: string | null;
  /** Nombre de la persona, cuando el premio es individual. */
  persona?: string | null;
  /** La cifra que lo gana, ya redactada. */
  detalle?: string | null;
  /** El podio va destacado: es lo que la gente viene a ver. */
  tono?: 'oro' | 'plata' | 'bronce' | 'normal';
}

function Casilla({ c }: { c: Casilla }) {
  const eq = c.equipo ? getEquipo(c.equipo) : undefined;
  const definido = Boolean(c.equipo || c.persona);
  const Icono = c.icono;

  const borde =
    c.tono === 'oro'
      ? 'border-amarillo/50 bg-amarillo/[0.07]'
      : c.tono === 'plata'
        ? 'border-white/25 bg-white/[0.04]'
        : c.tono === 'bronce'
          ? 'border-naranja/40 bg-naranja/[0.06]'
          : 'border-white/10 bg-black/30';

  return (
    <div
      className={cn(
        'flex flex-col rounded-2xl border p-5',
        definido ? borde : 'border-dashed border-white/15 bg-black/20',
      )}
    >
      <p
        className={cn(
          'flex items-center gap-2 font-bufon text-[11px] font-bold uppercase tracking-[0.15em]',
          c.tono === 'oro' ? 'text-amarillo' : 'text-neutral-400',
        )}
      >
        <Icono size={14} aria-hidden className="shrink-0" />
        {c.rotulo}
      </p>

      {definido ? (
        <>
          <div className="mt-3 flex items-center gap-2.5">
            {c.equipo ? <TeamCrest slug={c.equipo} size={c.tono === 'oro' ? 40 : 32} /> : null}
            <span
              className={cn(
                'min-w-0 font-sport uppercase leading-none text-neutral-50',
                c.tono === 'oro' ? 'text-3xl' : 'text-2xl',
              )}
            >
              {c.persona ?? eq?.nombre ?? c.equipo}
            </span>
          </div>
          {c.persona && c.equipo ? (
            <p className="mt-1.5 text-xs text-neutral-400">{eq?.nombre ?? c.equipo}</p>
          ) : null}
          {c.detalle ? <p className="mt-2 text-sm text-neutral-300">{c.detalle}</p> : null}
        </>
      ) : (
        <p className="mt-3 font-sport text-2xl uppercase leading-none text-neutral-600">
          Por definir
        </p>
      )}
    </div>
  );
}

export function PanelPremios({ datos }: { datos: DatosLiga }) {
  // Todas las fases juntas: es lo que distingue este cálculo del de la tabla.
  const totales = totalesDeEdicion([...datos.partidos, ...datos.eliminatoria]);
  const podio = podioDeEdicion(datos.eliminatoria);
  const goleador = datos.goleadores[0] ?? null;
  const artillero = equipoMasGoleador(totales);
  const valla = vallaMenosVencida(totales);

  // El juego limpio sí sale de la tabla: las tarjetas se llevan por club y
  // por edición, no por partido, así que ya vienen acumuladas de todas las
  // fases. El puesto en la tabla solo se usa para desempatar.
  const limpio = tablaJuegoLimpio(calcularPosiciones(datos.partidos, datos.disciplina))[0] ?? null;

  const mvp = datos.premios.find((p) => p.clave === 'mvp') ?? null;

  const casillas: Casilla[] = [
    {
      rotulo: 'Campeón',
      icono: Trophy,
      equipo: podio.campeon,
      tono: 'oro',
      detalle: podio.campeon ? 'Ganador de la Gran Final' : null,
    },
    {
      rotulo: 'Subcampeón',
      icono: Medal,
      equipo: podio.subcampeon,
      tono: 'plata',
    },
    {
      rotulo: 'Tercer puesto',
      icono: Medal,
      equipo: podio.tercero,
      tono: 'bronce',
    },
    {
      rotulo: 'Equipo más goleador',
      icono: Target,
      equipo: artillero?.equipo,
      detalle: artillero ? `${artillero.valor} goles en la edición` : null,
    },
    {
      rotulo: 'Goleador · bota de oro',
      icono: Award,
      persona: goleador?.jugador,
      equipo: goleador?.equipo,
      detalle: goleador
        ? `${goleador.goles} goles${goleador.numero ? ` · dorsal ${goleador.numero}` : ''}`
        : null,
    },
    {
      rotulo: 'Valla menos vencida',
      icono: ShieldCheck,
      equipo: valla?.equipo,
      detalle: valla ? `${valla.valor} goles en contra en la edición` : null,
    },
    {
      rotulo: 'Fair Play',
      icono: Star,
      equipo: limpio?.equipo,
      detalle: limpio
        ? `${puntosJuegoLimpio(limpio)} puntos · ${limpio.ta} amarillas, ${limpio.tr} rojas`
        : null,
    },
    {
      rotulo: 'MVP del torneo',
      icono: Crown,
      persona: mvp?.jugador,
      equipo: mvp?.equipo,
      detalle: mvp ? (mvp.nota ?? 'Elección del jurado') : null,
    },
  ];

  return (
    <section>
      <p className="font-bufon text-xs font-bold uppercase tracking-[0.25em] text-naranja">
        La clausura
      </p>
      <h2 className="mt-1 font-sport text-4xl uppercase leading-none text-neutral-50 md:text-5xl">
        Panel de premios
      </h2>
      <div className="energy-bar mt-5 h-1 w-full rounded-full opacity-70" />

      <p className="mt-5 max-w-2xl text-sm text-neutral-400">
        Todo se cuenta sobre la <strong className="text-neutral-200">edición completa</strong> —las
        siete fechas más la fase final—, no solo sobre la fase de grupos. Sale de los mismos
        marcadores que se cargan cada semana: ninguna de estas cifras se escribe a mano.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {casillas.map((c) => (
          <Casilla key={c.rotulo} c={c} />
        ))}
      </div>
    </section>
  );
}
