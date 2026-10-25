/**
 * Tarjetas partido por partido, y lo que sale de ellas.
 *
 * Desde la 5ª edición la organización publica cada tarjeta con su partido y
 * su dorsal. De esa lista salen el acumulado de cada club —que desempata la
 * tabla— y quién está suspendido. Si alguno de los tres se escribiera
 * aparte, tarde o temprano diría otra cosa: estas pruebas lo impiden.
 */

const test = require('node:test');
const assert = require('node:assert/strict');

const {
  DISCIPLINA,
  PARTIDOS_LIGA,
  TARJETAS_LIGA,
  disciplinaDeTarjetas,
  proximoCompromiso,
  suspendidosDelCompromiso,
  suspendidosEn,
  suspensiones,
} = require('../.test-build/lib/liga.js');

test('el acumulado de cada club es la cuenta de sus tarjetas', () => {
  assert.deepEqual(disciplinaDeTarjetas(TARJETAS_LIGA), DISCIPLINA);
  assert.deepEqual(DISCIPLINA['la-banda-cruzada'], { amarillas: 2, rojas: 1 });
  assert.deepEqual(DISCIPLINA['cucuta-10-fc'], { amarillas: 4, rojas: 0 });
});

test('toda tarjeta es de un club que jugó ese partido', () => {
  for (const t of TARJETAS_LIGA) {
    const p = PARTIDOS_LIGA.find((x) => x.id === t.partido);
    assert.ok(p, `tarjeta en un partido que no existe: ${t.partido}`);
    assert.ok(p.local === t.equipo || p.visitante === t.equipo, `${t.equipo} no jugó ${t.partido}`);
    assert.equal(p.estado, 'jugado', 'no hay tarjetas en un partido sin jugar');
  }
});

test('tras la Fecha 1, los suspendidos son el #7 de La Banda y el #21 de Los Pibes', () => {
  const s = suspensiones(TARJETAS_LIGA, PARTIDOS_LIGA);
  assert.deepEqual(
    s.map((x) => [x.equipo, x.numero]),
    [
      ['la-banda-cruzada', 7],
      ['los-pibes', 21],
    ],
  );
});

test('la suspensión se cumple en el siguiente partido de su club', () => {
  const s = suspensiones(TARJETAS_LIGA, PARTIDOS_LIGA);
  const banda = s.find((x) => x.equipo === 'la-banda-cruzada');
  const cumple = PARTIDOS_LIGA.find((p) => p.id === banda.cumple);
  assert.equal(cumple.jornada, 2);
  assert.ok(cumple.local === 'la-banda-cruzada' || cumple.visitante === 'la-banda-cruzada');
});

test('la tarjeta de la próxima fecha trae a sus suspendidos', () => {
  const proximo = proximoCompromiso(PARTIDOS_LIGA, []);
  const s = suspendidosDelCompromiso(proximo, TARJETAS_LIGA, PARTIDOS_LIGA);
  assert.equal(proximo.titulo, 'Fecha 2');
  assert.deepEqual(s.map((x) => x.numero).sort(), [21, 7].sort());
});

test('una amarilla no suspende, y una roja sin dorsal tampoco nombra a nadie', () => {
  const tarjetas = [
    { partido: 'j1p3', equipo: 'the-originals', numero: 9, tipo: 'amarilla' },
    { partido: 'j1p3', equipo: 'tp-fc', numero: null, tipo: 'roja' },
  ];
  assert.deepEqual(suspensiones(tarjetas, PARTIDOS_LIGA), []);
  // Pero la roja sin dorsal sí cuenta para el Fair Play del club.
  assert.deepEqual(disciplinaDeTarjetas(tarjetas)['tp-fc'], { amarillas: 0, rojas: 1 });
});

test('una roja en la última fecha se cumple en una ronda que aún no existe', () => {
  const tarjetas = [{ partido: 'j3p4', equipo: 'cucuta-10-fc', numero: 10, tipo: 'roja' }];
  const [s] = suspensiones(tarjetas, PARTIDOS_LIGA);
  assert.equal(s.cumple, null, 'su siguiente partido es una semifinal sin crear');
  assert.equal(suspendidosEn([], [s]).length, 0, 'en una fecha de grupos no se anuncia');
  assert.equal(suspendidosEn([], [s], true).length, 1, 'en la ronda siguiente, sí');
});
