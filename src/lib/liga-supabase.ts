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
 * última copia del respaldo. Nunca se rompe el despliegue por un problema de
 * base de datos.
 *
 * Qué NO se lee de aquí: los equipos. Cambian una vez por edición y su escudo
 * es un archivo del repositorio, así que renombrar un club exige un commit de
 * todas formas. Siguen en `torneo-data.ts`.
 */

import { createClient } from '@supabase/supabase-js';
import { EDICION_DATOS } from './entorno';
import { SUPABASE_ANON_KEY, SUPABASE_URL, supabaseConfigurado } from './supabase';
import {
  DISCIPLINA,
  EVENTOS_LIGA,
  GOLEADORES_LIGA,
  PARTIDOS_LIGA,
  TARJETAS_LIGA,
  disciplinaDeTarjetas,
  type Disciplina,
  type EventoFecha,
  type Copa,
  type FaseFinal,
  type Goleador,
  type PartidoEliminatoria,
  type PartidoLiga,
  type Tarjeta,
} from './liga';

// Los dos tipos viven ahora en `liga.ts`, junto al calendario de la fase
// final que los usa. Se reexportan para no romper a quien los importaba
// desde aquí.
export type { Copa, FaseFinal, PartidoEliminatoria };

/** Premio que decide un jurado, no los marcadores. Hoy solo el MVP. */
export interface PremioJurado {
  clave: string;
  jugador: string | null;
  equipo: string | null;
  nota: string | null;
}

export interface DatosLiga {
  /** Solo fase de grupos: es lo que alimenta la tabla de posiciones. */
  partidos: readonly PartidoLiga[];
  /** Cruces eliminatorios, si ya existen. No cuentan para la tabla. */
  eliminatoria: readonly PartidoEliminatoria[];
  /**
   * Acumulado por club. Si la edición tiene tarjetas cargadas partido por
   * partido, sale de ellas; si no —ediciones anteriores—, de `disciplina`.
   */
  disciplina: Readonly<Record<string, Disciplina>>;
  /** Cada tarjeta con su partido. Vacío en ediciones que solo cargaban acumulados. */
  tarjetas: readonly Tarjeta[];
  /** Lo que pasa en una fecha y no es un partido. */
  eventos: readonly EventoFecha[];
  goleadores: readonly Goleador[];
  /** Premios de jurado ya decididos. Vacío mientras no se cargue ninguno. */
  premios: readonly PremioJurado[];
  /** De dónde salieron los datos. Se registra en el log del build. */
  origen: 'supabase' | 'respaldo';
}

const RESPALDO: DatosLiga = {
  partidos: PARTIDOS_LIGA,
  eliminatoria: [],
  disciplina: DISCIPLINA,
  tarjetas: TARJETAS_LIGA,
  eventos: EVENTOS_LIGA,
  goleadores: GOLEADORES_LIGA,
  premios: [],
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
  fase: string;
  jornada: number;
  fecha: string;
  hora: string;
  local: string;
  visitante: string;
  goles_local: number | null;
  goles_visitante: number | null;
  penales_local: number | null;
  penales_visitante: number | null;
  copa: string | null;
  estado: string;
}

interface FilaDisciplina {
  equipo: string;
  amarillas: number;
  rojas: number;
}

interface FilaTarjeta {
  partido: string;
  equipo: string;
  numero: number | null;
  tipo: string;
}

interface FilaEvento {
  id: string;
  jornada: number;
  hora: string | null;
  titulo: string;
  detalle: string | null;
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
export async function cargarLiga(edicion = EDICION_DATOS): Promise<DatosLiga> {
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
    const [partidosRes, disciplinaRes, goleadoresRes, premiosRes, tarjetasRes, eventosRes] =
      await Promise.all([
        supabase
          .from('partidos')
          .select(
            'id, fase, copa, jornada, fecha, hora, local, visitante, goles_local, goles_visitante, penales_local, penales_visitante, estado',
          )
          .eq('edicion', edicion)
          // Por fecha antes que por hora: hay jornadas repartidas en dos dias
          // (miercoles y jueves) y ordenar solo por hora las intercala mal.
          .order('jornada')
          .order('fecha')
          .order('hora'),
        supabase.from('disciplina').select('equipo, amarillas, rojas').eq('edicion', edicion),
        supabase
          .from('goleadores')
          .select('jugador, equipo, numero, goles')
          .eq('edicion', edicion)
          .order('goles', { ascending: false }),
        supabase.from('premios').select('clave, jugador, equipo, nota').eq('edicion', edicion),
        supabase.from('tarjetas').select('partido, equipo, numero, tipo').eq('edicion', edicion),
        supabase
          .from('eventos_fecha')
          .select('id, jornada, hora, titulo, detalle')
          .eq('edicion', edicion)
          .order('jornada')
          .order('hora'),
      ]);

    const filasPartidos = (partidosRes.data ?? []) as FilaPartido[];

    // Sin partidos no hay tabla ni calendario que mostrar: es preferible el
    // respaldo a publicar un torneo vacío.
    if (partidosRes.error || filasPartidos.filter((p) => p.fase === 'grupos').length === 0) {
      return RESPALDO;
    }

    const aPartido = (p: FilaPartido): PartidoLiga => ({
      id: p.id,
      jornada: p.jornada,
      fecha: aFechaLegible(p.fecha),
      hora: aHoraLegible(p.hora),
      local: p.local,
      visitante: p.visitante,
      golesLocal: p.goles_local,
      golesVisitante: p.goles_visitante,
      estado: p.estado === 'jugado' ? 'jugado' : 'programado',
    });

    // Se separan aqui, no en la consulta, para no pagar dos viajes a la base.
    const partidos = filasPartidos.filter((p) => p.fase === 'grupos').map(aPartido);
    const eliminatoria: PartidoEliminatoria[] = filasPartidos
      .filter((p) => p.fase !== 'grupos')
      .map((p) => ({
        ...aPartido(p),
        fase: p.fase as FaseFinal,
        copa: p.copa === 'oro' || p.copa === 'plata' ? p.copa : null,
        penalesLocal: p.penales_local,
        penalesVisitante: p.penales_visitante,
      }));

    // Igual que los premios: un fallo leyendo tarjetas o eventos no puede
    // tumbar el sitio. Sin tarjetas se cae al acumulado de `disciplina`.
    const tarjetas: Tarjeta[] = (
      (tarjetasRes.error ? [] : (tarjetasRes.data ?? [])) as FilaTarjeta[]
    ).map((t) => ({
      partido: t.partido,
      equipo: t.equipo,
      numero: t.numero,
      tipo: t.tipo === 'roja' ? 'roja' : 'amarilla',
    }));
    const eventos: EventoFecha[] = (
      (eventosRes.error ? [] : (eventosRes.data ?? [])) as FilaEvento[]
    ).map((e) => ({
      id: e.id,
      jornada: e.jornada,
      hora: e.hora ? aHoraLegible(e.hora) : null,
      titulo: e.titulo,
      detalle: e.detalle,
    }));

    // Una sola fuente por edición: con tarjetas cargadas, el acumulado se
    // cuenta sobre ellas y la tabla `disciplina` no se mira. Mezclar las dos
    // daría un Fair Play que no cuadra con las tarjetas de los partidos.
    const disciplina: Record<string, Disciplina> = {};
    if (tarjetas.length > 0) {
      Object.assign(disciplina, disciplinaDeTarjetas(tarjetas));
    } else {
      for (const d of (disciplinaRes.data ?? []) as FilaDisciplina[]) {
        disciplina[d.equipo] = { amarillas: d.amarillas, rojas: d.rojas };
      }
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

    // Un fallo leyendo los premios no puede tumbar el sitio: sin ellos el
    // panel muestra «por definir», que es la verdad.
    const premios = (premiosRes.error ? [] : (premiosRes.data ?? [])) as PremioJurado[];

    return {
      partidos,
      eliminatoria,
      disciplina,
      tarjetas,
      eventos,
      goleadores,
      premios,
      origen: 'supabase',
    };
  } catch {
    return RESPALDO;
  }
}

/**
 * Igual que `cargarLiga`, pero deja constancia en el log del build de qué
 * fuente se usó. Si un despliegue sale con datos viejos, el log lo dice.
 */
export async function cargarLigaConAviso(edicion = EDICION_DATOS): Promise<DatosLiga> {
  const datos = await cargarLiga(edicion);
  const detalle = `${datos.partidos.length} partidos, ${datos.goleadores.length} goleadores`;
  if (datos.origen === 'supabase') {
    console.log(`[liga] Datos leídos de Supabase (${detalle}).`);
  } else {
    console.warn(`[liga] Supabase no respondió: se usan los datos de respaldo (${detalle}).`);
  }
  return datos;
}
