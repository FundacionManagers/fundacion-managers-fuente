/**
 * La llave de cuartos.
 *
 * Regla del torneo: la llave se deriva de la tabla, nunca se escribe a mano.
 * Estas pruebas son el candado. Si alguien vuelve a teclear los cruces, la
 * prueba de "sale de la tabla" lo detecta.
 */

const test = require('node:test');
const assert = require('node:assert/strict');

const {
  CUARTOS_LIGA,
  EMPAREJAMIENTOS_CUARTOS,
  PARTIDOS_LIGA,
  POSICIONES_LIGA,
  cruzarCuartos,
  faseDeGruposCompleta,
} = require('../.test-build/lib/liga.js');
const { EQUIPOS } = require('../.test-build/lib/torneo-data.js');

test('los cruces son 1º-8º, 2º-7º, 3º-6º y 4º-5º', () => {
  assert.deepEqual(
    EMPAREJAMIENTOS_CUARTOS.map((par) => [...par]),
    [
      [1, 8],
      [2, 7],
      [3, 6],
      [4, 5],
    ],
  );

  assert.deepEqual(
    CUARTOS_LIGA.map((c) => [c.posicionLocal, c.posicionVisitante]),
    [
      [1, 8],
      [2, 7],
      [3, 6],
      [4, 5],
    ],
  );
});

test('la llave tiene 4 cruces y mete a los 8 clubes una sola vez', () => {
  assert.equal(CUARTOS_LIGA.length, 4);

  const participantes = CUARTOS_LIGA.flatMap((c) => [c.local, c.visitante]);
  assert.equal(participantes.length, 8);
  assert.equal(new Set(participantes).size, 8, 'ningún club puede jugar dos cuartos');
  assert.deepEqual(
    [...participantes].sort(),
    EQUIPOS.map((e) => e.slug).sort(),
  );
});

test('el mejor ubicado hace de local', () => {
  for (const c of CUARTOS_LIGA) {
    assert.ok(
      c.posicionLocal < c.posicionVisitante,
      `${c.etiqueta}: el local debería ser el mejor ubicado`,
    );
  }
});

test('la llave sale de la tabla, no de una lista escrita a mano', () => {
  // Tabla inventada, al revés de la real: la llave debe seguirla igual.
  const alReves = [...POSICIONES_LIGA]
    .map((f) => f.equipo)
    .reverse()
    .map((equipo, i) => ({ equipo, posicion: i + 1 }));

  const cruces = cruzarCuartos(alReves);

  assert.equal(cruces[0].local, alReves[0].equipo, 'el 1º de esa tabla abre la llave');
  assert.equal(cruces[0].visitante, alReves[7].equipo, 'contra el 8º de esa tabla');
  assert.notDeepEqual(
    cruces.map((c) => c.local),
    CUARTOS_LIGA.map((c) => c.local),
    'si la llave no cambia al cambiar la tabla, es que está escrita a mano',
  );
});

test('una posición vacía no inventa rival', () => {
  const cruces = cruzarCuartos([{ equipo: 'pomada-alfa', posicion: 1 }]);
  assert.equal(cruces[0].local, 'pomada-alfa');
  assert.equal(cruces[0].visitante, null, 'sin 8º clasificado, el rival queda por definir');
});

test('la fase de grupos no está completa mientras falten las fechas 6 y 7', () => {
  assert.equal(
    faseDeGruposCompleta(PARTIDOS_LIGA),
    false,
    'la llave de hoy es una proyección, no el cuadro definitivo',
  );

  const todosJugados = PARTIDOS_LIGA.map((p) => ({ ...p, estado: 'jugado' }));
  assert.equal(faseDeGruposCompleta(todosJugados), true);
});
