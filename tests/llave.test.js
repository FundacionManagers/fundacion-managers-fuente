/**
 * Las semifinales de las dos copas.
 *
 * Regla del torneo: la llave se deriva de las tablas, nunca se escribe a
 * mano. Estas pruebas son el candado. Si alguien vuelve a teclear los
 * cruces, la prueba de "sale de la tabla" lo detecta.
 */

const test = require('node:test');
const assert = require('node:assert/strict');

const {
  CRUCES_LIGA,
  PARTIDOS_LIGA,
  cruzarFaseFinal,
  faseDeGruposCompleta,
  posicionesPorGrupo,
} = require('../.test-build/lib/liga.js');
const { EQUIPOS, GRUPOS } = require('../.test-build/lib/torneo-data.js');

/** Tablas de mentira: cada grupo en el orden que se le pase. */
function tablas(a, b) {
  const filas = (slugs) => slugs.map((equipo, i) => ({ equipo, posicion: i + 1 }));
  return [
    { grupo: 'A', filas: filas(a) },
    { grupo: 'B', filas: filas(b) },
  ];
}

test('las semifinales se cruzan: 1º A con 2º B y 1º B con 2º A', () => {
  assert.deepEqual(
    CRUCES_LIGA.map((c) => [c.copa, c.siembraLocal, c.siembraVisitante]),
    [
      ['oro', '1A', '2B'],
      ['oro', '1B', '2A'],
      ['plata', '3A', '4B'],
      ['plata', '3B', '4A'],
    ],
  );
});

test('las dos copas meten a los 8 clubes una sola vez', () => {
  const participantes = CRUCES_LIGA.flatMap((c) => [c.local, c.visitante]);
  assert.equal(participantes.length, 8);
  assert.equal(new Set(participantes).size, 8, 'ningún club puede jugar dos semifinales');
  assert.deepEqual([...participantes].sort(), EQUIPOS.map((e) => e.slug).sort());
});

test('cada semifinal enfrenta a un club de cada grupo', () => {
  for (const c of CRUCES_LIGA) {
    const deA = GRUPOS.A.includes(c.local) ? 1 : 0;
    const deA2 = GRUPOS.A.includes(c.visitante) ? 1 : 0;
    assert.equal(deA + deA2, 1, `${c.etiqueta}: deberían ser de grupos distintos`);
  }
});

test('el mejor ubicado hace de local', () => {
  for (const c of CRUCES_LIGA) {
    assert.ok(
      Number(c.siembraLocal[0]) < Number(c.siembraVisitante[0]),
      `${c.etiqueta}: el local debería ser el mejor ubicado`,
    );
  }
});

test('la llave sale de las tablas, no de una lista escrita a mano', () => {
  const t = tablas(['a1', 'a2', 'a3', 'a4'], ['b1', 'b2', 'b3', 'b4']);
  const alReves = tablas(['a4', 'a3', 'a2', 'a1'], ['b4', 'b3', 'b2', 'b1']);

  assert.deepEqual(
    cruzarFaseFinal(t).map((c) => [c.local, c.visitante]),
    [
      ['a1', 'b2'],
      ['b1', 'a2'],
      ['a3', 'b4'],
      ['b3', 'a4'],
    ],
  );
  assert.notDeepEqual(
    cruzarFaseFinal(alReves).map((c) => c.local),
    cruzarFaseFinal(t).map((c) => c.local),
    'si la llave no cambia al cambiar la tabla, es que está escrita a mano',
  );
});

test('un puesto vacío no inventa rival', () => {
  const cruces = cruzarFaseFinal(tablas(['a1'], ['b1']));
  assert.equal(cruces[0].local, 'a1');
  assert.equal(cruces[0].visitante, null, 'sin 2º del Grupo B, el rival queda por definir');
});

test('con la Fecha 1, la Oro sale TP vs Banda y Pomada vs Cúcuta', () => {
  // La tabla oficial de la organización tras la Fecha 1.
  const [a, b] = posicionesPorGrupo();
  assert.deepEqual(
    a.filas.map((f) => f.equipo),
    ['tp-fc', 'cucuta-10-fc', 'yonotomo-fc', 'the-originals'],
  );
  assert.deepEqual(
    b.filas.map((f) => f.equipo),
    ['pomada-alfa', 'la-banda-cruzada', 'isotopos-portal-1', 'los-pibes'],
  );
  assert.deepEqual(
    CRUCES_LIGA.filter((c) => c.copa === 'oro').map((c) => [c.local, c.visitante]),
    [
      ['tp-fc', 'la-banda-cruzada'],
      ['pomada-alfa', 'cucuta-10-fc'],
    ],
  );
});

test('la fase de grupos no está completa mientras falten las fechas 2 y 3', () => {
  assert.equal(
    faseDeGruposCompleta(PARTIDOS_LIGA),
    false,
    'la llave de hoy es una proyección, no el cuadro definitivo',
  );

  const todosJugados = PARTIDOS_LIGA.map((p) => ({ ...p, estado: 'jugado' }));
  assert.equal(faseDeGruposCompleta(todosJugados), true);
});
