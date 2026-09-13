/**
 * Lectura y escritura del torneo desde el panel de administración.
 *
 * A diferencia de `liga-supabase.ts`, que corre en el build sin sesión y solo
 * lee, esto corre en el navegador con la sesión del administrador. Las
 * políticas RLS exigen que su correo esté en `public.admins`: si no lo está,
 * las escrituras fallan aunque haya sesión válida.
 */

import { supabase } from './supabase';
import { EDICION_ACTUAL, type FaseFinal } from './liga';

/** Ronda a la que pertenece un partido: la liga o una ronda eliminatoria. */
export type FasePartido = 'grupos' | FaseFinal;

export interface PartidoPanel {
  id: string;
  fase: FasePartido;
  /** 1..7 en la fase de grupos; 0 en la eliminatoria. */
  jornada: number;
  fecha: string;
  hora: string;
  local: string;
  visitante: string;
  golesLocal: number | null;
  golesVisitante: number | null;
  /** Penales de la tanda. Solo en fase final y solo si los goles empataron. */
  penalesLocal: number | null;
  penalesVisitante: number | null;
  jugado: boolean;
}

export interface DisciplinaPanel {
  equipo: string;
  amarillas: number;
  rojas: number;
}

export interface GoleadorPanel {
  id: string;
  jugador: string;
  equipo: string;
  numero: number | null;
  goles: number;
}

export interface EstadoTorneo {
  partidos: PartidoPanel[];
  disciplina: DisciplinaPanel[];
  goleadores: GoleadorPanel[];
}

function exigirCliente() {
  if (!supabase) throw new Error('Supabase no está configurado.');
  return supabase;
}

export async function cargarTodo(edicion = EDICION_ACTUAL): Promise<EstadoTorneo> {
  const sb = exigirCliente();

  const [p, d, g] = await Promise.all([
    sb
      .from('partidos')
      .select(
        'id, fase, jornada, fecha, hora, local, visitante, goles_local, goles_visitante, penales_local, penales_visitante, estado',
      )
      .eq('edicion', edicion)
      // Vienen todas las rondas, tambien la eliminatoria. El selector del
      // panel separa las fechas de grupos de los cruces finales: filtrar
      // aqui por 'grupos' era lo que dejaba los cuartos sin formulario.
      .order('jornada')
      .order('fecha')
      .order('hora'),
    sb.from('disciplina').select('equipo, amarillas, rojas').eq('edicion', edicion),
    sb
      .from('goleadores')
      .select('id, jugador, equipo, numero, goles')
      .eq('edicion', edicion)
      .order('goles', { ascending: false }),
  ]);

  if (p.error) throw p.error;
  if (d.error) throw d.error;
  if (g.error) throw g.error;

  return {
    partidos: (p.data ?? []).map((r) => ({
      id: r.id as string,
      fase: r.fase as FasePartido,
      jornada: r.jornada as number,
      fecha: r.fecha as string,
      hora: (r.hora as string).slice(0, 5),
      local: r.local as string,
      visitante: r.visitante as string,
      golesLocal: r.goles_local as number | null,
      golesVisitante: r.goles_visitante as number | null,
      penalesLocal: r.penales_local as number | null,
      penalesVisitante: r.penales_visitante as number | null,
      jugado: r.estado === 'jugado',
    })),
    disciplina: (d.data ?? []) as DisciplinaPanel[],
    goleadores: (g.data ?? []).map((r) => ({
      id: r.id as string,
      jugador: r.jugador as string,
      equipo: r.equipo as string,
      numero: r.numero as number | null,
      goles: r.goles as number,
    })),
  };
}

/**
 * Guarda el marcador de un partido.
 *
 * La base tiene una restricción que impide estados incoherentes: o está
 * programado sin marcador, o jugado con los dos goles. Por eso al marcar
 * como programado se limpian los goles en la misma operación.
 */
export async function guardarPartido(p: PartidoPanel): Promise<void> {
  const sb = exigirCliente();
  const jugado = p.jugado && p.golesLocal != null && p.golesVisitante != null;

  /**
   * La tanda solo se guarda si la base la va a aceptar: fase final, partido
   * jugado, goles empatados y un ganador claro en los penales. Si el marcador
   * deja de estar empatado —porque se corrigió—, la tanda se borra sola en la
   * misma operación; si no, la restricción `penales_coherentes` rechazaría el
   * guardado entero y el usuario vería un error sin saber por qué.
   */
  const hayTanda =
    jugado &&
    p.fase !== 'grupos' &&
    p.golesLocal === p.golesVisitante &&
    p.penalesLocal != null &&
    p.penalesVisitante != null &&
    p.penalesLocal !== p.penalesVisitante;

  const { error } = await sb
    .from('partidos')
    .update({
      goles_local: jugado ? p.golesLocal : null,
      goles_visitante: jugado ? p.golesVisitante : null,
      penales_local: hayTanda ? p.penalesLocal : null,
      penales_visitante: hayTanda ? p.penalesVisitante : null,
      estado: jugado ? 'jugado' : 'programado',
    })
    .eq('id', p.id);

  if (error) throw error;
}

export interface NuevoCruce {
  fase: FaseFinal;
  /** 'AAAA-MM-DD', tal como lo entrega un <input type="date">. */
  fecha: string;
  /** 'HH:MM', tal como lo entrega un <input type="time">. */
  hora: string;
  local: string;
  visitante: string;
}

/**
 * Crea un cruce de la fase final.
 *
 * La jornada va en 0 porque en eliminatoria no aplica: es lo que exige la
 * restriccion `jornada_coherente` de la migracion 0007. El partido nace
 * programado y sin marcador, que es lo unico que admite
 * `marcador_coherente`.
 */
export async function crearCruce(c: NuevoCruce, edicion = EDICION_ACTUAL): Promise<void> {
  const sb = exigirCliente();
  const { error } = await sb.from('partidos').insert({
    edicion,
    fase: c.fase,
    jornada: 0,
    fecha: c.fecha,
    hora: `${c.hora}:00`,
    local: c.local,
    visitante: c.visitante,
    estado: 'programado',
  });
  if (error) throw error;
}

/**
 * Borra un partido. Solo se ofrece para la fase final: los 28 de la liga son
 * el fixture oficial y no se tocan desde el panel.
 */
export async function eliminarPartido(id: string): Promise<void> {
  const sb = exigirCliente();
  const { error } = await sb.from('partidos').delete().eq('id', id);
  if (error) throw error;
}

export async function guardarDisciplina(
  filas: DisciplinaPanel[],
  edicion = EDICION_ACTUAL,
): Promise<void> {
  const sb = exigirCliente();
  const { error } = await sb.from('disciplina').upsert(
    filas.map((f) => ({
      edicion,
      equipo: f.equipo,
      amarillas: f.amarillas,
      rojas: f.rojas,
    })),
    { onConflict: 'edicion,equipo' },
  );
  if (error) throw error;
}

export async function crearGoleador(
  g: Omit<GoleadorPanel, 'id'>,
  edicion = EDICION_ACTUAL,
): Promise<void> {
  const sb = exigirCliente();
  const { error } = await sb.from('goleadores').insert({
    edicion,
    jugador: g.jugador.trim(),
    equipo: g.equipo,
    numero: g.numero,
    goles: g.goles,
  });
  if (error) throw error;
}

export async function actualizarGoleador(g: GoleadorPanel): Promise<void> {
  const sb = exigirCliente();
  const { error } = await sb
    .from('goleadores')
    .update({ jugador: g.jugador.trim(), equipo: g.equipo, numero: g.numero, goles: g.goles })
    .eq('id', g.id);
  if (error) throw error;
}

export async function eliminarGoleador(id: string): Promise<void> {
  const sb = exigirCliente();
  const { error } = await sb.from('goleadores').delete().eq('id', id);
  if (error) throw error;
}

export interface Descuadre {
  equipo: string;
  golesTabla: number;
  golesRanking: number;
}

/**
 * Compara, club por club, los goles a favor que salen de los marcadores
 * contra la suma del ranking de goleadores.
 *
 * Es la misma comprobación que destapó las dos erratas del gráfico oficial de
 * la Fecha 4. Aquí avisa antes de publicar, no después.
 */
export function descuadres(estado: EstadoTorneo): Descuadre[] {
  const golesTabla = new Map<string, number>();
  for (const p of estado.partidos) {
    if (!p.jugado || p.golesLocal == null || p.golesVisitante == null) continue;
    golesTabla.set(p.local, (golesTabla.get(p.local) ?? 0) + p.golesLocal);
    golesTabla.set(p.visitante, (golesTabla.get(p.visitante) ?? 0) + p.golesVisitante);
  }

  const golesRanking = new Map<string, number>();
  for (const g of estado.goleadores) {
    golesRanking.set(g.equipo, (golesRanking.get(g.equipo) ?? 0) + g.goles);
  }

  const equipos = new Set([...golesTabla.keys(), ...golesRanking.keys()]);
  const salida: Descuadre[] = [];
  for (const equipo of equipos) {
    const a = golesTabla.get(equipo) ?? 0;
    const b = golesRanking.get(equipo) ?? 0;
    if (a !== b) salida.push({ equipo, golesTabla: a, golesRanking: b });
  }
  return salida.sort((x, y) => x.equipo.localeCompare(y.equipo));
}
