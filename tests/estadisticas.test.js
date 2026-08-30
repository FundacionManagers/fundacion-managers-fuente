/**
 * Las cifras que publica Estadísticas.
 *
 * La página llegó a publicar un MVP sin nombre y "Por confirmar" mientras el
 * Resumen ya mostraba los goleadores reales: eran dos fuentes para el mismo
 * dato. Estas cifras salen del mismo calendario que la tabla, y estas pruebas
 * fijan que sigan haciéndolo en vez de desincronizarse con el tiempo.
 */

const test = require('node:test');
const assert = require('node:assert/strict');

const {
  PARTIDOS_LIGA,
  calcularPosiciones,
  cifrasDeEdicion,
  mejorDefensa,
  puntosJuegoLimpio,
  tablaJuegoLimpio,
} = require('../.test-build/lib/liga.js');

const posiciones = calcularPosiciones();

test('las cifras cuentan solo los partidos ya jugados', () => {
  const c = cifrasDeEdicion(PARTIDOS_LIGA);
  const jugados = PARTIDOS_LIGA.filter((p) => p.estado === 'jugado');
  assert.equal(c.partidos, jugados.length);
  assert.ok(c.partidos > 0 && c.partidos < PARTIDOS_LIGA.length, 'la edición está a medias');
});

/**
 * Es el mismo número que publica la tabla como suma de goles a favor. Si
 * algún día dejaran de coincidir, la página se estaría contradiciendo sola.
 */
test('los goles cuadran con los goles a favor de la tabla', () => {
  const c = cifrasDeEdicion(PARTIDOS_LIGA);
  const gf = posiciones.reduce((s, f) => s + f.gf, 0);
  const gc = posiciones.reduce((s, f) => s + f.gc, 0);
  assert.equal(c.goles, gf);
  assert.equal(c.goles, gc, 'cada gol a favor de alguien es un gol en contra de otro');
});

test('el promedio es goles entre partidos, con dos decimales', () => {
  const c = cifrasDeEdicion(PARTIDOS_LIGA);
  assert.equal(c.promedio, Math.round((c.goles / c.partidos) * 100) / 100);
});

test('sin partidos jugados no se inventa un promedio', () => {
  const c = cifrasDeEdicion(PARTIDOS_LIGA.map((p) => ({ ...p, estado: 'programado' })));
  assert.equal(c.partidos, 0);
  assert.equal(c.goles, 0);
  assert.equal(c.promedio, null);
  assert.equal(c.masGoleado, null, 'sin partidos no hay partido más goleado');
});

test('el partido más goleado es de verdad el que más goles tuvo', () => {
  const c = cifrasDeEdicion(PARTIDOS_LIGA);
  const suma = (p) => (p.golesLocal ?? 0) + (p.golesVisitante ?? 0);
  const maximo = Math.max(
    ...PARTIDOS_LIGA.filter((p) => p.estado === 'jugado').map(suma),
  );
  assert.equal(suma(c.masGoleado), maximo);
});

/**
 * Con dos partidos de los mismos goles gana el de la jornada más temprana, y
 * no el que Supabase devuelva primero: si dependiera del orden de las filas,
 * la página podría cambiar de titular sin que se jugara nada.
 */
test('ante un empate manda la jornada, no el orden de las filas', () => {
  const empatados = [
    { ...PARTIDOS_LIGA[0], id: 'a', jornada: 5, estado: 'jugado', golesLocal: 3, golesVisitante: 3 },
    { ...PARTIDOS_LIGA[0], id: 'b', jornada: 2, estado: 'jugado', golesLocal: 4, golesVisitante: 2 },
  ];
  assert.equal(cifrasDeEdicion(empatados).masGoleado.id, 'b');
  assert.equal(cifrasDeEdicion([...empatados].reverse()).masGoleado.id, 'b');
});

test('la mejor defensa es la menos goleada', () => {
  const d = mejorDefensa(posiciones);
  assert.equal(d.gc, Math.min(...posiciones.map((f) => f.gc)));
});

test('sin equipos, la mejor defensa es nula en vez de reventar', () => {
  assert.equal(mejorDefensa([]), null);
});

test('el juego limpio ordena por tarjetas ponderadas, de menos a más', () => {
  const tabla = tablaJuegoLimpio(posiciones);
  assert.equal(tabla.length, posiciones.length, 'salen los ocho, no solo el ganador');
  for (let i = 1; i < tabla.length; i++) {
    assert.ok(
      puntosJuegoLimpio(tabla[i - 1]) <= puntosJuegoLimpio(tabla[i]),
      'cada club tiene igual o más tarjetas ponderadas que el anterior',
    );
  }
});

/**
 * El caso que hacía ilegible el bloque anterior: el más limpio tiene MÁS
 * amarillas que otro club y gana igual, porque el otro arrastra rojas. Con la
 * tabla entera delante la regla se entiende; con un solo club, no.
 */
test('una roja pesa tres amarillas, y por eso el orden sorprende', () => {
  const tabla = tablaJuegoLimpio(posiciones);
  const primero = tabla[0];
  const conMenosAmarillas = posiciones.filter((f) => f.ta < primero.ta);
  for (const f of conMenosAmarillas) {
    assert.ok(
      puntosJuegoLimpio(f) > puntosJuegoLimpio(primero),
      `${f.equipo} tiene menos amarillas que el líder de juego limpio y aun así va detrás`,
    );
  }
  assert.equal(puntosJuegoLimpio(primero), primero.ta + primero.tr * 3);
});
