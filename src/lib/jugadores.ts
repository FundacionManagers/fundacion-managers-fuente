/**
 * Tipos y reglas del plantel (paso 3 de la inscripción).
 * Datos "completos" por jugador + cálculo de progreso.
 */

export type PosicionJugador = 'POR' | 'DEF' | 'MED' | 'DEL';

export const POSICIONES_JUGADOR: { value: PosicionJugador; label: string }[] = [
  { value: 'POR', label: 'Portero' },
  { value: 'DEF', label: 'Defensa' },
  { value: 'MED', label: 'Mediocampo' },
  { value: 'DEL', label: 'Delantero' },
];

export const TALLAS = ['XS', 'S', 'M', 'L', 'XL', 'XXL'] as const;

/** Mínimo de jugadores completos para considerar el plantel listo (F7). */
export const MIN_JUGADORES = 7;

export interface Jugador {
  id: string;
  nombre: string;
  documento: string;
  celular: string;
  numero: string; // se maneja como texto en el form; el RPC lo castea a int
  posicion: PosicionJugador | '';
  fechaNacimiento: string; // yyyy-mm-dd
  eps: string;
  talla: string;
  fotoUrl: string; // ruta en Storage
  /** preview local (no se persiste); solo para mostrar la foto recién elegida. */
  fotoPreview?: string;
}

export function jugadorVacio(): Jugador {
  return {
    id: '',
    nombre: '',
    documento: '',
    celular: '',
    numero: '',
    posicion: '',
    fechaNacimiento: '',
    eps: '',
    talla: '',
    fotoUrl: '',
  };
}

/** Campos obligatorios para considerar al jugador "completo". */
export function jugadorCompleto(j: Jugador): boolean {
  return (
    j.nombre.trim() !== '' &&
    j.documento.trim() !== '' &&
    j.celular.trim() !== '' &&
    j.numero.trim() !== '' &&
    j.posicion !== '' &&
    j.fechaNacimiento.trim() !== '' &&
    j.eps.trim() !== '' &&
    j.talla.trim() !== '' &&
    j.fotoUrl.trim() !== ''
  );
}

/** Cuántos campos obligatorios tiene llenos un jugador (para progreso fino). */
export function camposLlenos(j: Jugador): number {
  const campos = [
    j.nombre,
    j.documento,
    j.celular,
    j.numero,
    j.posicion,
    j.fechaNacimiento,
    j.eps,
    j.talla,
    j.fotoUrl,
  ];
  return campos.filter((c) => String(c).trim() !== '').length;
}

export const CAMPOS_POR_JUGADOR = 9;

/**
 * Progreso 0..100 del plantel. Se basa en los datos llenos de los primeros
 * `MIN_JUGADORES` jugadores (los necesarios para estar completo).
 */
export function progresoPlantel(jugadores: Jugador[]): number {
  const objetivo = MIN_JUGADORES * CAMPOS_POR_JUGADOR;
  // Ordena por más completos primero para que el % refleje el avance real.
  const llenos = jugadores
    .map(camposLlenos)
    .sort((a, b) => b - a)
    .slice(0, MIN_JUGADORES)
    .reduce((acc, n) => acc + n, 0);
  return Math.min(100, Math.round((llenos / objetivo) * 100));
}

export function plantelListo(jugadores: Jugador[]): boolean {
  return jugadores.filter(jugadorCompleto).length >= MIN_JUGADORES;
}
