/**
 * Cliente de Supabase para el navegador.
 *
 * Usa las variables públicas NEXT_PUBLIC_* (la anon key está diseñada para
 * exponerse en el cliente; la seguridad real la da Row Level Security en la BD).
 * NUNCA usar aquí la service_role key.
 *
 * Si las variables no están definidas, `supabaseConfigurado` es false y la UI
 * cae al flujo de respaldo (WhatsApp / localStorage) sin romperse.
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// Valores del proyecto Supabase "fundacion-managers". La publishable key es
// pública por diseño (viaja en el bundle del navegador); la seguridad real la
// da Row Level Security. Se permiten overrides por variable de entorno.
const URL_DEFECTO = 'https://rlgakgpcfbwhigjdumiv.supabase.co';
const KEY_DEFECTO = 'sb_publishable_VJ4JIosQfATwORGErcb0Dw_VxcrSngy';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || URL_DEFECTO;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || KEY_DEFECTO;

export const supabaseConfigurado = url !== '' && anonKey !== '';

/**
 * Cliente principal (con sesión persistente). Lo usa el panel de admin para
 * autenticarse y leer/editar con RLS de usuario autenticado.
 */
export const supabase: SupabaseClient | null = supabaseConfigurado
  ? createClient(url, anonKey)
  : null;

/**
 * Cliente PÚBLICO sin sesión: siempre actúa como `anon`, aunque haya un admin
 * logueado en el mismo navegador. Lo usan el formulario de pre-inscripción y el
 * de planteles para que sus escrituras siempre pasen la política RLS de anon.
 */
export const supabasePublico: SupabaseClient | null = supabaseConfigurado
  ? createClient(url, anonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        storageKey: 'fm-publico-no-session',
      },
    })
  : null;

/** Fila de la tabla `inscripciones` en Supabase. */
export interface InscripcionRow {
  id: string;
  equipo: string;
  capitan: string;
  contacto: string | null;
  paso_actual: number;
  pagado: boolean;
  notas: string | null;
  creado_en: string;
  actualizado_en: string;
}
