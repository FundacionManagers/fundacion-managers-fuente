/**
 * Genera las imágenes de compartir (Open Graph) del sitio.
 *
 * Sin ellas, un enlace pegado en WhatsApp llega con título y descripción
 * sobre un rectángulo gris. Y el proceso de inscripción arranca justamente
 * con un enlace repartido por WhatsApp a los capitanes: es el primer
 * contacto de un equipo nuevo con el torneo.
 *
 * Se componen a partir de lo que ya existe en el sitio —la foto del estadio,
 * la moneda dorada, el logotipo— en vez de inventar arte nuevo. El texto va
 * en el logotipo, que es una imagen: así el resultado no depende de qué
 * fuentes tenga instaladas la máquina que lo genera.
 *
 * Se ejecuta a mano cuando cambien esos materiales:
 *   node herramientas/og-imagenes.mjs
 *
 * El resultado se versiona en public/og/. No corre en cada build: el
 * despliegue no debería depender de que sharp funcione en el runner.
 */

import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const RAIZ = path.join(import.meta.dirname, '..');
const PUB = path.join(RAIZ, 'public');
const DESTINO = path.join(PUB, 'og');

/** Tamaño recomendado por Open Graph. WhatsApp recorta a 1.91:1. */
const ANCHO = 1200;
const ALTO = 630;

/** Velo oscuro para que el logotipo dorado siempre tenga contraste. */
function velo() {
  return Buffer.from(
    `<svg width="${ANCHO}" height="${ALTO}" xmlns="http://www.w3.org/2000/svg">
       <defs>
         <linearGradient id="v" x1="0" y1="0" x2="0" y2="1">
           <stop offset="0%" stop-color="#0b0f14" stop-opacity="0.72"/>
           <stop offset="55%" stop-color="#0b0f14" stop-opacity="0.82"/>
           <stop offset="100%" stop-color="#0b0f14" stop-opacity="0.94"/>
         </linearGradient>
       </defs>
       <rect width="${ANCHO}" height="${ALTO}" fill="url(#v)"/>
       <rect x="0" y="${ALTO - 8}" width="${ANCHO}" height="8" fill="#F2C230"/>
     </svg>`,
  );
}

async function componer({ foto, piezas, salida }) {
  const fondo = await sharp(path.join(PUB, foto))
    .resize(ANCHO, ALTO, { fit: 'cover', position: 'centre' })
    .toBuffer();

  const capas = [{ input: velo() }];
  for (const p of piezas) {
    capas.push({
      input: await sharp(path.join(PUB, p.archivo)).resize(p.ancho).png().toBuffer(),
      top: p.top,
      left: p.left,
    });
  }

  const png = await sharp(fondo).composite(capas).jpeg({ quality: 86 }).toBuffer();
  await writeFile(path.join(DESTINO, salida), png);
  console.log(`  ${salida.padEnd(18)} ${ANCHO}x${ALTO}  ${Math.round(png.length / 1024)} KB`);
}

await mkdir(DESTINO, { recursive: true });
console.log('[og] generando imágenes de compartir');

// Torneo: la moneda dorada sobre el estadio, con el logotipo debajo.
await componer({
  foto: 'fotos/torneo-estadio.jpg',
  piezas: [
    { archivo: 'coin-managers.png', ancho: 300, top: 90, left: 450 },
    { archivo: 'logo-fundacion.png', ancho: 460, top: 420, left: 370 },
  ],
  salida: 'torneo.jpg',
});

// Fundación: el logotipo centrado sobre la foto de portada.
await componer({
  foto: 'fotos/seccion-home.jpg',
  piezas: [{ archivo: 'logo-fundacion.png', ancho: 620, left: 290, top: 240 }],
  salida: 'fundacion.jpg',
});

console.log('[og] listo');
