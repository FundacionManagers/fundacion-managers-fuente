'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Check, Loader2, Plus, RefreshCw, Trash2, TriangleAlert } from 'lucide-react';
import { DefinirClave } from '@/components/shared/DefinirClave';
import { TeamCrest } from '@/components/torneo/TeamCrest';
import { EQUIPOS, getEquipo } from '@/lib/torneo-data';
import { calcularPosiciones, COLUMNAS_TABLA, TOTAL_JORNADAS, type PartidoLiga } from '@/lib/liga';
import {
  actualizarGoleador,
  cargarTodo,
  crearGoleador,
  descuadres,
  eliminarGoleador,
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

/** Campo numérico que admite quedar vacío mientras se escribe. */
function NumeroInput({
  valor,
  onChange,
  ancho = 'w-16',
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
      onChange={(e) => onChange(e.target.value === '' ? null : Math.max(min, Number(e.target.value)))}
      className={cn(
        ancho,
        'rounded-md border border-white/15 bg-black/40 px-2 py-2 text-center text-base tabular-nums',
        'focus:border-amarillo focus:outline-none focus:ring-2 focus:ring-amarillo/30',
      )}
    />
  );
}

export function PanelResultados({
  salir,
  correo,
}: {
  salir: () => Promise<void>;
  correo: string;
}) {
  const [estado, setEstado] = useState<EstadoTorneo | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [aviso, setAviso] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [seccion, setSeccion] = useState<Seccion>('marcadores');
  const [jornada, setJornada] = useState(1);

  const recargar = useCallback(async () => {
    setCargando(true);
    setError('');
    try {
      const datos = await cargarTodo();
      setEstado(datos);
      // Abrir en la primera fecha sin cargar del todo: es lo que toca hacer.
      const pendiente = datos.partidos.find((p) => !p.jugado)?.jornada;
      setJornada(pendiente ?? TOTAL_JORNADAS);
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
    const fechas = [...new Set(estado.partidos.map((p) => p.jornada))].filter((j) =>
      estado.partidos.filter((p) => p.jornada === j).every((p) => p.jugado),
    );
    const goles = jugados.reduce(
      (s, p) => s + (p.golesLocal ?? 0) + (p.golesVisitante ?? 0),
      0,
    );
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
    const comoLiga: PartidoLiga[] = estado.partidos.map((p) => ({
      id: p.id,
      jornada: p.jornada,
      fecha: p.fecha,
      hora: p.hora,
      local: p.local,
      visitante: p.visitante,
      golesLocal: p.jugado ? p.golesLocal : null,
      golesVisitante: p.jugado ? p.golesVisitante : null,
      estado: p.jugado && p.golesLocal != null && p.golesVisitante != null ? 'jugado' : 'programado',
    }));
    const disciplina = Object.fromEntries(
      estado.disciplina.map((d) => [d.equipo, { amarillas: d.amarillas, rojas: d.rojas }]),
    );
    return calcularPosiciones(comoLiga, disciplina);
  }, [estado]);
  const partidosJornada = useMemo(
    () => (estado ? estado.partidos.filter((p) => p.jornada === jornada) : []),
    [estado, jornada],
  );

  function tocarPartido(id: string, cambios: Partial<PartidoPanel>) {
    setEstado((prev) =>
      prev
        ? { ...prev, partidos: prev.partidos.map((p) => (p.id === id ? { ...p, ...cambios } : p)) }
        : prev,
    );
  }

  async function guardarJornada() {
    if (!estado) return;
    setGuardando(true);
    setError('');
    setAviso('');
    try {
      await Promise.all(partidosJornada.map((p) => guardarPartido(p)));
      setAviso(`Fecha ${jornada} guardada.`);
    } catch {
      setError('No se pudo guardar. Verifica que tu cuenta siga autorizada.');
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
        <div className="mb-10 grid grid-cols-2 gap-4 stagger-in lg:grid-cols-4">
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
              <div className="font-sport text-4xl leading-none text-energy lg:text-5xl">{s.v}</div>
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

      {/* Mensajes */}
      {error ? (
        <p className="mt-5 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </p>
      ) : null}
      {aviso ? (
        <p className="mt-5 flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
          <Check size={16} /> {aviso} Los cambios se verán en el sitio tras el próximo despliegue.
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
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: TOTAL_JORNADAS }, (_, i) => i + 1).map((j) => {
              const dePaso = estado.partidos.filter((p) => p.jornada === j);
              const completa = dePaso.length > 0 && dePaso.every((p) => p.jugado);
              return (
                <button
                  key={j}
                  onClick={() => setJornada(j)}
                  className={cn(
                    'h-10 w-10 rounded-lg font-sport text-lg transition-colors',
                    jornada === j
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

          <ul className="mt-6 space-y-3">
            {partidosJornada.map((p) => (
              <li key={p.id} className="rounded-xl border border-white/10 bg-black/40 p-4">
                <p className="text-xs text-neutral-500">
                  {p.fecha} · {p.hora}
                </p>
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
              </li>
            ))}
          </ul>

          <button
            onClick={() => void guardarJornada()}
            disabled={guardando}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amarillo to-naranja px-7 py-3 text-sm font-bold text-carbon disabled:opacity-50"
          >
            {guardando ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
            Guardar fecha {jornada}
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
                          c.key === 'pts' ? 'font-sport text-base text-amarillo' : 'text-neutral-300',
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

function SeccionGoleadores({
  estado,
  onCambio,
}: {
  estado: EstadoTorneo;
  onCambio: () => void;
}) {
  const [nuevo, setNuevo] = useState<{ jugador: string; equipo: string; numero: number | null; goles: number | null }>(
    { jugador: '', equipo: EQUIPOS[0]?.slug ?? '', numero: null, goles: 1 },
  );
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
              className="w-52 rounded-md border border-white/15 bg-black/40 px-3 py-2 text-sm focus:border-amarillo focus:outline-none"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs text-neutral-400">
            Equipo
            <select
              value={nuevo.equipo}
              onChange={(e) => setNuevo({ ...nuevo, equipo: e.target.value })}
              className="w-48 rounded-md border border-white/15 bg-black/40 px-3 py-2 text-sm focus:border-amarillo focus:outline-none"
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
        {estado.goleadores.length} anotadores ·{' '}
        {estado.goleadores.reduce((s, g) => s + g.goles, 0)} goles
      </p>
    </div>
  );
}
