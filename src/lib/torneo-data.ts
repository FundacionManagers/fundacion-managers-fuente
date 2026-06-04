/**
 * Datos del Torneo Managers — hub estilo Premier League (estático, Fase 3).
 *
 * REAL (verificado desde @torneo_managers): nombres de los 8 equipos,
 * estructura de bracket 2026, fechas/horas de cuartos, campeones por edición.
 *
 * PLACEHOLDER (marcado con `placeholder: true` o "Por confirmar"): marcadores
 * de partidos, planteles, goleadores. Reemplazar cuando lleguen los datos
 * reales — toda la UI ya está cableada a esta estructura.
 */

export interface Equipo {
  slug: string;
  nombre: string;
  corto: string;
  /** Color de acento del club (placeholder hasta tener escudos reales). */
  color: string;
  titulos: number;
  /** true = datos de plantel/escudo aún placeholder. */
  placeholder: boolean;
}

export const EQUIPOS: readonly Equipo[] = [
  { slug: 'pomada-alfa', nombre: 'Pomada Alfa FC', corto: 'PAL', color: '#8B2E2E', titulos: 2, placeholder: true },
  { slug: 'managers-fc', nombre: 'Managers FC', corto: 'MGR', color: '#D4A437', titulos: 0, placeholder: true },
  { slug: 'the-originals', nombre: 'The Originals FC', corto: 'ORI', color: '#2D6CDF', titulos: 1, placeholder: true },
  { slug: 'alianza', nombre: 'Alianza', corto: 'ALZ', color: '#2D7A4F', titulos: 0, placeholder: true },
  { slug: 'los-pibes', nombre: 'Los Pibes del Barrio', corto: 'PIB', color: '#C8362B', titulos: 0, placeholder: true },
  { slug: 'useche-fc', nombre: 'Useche FC', corto: 'USE', color: '#5B3DA8', titulos: 0, placeholder: true },
  { slug: 'yonotomo-fc', nombre: 'Yonotomo FC', corto: 'YON', color: '#E8722C', titulos: 0, placeholder: true },
  { slug: 'tp-fc', nombre: 'TP F.C.', corto: 'TPF', color: '#0F766E', titulos: 0, placeholder: true },
] as const;

export function getEquipo(slug: string): Equipo | undefined {
  return EQUIPOS.find((e) => e.slug === slug);
}

export type Fase = 'cuartos' | 'semifinal' | 'tercer-puesto' | 'final';

export interface Partido {
  id: string;
  fase: Fase;
  etiqueta: string;
  fecha: string;
  hora: string;
  /** slug de equipo o null si aún no definido (espera ganador). */
  local: string | null;
  visitante: string | null;
  golesLocal: number | null;
  golesVisitante: number | null;
  /** Definición por penales cuando el tiempo reglamentario termina empatado. */
  penales?: { local: number; visitante: number };
  estado: 'programado' | 'jugado' | 'en-vivo';
  /** Fechas/horas tomadas del bracket de IG; pendientes de confirmar. */
  placeholder: boolean;
}

/** Ganador de un partido jugado (considera penales en caso de empate). */
export function ganadorDe(p: Partido): string | null {
  if (p.estado !== 'jugado' || p.golesLocal == null || p.golesVisitante == null) {
    return null;
  }
  if (p.golesLocal > p.golesVisitante) return p.local;
  if (p.golesVisitante > p.golesLocal) return p.visitante;
  if (p.penales) {
    return p.penales.local > p.penales.visitante ? p.local : p.visitante;
  }
  return null;
}

/**
 * Bracket 2026 (tercera edición). Emparejamientos de cuartos según el
 * gráfico de @torneo_managers; marcadores aún por confirmar.
 */
export const BRACKET_2026: readonly Partido[] = [
  {
    id: 'cf1',
    fase: 'cuartos',
    etiqueta: 'Cuartos · Partido 1',
    fecha: '24 may 2026',
    hora: '10:00',
    local: 'los-pibes',
    visitante: 'useche-fc',
    golesLocal: 5,
    golesVisitante: 0,
    estado: 'jugado',
    placeholder: false,
  },
  {
    id: 'cf2',
    fase: 'cuartos',
    etiqueta: 'Cuartos · Partido 2',
    fecha: '24 may 2026',
    hora: '08:00',
    local: 'the-originals',
    visitante: 'managers-fc',
    golesLocal: 5,
    golesVisitante: 2,
    estado: 'jugado',
    placeholder: false,
  },
  {
    id: 'cf3',
    fase: 'cuartos',
    etiqueta: 'Cuartos · Partido 3',
    fecha: '24 may 2026',
    hora: '07:00',
    local: 'pomada-alfa',
    visitante: 'alianza',
    golesLocal: 0,
    golesVisitante: 0,
    penales: { local: 3, visitante: 4 },
    estado: 'jugado',
    placeholder: false,
  },
  {
    id: 'cf4',
    fase: 'cuartos',
    etiqueta: 'Cuartos · Partido 4',
    fecha: '24 may 2026',
    hora: '09:00',
    local: 'yonotomo-fc',
    visitante: 'tp-fc',
    golesLocal: 6,
    golesVisitante: 2,
    estado: 'jugado',
    placeholder: false,
  },
  {
    id: 'sf1',
    fase: 'semifinal',
    etiqueta: 'Semifinal 1',
    fecha: '31 may 2026',
    hora: '07:00',
    local: 'los-pibes',
    visitante: 'yonotomo-fc',
    golesLocal: 3,
    golesVisitante: 2,
    estado: 'jugado',
    placeholder: false,
  },
  {
    id: 'sf2',
    fase: 'semifinal',
    etiqueta: 'Semifinal 2',
    fecha: '31 may 2026',
    hora: '08:30',
    local: 'the-originals',
    visitante: 'alianza',
    golesLocal: 3,
    golesVisitante: 0,
    estado: 'jugado',
    placeholder: false,
  },
  {
    id: 'tp',
    fase: 'tercer-puesto',
    etiqueta: 'Tercer puesto',
    fecha: '31 may 2026',
    hora: '10:00',
    local: 'yonotomo-fc',
    visitante: 'alianza',
    golesLocal: 8,
    golesVisitante: 3,
    estado: 'jugado',
    placeholder: false,
  },
  {
    id: 'fin',
    fase: 'final',
    etiqueta: 'Gran Final',
    fecha: '31 may 2026',
    hora: '11:30',
    local: 'los-pibes',
    visitante: 'the-originals',
    golesLocal: 1,
    golesVisitante: 2,
    estado: 'jugado',
    placeholder: false,
  },
] as const;

/** Fecha/hora ISO del próximo partido (Colombia, UTC-5) para la cuenta regresiva. */
export const PROXIMO_PARTIDO_ISO = '2026-05-31T11:30:00-05:00';

export const CUARTOS = BRACKET_2026.filter((p) => p.fase === 'cuartos');
export const SEMIS = BRACKET_2026.filter((p) => p.fase === 'semifinal');
export const TERCER_PUESTO = BRACKET_2026.find((p) => p.fase === 'tercer-puesto')!;
export const FINAL = BRACKET_2026.find((p) => p.fase === 'final')!;

/** Calendario = bracket ordenado por fecha/hora. */
export const CALENDARIO = [...BRACKET_2026];

export interface LineaStat {
  posicion: number;
  jugador: string;
  equipo: string;
  valor: number | string;
  placeholder: boolean;
}

export const GOLEADORES: readonly LineaStat[] = [
  { posicion: 1, jugador: 'Por confirmar', equipo: 'los-pibes', valor: '—', placeholder: true },
  { posicion: 2, jugador: 'Por confirmar', equipo: 'pomada-alfa', valor: '—', placeholder: true },
  { posicion: 3, jugador: 'Por confirmar', equipo: 'managers-fc', valor: '—', placeholder: true },
] as const;

export const MVP = {
  jugador: 'MVP del partido (Los Pibes del Barrio)',
  equipo: 'los-pibes',
  nota: 'Reconocimiento publicado por @torneo_managers. Nombre por confirmar.',
};

export type Posicion = 'POR' | 'DEF' | 'MED' | 'DEL';

export interface Jugador {
  numero: number;
  nombre: string;
  posicion: Posicion;
  placeholder: boolean;
}

/**
 * Plantel placeholder por club (F7: portero + 6 de campo + suplentes).
 * Nombres "Por confirmar" hasta recibir las nóminas reales del torneo.
 */
export function plantelDe(): Jugador[] {
  const plan: { numero: number; posicion: Posicion }[] = [
    { numero: 1, posicion: 'POR' },
    { numero: 2, posicion: 'DEF' },
    { numero: 3, posicion: 'DEF' },
    { numero: 4, posicion: 'DEF' },
    { numero: 5, posicion: 'MED' },
    { numero: 8, posicion: 'MED' },
    { numero: 10, posicion: 'MED' },
    { numero: 7, posicion: 'DEL' },
    { numero: 9, posicion: 'DEL' },
    { numero: 11, posicion: 'DEL' },
    { numero: 12, posicion: 'POR' },
    { numero: 6, posicion: 'DEF' },
  ];
  return plan.map((p) => ({
    numero: p.numero,
    posicion: p.posicion,
    nombre: 'Por confirmar',
    placeholder: true,
  }));
}

export const POSICIONES: { key: Posicion; label: string }[] = [
  { key: 'POR', label: 'Porteros' },
  { key: 'DEF', label: 'Defensas' },
  { key: 'MED', label: 'Mediocampo' },
  { key: 'DEL', label: 'Delanteros' },
];

export interface SubRuta {
  href: string;
  label: string;
}

export const TORNEO_TABS: readonly SubRuta[] = [
  { href: '/torneo/', label: 'Resumen' },
  { href: '/torneo/bracket/', label: 'Llave' },
  { href: '/torneo/calendario/', label: 'Calendario' },
  { href: '/torneo/equipos/', label: 'Equipos' },
  { href: '/torneo/estadisticas/', label: 'Estadísticas' },
  { href: '/torneo/inscripciones/', label: 'Inscripciones' },
] as const;
