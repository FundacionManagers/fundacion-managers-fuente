/**
 * Lee la liga desde Supabase en tiempo de compilación.
 *
 * El sitio es una exportación estática: esta consulta corre en el build de
 * GitHub Actions y los datos quedan horneados en el HTML. Por eso las páginas
 * siguen siendo tan rápidas como cuando los datos estaban escritos en el
 * código, pero ahora la fuente de verdad es la base y el panel puede
 * cambiarlos sin tocar el repositorio.
 *
 * Si Supabase no responde —o alguien compila sin red— se devuelven las
 * constantes de `liga.ts` y el sitio se publica igual, con los datos de la
 * Fecha 4. Nunca se rompe el despliegue por un problema de base de datos.
 *
 * Qué NO se lee de aquí: los equipos. Cambian una vez por edición y su escudo
 * es un archivo del repositorio, así que renombrar un club exige un commit de
 * todas formas. Siguen en `torneo-data.ts`.
 */

import { createClient } from '@supabase/supabase-js';
import { SUPABASE_ANON_KEY, SUPABASE_URL, supabaseConfigurado } from './supabase';
import {
  DISCIPLINA,
  GOLEADORES_LIGA,
  PARTIDOS_LIGA,
  type Disciplina,
  type Goleador,
  type PartidoLiga,
} from './liga';

export interface DatosLiga {
  partidos: readonly PartidoLiga[];
  disciplina: Readonly<Record<string, Disciplina>>;
  goleadores: readonly Goleador[];
  /** De dónde salieron los datos. Se registra en el log del build. */
  origen: 'supabase' | 'respaldo';
}

const RESPALDO: DatosLiga = {
  partidos: PARTIDOS_LIGA,
  disciplina: DISCIPLINA,
  goleadores: GOLEADORES_LIGA,
  origen: 'respaldo',
};

/** '2026-08-13' → '13/08/2026' */
function aFechaLegible(iso: string): string {
  const [a, m, d] = iso.split('-');
  return `${d}/${m}/${a}`;
}

/** '20:00:00' → '20:00' */
function aHoraLegible(hora: string): string {
  return hora.slice(0, 5);
}

interface FilaPartido {
  id: string;
  jornada: number;
  fecha: string;
  hora: string;
  local: string;
  visitante: string;
  goles_local: number | null;
  goles_visitante: number | null;
  estado: string;
}

interface FilaDisciplina {
  equipo: string;
  amarillas: number;
  rojas: number;
}

interface FilaGoleador {
  jugador: string;
  equipo: string;
  numero: number | null;
  goles: number;
}

/**
 * Trae la edición indicada. Devuelve el respaldo ante cualquier problema:
 * sin cliente configurado, error de red, o tablas vacías.
 */
export async function cargarLiga(edicion = 4): Promise<DatosLiga> {
  if (!supabaseConfigurado) return RESPALDO;

  /**
   * Cliente propio, sin sesión: estas consultas corren en el build y solo
   * leen datos públicos.
   *
   * Ojo con la caché de Next: envuelve `fetch` y guarda la respuesta en
   * `.next/cache`. Al compilar dos veces seguidas en la misma máquina, la
   * segunda sirve los datos de la primera —el log dice "leídos de Supabase"
   * mientras devuelve valores viejos—. En CI no ocurre, porque cada
   * ejecución arranca con un runner limpio; en local, borrar `.next` antes
   * de compilar. No se puede usar `cache: 'no-store'`: con
   * `output: 'export'` vuelve dinámica la consulta y Next la rechaza.
   */
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  try {
    const [partidosRes, disciplinaRes, goleadoresRes] = await Promise.all([
      supabase
        .from('partidos')
        .select('id, jornada, fecha, hora, local, visitante, goles_local, goles_visitante, estado')
        .eq('edicion', edicion)
        // Por fecha antes que por hora: hay jornadas repartidas en dos dias
        // (miercoles y jueves) y ordenar solo por hora las intercala mal.
        .order('jornada')
        .order('fecha')
        .order('hora'),
      supabase
        .from('disciplina')
        .select('equipo, amarillas, rojas')
        .eq('edicion', edicion),
      supabase
        .from('goleadores')
        .select('jugador, equipo, numero, goles')
        .eq('edicion', edicion)
        .order('goles', { ascending: false }),
    ]);

    const filasPartidos = (partidosRes.data ?? []) as FilaPartido[];

    // Sin partidos no hay tabla ni calendario que mostrar: es preferible el
    // respaldo a publicar un torneo vacío.
    if (partidosRes.error || filasPartidos.length === 0) return RESPALDO;

    const partidos: PartidoLiga[] = filasPartidos.map((p) => ({
      id: p.id,
      jornada: p.jornada,
      fecha: aFechaLegible(p.fecha),
      hora: aHoraLegible(p.hora),
      local: p.local,
      visitante: p.visitante,
      golesLocal: p.goles_local,
      golesVisitante: p.goles_visitante,
      estado: p.estado === 'jugado' ? 'jugado' : 'programado',
    }));

    const disciplina: Record<string, Disciplina> = {};
    for (const d of (disciplinaRes.data ?? []) as FilaDisciplina[]) {
      disciplina[d.equipo] = { amarillas: d.amarillas, rojas: d.rojas };
    }

    // La posición se asigna aquí, no se guarda: así nunca queda desfasada
    // respecto a los goles.
    const goleadores: Goleador[] = ((goleadoresRes.data ?? []) as FilaGoleador[])
      .slice()
      .sort((a, b) => b.goles - a.goles || a.jugador.localeCompare(b.jugador))
      .map((g, i) => ({
        posicion: i + 1,
        jugador: g.jugador,
        equipo: g.equipo,
        numero: g.numero ?? 0,
        goles: g.goles,
      }));

    return { partidos, disciplina, goleadores, origen: 'supabase' };
  } catch {
    return RESPALDO;
  }
}

/**
 * Igual que `cargarLiga`, pero deja constancia en el log del build de qué
 * fuente se usó. Si un despliegue sale con datos viejos, el log lo dice.
 */
export async function cargarLigaConAviso(edicion = 4): Promise<DatosLiga> {
  const datos = await cargarLiga(edicion);
  const detalle = `${datos.partidos.length} partidos, ${datos.goleadores.length} goleadores`;
  if (datos.origen === 'supabase') {
    console.log(`[liga] Datos leídos de Supabase (${detalle}).`);
  } else {
    console.warn(`[liga] Supabase no respondió: se usan los datos de respaldo (${detalle}).`);
  }
  return datos;
}
