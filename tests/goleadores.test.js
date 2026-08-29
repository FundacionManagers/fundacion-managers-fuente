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
  PARTIDOS_LIGA,
  POSICIONES_LIGA,
  autogolesDe,
  beneficiadoDe,
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

test('el total del torneo cuadra: goles del marcador = goleadores + autogoles', () => {
  const golesMarcados = POSICIONES_LIGA.reduce((s, f) => s + f.gf, 0);
  const deJugador = GOLEADORES_LIGA.reduce((s, g) => s + g.goles, 0);
  assert.equal(
    golesMarcados,
    deJugador + AUTOGOLES.length,
    'la suma publicada no cuadra: sobra o falta un gol sin explicar',
  );
});

/**
 * El cuadre club por club, que es más exigente que el total.
 *
 * El total puede cuadrar por casualidad —un club con un gol de más y otro
 * con uno de menos se compensan— y eso fue exactamente lo que pasó: Pomada
 * Alfa tenía acreditado a un jugador el autogol de Managers FC, y a La Banda
 * Cruzada le faltaba un goleador. Con esta prueba, ese tipo de descuadre no
 * se puede esconder detrás de una suma que da bien.
 */
test('cada club cuadra: sus goleadores más sus autogoles son sus goles', () => {
  const descuadre = POSICIONES_LIGA.map((f) => {
    const deJugador = GOLEADORES_LIGA.filter((g) => g.equipo === f.equipo).reduce(
      (s, g) => s + g.goles,
      0,
    );
    return { equipo: f.equipo, diferencia: deJugador + autogolesDe(f.equipo) - f.gf };
  }).filter((x) => x.diferencia !== 0);

  assert.deepEqual(descuadre, [], 'algún club reparte más o menos goles de los que marcó');
});

test('Pomada Alfa marca 23: 22 de sus jugadores y el autogol de Managers FC', () => {
  const fila = POSICIONES_LIGA.find((f) => f.equipo === 'pomada-alfa');
  const deJugador = GOLEADORES_LIGA.filter((g) => g.equipo === 'pomada-alfa').reduce(
    (s, g) => s + g.goles,
    0,
  );
  assert.equal(fila.gf, 23);
  assert.equal(deJugador, 22);
  assert.equal(autogolesDe('pomada-alfa'), 1);
});

test('el autogol lo marcó Managers FC en la Fecha 2, a favor de Pomada Alfa', () => {
  assert.equal(AUTOGOLES.length, 1);
  assert.equal(AUTOGOLES[0].autor, 'managers-fc');
  assert.equal(AUTOGOLES[0].jornada, 2);
  assert.equal(
    beneficiadoDe(AUTOGOLES[0]),
    'pomada-alfa',
    'el beneficiado sale del calendario: es el rival de ese partido',
  );
});

test('el partido del autogol es el 0–1 que describió la organización', () => {
  const partido = PARTIDOS_LIGA.find(
    (p) => p.jornada === 2 && p.local === 'managers-fc' && p.visitante === 'pomada-alfa',
  );
  assert.ok(partido, 'Managers FC vs Pomada Alfa debería estar en la Fecha 2');
  assert.equal(partido.golesLocal, 0);
  assert.equal(partido.golesVisitante, 1);
});

test('todo autogol cae en un partido jugado por su autor, y cabe en el marcador', () => {
  for (const a of AUTOGOLES) {
    const partido = PARTIDOS_LIGA.find(
      (p) => p.jornada === a.jornada && (p.local === a.autor || p.visitante === a.autor),
    );
    assert.ok(partido, `${a.autor} no jugó en la fecha ${a.jornada}: la fecha no cuadra`);
    assert.equal(partido.estado, 'jugado', 'un autogol no puede caer en un partido sin jugar');

    // El gol tuvo que caber en el marcador del club beneficiado.
    const beneficiado = beneficiadoDe(a);
    const golesDelBeneficiado =
      partido.local === beneficiado ? partido.golesLocal : partido.golesVisitante;
    assert.ok(
      golesDelBeneficiado >= 1,
      `${beneficiado} no marcó en la fecha ${a.jornada}: ahí no cabe un autogol a favor`,
    );
  }
});

test('ningún autogol se le acredita a un jugador del ranking', () => {
  const nombres = new Set(GOLEADORES_LIGA.map((g) => g.jugador.toLowerCase()));
  assert.ok(
    !nombres.has('autogol') && !nombres.has('gol en propia puerta'),
    'los autogoles van en AUTOGOLES, no como una fila más de la bota de oro',
  );
});

test('autor y beneficiado de cada autogol son clubes del torneo', () => {
  const slugs = new Set(EQUIPOS.map((e) => e.slug));
  for (const a of AUTOGOLES) {
    assert.ok(slugs.has(a.autor), `autogol de un club inexistente: ${a.autor}`);
    assert.ok(slugs.has(beneficiadoDe(a)), `autogol a favor de un club inexistente: ${a.autor}`);
  }
});
