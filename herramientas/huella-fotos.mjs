#!/usr/bin/env node
/**
 * Le pone la huella del contenido a cada foto del sitio.
 *
 * El problema: GitHub Pages manda `Cache-Control: max-age=600` y no deja
 * cambiar esa cabecera. Los archivos que genera Next ya llevan su hash en el
 * nombre, así que cuando cambian, cambia la dirección y nadie ve lo viejo.
 * Las fotos no: `seccion-home.jpg` se llama igual antes y después, y
 * reemplazarla no le avisa a nadie. Jorge cambió cinco fotos y siguió viendo
 * las de antes durante horas.
 *
 * La solución: después de construir, se recorre `out/`, se calcula el hash de
 * cada archivo de `out/fotos/` y se reescribe cada referencia a
 * `/fotos/algo.jpg` como `/fotos/algo.jpg?v=<hash>`. Al cambiar la foto cambia
 * el hash, cambia la dirección, y el navegador la pide de nuevo sola.
 *
 * Funciona sobre la salida, no sobre el código, así que cubre por igual las
 * páginas de Next, el CSS, los trozos de JavaScript y `emprendedores.html`,
 * que es un archivo suelto y referencia sus fotos a mano.
 */
import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const SALIDA = 'out';
const CARPETA_FOTOS = join(SALIDA, 'fotos');
/** Dónde puede aparecer escrita la dirección de una foto. */
const TEXTO = new Set(['.html', '.css', '.js', '.json', '.txt', '.xml', '.webmanifest']);

function archivos(dir) {
  const salida = [];
  for (const nombre of readdirSync(dir)) {
    const ruta = join(dir, nombre);
    if (statSync(ruta).isDirectory()) salida.push(...archivos(ruta));
    else salida.push(ruta);
  }
  return salida;
}

function huella(ruta) {
  return createHash('sha1').update(readFileSync(ruta)).digest('hex').slice(0, 8);
}

let huellas;
try {
  huellas = new Map(
    archivos(CARPETA_FOTOS).map((ruta) => [
      relative(CARPETA_FOTOS, ruta).split(sep).join('/'),
      huella(ruta),
    ]),
  );
} catch {
  console.log('[huella-fotos] no hay out/fotos, no hay nada que firmar');
  process.exit(0);
}

if (huellas.size === 0) {
  console.log('[huella-fotos] out/fotos está vacía');
  process.exit(0);
}

// Las fotos van de más largo a más corto para que `seccion-home.jpg` no se
// coma a `seccion-home-2.jpg` si algún día existe.
const nombres = [...huellas.keys()].sort((a, b) => b.length - a.length);

let tocados = 0;
let sustituciones = 0;

for (const ruta of archivos(SALIDA)) {
  const punto = ruta.lastIndexOf('.');
  if (punto < 0 || !TEXTO.has(ruta.slice(punto).toLowerCase())) continue;

  const antes = readFileSync(ruta, 'utf8');
  let despues = antes;

  for (const nombre of nombres) {
    const v = huellas.get(nombre);
    // Se acepta la ruta con barra inicial (`/fotos/x.jpg`) y sin ella
    // (`fotos/x.jpg`, que es como la escribe emprendedores.html), y se salta
    // la que ya viene firmada, para que el guion se pueda correr dos veces.
    const patron = new RegExp(`((?:/|(?<![\\w./-]))fotos/${nombre.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&')})(?!\\?v=)`, 'g');
    despues = despues.replace(patron, (coincidencia) => {
      sustituciones += 1;
      return `${coincidencia}?v=${v}`;
    });
  }

  if (despues !== antes) {
    writeFileSync(ruta, despues);
    tocados += 1;
  }
}

console.log(
  `[huella-fotos] ${huellas.size} fotos firmadas · ${sustituciones} referencias en ${tocados} archivos`,
);
