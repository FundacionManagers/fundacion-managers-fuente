/**
 * El palmarés sale de una sola lista, y cada título dice de dónde viene.
 *
 * La web llegó a presentar a Pomada Alfa como "bicampeón vigente" con dos
 * títulos fechados en 2024 y 2025 que no encajaban con la numeración del
 * resto del sitio, mientras la 3ª edición la había ganado The Originals. El
 * número vivía suelto en la ficha del club, sin ninguna lista detrás.
 *
 * Ahora todo sale de EDICIONES, y cada campeón declara su respaldo: la llave
 * publicada, o el palmarés que aporta la organización. Estas pruebas vigilan
 * que no vuelva a haber un título sin procedencia, y que campeón vigente y
 * máximo ganador no se confundan.
 */

const test = require('node:test');
const assert = require('node:assert/strict');

const {
  CAMPEON_VIGENTE,
  EDICIONES,
  MAXIMO_GANADOR,
  MAXIMO_GANADOR_ES_OTRO,
  TITULOS_POR_CLUB,
  campeonDe,
  respaldoDe,
} = require('../.test-build/lib/torneo.js');
const { EQUIPOS } = require('../.test-build/lib/torneo-data.js');

test('ningún título existe sin declarar de dónde sale', () => {
  const titulosContados = Object.values(TITULOS_POR_CLUB).reduce((s, n) => s + n, 0);
  const conRespaldo = EDICIONES.filter((e) => respaldoDe(e) !== undefined).length;
  assert.equal(titulosContados, conRespaldo, 'hay títulos repartidos sin procedencia declarada');

  for (const e of EDICIONES) {
    const tieneCampeon = campeonDe(e) !== undefined;
    assert.equal(
      tieneCampeon,
      respaldoDe(e) !== undefined,
      `la edición ${e.numero} corona a alguien sin decir de dónde sale el dato`,
    );
  }
});

test('el campeón de una edición con llave sale de quién ganó su Gran Final', () => {
  const tercera = EDICIONES.find((e) => e.numero === 3);
  const final = tercera.partidos.find((p) => p.fase === 'final');
  assert.equal(final.local, 'los-pibes');
  assert.equal(final.visitante, 'the-originals');
  assert.equal(final.golesLocal, 1);
  assert.equal(final.golesVisitante, 2);
  assert.equal(campeonDe(tercera), 'The Originals', 'ganó la final, luego es el campeón');
  assert.equal(respaldoDe(tercera), 'llave-publicada');
});

test('las dos primeras ediciones las ganó Pomada Alfa, sin llave publicada', () => {
  for (const numero of [1, 2]) {
    const e = EDICIONES.find((x) => x.numero === numero);
    assert.equal(campeonDe(e), 'Pomada Alfa');
    assert.equal(
      respaldoDe(e),
      'declarado',
      'si se publica su llave, el respaldo pasa a llave-publicada y hay que actualizar esta prueba',
    );
  }
});

test('Pomada Alfa es bicampeón y el escudo lo refleja', () => {
  assert.equal(TITULOS_POR_CLUB['Pomada Alfa'], 2);
  const pomada = EQUIPOS.find((e) => e.slug === 'pomada-alfa');
  assert.equal(pomada.titulos, 2, 'los títulos del club se cuentan sobre EDICIONES, no a mano');
});

test('el campeón vigente es The Originals, de la 3ª edición', () => {
  assert.equal(CAMPEON_VIGENTE.equipo, 'The Originals');
  assert.equal(CAMPEON_VIGENTE.edicion, 3);
  assert.equal(CAMPEON_VIGENTE.periodo, '2026-1');
});

test('el campeón vigente sale de la última edición ya jugada', () => {
  const conCampeon = EDICIONES.filter((e) => e.estado === 'jugada' && campeonDe(e) !== undefined);
  const ultima = conCampeon[conCampeon.length - 1];
  assert.equal(CAMPEON_VIGENTE.equipo, campeonDe(ultima));
  assert.equal(CAMPEON_VIGENTE.edicion, ultima.numero);
});

test('el máximo ganador es Pomada Alfa, con 2 títulos', () => {
  assert.equal(MAXIMO_GANADOR.equipo, 'Pomada Alfa');
  assert.equal(MAXIMO_GANADOR.titulos, 2);
});

test('máximo ganador y campeón vigente son cosas distintas', () => {
  assert.notEqual(
    MAXIMO_GANADOR.equipo,
    CAMPEON_VIGENTE.equipo,
    'hoy son clubes distintos: Pomada Alfa acumula más, The Originals tiene la corona',
  );
  assert.equal(
    MAXIMO_GANADOR_ES_OTRO,
    true,
    'con clubes distintos, la web debe mostrar los dos bloques',
  );
});

test('los títulos de cada club cuadran con las ediciones que ganaron', () => {
  for (const e of EQUIPOS) {
    const ganadas = EDICIONES.filter((ed) => campeonDe(ed) === e.nombre).length;
    assert.equal(e.titulos, ganadas, `${e.nombre} dice ${e.titulos} títulos y ganó ${ganadas}`);
  }
});

test('la 4ª edición está en curso y todavía no corona a nadie', () => {
  const cuarta = EDICIONES.find((e) => e.numero === 4);
  assert.equal(cuarta.estado, 'en-curso');
  assert.equal(campeonDe(cuarta), undefined);
});
