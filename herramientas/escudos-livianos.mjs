/**
 * Versiones livianas de los escudos: 128, 256 y 512 px en WebP.
 *
 * Por qué: los originales son PNG de 512 px, entre 130 y 500 KB cada uno, y
 * el sitio los muestra a 20-72 px. Con datos móviles en la cancha, /torneo/
 * bajaba 2,7 MB y tardaba 8 s en pintar lo principal. TeamCrest pide la de
 * 128 hasta 64 px, la de 256 hasta 128 y la de 512 por encima: así sigue nítido en
 * pantallas de doble densidad.
 *
 * El original se queda en public/escudos/ como fuente. Al llegar un club nuevo
 * con escudo, se pone su PNG ahí y se corre:
 *
 *   node herramientas/escudos-livianos.mjs
 */

import { readdir, mkdir } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const ORIGEN = path.join(process.cwd(), 'public', 'escudos');
const TAMANOS = [128, 256, 512];

const archivos = (await readdir(ORIGEN)).filter((f) => f.endsWith('.png'));
for (const tam of TAMANOS) {
  await mkdir(path.join(ORIGEN, String(tam)), { recursive: true });
}

for (const archivo of archivos) {
  const slug = archivo.replace(/\.png$/, '');
  for (const tam of TAMANOS) {
    const destino = path.join(ORIGEN, String(tam), `${slug}.webp`);
    const info = await sharp(path.join(ORIGEN, archivo))
      .resize(tam, tam, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .webp({ quality: 88 })
      .toFile(destino);
    console.log(`${slug} ${tam}px → ${(info.size / 1024).toFixed(1)} KB`);
  }
}
