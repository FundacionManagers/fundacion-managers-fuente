/**
 * Estado de inscripción de equipos para el dashboard administrativo.
 *
 * IMPORTANTE — privacidad (Ley 1581 de 2012): estos datos contienen información
 * personal (nombre del capitán, contacto). NO deben publicarse en el sitio
 * estático ni versionarse en un repositorio PÚBLICO. La persistencia ocurre en
 * `localStorage` del dispositivo del administrador; el export JSON está pensado
 * para respaldarse en un repositorio PRIVADO o migrar a Supabase (Fase 5).
 */

/** Los 5 pasos del proceso de inscripción (pizarra del torneo). */
export const PASOS_INSCRIPCION = [
  { numero: 1, label: 'Pre-inscripción', detalle: 'Capitán + nombre del equipo' },
  { numero: 2, label: 'Grupo de WhatsApp', detalle: 'Agregado al grupo + link enviado' },
  { numero: 3, label: 'Inscripción confirmada', detalle: 'Link + logo + fotos de jugadores' },
  { numero: 4, label: 'Pago', detalle: 'Inscripción pagada (Bold)' },
  { numero: 5, label: 'Programación enviada', detalle: 'Calendario + reglas entregados' },
] as const;

export const TOTAL_PASOS = PASOS_INSCRIPCION.length;

export interface Inscripcion {
  id: string;
  equipo: string;
  capitan: string;
  /** Celular/WhatsApp de contacto (opcional). */
  contacto: string;
  /** Paso alcanzado: 1..5. */
  pasoActual: number;
  pagado: boolean;
  notas: string;
  /** ISO timestamp. */
  creadoEn: string;
  actualizadoEn: string;
}

const STORAGE_KEY = 'fm-inscripciones-v1';

function ahora(): string {
  return new Date().toISOString();
}

function generarId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function nuevaInscripcion(
  datos: Pick<Inscripcion, 'equipo' | 'capitan'> & Partial<Pick<Inscripcion, 'contacto'>>,
): Inscripcion {
  const ts = ahora();
  return {
    id: generarId(),
    equipo: datos.equipo.trim(),
    capitan: datos.capitan.trim(),
    contacto: (datos.contacto ?? '').trim(),
    pasoActual: 1,
    pagado: false,
    notas: '',
    creadoEn: ts,
    actualizadoEn: ts,
  };
}

/** Lee el listado desde localStorage; devuelve [] si no hay nada o falla el parseo. */
export function cargarInscripciones(): Inscripcion[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Inscripcion[]) : [];
  } catch {
    return [];
  }
}

export function guardarInscripciones(lista: Inscripcion[]): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lista));
}

/** Serializa a JSON legible para respaldar en un repo privado. */
export function exportarJSON(lista: Inscripcion[]): string {
  return JSON.stringify(lista, null, 2);
}

/** Parsea un JSON de respaldo; lanza si el formato es inválido. */
export function importarJSON(texto: string): Inscripcion[] {
  const parsed = JSON.parse(texto);
  if (!Array.isArray(parsed)) {
    throw new Error('El JSON debe ser una lista de inscripciones.');
  }
  return parsed as Inscripcion[];
}

/** Progreso 0..1 considerando el paso actual. */
export function progreso(ins: Inscripcion): number {
  return ins.pasoActual / TOTAL_PASOS;
}

/** Nombre legible del paso (ej. "1 · Pre-inscripción"). */
export function nombrePaso(numero: number): string {
  const paso = PASOS_INSCRIPCION.find((p) => p.numero === numero);
  return paso ? `${paso.numero} · ${paso.label}` : String(numero);
}

function celdaCSV(valor: string): string {
  // Envuelve en comillas y duplica las comillas internas (formato CSV estándar).
  return `"${valor.replace(/"/g, '""')}"`;
}

/**
 * Genera un CSV compatible con Excel en español:
 * - BOM UTF-8 (para que Excel muestre bien tildes y emojis).
 * - Separador ";" (Excel en es-CO usa coma como decimal).
 */
export function exportarCSV(lista: Inscripcion[]): string {
  const encabezados = [
    'Equipo',
    'Capitán',
    'WhatsApp',
    'Paso actual',
    'Pago confirmado',
    'Notas',
    'Fecha de registro',
  ];
  const filas = lista.map((i) =>
    [
      i.equipo,
      i.capitan,
      i.contacto,
      nombrePaso(i.pasoActual),
      i.pagado ? 'Sí' : 'No',
      i.notas,
      new Date(i.creadoEn).toLocaleString('es-CO'),
    ]
      .map((c) => celdaCSV(String(c ?? '')))
      .join(';'),
  );
  const BOM = String.fromCharCode(0xfeff);
  return BOM + [encabezados.map(celdaCSV).join(';'), ...filas].join('\r\n');
}
