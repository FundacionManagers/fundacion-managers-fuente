/**
 * El ranking público de goleadores.
 *
 * Tres cosas se vigilan aquí. Una, que nadie aparezca dos veces: un jugador
 * partido en dos filas se ve en la web como dos personas distintas con la
 * mitad de los goles cada una. Dos, que el ranking no reparta más goles de
 * los que el club marcó de verdad. Y tres, que cada gol del marcador tenga
 * explicación: o lo marcó un jugador, o es un autogol registrado. Ningún
 * gol puede quedar suelto sin que la web dé cuenta de él.
 */

const test = require('node:test');
const assert = require('node:assert/strict');

const {
  AUTOGOLES,
  GOLEADORES_LIGA,
  POSICIONES_LIGA,
  autogolesDe,
} = require('../.test-build/lib/liga.js');
const { EQUIPOS } = require('../.test-build/lib/torneo-data.js');

test('ningún jugador aparece dos veces', () => {
  const vistos = new Map();
  for (const g of GOLEADORES_LIGA) {
    const clave = `${g.equipo}/${g.jugador}`;
    assert.ok(
      !vistos.has(clave),
      `${g.jugador} (${g.equipo}) aparece más de una vez: sus goles quedarían partidos en el ranking`,
    );
    vistos.set(clave, g);
  }
});

test('Jeison Malagón figura una sola vez, con 4 goles', () => {
  const suyas = GOLEADORES_LIGA.filter((g) => g.jugador === 'Jeison Malagón');
  assert.equal(suyas.length, 1, 'debe tener exactamente una fila');
  assert.equal(suyas[0].goles, 4);
  assert.equal(suyas[0].equipo, 'pomada-alfa');
  assert.equal(suyas[0].numero, 8);
});

test('no se confunde con Yesid Malagón, que es otro jugador', () => {
  const yesid = GOLEADORES_LIGA.filter((g) => g.jugador === 'Yesid Malagón');
  assert.equal(yesid.length, 1);
  assert.equal(yesid[0].numero, 91);
  assert.notEqual(yesid[0].numero, 8, 'son dorsales distintos: no es la misma persona');
});

test('las posiciones del ranking van de 1 a N sin huecos', () => {
  assert.deepEqual(
    GOLEADORES_LIGA.map((g) => g.posicion),
    GOLEADORES_LIGA.map((_, i) => i + 1),
  );
});

test('el ranking está ordenado de más a menos goles', () => {
  for (let i = 1; i < GOLEADORES_LIGA.length; i += 1) {
    assert.ok(
      GOLEADORES_LIGA[i - 1].goles >= GOLEADORES_LIGA[i].goles,
      `la posición ${i + 1} tiene más goles que la ${i}`,
    );
  }
});

test('todo goleador pertenece a un club del torneo', () => {
  const slugs = new Set(EQUIPOS.map((e) => e.slug));
  for (const g of GOLEADORES_LIGA) {
    assert.ok(slugs.has(g.equipo), `${g.jugador} está en un club inexistente: ${g.equipo}`);
  }
});

test('ningún club reparte más goles de los que marcó', () => {
  for (const f of POSICIONES_LIGA) {
    const asignados = GOLEADORES_LIGA.filter((g) => g.equipo === f.equipo).reduce(
      (s, g) => s + g.goles,
      0,
    );
    assert.ok(asignados <= f.gf, `${f.equipo} reparte ${asignados} goles pero solo marcó ${f.gf}`);
  }
});

test('todo gol sin goleador está explicado por un autogol registrado', () => {
  const sinExplicar = POSICIONES_LIGA.map((f) => {
    const asignados = GOLEADORES_LIGA.filter((g) => g.equipo === f.equipo).reduce(
      (s, g) => s + g.goles,
      0,
    );
    return { equipo: f.equipo, faltan: f.gf - asignados - autogolesDe(f.equipo) };
  }).filter((x) => x.faltan !== 0);

  assert.deepEqual(
    sinExplicar,
    [],
    'hay goles que no salen ni de un goleador ni de un autogol: falta registrarlos',
  );
});

test('el autogol de la fase de grupos es a favor de La Banda Cruzada', () => {
  assert.equal(AUTOGOLES.length, 1);
  assert.equal(autogolesDe('la-banda-cruzada'), 1);
});

test('ningún autogol se le acredita a un jugador del ranking', () => {
  const nombres = new Set(GOLEADORES_LIGA.map((g) => g.jugador.toLowerCase()));
  assert.ok(
    !nombres.has('autogol') && !nombres.has('gol en propia puerta'),
    'los autogoles van en AUTOGOLES, no como una fila más de la bota de oro',
  );
});

test('todo autogol beneficia a un club del torneo', () => {
  const slugs = new Set(EQUIPOS.map((e) => e.slug));
  for (const a of AUTOGOLES) {
    assert.ok(slugs.has(a.equipo), `autogol a favor de un club inexistente: ${a.equipo}`);
  }
});
