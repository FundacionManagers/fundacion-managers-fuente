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
import { existsSync, readFileSync } from 'node:fs';
import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';

/**
 * EDICION_ACTUAL, leída de `src/lib/liga.ts`. Estuvo escrita aquí como 4 y,
 * al abrir la 5ª, el panel habría comparado la marca de la edición vieja.
 */
function edicionDelCodigo() {
  const fuente = readFileSync(join('src', 'lib', 'liga.ts'), 'utf8');
  const n = Number(/^export const EDICION_ACTUAL = (\d+);/m.exec(fuente)?.[1]);
  if (!n) throw new Error('[build-info] No se pudo leer EDICION_ACTUAL de src/lib/liga.ts');
  return n;
}

const URL_SUPABASE =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://rlgakgpcfbwhigjdumiv.supabase.co';
const CLAVE =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'sb_publishable_VJ4JIosQfATwORGErcb0Dw_VxcrSngy';

// La edicion que se esta compilando. Produccion y el sitio de ensayos
// comparten base y cada uno tiene que mirar solo la suya: con la marca
// global, un marcador de prueba obligaba a republicar la web real.
const EDICION = Number(process.env.NEXT_PUBLIC_EDICION) || edicionDelCodigo();
const ENTORNO = process.env.NEXT_PUBLIC_ENTORNO === 'ensayos' ? 'ensayos' : 'produccion';

async function leerMarca() {
  try {
    const r = await fetch(
      `${URL_SUPABASE}/rest/v1/torneo_marca_edicion?select=*&edicion=eq.${EDICION}`,
      {
        headers: { apikey: CLAVE, Authorization: `Bearer ${CLAVE}` },
      },
    );
    if (!r.ok) return null;
    const filas = await r.json();
    return filas?.[0] ?? null;
  } catch {
    return null;
  }
}

const marca = await leerMarca();

// La deja liga-supabase.ts si alguna página se compiló con los datos de
// respaldo. Sin esto, si la marca respondía y los partidos no, el panel decía
// «Todo publicado» sobre un sitio con datos viejos.
const origen = existsSync(join('.next', 'liga-respaldo')) ? 'respaldo' : 'supabase';

const info = {
  publicado_en: new Date().toISOString(),
  entorno: ENTORNO,
  edicion: EDICION,
  origen,
  // null si Supabase no respondió: el panel lo interpreta como "no se puede
  // comparar" en vez de afirmar que todo está publicado.
  ultimo_cambio: marca?.ultimo_cambio ?? null,
  filas: marca?.filas ?? null,
};

const destino = join(process.cwd(), 'out', 'build-info.json');
await writeFile(destino, JSON.stringify(info, null, 2), 'utf8');
console.log(
  `[build-info] ${ENTORNO} · edición ${EDICION} · datos de ${origen} · ${info.publicado_en} · ${
    marca ? `${info.filas} filas, último cambio ${info.ultimo_cambio}` : 'sin marca de Supabase'
  }`,
);
