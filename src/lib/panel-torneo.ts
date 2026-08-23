/**
 * Lectura y escritura del torneo desde el panel de administración.
 *
 * A diferencia de `liga-supabase.ts`, que corre en el build sin sesión y solo
 * lee, esto corre en el navegador con la sesión del administrador. Las
 * políticas RLS exigen que su correo esté en `public.admins`: si no lo está,
 * las escrituras fallan aunque haya sesión válida.
 */

import { supabase } from './supabase';
import { EDICION_ACTUAL } from './liga';

export interface PartidoPanel {
  id: string;
  jornada: number;
  fecha: string;
  hora: string;
  local: string;
  visitante: string;
  golesLocal: number | null;
  golesVisitante: number | null;
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
      .select('id, jornada, fecha, hora, local, visitante, goles_local, goles_visitante, estado')
      .eq('edicion', edicion)
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
      jornada: r.jornada as number,
      fecha: r.fecha as string,
      hora: (r.hora as string).slice(0, 5),
      local: r.local as string,
      visitante: r.visitante as string,
      golesLocal: r.goles_local as number | null,
      golesVisitante: r.goles_visitante as number | null,
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

  const { error } = await sb
    .from('partidos')
    .update({
      goles_local: jugado ? p.golesLocal : null,
      goles_visitante: jugado ? p.golesVisitante : null,
      estado: jugado ? 'jugado' : 'programado',
    })
    .eq('id', p.id);

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
