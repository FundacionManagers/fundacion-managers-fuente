'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { BookOpen, Check, Loader2, Plus, RefreshCw, Trash2, TriangleAlert, X } from 'lucide-react';
import { DefinirClave } from '@/components/shared/DefinirClave';
import { EstadoPublicacion } from '@/components/torneo/EstadoPublicacion';
import { TeamCrest } from '@/components/torneo/TeamCrest';
import { EQUIPOS, getEquipo } from '@/lib/torneo-data';
import {
  calcularPosiciones,
  CALENDARIO_FASE_FINAL,
  COLUMNAS_TABLA,
  COPAS,
  copaDe,
  CRUCES_POR_FASE,
  cruzarFaseFinal,
  disciplinaDeTarjetas,
  equipoMasGoleador,
  ladoGanador,
  podioDeEdicion,
  posicionesPorGrupo,
  suspensiones,
  tablaJuegoLimpio,
  totalesDeEdicion,
  vallaMenosVencida,
  TITULO_COPA,
  TITULO_FASE,
  TOTAL_JORNADAS,
  type Copa,
  type Disciplina,
  type FaseFinal,
  type PartidoLiga,
} from '@/lib/liga';
import {
  actualizarGoleador,
  cargarTodo,
  borrarMvp,
  crearCruce,
  crearEvento,
  crearGoleador,
  crearTarjeta,
  descuadres,
  eliminarEvento,
  eliminarGoleador,
  eliminarPartido,
  eliminarTarjeta,
  guardarMvp,
  guardarPartido,
  type EstadoTorneo,
  type GoleadorPanel,
  type MvpPanel,
  type PartidoPanel,
  type TarjetaPanel,
} from '@/lib/panel-torneo';
import { cn } from '@/lib/utils';

type Seccion =
  | 'marcadores'
  | 'tarjetas'
  | 'eventos'
  | 'previa'
  | 'goleadores'
  | 'premios'
  | 'acceso';

const SECCIONES: { key: Seccion; label: string }[] = [
  { key: 'marcadores', label: 'Marcadores' },
  { key: 'tarjetas', label: 'Tarjetas' },
  { key: 'eventos', label: 'Eventos' },
  { key: 'previa', label: 'Tabla (previa)' },
  { key: 'goleadores', label: 'Goleadores' },
  { key: 'premios', label: 'Premios' },
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
type Ronda = { tipo: 'jornada'; jornada: number } | { tipo: 'fase'; fase: FaseFinal; copa: Copa };

/**
 * Las rondas de la fase final de la edición en curso, en su orden. Salen del
 * calendario anunciado: en la 5ª no hay cuartos, y un botón «Cuartos» en el
 * panel invitaba a crear un cruce que no existe.
 */
const FASES_FINAL: readonly FaseFinal[] = CALENDARIO_FASE_FINAL.map((r) => r.fase);

/** Los cruces de una ronda y copa concretas. */
function deLaRonda(partidos: readonly PartidoPanel[], fase: FaseFinal, copa: Copa) {
  return partidos.filter((p) => p.fase === fase && copaDe(p) === copa);
}

/** Nombre corto para el botón del selector. */
const FASE_CORTA: Record<FaseFinal, string> = {
  cuartos: 'Cuartos',
  semifinal: 'Semis',
  'tercer-puesto': '3.º puesto',
  final: 'Final',
};

function tituloRonda(r: Ronda): string {
  return r.tipo === 'jornada'
    ? `Fecha ${r.jornada}`
    : `${TITULO_COPA[r.copa]} · ${TITULO_FASE[r.fase]}`;
}

/**
 * El acumulado por club con lo que hay en el panel.
 *
 * Con tarjetas cargadas partido por partido, se cuenta sobre ellas, igual que
 * en el sitio (`liga-supabase.ts`). Si la edición no tiene ninguna, el
 * acumulado viejo de `disciplina`. Una sola fuente, para que la tabla previa
 * del panel no pueda decir otra cosa que la publicada.
 */
function disciplinaDe(estado: EstadoTorneo): Record<string, Disciplina> {
  if (estado.tarjetas.length > 0) return disciplinaDeTarjetas(estado.tarjetas);
  return Object.fromEntries(
    estado.disciplina.map((d) => [d.equipo, { amarillas: d.amarillas, rojas: d.rojas }]),
  );
}

/** Un partido del panel en la forma que usan las funciones de `liga.ts`. */
function comoPartidoLiga(p: PartidoPanel): PartidoLiga {
  const jugado = p.jugado && p.golesLocal != null && p.golesVisitante != null;
  return {
    id: p.id,
    jornada: p.jornada,
    // `liga.ts` trabaja con 'DD/MM/AAAA'; el panel guarda 'AAAA-MM-DD'.
    fecha: p.fecha.split('-').reverse().join('/'),
    hora: p.hora,
    local: p.local,
    visitante: p.visitante,
    golesLocal: jugado ? p.golesLocal : null,
    golesVisitante: jugado ? p.golesVisitante : null,
    estado: jugado ? 'jugado' : 'programado',
  };
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
        // Ronda por ronda, la Oro antes que la Plata: lo primero con cruces a
        // medio jugar; si no hay, la última ronda que tenga algo cargado; y si
        // la fase final está vacía, las semifinales de la Oro, que es donde
        // toca crear los primeros cruces.
        const pares = FASES_FINAL.flatMap((fase) => COPAS.map(({ copa }) => ({ fase, copa })));
        const pendiente = pares.find(({ fase, copa }) => {
          const suyos = deLaRonda(datos.partidos, fase, copa);
          return suyos.length > 0 && suyos.some((p) => !p.jugado);
        });
        const ultima = pares
          .filter(({ fase, copa }) => deLaRonda(datos.partidos, fase, copa).length > 0)
          .at(-1);
        const destino = pendiente ?? ultima ?? { fase: FASES_FINAL[0]!, copa: 'oro' as const };
        setRonda({ tipo: 'fase', ...destino });
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

  // Tablas calculadas con lo que hay AHORA en pantalla, aunque no se haya
  // guardado. Deja ver el efecto de un marcador antes de tocar nada real.
  // Una por grupo: los puestos que cuentan para las copas son los del grupo.
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
    const disciplina = disciplinaDe(estado);
    return posicionesPorGrupo(comoLiga, disciplina);
  }, [estado]);
  const partidosRonda = useMemo(() => {
    if (!estado) return [];
    return ronda.tipo === 'jornada'
      ? estado.partidos.filter((p) => p.fase === 'grupos' && p.jornada === ronda.jornada)
      : deLaRonda(estado.partidos, ronda.fase, ronda.copa);
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
          </div>

          {/* Eliminatoria, una fila por copa. Aparecen todas sus rondas
              siempre, tengan o no cruces: la que está vacía es justo donde se
              crean. */}
          {COPAS.map(({ copa, titulo }) => (
            <div key={copa} className="mt-3 flex flex-wrap items-center gap-2">
              <span className="w-24 shrink-0 font-bufon text-[11px] font-bold uppercase tracking-[0.12em] text-neutral-500">
                {titulo}
              </span>
              {FASES_FINAL.map((f) => {
                const suyos = deLaRonda(estado.partidos, f, copa);
                const completa = suyos.length > 0 && suyos.every((p) => p.jugado);
                const activa = ronda.tipo === 'fase' && ronda.fase === f && ronda.copa === copa;
                return (
                  <button
                    key={f}
                    onClick={() => setRonda({ tipo: 'fase', fase: f, copa })}
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
                        ? `${titulo} · ${TITULO_FASE[f]}: sin cruces cargados`
                        : completa
                          ? `${titulo} · ${TITULO_FASE[f]} completa`
                          : `${titulo} · ${TITULO_FASE[f]} pendiente`
                    }
                  >
                    {FASE_CORTA[f]}
                  </button>
                );
              })}
            </div>
          ))}

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
            <NuevoCruceForm
              key={`${ronda.copa}-${ronda.fase}`}
              fase={ronda.fase}
              copa={ronda.copa}
              estado={estado}
              onCreado={() => void recargar()}
            />
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
        <SeccionTarjetas estado={estado} onCambio={() => void recargar()} />
      ) : null}

      {/* ── EVENTOS ────────────────────────────────────────────────── */}
      {seccion === 'eventos' ? (
        <SeccionEventos estado={estado} onCambio={() => void recargar()} />
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
          {previa.map((t) => (
            <div key={t.grupo} className="mt-6">
              <p className="font-sport text-2xl uppercase leading-none text-neutral-100">
                Grupo {t.grupo}
              </p>
              <div className="mt-3 overflow-x-auto rounded-2xl border border-white/10 bg-black/40">
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
                    {t.filas.map((f) => (
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
                            <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-500">
                              {f.posicion <= 2 ? 'Oro' : 'Plata'}
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
          ))}
        </div>
      ) : null}

      {seccion === 'premios' ? (
        <SeccionPremios estado={estado} onCambio={() => void recargar()} />
      ) : null}

      {seccion === 'acceso' ? <DefinirClave correo={correo} /> : null}
    </div>
  );
}

/**
 * Alta de un cruce de la fase final.
 *
 * Existe para que la organización no dependa de nadie con acceso a la base:
 * cuando se cierran los grupos, aquí mismo se arman las semifinales. Cuántos
 * cruces lleva cada ronda está en `CRUCES_POR_FASE`, así que el formulario
 * avisa cuando ya están todos y no deja crear de más por descuido.
 *
 * Cada cruce nace con su copa: en la 5ª hay dos semifinales 1 y dos finales,
 * y sin la copa la Llave no sabría en qué cuadro pintarlo.
 *
 * Lo que propone depende de la ronda, y sale de los mismos cálculos que usa
 * el sitio: las semifinales, de las tablas de grupo (1º A vs 2º B…); la
 * final, de los ganadores de las semifinales de esa copa; el tercer puesto,
 * de sus perdedores. Antes proponía «los ganadores de la ronda anterior» para
 * todo, y en el tercer puesto ofrecía justo a los dos finalistas.
 */
function NuevoCruceForm({
  fase,
  copa,
  estado,
  onCreado,
}: {
  fase: FaseFinal;
  copa: Copa;
  estado: EstadoTorneo;
  onCreado: () => void;
}) {
  /** Las parejas que tocan en esta ronda, en orden. Vacío si aún no se sabe. */
  const sugeridas = useMemo(() => parejasSugeridas(fase, copa, estado), [fase, copa, estado]);

  /** Las parejas sugeridas que todavía no tienen cruce creado. */
  const disponibles = useMemo(() => {
    const yaCruzados = new Set(
      deLaRonda(estado.partidos, fase, copa).flatMap((p) => [p.local, p.visitante]),
    );
    return sugeridas.filter(([a, b]) => !yaCruzados.has(a) && !yaCruzados.has(b));
  }, [sugeridas, estado.partidos, fase, copa]);

  const cargados = deLaRonda(estado.partidos, fase, copa).length;
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
    setLocal((v) => v || disponibles[0]?.[0] || '');
    setVisitante((v) => v || disponibles[0]?.[1] || '');
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
      await crearCruce({ fase, copa, fecha, hora, local, visitante });
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
        Nuevo cruce · {TITULO_COPA[copa]} · {TITULO_FASE[fase]}
      </p>

      {sugeridas.length > 0 ? (
        <p className="mt-2 text-xs text-neutral-400">
          Tocan:{' '}
          {sugeridas
            .map(([a, b]) => `${getEquipo(a)?.nombre ?? a} vs ${getEquipo(b)?.nombre ?? b}`)
            .join(' · ')}
          .
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

/**
 * Quién debería jugar cada cruce de una ronda, según lo que ya está cargado.
 *
 * - Semifinales: de las tablas de grupo, con `cruzarFaseFinal`, la misma
 *   función que dibuja la Llave. Solo cuando la fase de grupos está completa:
 *   antes es una proyección y no se debe crear un cruce sobre ella.
 * - Final: los ganadores de las dos semifinales de esa copa.
 * - Tercer puesto: los perdedores.
 *
 * Una semifinal empatada sin tanda no da ganador, y esa pareja no se propone.
 */
function parejasSugeridas(fase: FaseFinal, copa: Copa, estado: EstadoTorneo): [string, string][] {
  const grupos = estado.partidos.filter((p) => p.fase === 'grupos');

  if (fase === 'semifinal') {
    if (grupos.length === 0 || grupos.some((p) => !p.jugado)) return [];
    const comoLiga: PartidoLiga[] = grupos.map((p) => ({
      id: p.id,
      jornada: p.jornada,
      fecha: p.fecha,
      hora: p.hora,
      local: p.local,
      visitante: p.visitante,
      golesLocal: p.golesLocal,
      golesVisitante: p.golesVisitante,
      estado: 'jugado',
    }));
    const disciplina = disciplinaDe(estado);
    return cruzarFaseFinal(posicionesPorGrupo(comoLiga, disciplina))
      .filter((c) => c.copa === copa && c.local && c.visitante)
      .map((c) => [c.local!, c.visitante!]);
  }

  // Final y tercer puesto salen de las semifinales de la misma copa.
  const lados = deLaRonda(estado.partidos, 'semifinal', copa)
    .filter((p) => p.jugado)
    .map((p) => {
      const gana = ladoGanador(p.golesLocal, p.golesVisitante, p.penalesLocal, p.penalesVisitante);
      if (!gana) return null;
      return gana === 'local'
        ? { ganador: p.local, perdedor: p.visitante }
        : { ganador: p.visitante, perdedor: p.local };
    })
    .filter((x): x is { ganador: string; perdedor: string } => x != null);
  if (lados.length !== 2) return [];
  const [a, b] = lados as [(typeof lados)[0], (typeof lados)[0]];
  if (fase === 'final') return [[a.ganador, b.ganador]];
  if (fase === 'tercer-puesto') return [[a.perdedor, b.perdedor]];
  return [];
}

/** Desplegable con los clubes de la edición. */
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
  // Sirve el de cualquier copa: las dos juegan cada ronda el mismo día.
  const hermano = estado.partidos.find((p) => p.fase === fase);
  if (hermano) return hermano.fecha;
  const anunciada = CALENDARIO_FASE_FINAL.find((r) => r.fase === fase)?.fecha;
  if (!anunciada) return '';
  const [d, m, a] = anunciada.split('/');
  return `${a}-${m}-${d}`;
}

/**
 * La pestaña de Premios del panel.
 *
 * Solo tiene un formulario, el del MVP, y es a propósito: **los otros siete
 * premios no se escriben, se calculan**. El campeón sale de la Gran Final,
 * el goleador del ranking, la valla de los goles recibidos. Si hubiera un
 * campo para escribirlos, tarde o temprano alguien escribiría uno que
 * contradijera al marcador.
 *
 * Lo que sí hace es mostrarlos, para que quien cierra el torneo vea de un
 * vistazo qué falta por cargar antes de la clausura.
 */
function SeccionPremios({ estado, onCambio }: { estado: EstadoTorneo; onCambio: () => void }) {
  const [mvp, setMvp] = useState<MvpPanel>(
    estado.mvp ?? { jugador: '', equipo: EQUIPOS[0]?.slug ?? '' },
  );
  const [trabajando, setTrabajando] = useState(false);
  const [aviso, setAviso] = useState('');
  const [error, setError] = useState('');

  // Los premios que se deducen, con los datos que hay AHORA en la base.
  const calculados = useMemo(() => {
    const comoLiga: PartidoLiga[] = estado.partidos.map((p) => ({
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

    const eliminatoria = estado.partidos
      .filter((p) => p.fase !== 'grupos')
      .map((p) => ({
        ...comoLiga.find((c) => c.id === p.id)!,
        fase: p.fase as FaseFinal,
        copa: p.copa,
        penalesLocal: p.penalesLocal,
        penalesVisitante: p.penalesVisitante,
      }));

    const totales = totalesDeEdicion(comoLiga);
    const disciplina = disciplinaDe(estado);
    const soloGrupos = comoLiga.filter((_, i) => estado.partidos[i]?.fase === 'grupos');

    return {
      podio: podioDeEdicion(eliminatoria),
      artillero: equipoMasGoleador(totales),
      valla: vallaMenosVencida(totales),
      limpio: tablaJuegoLimpio(calcularPosiciones(soloGrupos, disciplina))[0] ?? null,
      goleador: estado.goleadores[0] ?? null,
    };
  }, [estado]);

  const nombre = (slug?: string | null) =>
    slug ? (getEquipo(slug)?.nombre ?? slug) : 'Por definir';

  async function guardar() {
    if (!mvp.jugador.trim() || !mvp.equipo) {
      setError('Falta el nombre o el club.');
      return;
    }
    setTrabajando(true);
    setError('');
    setAviso('');
    try {
      await guardarMvp(mvp);
      setAviso('MVP guardado.');
      onCambio();
    } catch {
      setError('No se pudo guardar. Verifica que tu cuenta siga autorizada.');
    } finally {
      setTrabajando(false);
    }
  }

  async function borrar() {
    setTrabajando(true);
    setError('');
    setAviso('');
    try {
      await borrarMvp();
      setMvp({ jugador: '', equipo: EQUIPOS[0]?.slug ?? '' });
      setAviso('MVP borrado.');
      onCambio();
    } catch {
      setError('No se pudo borrar.');
    } finally {
      setTrabajando(false);
    }
  }

  const filas: { rotulo: string; quien: string; detalle: string }[] = [
    {
      rotulo: 'Campeón',
      quien: nombre(calculados.podio.campeon),
      detalle: calculados.podio.campeon ? 'Ganador de la Gran Final' : 'Falta cargar la Gran Final',
    },
    {
      rotulo: 'Subcampeón',
      quien: nombre(calculados.podio.subcampeon),
      detalle: calculados.podio.subcampeon ? 'Finalista' : 'Falta cargar la Gran Final',
    },
    {
      rotulo: 'Tercer puesto',
      quien: nombre(calculados.podio.tercero),
      detalle: calculados.podio.tercero
        ? 'Ganador del tercer puesto'
        : 'Falta cargar el tercer puesto',
    },
    {
      rotulo: 'Equipo más goleador',
      quien: nombre(calculados.artillero?.equipo),
      detalle: calculados.artillero ? `${calculados.artillero.valor} goles en la edición` : '—',
    },
    {
      rotulo: 'Goleador',
      quien: calculados.goleador?.jugador ?? 'Por definir',
      detalle: calculados.goleador
        ? `${calculados.goleador.goles} goles · ${nombre(calculados.goleador.equipo)}`
        : '—',
    },
    {
      rotulo: 'Valla menos vencida',
      quien: nombre(calculados.valla?.equipo),
      detalle: calculados.valla ? `${calculados.valla.valor} goles en contra` : '—',
    },
    {
      rotulo: 'Fair Play',
      quien: nombre(calculados.limpio?.equipo),
      detalle: calculados.limpio
        ? `${calculados.limpio.ta} amarillas, ${calculados.limpio.tr} rojas`
        : '—',
    },
  ];

  return (
    <div className="mt-8">
      <div className="rounded-xl border border-amarillo/30 bg-black/50 p-4">
        <p className="font-bufon text-xs font-bold uppercase tracking-[0.15em] text-amarillo">
          MVP del torneo
        </p>
        <p className="mt-2 text-xs text-neutral-400">
          Es el único premio que se escribe a mano: no hay asistencias ni minutos en el sistema, así
          que no se puede deducir. Lo decide el jurado.
        </p>
        <div className="mt-3 flex flex-wrap items-end gap-3">
          <label className="flex flex-col gap-1 text-xs text-neutral-400">
            Jugador
            <input
              value={mvp.jugador}
              onChange={(e) => setMvp({ ...mvp, jugador: e.target.value })}
              placeholder="Nombre y apellido"
              className="w-52 rounded-md border border-white/25 bg-[#05070a] px-3 py-2 text-sm text-neutral-50 placeholder:text-neutral-500 focus:border-amarillo focus:outline-none"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs text-neutral-400">
            Club
            <SelectEquipo valor={mvp.equipo} onChange={(v) => setMvp({ ...mvp, equipo: v })} />
          </label>
          <button
            onClick={() => void guardar()}
            disabled={trabajando}
            className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amarillo to-naranja px-5 py-2.5 text-sm font-bold text-carbon disabled:opacity-50"
          >
            {trabajando ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
            Guardar MVP
          </button>
          {estado.mvp ? (
            <button
              onClick={() => void borrar()}
              disabled={trabajando}
              className="text-xs text-neutral-500 hover:text-red-400"
            >
              Borrar
            </button>
          ) : null}
        </div>
        {error ? <p className="mt-2 text-xs text-red-400">{error}</p> : null}
        {aviso ? <p className="mt-2 text-xs text-emerald-400">{aviso}</p> : null}
      </div>

      <p className="mt-8 font-bufon text-xs font-bold uppercase tracking-[0.15em] text-neutral-400">
        Los otros siete se calculan solos
      </p>
      <p className="mt-2 text-xs text-neutral-500">
        Salen de los marcadores, y se cuentan sobre la edición completa —las siete fechas más la
        fase final—. Si alguno dice «Por definir», es que falta cargar un partido.
      </p>

      <ul className="mt-4 space-y-2">
        {filas.map((f) => {
          const pendiente = f.quien === 'Por definir';
          return (
            <li
              key={f.rotulo}
              className={cn(
                'flex flex-wrap items-center gap-x-4 gap-y-1 rounded-xl border p-3',
                pendiente
                  ? 'border-dashed border-white/15 bg-black/20'
                  : 'border-white/10 bg-black/40',
              )}
            >
              <span className="w-48 shrink-0 font-mono text-[11px] uppercase tracking-[0.12em] text-neutral-500">
                {f.rotulo}
              </span>
              <span
                className={cn(
                  'min-w-0 flex-1 font-semibold',
                  pendiente ? 'text-neutral-600' : 'text-neutral-100',
                )}
              >
                {f.quien}
              </span>
              <span className="text-xs text-neutral-500">{f.detalle}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
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

/**
 * La pestaña de Tarjetas: una por una, en el partido en que se mostraron.
 *
 * Antes se escribía el acumulado de cada club. Ahora se anota cada tarjeta
 * con su dorsal, y de ahí salen solos el acumulado del Fair Play y quién
 * está suspendido para la fecha siguiente: si los tres se escribieran por
 * separado, tarde o temprano dirían cosas distintas.
 *
 * Cada tarjeta se guarda al momento. No hay botón de «guardar todo»: si se
 * cierra la pestaña a mitad de camino, lo anotado ya está.
 */
function SeccionTarjetas({ estado, onCambio }: { estado: EstadoTorneo; onCambio: () => void }) {
  const grupos = estado.partidos.filter((p) => p.fase === 'grupos');
  // Abre en la última fecha jugada: las tarjetas se cargan después del partido.
  const ultimaJugada = grupos.filter((p) => p.jugado).reduce((m, p) => Math.max(m, p.jornada), 0);
  const [vista, setVista] = useState<number | 'final'>(ultimaJugada || 1);

  const partidos =
    vista === 'final'
      ? estado.partidos.filter((p) => p.fase !== 'grupos')
      : grupos.filter((p) => p.jornada === vista);

  const acumulado = disciplinaDe(estado);
  const susp = useMemo(
    () => suspensiones(estado.tarjetas, estado.partidos.map(comoPartidoLiga)),
    [estado.tarjetas, estado.partidos],
  );
  const pendientes = susp.filter((x) => {
    const cumple = x.cumple ? estado.partidos.find((p) => p.id === x.cumple) : null;
    return !cumple || !cumple.jugado;
  });

  return (
    <div className="mt-8">
      <p className="text-sm text-neutral-400">
        Anota cada tarjeta en el partido en que se mostró, con el dorsal si lo tienes. El acumulado
        de cada club y los suspendidos se calculan solos.
      </p>
      {estado.tarjetas.length === 0 && estado.disciplina.length > 0 ? (
        <p className="mt-3 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-xs text-amber-200">
          Esta edición tiene acumulados por club cargados a la antigua. En cuanto anotes la primera
          tarjeta aquí, el Fair Play pasa a contarse sobre las tarjetas de los partidos y esos
          acumulados dejan de usarse.
        </p>
      ) : null}

      <div className="mt-6 flex flex-wrap items-center gap-2">
        {Array.from({ length: TOTAL_JORNADAS }, (_, i) => i + 1).map((j) => (
          <button
            key={j}
            onClick={() => setVista(j)}
            className={cn(
              'h-10 w-10 rounded-lg font-sport text-lg transition-colors',
              vista === j
                ? 'bg-amarillo text-carbon'
                : 'border border-white/15 text-neutral-400 hover:border-amarillo/50',
            )}
            title={`Fecha ${j}`}
          >
            {j}
          </button>
        ))}
        <button
          onClick={() => setVista('final')}
          className={cn(
            'h-10 rounded-lg px-3 font-bufon text-xs font-bold uppercase tracking-[0.1em] transition-colors',
            vista === 'final'
              ? 'bg-amarillo text-carbon'
              : 'border border-white/15 text-neutral-400 hover:border-amarillo/50',
          )}
        >
          Fase final
        </button>
      </div>

      {partidos.length === 0 ? (
        <p className="mt-6 text-sm text-neutral-500">Todavía no hay partidos en esta ronda.</p>
      ) : (
        <ul className="mt-6 space-y-4">
          {partidos.map((p) => (
            <li key={p.id} className="rounded-xl border border-white/10 bg-black/60 p-4">
              <p className="text-xs text-neutral-500">
                {p.copa ? `${TITULO_COPA[p.copa]} · ${TITULO_FASE[p.fase as FaseFinal]} · ` : ''}
                {p.fecha} · {p.hora}
                {p.jugado ? ` · ${p.golesLocal}–${p.golesVisitante}` : ' · sin jugar'}
              </p>
              <div className="mt-3 grid gap-4 sm:grid-cols-2">
                {[p.local, p.visitante].map((equipo) => (
                  <TarjetasDeClub
                    key={equipo}
                    partido={p.id}
                    equipo={equipo}
                    tarjetas={estado.tarjetas.filter(
                      (t) => t.partido === p.id && t.equipo === equipo,
                    )}
                    onCambio={onCambio}
                  />
                ))}
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Lo que sale solo de las tarjetas: lo que antes se escribía a mano. */}
      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <div>
          <p className="font-bufon text-xs font-bold uppercase tracking-[0.15em] text-amarillo">
            Suspendidos por roja
          </p>
          {pendientes.length ? (
            <ul className="mt-3 space-y-1.5 text-sm text-neutral-300">
              {pendientes.map((x) => {
                const cumple = x.cumple ? estado.partidos.find((q) => q.id === x.cumple) : null;
                return (
                  <li key={`${x.equipo}-${x.numero}-${x.origen}`}>
                    <strong>#{x.numero}</strong> de {getEquipo(x.equipo)?.nombre ?? x.equipo}
                    <span className="text-neutral-500">
                      {' '}
                      ·{' '}
                      {cumple
                        ? cumple.fase === 'grupos'
                          ? `no juega la Fecha ${cumple.jornada}`
                          : `no juega el ${cumple.fecha}`
                        : 'no juega su próximo partido'}
                    </span>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-neutral-500">Nadie tiene una suspensión pendiente.</p>
          )}
          <p className="mt-2 text-[11px] text-neutral-600">
            Una roja con dorsal suspende al jugador para el siguiente partido de su club. Una roja
            sin dorsal cuenta para el Fair Play, pero no se puede nombrar a nadie.
          </p>
        </div>

        <div>
          <p className="font-bufon text-xs font-bold uppercase tracking-[0.15em] text-amarillo">
            Acumulado por club
          </p>
          <ul className="mt-3 space-y-1 text-sm">
            {EQUIPOS.map((eq) => {
              const d = acumulado[eq.slug] ?? { amarillas: 0, rojas: 0 };
              return (
                <li key={eq.slug} className="flex items-center gap-2 text-neutral-300">
                  <TeamCrest slug={eq.slug} size={22} />
                  <span className="min-w-0 flex-1 truncate">{eq.nombre}</span>
                  <span className="tabular-nums text-amber-300">{d.amarillas} TA</span>
                  <span className="w-12 text-right tabular-nums text-red-400">{d.rojas} TR</span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}

/** Las tarjetas de un club en un partido, con el formulario para añadir otra. */
function TarjetasDeClub({
  partido,
  equipo,
  tarjetas,
  onCambio,
}: {
  partido: string;
  equipo: string;
  tarjetas: TarjetaPanel[];
  onCambio: () => void;
}) {
  const [tipo, setTipo] = useState<'amarilla' | 'roja'>('amarilla');
  const [numero, setNumero] = useState<number | null>(null);
  const [trabajando, setTrabajando] = useState(false);
  const [error, setError] = useState('');

  async function agregar() {
    setTrabajando(true);
    setError('');
    try {
      await crearTarjeta({ partido, equipo, numero, tipo });
      setNumero(null);
      onCambio();
    } catch {
      setError('No se pudo guardar la tarjeta.');
    } finally {
      setTrabajando(false);
    }
  }

  async function quitar(t: TarjetaPanel) {
    const quien = t.numero != null ? `#${t.numero}` : 'sin dorsal';
    if (!window.confirm(`¿Quitar la ${t.tipo} ${quien}?`)) return;
    setTrabajando(true);
    setError('');
    try {
      await eliminarTarjeta(t.id);
      onCambio();
    } catch {
      setError('No se pudo quitar la tarjeta.');
    } finally {
      setTrabajando(false);
    }
  }

  const ordenadas = [...tarjetas].sort(
    (a, b) => a.tipo.localeCompare(b.tipo) || (a.numero ?? 999) - (b.numero ?? 999),
  );

  return (
    <div className="rounded-lg border border-white/10 bg-black/40 p-3">
      <p className="flex items-center gap-2 text-sm font-semibold text-neutral-200">
        <TeamCrest slug={equipo} size={24} />
        {getEquipo(equipo)?.nombre ?? equipo}
      </p>

      <ul className="mt-2 flex min-h-[28px] flex-wrap gap-1.5">
        {ordenadas.length === 0 ? (
          <li className="text-xs text-neutral-600">Sin tarjetas.</li>
        ) : (
          ordenadas.map((t) => (
            <li key={t.id}>
              <button
                onClick={() => void quitar(t)}
                disabled={trabajando}
                title="Quitar esta tarjeta"
                className={cn(
                  'inline-flex items-center gap-1 rounded px-2 py-1 font-mono text-xs font-bold disabled:opacity-50',
                  t.tipo === 'roja' ? 'bg-red-600 text-white' : 'bg-amber-300 text-carbon',
                )}
              >
                {t.numero != null ? `#${t.numero}` : 's/d'}
                <X size={12} aria-hidden />
              </button>
            </li>
          ))
        )}
      </ul>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <select
          value={tipo}
          onChange={(e) => setTipo(e.target.value === 'roja' ? 'roja' : 'amarilla')}
          className="rounded-md border border-white/25 bg-[#05070a] px-2 py-2 text-xs text-neutral-50"
          aria-label="Color de la tarjeta"
        >
          <option value="amarilla">Amarilla</option>
          <option value="roja">Roja</option>
        </select>
        <label className="flex items-center gap-1 text-xs text-neutral-400">
          Dorsal
          <NumeroInput valor={numero} onChange={setNumero} ancho="w-16" />
        </label>
        <button
          onClick={() => void agregar()}
          disabled={trabajando}
          className="inline-flex items-center gap-1 rounded-full border border-white/20 px-3 py-2 text-xs font-bold text-neutral-200 hover:border-amarillo/60 hover:text-amarillo disabled:opacity-50"
        >
          {trabajando ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />}
          Añadir
        </button>
      </div>
      {error ? <p className="mt-2 text-xs text-red-400">{error}</p> : null}
    </div>
  );
}

/**
 * La pestaña de Eventos: lo que pasa en una fecha y no es un partido.
 *
 * Existe por el torneo de penales de la Fecha 1, que tenía hora y campeón
 * pero no cabía en ningún sitio: no suma puntos ni tiene dos equipos. Sale
 * en el Calendario, dentro de su fecha y en su hora.
 */
function SeccionEventos({ estado, onCambio }: { estado: EstadoTorneo; onCambio: () => void }) {
  const [jornada, setJornada] = useState(1);
  const [hora, setHora] = useState('');
  const [titulo, setTitulo] = useState('');
  const [detalle, setDetalle] = useState('');
  const [trabajando, setTrabajando] = useState(false);
  const [error, setError] = useState('');

  async function crear() {
    if (!titulo.trim()) return setError('Falta el título: «Torneo de penales», por ejemplo.');
    setTrabajando(true);
    setError('');
    try {
      await crearEvento({ jornada, hora: hora || null, titulo, detalle: detalle || null });
      setTitulo('');
      setDetalle('');
      setHora('');
      onCambio();
    } catch {
      setError('No se pudo guardar el evento.');
    } finally {
      setTrabajando(false);
    }
  }

  async function borrar(id: string, nombre: string) {
    if (!window.confirm(`¿Eliminar «${nombre}»?`)) return;
    setTrabajando(true);
    try {
      await eliminarEvento(id);
      onCambio();
    } catch {
      setError('No se pudo eliminar el evento.');
    } finally {
      setTrabajando(false);
    }
  }

  return (
    <div className="mt-8">
      <p className="text-sm text-neutral-400">
        Lo que pasa en una fecha y no es un partido —un torneo de penales, una premiación—. Sale en
        el Calendario, dentro de su fecha.
      </p>

      {estado.eventos.length ? (
        <ul className="mt-6 space-y-2">
          {estado.eventos.map((ev) => (
            <li
              key={ev.id}
              className="flex flex-wrap items-center gap-3 rounded-xl border border-white/10 bg-black/50 px-4 py-3"
            >
              <span className="font-sport text-lg text-amarillo">Fecha {ev.jornada}</span>
              <span className="font-mono text-xs text-neutral-500">{ev.hora ?? 'sin hora'}</span>
              <span className="min-w-0 flex-1 text-sm text-neutral-200">
                <strong>{ev.titulo}</strong>
                {ev.detalle ? <span className="text-neutral-400"> · {ev.detalle}</span> : null}
              </span>
              <button
                onClick={() => void borrar(ev.id, ev.titulo)}
                disabled={trabajando}
                title="Eliminar este evento"
                className="rounded-md p-1.5 text-neutral-600 hover:bg-red-500/10 hover:text-red-400 disabled:opacity-50"
              >
                <Trash2 size={15} />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-6 text-sm text-neutral-500">Todavía no hay eventos.</p>
      )}

      <div className="mt-6 rounded-xl border border-amarillo/30 bg-black/50 p-4">
        <p className="font-bufon text-xs font-bold uppercase tracking-[0.15em] text-amarillo">
          Nuevo evento
        </p>
        <div className="mt-3 flex flex-wrap items-end gap-3">
          <label className="flex flex-col gap-1 text-xs text-neutral-400">
            Fecha
            <select
              value={jornada}
              onChange={(e) => setJornada(Number(e.target.value))}
              className="rounded-md border border-white/25 bg-[#05070a] px-3 py-2 text-sm text-neutral-50"
            >
              {Array.from({ length: TOTAL_JORNADAS }, (_, i) => i + 1).map((j) => (
                <option key={j} value={j}>
                  Fecha {j}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-xs text-neutral-400">
            Hora
            <input
              type="time"
              value={hora}
              onChange={(e) => setHora(e.target.value)}
              className="rounded-md border border-white/25 bg-[#05070a] px-3 py-2 text-sm text-neutral-50"
            />
          </label>
          <label className="flex min-w-[12rem] flex-1 flex-col gap-1 text-xs text-neutral-400">
            Título
            <input
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Torneo de penales"
              className="rounded-md border border-white/25 bg-[#05070a] px-3 py-2 text-sm text-neutral-50"
            />
          </label>
          <label className="flex min-w-[12rem] flex-1 flex-col gap-1 text-xs text-neutral-400">
            Detalle (opcional)
            <input
              value={detalle}
              onChange={(e) => setDetalle(e.target.value)}
              placeholder="Campeón: Los Pibes del Barrio"
              className="rounded-md border border-white/25 bg-[#05070a] px-3 py-2 text-sm text-neutral-50"
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
        </div>
        {error ? <p className="mt-2 text-xs text-red-400">{error}</p> : null}
      </div>
    </div>
  );
}
