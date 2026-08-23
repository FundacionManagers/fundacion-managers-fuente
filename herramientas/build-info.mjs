/**
 * Deja constancia de cuándo se publicó el sitio y con qué datos del torneo.
 *
 * Se ejecuta como `postbuild`, cuando `out/` ya existe, y escribe
 * `out/build-info.json`. El panel de administración lo lee para responder la
 * pregunta que uno se hace después de guardar: ¿esto ya salió al aire?
 *
 * Guarda la misma marca que usa el cron —última fecha de cambio y total de
 * filas— para poder comparar. Si la marca del sitio publicado difiere de la
 * que tiene la base ahora mismo, hay cambios esperando el próximo despliegue.
 *
 * No usa dependencias: solo `fetch`, que Node trae desde la 18.
 */
import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const URL_SUPABASE =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://rlgakgpcfbwhigjdumiv.supabase.co';
const CLAVE =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'sb_publishable_VJ4JIosQfATwORGErcb0Dw_VxcrSngy';

async function leerMarca() {
  try {
    const r = await fetch(`${URL_SUPABASE}/rest/v1/torneo_marca?select=*`, {
      headers: { apikey: CLAVE, Authorization: `Bearer ${CLAVE}` },
    });
    if (!r.ok) return null;
    const filas = await r.json();
    return filas?.[0] ?? null;
  } catch {
    return null;
  }
}

const marca = await leerMarca();
const info = {
  publicado_en: new Date().toISOString(),
  // null si Supabase no respondió: el panel lo interpreta como "no se puede
  // comparar" en vez de afirmar que todo está publicado.
  ultimo_cambio: marca?.ultimo_cambio ?? null,
  filas: marca?.filas ?? null,
};

const destino = join(process.cwd(), 'out', 'build-info.json');
await writeFile(destino, JSON.stringify(info, null, 2), 'utf8');
console.log(
  `[build-info] ${info.publicado_en} · ${
    marca ? `${info.filas} filas, último cambio ${info.ultimo_cambio}` : 'sin marca de Supabase'
  }`,
);
