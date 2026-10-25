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
const { CLUBES_HISTORICOS } = require('../.test-build/lib/torneo-data.js');

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

test('Pomada Alfa suma tres títulos y el escudo lo refleja', () => {
  assert.equal(TITULOS_POR_CLUB['Pomada Alfa'], 3);
  const pomada = CLUBES_HISTORICOS.find((e) => e.slug === 'pomada-alfa');
  assert.equal(pomada.titulos, 3, 'los títulos del club se cuentan sobre EDICIONES, no a mano');
});

test('la 4ª la ganó Pomada Alfa en penales, y lo dice la llave publicada', () => {
  const cuarta = EDICIONES.find((e) => e.numero === 4);
  assert.equal(cuarta.estado, 'jugada');
  assert.equal(campeonDe(cuarta), 'Pomada Alfa');
  assert.equal(respaldoDe(cuarta), 'llave-publicada');
});

test('el campeón vigente es Pomada Alfa, de la 4ª edición', () => {
  assert.equal(CAMPEON_VIGENTE.equipo, 'Pomada Alfa');
  assert.equal(CAMPEON_VIGENTE.edicion, 4);
  assert.equal(CAMPEON_VIGENTE.periodo, '2026-2');
});

test('el campeón vigente sale de la última edición ya jugada', () => {
  const conCampeon = EDICIONES.filter((e) => e.estado === 'jugada' && campeonDe(e) !== undefined);
  const ultima = conCampeon[conCampeon.length - 1];
  assert.equal(CAMPEON_VIGENTE.equipo, campeonDe(ultima));
  assert.equal(CAMPEON_VIGENTE.edicion, ultima.numero);
});

test('el máximo ganador es Pomada Alfa, con 3 títulos', () => {
  assert.equal(MAXIMO_GANADOR.equipo, 'Pomada Alfa');
  assert.equal(MAXIMO_GANADOR.titulos, 3);
});

test('si máximo ganador y campeón vigente coinciden, no se pinta el bloque dos veces', () => {
  assert.equal(MAXIMO_GANADOR.equipo, CAMPEON_VIGENTE.equipo);
  assert.equal(
    MAXIMO_GANADOR_ES_OTRO,
    false,
    'con el mismo club en los dos, la web mostraría a Pomada Alfa dos veces',
  );
});

test('los títulos de cada club cuadran con las ediciones que ganaron', () => {
  for (const e of CLUBES_HISTORICOS) {
    const ganadas = EDICIONES.filter((ed) => campeonDe(ed) === e.nombre).length;
    assert.equal(e.titulos, ganadas, `${e.nombre} dice ${e.titulos} títulos y ganó ${ganadas}`);
  }
});

test('la 5ª edición está en curso y todavía no corona a nadie', () => {
  const quinta = EDICIONES.find((e) => e.numero === 5);
  assert.equal(quinta.estado, 'en-curso');
  assert.equal(campeonDe(quinta), undefined);
});
