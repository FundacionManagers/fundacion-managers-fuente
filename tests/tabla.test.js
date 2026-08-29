/**
 * La tabla se deriva del calendario. Estas pruebas vigilan que siga siendo
 * imposible que la tabla y los marcadores se contradigan.
 */

const test = require('node:test');
const assert = require('node:assert/strict');

const {
  PARTIDOS_LIGA,
  POSICIONES_LIGA,
  TOTAL_JORNADAS,
  calcularPosiciones,
} = require('../.test-build/lib/liga.js');
const { EQUIPOS } = require('../.test-build/lib/torneo-data.js');
const { partido, tarjetas } = require('./ayuda.js');

test('la tabla lista los 8 clubes, sin repetir ni faltar', () => {
  assert.equal(POSICIONES_LIGA.length, 8);
  const slugs = POSICIONES_LIGA.map((f) => f.equipo).sort();
  assert.deepEqual(slugs, EQUIPOS.map((e) => e.slug).sort());
});

test('las posiciones van de 1 a 8 sin huecos', () => {
  assert.deepEqual(
    POSICIONES_LIGA.map((f) => f.posicion),
    [1, 2, 3, 4, 5, 6, 7, 8],
  );
});

test('los puntos son 3 por victoria y 1 por empate', () => {
  for (const f of POSICIONES_LIGA) {
    assert.equal(f.pts, f.pg * 3 + f.pe, `${f.equipo} tiene los puntos descuadrados`);
  }
});

test('los partidos jugados son la suma de ganados, empatados y perdidos', () => {
  for (const f of POSICIONES_LIGA) {
    assert.equal(f.pj, f.pg + f.pe + f.pp, `${f.equipo} tiene los partidos descuadrados`);
  }
});

test('la diferencia de gol es goles a favor menos goles en contra', () => {
  for (const f of POSICIONES_LIGA) {
    assert.equal(f.dg, f.gf - f.gc, `${f.equipo} tiene la diferencia mal calculada`);
  }
});

test('todo gol a favor de alguien es gol en contra de otro', () => {
  const favor = POSICIONES_LIGA.reduce((s, f) => s + f.gf, 0);
  const contra = POSICIONES_LIGA.reduce((s, f) => s + f.gc, 0);
  assert.equal(favor, contra);
});

test('los partidos programados no suman a la tabla', () => {
  const tabla = calcularPosiciones(
    [
      partido('jugado', 'pomada-alfa', 'managers-fc', 3, 0),
      { ...partido('futuro', 'pomada-alfa', 'los-pibes', 9, 0), estado: 'programado' },
    ],
    tarjetas(),
  );

  const pomada = tabla.find((f) => f.equipo === 'pomada-alfa');
  assert.equal(pomada.pj, 1, 'solo cuenta el partido ya jugado');
  assert.equal(pomada.gf, 3);
});

test('el fixture tiene 28 partidos: 7 fechas de 4', () => {
  assert.equal(PARTIDOS_LIGA.length, 28);
  for (let j = 1; j <= TOTAL_JORNADAS; j += 1) {
    const dela = PARTIDOS_LIGA.filter((p) => p.jornada === j);
    assert.equal(dela.length, 4, `la fecha ${j} no tiene 4 partidos`);
  }
});

test('cada club juega una sola vez contra cada rival', () => {
  const vistos = new Set();
  for (const p of PARTIDOS_LIGA) {
    const par = [p.local, p.visitante].sort().join(' vs ');
    assert.ok(!vistos.has(par), `${par} aparece dos veces en el fixture`);
    vistos.add(par);
  }
  assert.equal(vistos.size, 28);

  for (const e of EQUIPOS) {
    const suyos = PARTIDOS_LIGA.filter((p) => p.local === e.slug || p.visitante === e.slug);
    assert.equal(suyos.length, 7, `${e.slug} no juega 7 partidos`);
  }
});

test('el respaldo está al día en la Fecha 5', () => {
  for (const p of PARTIDOS_LIGA) {
    const esperado = p.jornada <= 5 ? 'jugado' : 'programado';
    assert.equal(p.estado, esperado, `el partido ${p.id} debería estar ${esperado}`);
  }

  for (const f of POSICIONES_LIGA) {
    assert.equal(f.pj, 5, `${f.equipo} debería llevar 5 partidos jugados`);
  }
});
