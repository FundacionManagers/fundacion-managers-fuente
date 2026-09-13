'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { BookOpen, Check, Loader2, Plus, RefreshCw, Trash2, TriangleAlert } from 'lucide-react';
import { DefinirClave } from '@/components/shared/DefinirClave';
import { EstadoPublicacion } from '@/components/torneo/EstadoPublicacion';
import { TeamCrest } from '@/components/torneo/TeamCrest';
import { EQUIPOS, getEquipo } from '@/lib/torneo-data';
import {
  calcularPosiciones,
  CALENDARIO_FASE_FINAL,
  COLUMNAS_TABLA,
  CRUCES_POR_FASE,
  ladoGanador,
  ORDEN_FASES,
  TITULO_FASE,
  TOTAL_JORNADAS,
  type FaseFinal,
  type PartidoLiga,
} from '@/lib/liga';
import {
  actualizarGoleador,
  cargarTodo,
  crearCruce,
  crearGoleador,
  descuadres,
  eliminarGoleador,
  eliminarPartido,
  guardarDisciplina,
  guardarPartido,
  type EstadoTorneo,
  type GoleadorPanel,
  type PartidoPanel,
} from '@/lib/panel-torneo';
import { cn } from '@/lib/utils';

type Seccion = 'marcadores' | 'tarjetas' | 'previa' | 'goleadores' | 'acceso';

const SECCIONES: { key: Seccion; label: string }[] = [
  { key: 'marcadores', label: 'Marcadores' },
  { key: 'tarjetas', label: 'Tarjetas' },
  { key: 'previa', label: 'Tabla (previa)' },
  { key: 'goleadores', label: 'Goleadores' },
  { key: 'acceso', label: 'Mi acceso' },
];

/**
 * Qué ronda se está editando en Marcadores.
 *
 * La fase de grupos se identifica por su número de fecha; la eliminatoria,
 * por su nombre de ronda. Un solo estado para las dos porque el formulario
 * es el mismo: lo único que cambia es qué partidos se listan y qué dice el
 * botón de guardar.
 */
type Ronda = { tipo: 'jornada'; jornada: number } | { tipo: 'fase'; fase: FaseFinal };

/** Nombre corto para el botón del selector. */
const FASE_CORTA: Record<FaseFinal, string> = {
  cuartos: 'Cuartos',
  semifinal: 'Semis',
  'tercer-puesto': '3.º puesto',
  final: 'Final',
};

function tituloRonda(r: Ronda): string {
  return r.tipo === 'jornada' ? `Fecha ${r.jornada}` : TITULO_FASE[r.fase];
}

/** Campo numérico que admite quedar vacío mientras se escribe. */
function NumeroInput({
  valor,
  onChange,
  ancho = 'w-20',
  min = 0,
}: {
  valor: number | null;
  onChange: (v: number | null) => void;
  ancho?: string;
  min?: number;
}) {
  return (
    <input
      type="number"
      inputMode="numeric"
      min={min}
      value={valor ?? ''}
      onChange={(e) =>
        onChange(e.target.value === '' ? null : Math.max(min, Number(e.target.value)))
      }
      className={cn(
        ancho,
        'rounded-md border border-white/25 bg-[#05070a] px-2 py-2 text-center tabular-nums',
        'font-sport text-2xl leading-none text-neutral-50',
        'focus:border-amarillo focus:outline-none focus:ring-2 focus:ring-amarillo/40',
      )}
    />
  );
}

export function PanelResultados({ salir, correo }: { salir: () => Promise<void>; correo: string }) {
  const [estado, setEstado] = useState<EstadoTorneo | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [aviso, setAviso] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [seccion, setSeccion] = useState<Seccion>('marcadores');
  const [ronda, setRonda] = useState<Ronda>({ tipo: 'jornada', jornada: 1 });

  const recargar = useCallback(async () => {
    setCargando(true);
    setError('');
    try {
      const datos = await cargarTodo();
      setEstado(datos);
      // Abrir en lo primero que falte por cargar: es lo que toca hacer.
      // Primero las fechas de grupos y, cuando ya no queda ninguna, la
      // ronda eliminatoria pendiente. Antes se quedaba clavado en la Fecha
      // 7 y no habia manera de llegar a los cuartos.
      const grupos = datos.partidos.filter((p) => p.fase === 'grupos');
      const fechaPendiente = grupos.find((p) => !p.jugado)?.jornada;
      if (fechaPendiente != null) {
        setRonda({ tipo: 'jornada', jornada: fechaPendiente });
      } else {
        const fasePendiente = ORDEN_FASES.find((f) => {
          const suyos = datos.partidos.filter((p) => p.fase === f);
          return suyos.length > 0 && suyos.some((p) => !p.jugado);
        });
        const ultimaFase = ORDEN_FASES.filter((f) => datos.partidos.some((p) => p.fase === f)).at(
          -1,
        );
        const destino = fasePendiente ?? ultimaFase;
        setRonda(
          destino ? { tipo: 'fase', fase: destino } : { tipo: 'jornada', jornada: TOTAL_JORNADAS },
        );
      }
    } catch {
      setError('No se pudieron cargar los datos. Revisa tu conexión y vuelve a intentar.');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    void recargar();
  }, [recargar]);

  // Resumen de arriba: da contexto de un vistazo y de paso rompe la sensacion
  // de formulario pelado.
  const resumen = useMemo(() => {
    if (!estado) return null;
    const jugados = estado.partidos.filter((p) => p.jugado);
    const grupos = estado.partidos.filter((p) => p.fase === 'grupos');
    const fechas = [...new Set(grupos.map((p) => p.jornada))].filter((j) =>
      grupos.filter((p) => p.jornada === j).every((p) => p.jugado),
    );
    const goles = jugados.reduce((s, p) => s + (p.golesLocal ?? 0) + (p.golesVisitante ?? 0), 0);
    return {
      fechas: `${fechas.length}/${TOTAL_JORNADAS}`,
      partidos: `${jugados.length}/${estado.partidos.length}`,
      goles: String(goles),
      anotadores: String(estado.goleadores.length),
    };
  }, [estado]);

  const problemas = useMemo(() => (estado ? descuadres(estado) : []), [estado]);

  // Tabla calculada con lo que hay AHORA en pantalla, aunque no se haya
  // guardado. Deja ver el efecto de un marcador antes de tocar nada real.
  const previa = useMemo(() => {
    if (!estado) return [];
    // La tabla de posiciones es de la fase regular: los cruces eliminatorios
    // no suman puntos.
    const comoLiga: PartidoLiga[] = estado.partidos
      .filter((p) => p.fase === 'grupos')
      .map((p) => ({
        id: p.id,
        jornada: p.jornada,
        fecha: p.fecha,
        hora: p.hora,
        local: p.local,
        visitante: p.visitante,
        golesLocal: p.jugado ? p.golesLocal : null,
        golesVisitante: p.jugado ? p.golesVisitante : null,
        estado:
          p.jugado && p.golesLocal != null && p.golesVisitante != null ? 'jugado' : 'programado',
      }));
    const disciplina = Object.fromEntries(
      estado.disciplina.map((d) => [d.equipo, { amarillas: d.amarillas, rojas: d.rojas }]),
    );
    return calcularPosiciones(comoLiga, disciplina);
  }, [estado]);
  const partidosRonda = useMemo(() => {
    if (!estado) return [];
    return ronda.tipo === 'jornada'
      ? estado.partidos.filter((p) => p.fase === 'grupos' && p.jornada === ronda.jornada)
      : estado.partidos.filter((p) => p.fase === ronda.fase);
  }, [estado, ronda]);

  function tocarPartido(id: string, cambios: Partial<PartidoPanel>) {
    setEstado((prev) =>
      prev
        ? { ...prev, partidos: prev.partidos.map((p) => (p.id === id ? { ...p, ...cambios } : p)) }
        : prev,
    );
  }

  async function guardarRonda() {
    if (!estado) return;
    setGuardando(true);
    setError('');
    setAviso('');
    try {
      await Promise.all(partidosRonda.map((p) => guardarPartido(p)));
      setAviso(`${tituloRonda(ronda)} guardada.`);
    } catch {
      setError('No se pudo guardar. Verifica que tu cuenta siga autorizada.');
    } finally {
      setGuardando(false);
    }
  }

  /**
   * Borra un cruce de la fase final. Pide confirmación porque, a diferencia
   * de un marcador, esto no se deshace desmarcando una casilla.
   */
  async function borrarCruce(p: PartidoPanel) {
    const local = getEquipo(p.local)?.nombre ?? p.local;
    const visitante = getEquipo(p.visitante)?.nombre ?? p.visitante;
    if (!window.confirm(`¿Eliminar el cruce ${local} vs ${visitante}? No se puede deshacer.`)) {
      return;
    }
    setGuardando(true);
    setError('');
    setAviso('');
    try {
      await eliminarPartido(p.id);
      setAviso('Cruce eliminado.');
      await recargar();
    } catch {
      setError('No se pudo eliminar el cruce.');
    } finally {
      setGuardando(false);
    }
  }

  async function guardarTarjetas() {
    if (!estado) return;
    setGuardando(true);
    setError('');
    setAviso('');
    try {
      await guardarDisciplina(estado.disciplina);
      setAviso('Tarjetas guardadas.');
    } catch {
      setError('No se pudieron guardar las tarjetas.');
    } finally {
      setGuardando(false);
    }
  }

  if (cargando) {
    return (
      <p className="flex items-center gap-2 text-sm text-neutral-400">
        <Loader2 size={16} className="animate-spin" /> Cargando el torneo…
      </p>
    );
  }

  if (!estado) {
    return (
      <div>
        <p className="text-sm text-red-400">{error || 'No hay datos.'}</p>
        <button onClick={() => void recargar()} className="mt-4 text-sm text-amarillo underline">
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Resumen */}
      {resumen ? (
        <div className="stagger-in mb-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            { v: resumen.fechas, l: 'Fechas completas' },
            { v: resumen.partidos, l: 'Partidos cargados' },
            { v: resumen.goles, l: 'Goles anotados' },
            { v: resumen.anotadores, l: 'Anotadores' },
          ].map((s) => (
            <div
              key={s.l}
              className="rounded-2xl border border-white/10 bg-black/50 px-5 py-6 text-center backdrop-blur-sm"
            >
              <div className="text-energy font-sport text-4xl leading-none lg:text-5xl">{s.v}</div>
              <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-500">
                {s.l}
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {/* Barra superior */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {SECCIONES.map((s) => (
            <button
              key={s.key}
              onClick={() => setSeccion(s.key)}
              className={cn(
                'rounded-full px-4 py-2 font-bufon text-xs font-bold uppercase tracking-[0.12em] transition-colors',
                seccion === s.key
                  ? 'bg-gradient-to-r from-amarillo to-naranja text-carbon'
                  : 'border border-white/15 text-neutral-300 hover:border-amarillo/50',
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/resultados/guia/"
            className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-amarillo"
          >
            <BookOpen size={14} /> Guía
          </Link>
          <button
            onClick={() => void recargar()}
            className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-amarillo"
          >
            <RefreshCw size={14} /> Recargar
          </button>
          <button
            onClick={() => void salir()}
            className="text-xs text-neutral-500 hover:text-neutral-300"
          >
            Salir
          </button>
        </div>
      </div>

      <div className="mt-5">
        <EstadoPublicacion />
      </div>

      {/* Mensajes */}
      {error ? (
        <p className="mt-5 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </p>
      ) : null}
      {aviso ? (
        <p className="mt-5 flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
          <Check size={16} /> {aviso} Arriba puedes ver si ya salieron al sitio.
        </p>
      ) : null}

      {/* Aviso de descuadre: la comprobación que destapó las erratas del gráfico */}
      {problemas.length > 0 ? (
        <div className="mt-5 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3">
          <p className="flex items-center gap-2 text-sm font-semibold text-amber-300">
            <TriangleAlert size={16} /> Los goles no cuadran
          </p>
          <p className="mt-1 text-xs text-amber-200/80">
            La suma del ranking de goleadores no coincide con los goles de los marcadores. Falta
            registrar anotadores, o hay un marcador mal cargado.
          </p>
          <ul className="mt-2 space-y-1 text-xs text-amber-100">
            {problemas.map((d) => (
              <li key={d.equipo}>
                <strong>{getEquipo(d.equipo)?.nombre ?? d.equipo}</strong>: {d.golesTabla} goles en
                marcadores, {d.golesRanking} en el ranking
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="mt-5 flex items-center gap-2 text-xs text-emerald-400">
          <Check size={14} /> Los goles del ranking cuadran con los marcadores.
        </p>
      )}

      {/* ── MARCADORES ─────────────────────────────────────────────── */}
      {seccion === 'marcadores' ? (
        <div className="mt-8">
          <div className="flex flex-wrap items-center gap-2">
            {Array.from({ length: TOTAL_JORNADAS }, (_, i) => i + 1).map((j) => {
              const dePaso = estado.partidos.filter((p) => p.fase === 'grupos' && p.jornada === j);
              const completa = dePaso.length > 0 && dePaso.every((p) => p.jugado);
              const activa = ronda.tipo === 'jornada' && ronda.jornada === j;
              return (
                <button
                  key={j}
                  onClick={() => setRonda({ tipo: 'jornada', jornada: j })}
                  className={cn(
                    'h-10 w-10 rounded-lg font-sport text-lg transition-colors',
                    activa
                      ? 'bg-amarillo text-carbon'
                      : completa
                        ? 'border border-emerald-500/40 text-emerald-400'
                        : 'border border-white/15 text-neutral-400 hover:border-amarillo/50',
                  )}
                  title={completa ? `Fecha ${j} completa` : `Fecha ${j} pendiente`}
                >
                  {j}
                </button>
              );
            })}

            {/* Eliminatoria. Aparecen las cuatro rondas siempre, tengan o no
                cruces: la que está vacía es justo donde se crean. */}
            <span className="mx-1 h-8 w-px shrink-0 bg-white/15" aria-hidden />
            {ORDEN_FASES.map((f) => {
              const suyos = estado.partidos.filter((p) => p.fase === f);
              const completa = suyos.length > 0 && suyos.every((p) => p.jugado);
              const activa = ronda.tipo === 'fase' && ronda.fase === f;
              return (
                <button
                  key={f}
                  onClick={() => setRonda({ tipo: 'fase', fase: f })}
                  className={cn(
                    'h-10 rounded-lg px-3 font-bufon text-xs font-bold uppercase tracking-[0.1em] transition-colors',
                    activa
                      ? 'bg-amarillo text-carbon'
                      : completa
                        ? 'border border-emerald-500/40 text-emerald-400'
                        : 'border border-white/15 text-neutral-400 hover:border-amarillo/50',
                  )}
                  title={
                    suyos.length === 0
                      ? `${TITULO_FASE[f]}: sin cruces cargados`
                      : completa
                        ? `${TITULO_FASE[f]} completa`
                        : `${TITULO_FASE[f]} pendiente`
                  }
                >
                  {FASE_CORTA[f]}
                </button>
              );
            })}
          </div>

          <p className="mt-4 font-bufon text-xs font-bold uppercase tracking-[0.15em] text-amarillo">
            {tituloRonda(ronda)}
          </p>

          <ul className="mt-4 space-y-3">
            {partidosRonda.map((p) => (
              <li
                key={p.id}
                className="rounded-xl border border-white/10 bg-black/70 p-4 backdrop-blur-sm"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs text-neutral-500">
                    {p.fecha} · {p.hora}
                  </p>
                  {p.fase !== 'grupos' ? (
                    <button
                      onClick={() => void borrarCruce(p)}
                      disabled={guardando}
                      title="Eliminar este cruce"
                      className="rounded-md p-1.5 text-neutral-600 transition-colors hover:bg-red-500/10 hover:text-red-400 disabled:opacity-50"
                    >
                      <Trash2 size={15} />
                    </button>
                  ) : null}
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <div className="flex min-w-0 flex-1 items-center justify-end gap-2">
                    <span className="truncate text-right text-sm font-semibold text-neutral-200">
                      {getEquipo(p.local)?.nombre ?? p.local}
                    </span>
                    <TeamCrest slug={p.local} size={30} />
                  </div>
                  <NumeroInput
                    valor={p.golesLocal}
                    onChange={(v) => tocarPartido(p.id, { golesLocal: v })}
                  />
                  <span className="text-neutral-600">–</span>
                  <NumeroInput
                    valor={p.golesVisitante}
                    onChange={(v) => tocarPartido(p.id, { golesVisitante: v })}
                  />
                  <div className="flex min-w-0 flex-1 items-center gap-2">
                    <TeamCrest slug={p.visitante} size={30} />
                    <span className="truncate text-sm font-semibold text-neutral-200">
                      {getEquipo(p.visitante)?.nombre ?? p.visitante}
                    </span>
                  </div>
                </div>
                <label className="mt-3 flex cursor-pointer items-center gap-2 text-xs text-neutral-400">
                  <input
                    type="checkbox"
                    checked={p.jugado}
                    onChange={(e) => tocarPartido(p.id, { jugado: e.target.checked })}
                    className="h-4 w-4 accent-amarillo"
                  />
                  Partido jugado (si lo desmarcas, el marcador se borra y vuelve a programado)
                </label>

                {/* Penales. Aparecen solos cuando hacen falta: fase final,
                    partido jugado y empatado. En la liga un empate es un
                    resultado valido y no se pregunta nada. */}
                {p.fase !== 'grupos' &&
                p.jugado &&
                p.golesLocal != null &&
                p.golesLocal === p.golesVisitante ? (
                  <div className="mt-3 rounded-lg border border-naranja/40 bg-naranja/10 p-3">
                    <p className="font-bufon text-[11px] font-bold uppercase tracking-[0.15em] text-naranja">
                      Empate · definición por penales
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-3">
                      <span className="text-xs text-neutral-300">
                        {getEquipo(p.local)?.nombre ?? p.local}
                      </span>
                      <NumeroInput
                        ancho="w-16"
                        valor={p.penalesLocal}
                        onChange={(v) => tocarPartido(p.id, { penalesLocal: v })}
                      />
                      <span className="text-neutral-600">–</span>
                      <NumeroInput
                        ancho="w-16"
                        valor={p.penalesVisitante}
                        onChange={(v) => tocarPartido(p.id, { penalesVisitante: v })}
                      />
                      <span className="text-xs text-neutral-300">
                        {getEquipo(p.visitante)?.nombre ?? p.visitante}
                      </span>
                    </div>
                    {(() => {
                      const gana = ladoGanador(
                        p.golesLocal,
                        p.golesVisitante,
                        p.penalesLocal,
                        p.penalesVisitante,
                      );
                      const equipo =
                        gana === 'local' ? p.local : gana === 'visitante' ? p.visitante : null;
                      return equipo ? (
                        <p className="mt-2 text-xs text-emerald-400">
                          Pasa {getEquipo(equipo)?.nombre ?? equipo}.
                        </p>
                      ) : (
                        <p className="mt-2 text-xs text-amber-300">
                          Escribe la tanda: sin ella la llave no sabe quién pasa. No puede quedar
                          empatada.
                        </p>
                      );
                    })()}
                  </div>
                ) : null}
              </li>
            ))}
          </ul>

          {ronda.tipo === 'fase' ? (
            <NuevoCruceForm fase={ronda.fase} estado={estado} onCreado={() => void recargar()} />
          ) : null}

          <button
            onClick={() => void guardarRonda()}
            disabled={guardando || partidosRonda.length === 0}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amarillo to-naranja px-7 py-3 text-sm font-bold text-carbon disabled:opacity-50"
          >
            {guardando ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
            Guardar {tituloRonda(ronda).toLowerCase()}
          </button>
        </div>
      ) : null}

      {/* ── TARJETAS ───────────────────────────────────────────────── */}
      {seccion === 'tarjetas' ? (
        <div className="mt-8">
          <p className="text-sm text-neutral-400">
            Acumuladas por club. Son los únicos datos que no se deducen de los marcadores.
          </p>
          <ul className="mt-6 space-y-2">
            {EQUIPOS.map((eq) => {
              const fila = estado.disciplina.find((d) => d.equipo === eq.slug) ?? {
                equipo: eq.slug,
                amarillas: 0,
                rojas: 0,
              };
              return (
                <li
                  key={eq.slug}
                  className="flex flex-wrap items-center gap-3 rounded-xl border border-white/10 bg-black/40 p-3"
                >
                  <TeamCrest slug={eq.slug} size={30} />
                  <span className="min-w-0 flex-1 truncate text-sm font-semibold text-neutral-200">
                    {eq.nombre}
                  </span>
                  <label className="flex items-center gap-2 text-xs text-amber-300">
                    Amarillas
                    <NumeroInput
                      valor={fila.amarillas}
                      onChange={(v) =>
                        setEstado((prev) =>
                          prev
                            ? {
                                ...prev,
                                disciplina: [
                                  ...prev.disciplina.filter((d) => d.equipo !== eq.slug),
                                  { ...fila, amarillas: v ?? 0 },
                                ],
                              }
                            : prev,
                        )
                      }
                    />
                  </label>
                  <label className="flex items-center gap-2 text-xs text-red-400">
                    Rojas
                    <NumeroInput
                      valor={fila.rojas}
                      onChange={(v) =>
                        setEstado((prev) =>
                          prev
                            ? {
                                ...prev,
                                disciplina: [
                                  ...prev.disciplina.filter((d) => d.equipo !== eq.slug),
                                  { ...fila, rojas: v ?? 0 },
                                ],
                              }
                            : prev,
                        )
                      }
                    />
                  </label>
                </li>
              );
            })}
          </ul>
          <button
            onClick={() => void guardarTarjetas()}
            disabled={guardando}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amarillo to-naranja px-7 py-3 text-sm font-bold text-carbon disabled:opacity-50"
          >
            {guardando ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
            Guardar tarjetas
          </button>
        </div>
      ) : null}

      {/* ── GOLEADORES ─────────────────────────────────────────────── */}
      {seccion === 'goleadores' ? (
        <SeccionGoleadores estado={estado} onCambio={() => void recargar()} />
      ) : null}

      {seccion === 'previa' ? (
        <div className="mt-8">
          <p className="text-sm text-neutral-400">
            Así quedaría la tabla con lo que tienes en pantalla ahora mismo, esté guardado o no.
            Cambia un marcador y vuelve aquí: se recalcula sin tocar el sitio.
          </p>
          <div className="mt-5 overflow-x-auto rounded-2xl border border-white/10 bg-black/40">
            <table className="w-full min-w-[560px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-amarillo/30 bg-amarillo/10">
                  <th className="px-3 py-2.5 text-center font-bufon text-xs uppercase text-amarillo">
                    Pos
                  </th>
                  <th className="px-3 py-2.5 text-left font-bufon text-xs uppercase text-amarillo">
                    Equipo
                  </th>
                  {COLUMNAS_TABLA.map((c) => (
                    <th
                      key={c.key}
                      title={c.largo}
                      className="px-2 py-2.5 text-center font-bufon text-xs uppercase text-amarillo"
                    >
                      {c.corto}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {previa.map((f) => (
                  <tr key={f.equipo} className="border-b border-white/5 last:border-0">
                    <td className="px-3 py-2.5 text-center tabular-nums text-neutral-400">
                      {f.posicion}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2.5">
                      <span className="flex items-center gap-2">
                        <TeamCrest slug={f.equipo} size={24} />
                        <span className="font-semibold text-neutral-100">
                          {getEquipo(f.equipo)?.nombre ?? f.equipo}
                        </span>
                      </span>
                    </td>
                    {COLUMNAS_TABLA.map((c) => (
                      <td
                        key={c.key}
                        className={cn(
                          'px-2 py-2.5 text-center tabular-nums',
                          c.key === 'pts'
                            ? 'font-sport text-base text-amarillo'
                            : 'text-neutral-300',
                          c.key === 'dg' && f.dg > 0 && 'text-emerald-400',
                          c.key === 'dg' && f.dg < 0 && 'text-red-400',
                        )}
                      >
                        {c.key === 'dg' && f.dg > 0 ? `+${f.dg}` : f[c.key]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      {seccion === 'acceso' ? <DefinirClave correo={correo} /> : null}
    </div>
  );
}

/**
 * Alta de un cruce de la fase final.
 *
 * Existe para que la organización no dependa de nadie con acceso a la base:
 * cuando se juegan los cuartos, aquí mismo se arman las semifinales. Cuántos
 * cruces lleva cada ronda está en `CRUCES_POR_FASE`, así que el formulario
 * avisa cuando ya están todos y no deja crear de más por descuido.
 *
 * Los equipos que propone son los ganadores de la ronda anterior que todavía
 * no tienen rival: es casi siempre lo que toca elegir, y ahorra buscarlos en
 * una lista de ocho.
 */
function NuevoCruceForm({
  fase,
  estado,
  onCreado,
}: {
  fase: FaseFinal;
  estado: EstadoTorneo;
  onCreado: () => void;
}) {
  const anterior = ORDEN_FASES[ORDEN_FASES.indexOf(fase) - 1];

  /** Quién ganó cada partido de la ronda previa. Los empates no dan ganador. */
  const clasificados = useMemo(() => {
    if (!anterior) return [];
    return estado.partidos
      .filter((p) => p.fase === anterior && p.jugado)
      .map((p) => {
        const gana = ladoGanador(
          p.golesLocal,
          p.golesVisitante,
          p.penalesLocal,
          p.penalesVisitante,
        );
        return gana === 'local' ? p.local : gana === 'visitante' ? p.visitante : null;
      })
      .filter((x): x is string => x != null);
  }, [estado.partidos, anterior]);

  /** Los clasificados que aún no tienen cruce en esta ronda. */
  const disponibles = useMemo(() => {
    const yaCruzados = new Set(
      estado.partidos.filter((p) => p.fase === fase).flatMap((p) => [p.local, p.visitante]),
    );
    return clasificados.filter((eq) => !yaCruzados.has(eq));
  }, [clasificados, estado.partidos, fase]);

  const cargados = estado.partidos.filter((p) => p.fase === fase).length;
  const faltan = CRUCES_POR_FASE[fase] - cargados;

  const [abierto, setAbierto] = useState(false);
  const [local, setLocal] = useState('');
  const [visitante, setVisitante] = useState('');
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('');
  const [trabajando, setTrabajando] = useState(false);
  const [error, setError] = useState('');

  // Al abrir se rellena con lo más probable: los dos primeros que falten por
  // emparejar, el día de la ronda y la hora en que arranca la jornada.
  useEffect(() => {
    if (!abierto) return;
    setLocal((v) => v || disponibles[0] || '');
    setVisitante((v) => v || disponibles[1] || '');
    setFecha((v) => v || fechaSugerida(fase, estado));
    setHora((v) => v || '08:00');
  }, [abierto, disponibles, fase, estado]);

  async function crear() {
    if (!local || !visitante) return setError('Faltan los dos equipos.');
    if (local === visitante) return setError('Un equipo no puede jugar contra sí mismo.');
    if (!fecha || !hora) return setError('Faltan el día y la hora.');
    setTrabajando(true);
    setError('');
    try {
      await crearCruce({ fase, fecha, hora, local, visitante });
      setLocal('');
      setVisitante('');
      setAbierto(false);
      onCreado();
    } catch {
      setError('No se pudo crear el cruce. Verifica que tu cuenta siga autorizada.');
    } finally {
      setTrabajando(false);
    }
  }

  if (!abierto) {
    return (
      <div className="mt-4">
        <button
          onClick={() => setAbierto(true)}
          className="inline-flex items-center gap-1.5 rounded-full border border-white/20 px-5 py-2.5 text-sm font-bold text-neutral-300 transition-colors hover:border-amarillo/60 hover:text-amarillo"
        >
          <Plus size={16} /> Añadir cruce
        </button>
        {faltan > 0 ? (
          <p className="mt-2 text-xs text-neutral-500">
            {cargados === 0
              ? `Esta ronda todavía no tiene cruces. Lleva ${CRUCES_POR_FASE[fase]}.`
              : `Faltan ${faltan} de ${CRUCES_POR_FASE[fase]}.`}
          </p>
        ) : (
          <p className="mt-2 flex items-center gap-1.5 text-xs text-emerald-400">
            <Check size={13} /> Los cruces de esta ronda ya están cargados.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="mt-4 rounded-xl border border-amarillo/30 bg-black/50 p-4">
      <p className="font-bufon text-xs font-bold uppercase tracking-[0.15em] text-amarillo">
        Nuevo cruce · {TITULO_FASE[fase]}
      </p>

      {anterior && clasificados.length > 0 ? (
        <p className="mt-2 text-xs text-neutral-400">
          Ganaron {TITULO_FASE[anterior].toLowerCase()}:{' '}
          {clasificados.map((eq) => getEquipo(eq)?.nombre ?? eq).join(', ')}.
        </p>
      ) : null}

      <div className="mt-3 flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1 text-xs text-neutral-400">
          Local
          <SelectEquipo valor={local} onChange={setLocal} />
        </label>
        <label className="flex flex-col gap-1 text-xs text-neutral-400">
          Visitante
          <SelectEquipo valor={visitante} onChange={setVisitante} />
        </label>
        <label className="flex flex-col gap-1 text-xs text-neutral-400">
          Día
          <input
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            className="rounded-md border border-white/25 bg-[#05070a] px-3 py-2 text-sm text-neutral-50 focus:border-amarillo focus:outline-none"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-neutral-400">
          Hora
          <input
            type="time"
            value={hora}
            onChange={(e) => setHora(e.target.value)}
            className="rounded-md border border-white/25 bg-[#05070a] px-3 py-2 text-sm text-neutral-50 focus:border-amarillo focus:outline-none"
          />
        </label>
        <button
          onClick={() => void crear()}
          disabled={trabajando}
          className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amarillo to-naranja px-5 py-2.5 text-sm font-bold text-carbon disabled:opacity-50"
        >
          {trabajando ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
          Crear
        </button>
        <button
          onClick={() => setAbierto(false)}
          className="text-xs text-neutral-500 hover:text-neutral-300"
        >
          Cancelar
        </button>
      </div>

      <p className="mt-3 text-xs text-neutral-500">
        El cruce nace programado y sin marcador. Los goles se cargan después, aquí mismo, cuando se
        juegue.
      </p>
      {error ? <p className="mt-2 text-xs text-red-400">{error}</p> : null}
    </div>
  );
}

/** Desplegable con los ocho clubes de la edición. */
function SelectEquipo({ valor, onChange }: { valor: string; onChange: (v: string) => void }) {
  return (
    <select
      value={valor}
      onChange={(e) => onChange(e.target.value)}
      className="w-44 rounded-md border border-white/25 bg-[#05070a] px-3 py-2 text-sm text-neutral-50 focus:border-amarillo focus:outline-none"
    >
      <option value="">Elegir…</option>
      {EQUIPOS.map((eq) => (
        <option key={eq.slug} value={eq.slug}>
          {eq.nombre}
        </option>
      ))}
    </select>
  );
}

/**
 * Día que se propone para un cruce nuevo, en el formato del input de fecha.
 *
 * Manda el de los cruces que ya existan en la ronda —si el primero se juega
 * el 20, el segundo casi seguro también—. Si la ronda está vacía, el que
 * anunció la organización en el calendario de la fase final.
 */
function fechaSugerida(fase: FaseFinal, estado: EstadoTorneo): string {
  const hermano = estado.partidos.find((p) => p.fase === fase);
  if (hermano) return hermano.fecha;
  const anunciada = CALENDARIO_FASE_FINAL.find((r) => r.fase === fase)?.fecha;
  if (!anunciada) return '';
  const [d, m, a] = anunciada.split('/');
  return `${a}-${m}-${d}`;
}

function SeccionGoleadores({ estado, onCambio }: { estado: EstadoTorneo; onCambio: () => void }) {
  const [nuevo, setNuevo] = useState<{
    jugador: string;
    equipo: string;
    numero: number | null;
    goles: number | null;
  }>({ jugador: '', equipo: EQUIPOS[0]?.slug ?? '', numero: null, goles: 1 });
  const [trabajando, setTrabajando] = useState(false);
  const [error, setError] = useState('');

  async function agregar() {
    if (!nuevo.jugador.trim() || !nuevo.goles) {
      setError('Falta el nombre o los goles.');
      return;
    }
    setTrabajando(true);
    setError('');
    try {
      await crearGoleador({
        jugador: nuevo.jugador,
        equipo: nuevo.equipo,
        numero: nuevo.numero,
        goles: nuevo.goles,
      });
      setNuevo({ jugador: '', equipo: nuevo.equipo, numero: null, goles: 1 });
      onCambio();
    } catch {
      setError('No se pudo agregar. ¿Ya existe ese jugador en ese club?');
    } finally {
      setTrabajando(false);
    }
  }

  async function cambiarGoles(g: GoleadorPanel, goles: number) {
    setTrabajando(true);
    try {
      await actualizarGoleador({ ...g, goles });
      onCambio();
    } catch {
      setError('No se pudo actualizar.');
    } finally {
      setTrabajando(false);
    }
  }

  async function borrar(id: string) {
    setTrabajando(true);
    try {
      await eliminarGoleador(id);
      onCambio();
    } catch {
      setError('No se pudo eliminar.');
    } finally {
      setTrabajando(false);
    }
  }

  return (
    <div className="mt-8">
      {/* Alta */}
      <div className="rounded-xl border border-white/10 bg-black/40 p-4">
        <p className="font-bufon text-xs font-bold uppercase tracking-[0.15em] text-amarillo">
          Agregar anotador
        </p>
        <div className="mt-3 flex flex-wrap items-end gap-3">
          <label className="flex flex-col gap-1 text-xs text-neutral-400">
            Jugador
            <input
              value={nuevo.jugador}
              onChange={(e) => setNuevo({ ...nuevo, jugador: e.target.value })}
              placeholder="Nombre y apellido"
              className="w-52 rounded-md border border-white/25 bg-[#05070a] px-3 py-2 text-sm text-neutral-50 placeholder:text-neutral-500 focus:border-amarillo focus:outline-none"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs text-neutral-400">
            Equipo
            <select
              value={nuevo.equipo}
              onChange={(e) => setNuevo({ ...nuevo, equipo: e.target.value })}
              className="w-48 rounded-md border border-white/25 bg-[#05070a] px-3 py-2 text-sm text-neutral-50 focus:border-amarillo focus:outline-none"
            >
              {EQUIPOS.map((eq) => (
                <option key={eq.slug} value={eq.slug}>
                  {eq.nombre}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-xs text-neutral-400">
            Dorsal
            <NumeroInput valor={nuevo.numero} onChange={(v) => setNuevo({ ...nuevo, numero: v })} />
          </label>
          <label className="flex flex-col gap-1 text-xs text-neutral-400">
            Goles
            <NumeroInput
              valor={nuevo.goles}
              min={1}
              onChange={(v) => setNuevo({ ...nuevo, goles: v })}
            />
          </label>
          <button
            onClick={() => void agregar()}
            disabled={trabajando}
            className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amarillo to-naranja px-5 py-2.5 text-sm font-bold text-carbon disabled:opacity-50"
          >
            <Plus size={16} /> Agregar
          </button>
        </div>
        {error ? <p className="mt-2 text-xs text-red-400">{error}</p> : null}
      </div>

      {/* Listado */}
      <ul className="mt-5 space-y-2">
        {estado.goleadores.map((g) => (
          <li
            key={g.id}
            className="flex flex-wrap items-center gap-3 rounded-xl border border-white/10 bg-black/40 p-3"
          >
            <TeamCrest slug={g.equipo} size={26} />
            <span className="min-w-0 flex-1 truncate text-sm font-semibold text-neutral-100">
              {g.jugador}
            </span>
            <span className="hidden text-xs text-neutral-500 sm:block">
              {getEquipo(g.equipo)?.nombre ?? g.equipo}
              {g.numero != null ? ` · #${g.numero}` : ''}
            </span>
            <NumeroInput
              valor={g.goles}
              min={0}
              onChange={(v) => void (v != null && cambiarGoles(g, v))}
            />
            <button
              onClick={() => void borrar(g.id)}
              disabled={trabajando}
              title={`Eliminar a ${g.jugador}`}
              className="rounded-md p-2 text-neutral-500 transition-colors hover:bg-red-500/10 hover:text-red-400 disabled:opacity-50"
            >
              <Trash2 size={16} />
            </button>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs text-neutral-500">
        {estado.goleadores.length} anotadores · {estado.goleadores.reduce((s, g) => s + g.goles, 0)}{' '}
        goles
      </p>
    </div>
  );
}
