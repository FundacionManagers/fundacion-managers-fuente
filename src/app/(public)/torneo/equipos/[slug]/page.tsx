import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Star } from 'lucide-react';
import { GoldCoin } from '@/components/shared/GoldCoin';
import { MatchCard } from '@/components/torneo/MatchCard';
import { PlayerAvatar } from '@/components/torneo/PlayerAvatar';
import { TeamCrest } from '@/components/torneo/TeamCrest';
import { TorneoBackdrop } from '@/components/torneo/TorneoBackdrop';
import { TorneoNav } from '@/components/torneo/TorneoNav';
import { EDICION_ACTUAL, PERIODO_ACTUAL, calcularPosiciones, type PartidoLiga } from '@/lib/liga';
import { cargarLigaConAviso } from '@/lib/liga-supabase';
import { etiquetaTitulos } from '@/lib/torneo';
import { BRACKET_2026, EQUIPOS, getEquipo } from '@/lib/torneo-data';
import { cn } from '@/lib/utils';

interface Props {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return EQUIPOS.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const eq = getEquipo(slug);
  if (!eq) return {};
  return { title: `${eq.nombre} · Torneo Managers` };
}

/** Una fila del fixture de liga, vista desde la ficha de un club. */
function FilaLiga({ p, slug }: { p: PartidoLiga; slug: string }) {
  const rival = getEquipo(p.local === slug ? p.visitante : p.local);
  const enCasa = p.local === slug;
  const jugado = p.estado === 'jugado' && p.golesLocal != null && p.golesVisitante != null;
  const propios = enCasa ? p.golesLocal : p.golesVisitante;
  const ajenos = enCasa ? p.golesVisitante : p.golesLocal;
  const gana = jugado && propios! > ajenos!;
  const pierde = jugado && propios! < ajenos!;

  return (
    <li
      className={cn(
        'flex items-center gap-4 rounded-xl border px-4 py-3',
        jugado ? 'border-white/10 bg-black/40' : 'border-dashed border-white/10 bg-black/20',
      )}
    >
      <span className="w-16 shrink-0 font-mono text-[11px] uppercase tracking-widest text-neutral-500">
        Fecha {p.jornada}
      </span>
      <TeamCrest slug={rival?.slug ?? ''} size={30} />
      <span className="min-w-0 flex-1 truncate text-sm font-semibold text-neutral-200">
        {rival?.nombre ?? '—'}
        <span className="ml-2 text-[11px] uppercase tracking-widest text-neutral-600">
          {enCasa ? 'Local' : 'Visitante'}
        </span>
      </span>
      {jugado ? (
        <span
          className={cn(
            'shrink-0 rounded-lg bg-white/[0.06] px-3 py-1 font-sport text-xl leading-none',
            gana ? 'text-amarillo' : pierde ? 'text-neutral-500' : 'text-neutral-300',
          )}
        >
          {propios}–{ajenos}
        </span>
      ) : (
        <span className="shrink-0 font-bufon text-[10px] uppercase tracking-widest text-neutral-600">
          {p.fecha} · {p.hora}
        </span>
      )}
    </li>
  );
}

export default async function EquipoPage({ params }: Props) {
  const { slug } = await params;
  const eq = getEquipo(slug);
  if (!eq) notFound();

  const datos = await cargarLigaConAviso();
  const posiciones = calcularPosiciones(datos.partidos, datos.disciplina);
  const fila = posiciones.find((f) => f.equipo === eq.slug);

  // Partidos de la edicion EN CURSO. La ficha mostraba solo la llave de la 3a
  // edicion, asi que un club eliminado en cuartos aparecia con un unico
  // partido y su ficha no decia nada del torneo que se esta jugando.
  const partidosLiga = datos.partidos.filter((p) => p.local === eq.slug || p.visitante === eq.slug);
  const historial = BRACKET_2026.filter((p) => p.local === eq.slug || p.visitante === eq.slug);

  /**
   * La nomina se arma con los jugadores que ya tienen gol registrado en la
   * planilla de la edicion: nombre y dorsal reales.
   *
   * Antes se pintaban doce tarjetas "Por confirmar" mientras esos mismos
   * nombres y dorsales ya salian en la bota de oro. Es preferible una nomina
   * corta y cierta que una completa e inventada.
   */
  const nomina = datos.goleadores
    .filter((g) => g.equipo === eq.slug)
    .slice()
    .sort((a, b) => a.numero - b.numero);

  const tiles = [
    { l: 'Títulos', v: String(eq.titulos) },
    { l: 'Posición', v: fila ? `${fila.posicion}º` : '—' },
    { l: 'Puntos', v: fila ? String(fila.pts) : '—' },
    { l: 'Goles a favor', v: fila ? String(fila.gf) : '—' },
  ];

  return (
    <div className="tournament-section relative">
      <TorneoBackdrop tint={eq.color} image={`/fotos/torneo-eq-${eq.slug}.jpg`} />
      {/* HERO DE CLUB */}
      <section className="relative z-10 overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background: `linear-gradient(120deg, ${eq.color}40 0%, transparent 55%)`,
          }}
        />
        <div className="relative mx-auto flex max-w-7xl flex-col gap-8 px-6 py-20 lg:flex-row lg:items-end lg:px-8 lg:py-28">
          <div className="animate-fade-up">
            <Link
              href="/torneo/equipos/"
              className="inline-flex items-center gap-2 text-sm text-neutral-300 transition-colors duration-200 ease-managers hover:text-amarillo"
            >
              <ArrowLeft size={16} aria-hidden />
              Todos los clubes
            </Link>
            <div className="mt-6 flex items-center gap-6">
              <TeamCrest slug={eq.slug} size={120} showStars />
              <div>
                <p className="font-bufon text-sm font-bold uppercase tracking-[0.2em] text-amarillo">
                  {etiquetaTitulos(eq.titulos)}
                </p>
                <h1 className="mt-2 font-sport text-6xl uppercase leading-[0.85] text-neutral-50 md:text-8xl">
                  {eq.nombre}
                </h1>
                {eq.titulos > 0 ? (
                  <div className="mt-3 flex items-center gap-1.5">
                    {Array.from({ length: eq.titulos }, (_, i) => (
                      <Star key={i} size={22} className="fill-amarillo text-amarillo" aria-hidden />
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
          {eq.titulos > 0 ? (
            <div className="ml-auto hidden shrink-0 lg:block">
              <div className="float-y">
                <GoldCoin size={120} animate />
              </div>
            </div>
          ) : null}
        </div>
      </section>

      <TorneoNav active="/torneo/equipos/" />

      {/* CONTENIDO */}
      <section className="grain relative z-10 overflow-hidden">
        <div className="relative mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-24">
          {/* Datos rapidos de la edicion en curso */}
          <div className="stagger-in grid grid-cols-2 gap-4 sm:grid-cols-4">
            {tiles.map((s) => (
              <div
                key={s.l}
                className="rounded-2xl border border-white/10 bg-[#0d1218]/70 p-6 text-center"
              >
                <div className="text-energy font-sport text-5xl leading-none">{s.v}</div>
                <div className="mt-2 font-mono text-[11px] uppercase tracking-widest text-neutral-500">
                  {s.l}
                </div>
              </div>
            ))}
          </div>
          <p className="mt-4 font-mono text-[11px] uppercase tracking-widest text-neutral-600">
            {EDICION_ACTUAL}ª edición · {PERIODO_ACTUAL}
          </p>

          {/* PLANTEL */}
          <div className="mt-20">
            <p className="font-bufon text-sm font-bold uppercase tracking-[0.25em] text-naranja">
              Plantel
            </p>
            <h2 className="mt-1 font-sport text-5xl uppercase leading-none text-neutral-50 md:text-7xl">
              La nómina
            </h2>
            <div className="energy-bar mt-4 h-1 w-full rounded-full opacity-70" />

            {nomina.length ? (
              <>
                <ul className="stagger-in mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
                  {nomina.map((j) => (
                    <li
                      key={`${j.jugador}-${j.numero}`}
                      className="group flex flex-col items-center gap-3 rounded-2xl border border-white/10 bg-[#0d1218]/70 p-5 transition-all duration-300 ease-managers hover:-translate-y-1.5 hover:border-amarillo/40"
                    >
                      <PlayerAvatar color={eq.color} numero={j.numero} size={88} />
                      <div className="text-center">
                        <p className="text-sm font-bold text-neutral-100">#{j.numero}</p>
                        <p className="mt-1 text-[13px] font-semibold leading-tight text-neutral-200">
                          {j.jugador}
                        </p>
                        <p className="mt-1 text-[11px] uppercase tracking-widest text-amarillo">
                          {j.goles} {j.goles === 1 ? 'gol' : 'goles'}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
                <p className="mt-8 max-w-3xl text-xs leading-relaxed text-neutral-600">
                  Jugadores con gol registrado en la {EDICION_ACTUAL}ª edición: nombre y dorsal
                  salen de la misma planilla que la bota de oro. La nómina completa se publica
                  cuando la organización cargue la inscripción del club.
                </p>
              </>
            ) : (
              <p className="mt-10 rounded-2xl border border-dashed border-white/15 p-8 text-sm text-neutral-500">
                Todavía no hay jugadores de {eq.nombre} con gol registrado en la {EDICION_ACTUAL}ª
                edición. La nómina se publica cuando la organización cargue la inscripción del club.
              </p>
            )}
          </div>

          {/* PARTIDOS DE LA EDICION EN CURSO */}
          <div className="mt-20">
            <p className="font-bufon text-sm font-bold uppercase tracking-[0.25em] text-naranja">
              Camino en la {EDICION_ACTUAL}ª edición
            </p>
            <h2 className="mt-1 font-sport text-5xl uppercase leading-none text-neutral-50 md:text-7xl">
              Partidos
            </h2>
            <div className="energy-bar mt-4 h-1 w-full rounded-full opacity-70" />
            {partidosLiga.length ? (
              <ul className="stagger-in mt-8 space-y-2.5">
                {partidosLiga.map((p) => (
                  <FilaLiga key={p.id} p={p} slug={eq.slug} />
                ))}
              </ul>
            ) : (
              <p className="mt-8 rounded-2xl border border-dashed border-white/15 p-8 text-sm text-neutral-500">
                Aún sin partidos cargados para este club en la edición en curso.
              </p>
            )}
          </div>

          {/* HISTORIAL: LLAVE DE LA EDICION ANTERIOR */}
          {historial.length ? (
            <div className="mt-20 border-t border-white/10 pt-16">
              <p className="font-bufon text-sm font-bold uppercase tracking-[0.25em] text-neutral-500">
                Historial
              </p>
              <h2 className="mt-1 font-sport text-4xl uppercase leading-none text-neutral-300 md:text-5xl">
                {EDICION_ACTUAL - 1}ª edición · 2026-1
              </h2>
              <p className="mt-3 max-w-2xl text-sm text-neutral-500">
                La edición anterior se jugó por eliminación directa.
              </p>
              <div className="stagger-in mt-8 grid gap-5 sm:grid-cols-2">
                {historial.map((p) => (
                  <MatchCard key={p.id} p={p} />
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
