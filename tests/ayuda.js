/**
 * Utilidades compartidas por las verificaciones.
 *
 * Las pruebas corren contra `.test-build/`, la compilación a CommonJS que
 * hace `tsconfig.test.json`. Se compila antes de probar (script `pretest`)
 * para no depender de ningún runner externo: basta `node --test`.
 */

const { EQUIPOS } = require('../.test-build/lib/torneo-data.js');

/** Un partido ya jugado, con lo mínimo que necesita `calcularPosiciones`. */
function partido(id, local, visitante, golesLocal, golesVisitante) {
  return {
    id,
    jornada: 1,
    fecha: '01/01/2026',
    hora: '10:00',
    local,
    visitante,
    golesLocal,
    golesVisitante,
    estado: 'jugado',
  };
}

/** Disciplina limpia para los 8 clubes, con las excepciones que se indiquen. */
function tarjetas(excepciones = {}) {
  const d = {};
  for (const e of EQUIPOS) d[e.slug] = { amarillas: 0, rojas: 0 };
  return { ...d, ...excepciones };
}

/** Posición de un club en una tabla ya calculada. */
function posicionDe(tabla, slug) {
  const fila = tabla.find((f) => f.equipo === slug);
  if (!fila) throw new Error(`${slug} no está en la tabla`);
  return fila.posicion;
}

module.exports = { partido, tarjetas, posicionDe };
