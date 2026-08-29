/**
 * El Artículo 14 del reglamento, criterio por criterio.
 *
 * El orden es: puntaje → Fair Play → diferencia de gol → goles a favor →
 * resultados entre sí → sorteo. Lo que más se equivoca la gente es poner la
 * diferencia de gol antes que el Fair Play; estas pruebas existen para que
 * ese error no vuelva a entrar sin que nadie se dé cuenta.
 */

const test = require('node:test');
const assert = require('node:assert/strict');

const { calcularPosiciones, puntosJuegoLimpio, PESO_AMARILLA, PESO_ROJA } =
  require('../.test-build/lib/liga.js');
const { partido, tarjetas, posicionDe } = require('./ayuda.js');

test('el puntaje manda sobre el Fair Play y sobre la diferencia de gol', () => {
  const tabla = calcularPosiciones(
    [
      // 6 puntos con diferencia +2 y 20 amarillas encima.
      partido('a1', 'pomada-alfa', 'managers-fc', 1, 0),
      partido('a2', 'pomada-alfa', 'useche-fc', 1, 0),
      // 3 puntos con diferencia +8 y la ficha impecable.
      partido('b1', 'los-pibes', 'yonotomo-fc', 9, 0),
      partido('b2', 'la-banda-cruzada', 'los-pibes', 1, 0),
    ],
    tarjetas({ 'pomada-alfa': { amarillas: 20, rojas: 0 } }),
  );

  assert.ok(
    posicionDe(tabla, 'pomada-alfa') < posicionDe(tabla, 'los-pibes'),
    'con más puntos va arriba aunque tenga peor diferencia y más tarjetas',
  );
});

test('el Fair Play va ANTES que la diferencia de gol', () => {
  const tabla = calcularPosiciones(
    [
      // Mismos puntos, peor diferencia (+1), pero sin tarjetas.
      partido('a1', 'pomada-alfa', 'managers-fc', 1, 0),
      // Mismos puntos, mejor diferencia (+5), pero con 5 amarillas.
      partido('b1', 'los-pibes', 'yonotomo-fc', 5, 0),
    ],
    tarjetas({ 'los-pibes': { amarillas: 5, rojas: 0 } }),
  );

  assert.ok(
    posicionDe(tabla, 'pomada-alfa') < posicionDe(tabla, 'los-pibes'),
    'menos tarjetas gana aunque la diferencia de gol sea peor',
  );
});

test('con puntaje y Fair Play iguales, decide la diferencia de gol', () => {
  const tabla = calcularPosiciones(
    [
      partido('a1', 'pomada-alfa', 'managers-fc', 1, 0),
      partido('b1', 'los-pibes', 'yonotomo-fc', 5, 0),
    ],
    tarjetas(),
  );

  assert.ok(posicionDe(tabla, 'los-pibes') < posicionDe(tabla, 'pomada-alfa'));
});

test('con puntaje, Fair Play y diferencia iguales, deciden los goles a favor', () => {
  const tabla = calcularPosiciones(
    [
      partido('a1', 'pomada-alfa', 'managers-fc', 3, 2),
      partido('b1', 'los-pibes', 'yonotomo-fc', 1, 0),
    ],
    tarjetas(),
  );

  assert.ok(
    posicionDe(tabla, 'pomada-alfa') < posicionDe(tabla, 'los-pibes'),
    'ambos +1 de diferencia: sube el que marcó más',
  );
});

test('igualados en todo, deciden los resultados entre sí', () => {
  const tabla = calcularPosiciones(
    [
      // Se enfrentaron y ganó The Originals.
      partido('x', 'the-originals', 'los-pibes', 2, 0),
      // El otro partido de cada uno los deja idénticos en todo lo demás.
      partido('a1', 'useche-fc', 'the-originals', 2, 0),
      partido('b1', 'los-pibes', 'managers-fc', 2, 0),
    ],
    tarjetas(),
  );

  const fo = tabla.find((f) => f.equipo === 'the-originals');
  const fp = tabla.find((f) => f.equipo === 'los-pibes');
  assert.equal(fo.pts, fp.pts, 'el escenario debe dejarlos igualados en puntos');
  assert.equal(fo.dg, fp.dg, 'y también en diferencia de gol');
  assert.equal(fo.gf, fp.gf, 'y en goles a favor');
  assert.ok(
    posicionDe(tabla, 'the-originals') < posicionDe(tabla, 'los-pibes'),
    'quien ganó el enfrentamiento directo queda arriba',
  );
});

test('la roja pesa el triple que la amarilla', () => {
  assert.equal(PESO_AMARILLA, 1);
  assert.equal(PESO_ROJA, 3);
  assert.equal(puntosJuegoLimpio({ ta: 2, tr: 1 }), 5);
});

test('el sorteo no se automatiza: el orden es estable entre compilaciones', () => {
  const partidos = [
    partido('a1', 'pomada-alfa', 'managers-fc', 1, 0),
    partido('b1', 'los-pibes', 'yonotomo-fc', 1, 0),
  ];

  const primera = calcularPosiciones(partidos, tarjetas()).map((f) => f.equipo);
  const segunda = calcularPosiciones(partidos, tarjetas()).map((f) => f.equipo);

  assert.deepEqual(primera, segunda, 'dos compilaciones seguidas dan la misma tabla');
  assert.ok(
    posicionDe(calcularPosiciones(partidos, tarjetas()), 'los-pibes') <
      posicionDe(calcularPosiciones(partidos, tarjetas()), 'pomada-alfa'),
    'empatados en los cinco criterios, quedan en orden alfabético hasta que la organización sortee',
  );
});
