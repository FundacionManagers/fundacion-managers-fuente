/**
 * Lectura y escritura del torneo desde el panel de administración.
 *
 * A diferencia de `liga-supabase.ts`, que corre en el build sin sesión y solo
 * lee, esto corre en el navegador con la sesión del administrador. Las
 * políticas RLS exigen que su correo esté en `public.admins`: si no lo está,
 * las escrituras fallan aunque haya sesión válida.
 */

import { supabase } from './supabase';
import { EDICION_DATOS, ENTORNO } from './entorno';
import { type Copa, type FaseFinal } from './liga';

/** Ronda a la que pertenece un partido: la liga o una ronda eliminatoria. */
export type FasePartido = 'grupos' | FaseFinal;

export interface PartidoPanel {
  id: string;
  fase: FasePartido;
  /** 'oro' o 'plata' en la fase final de la 5ª; null en grupos y en la llave única. */
  copa: Copa | null;
  /** 1..3 en la fase de grupos; 0 en la eliminatoria. */
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
  /**
   * El `actualizado_en` que tenía la fila cuando se leyó. Se manda como
   * condición al guardar: si otro administrador la cambió entretanto, la
   * escritura no encuentra la fila y se avisa en vez de pisar su marcador.
   */
  version: string;
}

/** Otro administrador guardó el partido después de que este panel lo leyera. */
export class ConflictoDeVersion extends Error {
  constructor(public readonly partido: string) {
    super('El partido cambió en la base después de leerlo.');
  }
}

export interface DisciplinaPanel {
  equipo: string;
  amarillas: number;
  rojas: number;
}

/** Una tarjeta tal como la guarda la base, con su id para poder borrarla. */
export interface TarjetaPanel {
  id: string;
  partido: string;
  equipo: string;
  numero: number | null;
  tipo: 'amarilla' | 'roja';
}

export interface EventoPanel {
  id: string;
  jornada: number;
  hora: string | null;
  titulo: string;
  detalle: string | null;
}

export interface GoleadorPanel {
  id: string;
  jugador: string;
  equipo: string;
  numero: number | null;
  goles: number;
}

/** El MVP: el único premio que no sale de los marcadores. */
export interface MvpPanel {
  jugador: string;
  equipo: string;
}

export interface EstadoTorneo {
  partidos: PartidoPanel[];
  /** Acumulado por club de ediciones anteriores. La 5ª cuenta sobre `tarjetas`. */
  disciplina: DisciplinaPanel[];
  tarjetas: TarjetaPanel[];
  eventos: EventoPanel[];
  goleadores: GoleadorPanel[];
  mvp: MvpPanel | null;
}

function exigirCliente() {
  if (!supabase) throw new Error('Supabase no está configurado.');
  return supabase;
}

export async function cargarTodo(edicion = EDICION_DATOS): Promise<EstadoTorneo> {
  const sb = exigirCliente();

  const [p, d, g, m, t, e] = await Promise.all([
    sb
      .from('partidos')
      .select(
        'id, fase, copa, jornada, fecha, hora, local, visitante, goles_local, goles_visitante, penales_local, penales_visitante, estado, actualizado_en',
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
    sb
      .from('premios')
      .select('jugador, equipo')
      .eq('edicion', edicion)
      .eq('clave', 'mvp')
      .maybeSingle(),
    sb.from('tarjetas').select('id, partido, equipo, numero, tipo').eq('edicion', edicion),
    sb
      .from('eventos_fecha')
      .select('id, jornada, hora, titulo, detalle')
      .eq('edicion', edicion)
      .order('jornada')
      .order('hora'),
  ]);

  if (p.error) throw p.error;
  if (d.error) throw d.error;
  if (g.error) throw g.error;
  if (t.error) throw t.error;
  if (e.error) throw e.error;
  // El MVP puede no existir todavía: eso no es un error, es lo normal hasta
  // la clausura.

  return {
    partidos: (p.data ?? []).map((r) => ({
      id: r.id as string,
      fase: r.fase as FasePartido,
      copa: r.copa === 'oro' || r.copa === 'plata' ? (r.copa as Copa) : null,
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
      version: r.actualizado_en as string,
    })),
    disciplina: (d.data ?? []) as DisciplinaPanel[],
    tarjetas: (t.data ?? []).map((r) => ({
      id: r.id as string,
      partido: r.partido as string,
      equipo: r.equipo as string,
      numero: r.numero as number | null,
      tipo: r.tipo === 'roja' ? ('roja' as const) : ('amarilla' as const),
    })),
    eventos: (e.data ?? []).map((r) => ({
      id: r.id as string,
      jornada: r.jornada as number,
      hora: r.hora ? (r.hora as string).slice(0, 5) : null,
      titulo: r.titulo as string,
      detalle: (r.detalle as string | null) ?? null,
    })),
    goleadores: (g.data ?? []).map((r) => ({
      id: r.id as string,
      jugador: r.jugador as string,
      equipo: r.equipo as string,
      numero: r.numero as number | null,
      goles: r.goles as number,
    })),
    mvp: m.data
      ? { jugador: String(m.data.jugador ?? ''), equipo: String(m.data.equipo ?? '') }
      : null,
  };
}

/** Guarda o reemplaza el MVP de la edición. */
export async function guardarMvp(mvp: MvpPanel, edicion = EDICION_DATOS): Promise<void> {
  const sb = exigirCliente();
  const { error } = await sb
    .from('premios')
    .upsert(
      { edicion, clave: 'mvp', jugador: mvp.jugador.trim(), equipo: mvp.equipo },
      { onConflict: 'edicion,clave' },
    );
  if (error) throw error;
}

/** Borra el MVP, por si se cargó por error o cambia la decisión del jurado. */
export async function borrarMvp(edicion = EDICION_DATOS): Promise<void> {
  const sb = exigirCliente();
  const { error } = await sb.from('premios').delete().eq('edicion', edicion).eq('clave', 'mvp');
  if (error) throw error;
}

/** Los campos que el formulario de marcadores deja cambiar. */
export function marcadorDistinto(a: PartidoPanel, b: PartidoPanel): boolean {
  return (
    a.golesLocal !== b.golesLocal ||
    a.golesVisitante !== b.golesVisitante ||
    a.penalesLocal !== b.penalesLocal ||
    a.penalesVisitante !== b.penalesVisitante ||
    a.jugado !== b.jugado
  );
}

/**
 * Guarda el marcador de un partido y devuelve su versión nueva.
 *
 * La base tiene una restricción que impide estados incoherentes: o está
 * programado sin marcador, o jugado con los dos goles. Por eso al marcar
 * como programado se limpian los goles en la misma operación.
 *
 * Solo escribe si la fila sigue como se leyó (`version`). Con tres
 * administradores en una fecha de juego, guardar a ciegas dejaba en
 * «programado» el resultado que otro acababa de cargar, sin aviso.
 */
export async function guardarPartido(p: PartidoPanel): Promise<string> {
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

  const { data, error } = await sb
    .from('partidos')
    .update({
      goles_local: jugado ? p.golesLocal : null,
      goles_visitante: jugado ? p.golesVisitante : null,
      penales_local: hayTanda ? p.penalesLocal : null,
      penales_visitante: hayTanda ? p.penalesVisitante : null,
      estado: jugado ? 'jugado' : 'programado',
    })
    .eq('id', p.id)
    .eq('actualizado_en', p.version)
    .select('actualizado_en');

  if (error) throw error;
  const fila = data?.[0];
  if (!fila) throw new ConflictoDeVersion(p.id);
  return fila.actualizado_en as string;
}

export interface NuevoCruce {
  fase: FaseFinal;
  /** Obligatoria en una edición con dos copas: hay dos semifinales 1 y dos finales. */
  copa: Copa;
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
export async function crearCruce(c: NuevoCruce, edicion = EDICION_DATOS): Promise<void> {
  const sb = exigirCliente();
  const { error } = await sb.from('partidos').insert({
    edicion,
    fase: c.fase,
    copa: c.copa,
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
 * Borra un partido. Solo se ofrece para la fase final: los de grupos son el
 * fixture oficial y no se tocan desde el panel.
 */
export async function eliminarPartido(id: string): Promise<void> {
  const sb = exigirCliente();
  const { error } = await sb.from('partidos').delete().eq('id', id);
  if (error) throw error;
}

export async function guardarDisciplina(
  filas: DisciplinaPanel[],
  edicion = EDICION_DATOS,
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

/**
 * Anota una tarjeta en un partido. La base comprueba que el club jugó ese
 * partido (trigger `tarjeta_coherente`, migración 0013): una tarjeta cargada
 * al rival movería el Fair Play de los dos sin que nadie lo notara.
 */
export async function crearTarjeta(
  t: Omit<TarjetaPanel, 'id'>,
  edicion = EDICION_DATOS,
): Promise<void> {
  const sb = exigirCliente();
  const { error } = await sb.from('tarjetas').insert({
    edicion,
    partido: t.partido,
    equipo: t.equipo,
    numero: t.numero,
    tipo: t.tipo,
  });
  if (error) throw error;
}

export async function eliminarTarjeta(id: string): Promise<void> {
  const sb = exigirCliente();
  const { error } = await sb.from('tarjetas').delete().eq('id', id);
  if (error) throw error;
}

export async function crearEvento(
  ev: Omit<EventoPanel, 'id'>,
  edicion = EDICION_DATOS,
): Promise<void> {
  const sb = exigirCliente();
  const { error } = await sb.from('eventos_fecha').insert({
    edicion,
    jornada: ev.jornada,
    hora: ev.hora ? `${ev.hora}:00` : null,
    titulo: ev.titulo.trim(),
    detalle: ev.detalle?.trim() || null,
  });
  if (error) throw error;
}

export async function eliminarEvento(id: string): Promise<void> {
  const sb = exigirCliente();
  const { error } = await sb.from('eventos_fecha').delete().eq('id', id);
  if (error) throw error;
}

export async function crearGoleador(
  g: Omit<GoleadorPanel, 'id'>,
  edicion = EDICION_DATOS,
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

/**
 * Pide al servidor que recompile y publique el sitio de este entorno.
 *
 * El sitio es estático: guardar no publica. La revisión programada de GitHub
 * debería correr cada 15 minutos y en la práctica corre cada 2 a 5 horas, así
 * que el panel pide la publicación cada vez que guarda algo.
 *
 * Varios guardados seguidos se juntan en un solo disparo: el primero sale de
 * inmediato y los que lleguen en el minuto siguiente esperan a que acabe ese
 * minuto. Cada disparo es una compilación completa de casi dos minutos.
 */
const ESPERA_ENTRE_DISPAROS = 60_000;
let ultimoDisparo = 0;
let disparoPendiente: Promise<string | null> | null = null;

/**
 * Cuándo salió el último disparo aceptado, recordado en el navegador.
 *
 * El aviso de publicación lo usa para decir «publicación en curso» mientras
 * GitHub compila. Sin eso, después de pulsar seguía diciendo «salió al aire
 * hace N minutos» con la hora del despliegue anterior, y daba para volver a
 * pulsar: el 26 de octubre salieron cinco compilaciones del mismo sitio en
 * media hora. Se guarda en localStorage para que recargar el panel no lo
 * olvide.
 */
const CLAVE_DISPARO_ACEPTADO = `fm-publicacion-pedida-${ENTORNO}`;
export const EVENTO_PUBLICACION_PEDIDA = 'fm-publicacion-pedida';

export function momentoPublicacionPedida(): number {
  try {
    return Number(localStorage.getItem(CLAVE_DISPARO_ACEPTADO)) || 0;
  } catch {
    return 0;
  }
}

function anotarPublicacionPedida() {
  try {
    localStorage.setItem(CLAVE_DISPARO_ACEPTADO, String(Date.now()));
  } catch {
    // Sin almacenamiento el aviso no sabrá que hay una en curso; nada más.
  }
  window.dispatchEvent(new Event(EVENTO_PUBLICACION_PEDIDA));
}

async function dispararPublicacion(): Promise<string | null> {
  const sb = exigirCliente();
  ultimoDisparo = Date.now();
  // El entorno viaja en el cuerpo: la función sabe a qué repositorio
  // disparar. Sin esto, publicar desde ensayos recompilaba la web real.
  const { error } = await sb.functions.invoke('publicar', { body: { entorno: ENTORNO } });
  if (!error) {
    anotarPublicacionPedida();
    return null;
  }

  // Cuando la función responde con un código de error, supabase-js deja
  // `data` en null y guarda la respuesta real en `error.context`.
  try {
    const respuesta = (error as { context?: Response }).context;
    if (respuesta && typeof respuesta.json === 'function') {
      const cuerpo = await respuesta.json();
      if (cuerpo?.error) {
        return cuerpo.estado
          ? `${cuerpo.error} (GitHub respondió ${cuerpo.estado})`
          : String(cuerpo.error);
      }
    }
  } catch {
    // Si no se puede leer el cuerpo, queda el mensaje genérico.
  }
  return 'No se pudo iniciar la publicación.';
}

/** Devuelve null si el disparo salió, o el motivo si falló. */
export function pedirPublicacion(): Promise<string | null> {
  if (disparoPendiente) return disparoPendiente;
  const falta = ultimoDisparo + ESPERA_ENTRE_DISPAROS - Date.now();
  if (falta <= 0) return dispararPublicacion();
  disparoPendiente = new Promise<string | null>((resolver) => {
    setTimeout(() => {
      disparoPendiente = null;
      void dispararPublicacion().then(resolver);
    }, falta);
  });
  return disparoPendiente;
}
