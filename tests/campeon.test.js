/**
 * El palmarés se gana en la cancha, no se teclea.
 *
 * Un club solo suma un título si en el sitio está publicada la Gran Final
 * que ganó. La web llegó a presentar a Pomada Alfa como "bicampeón vigente"
 * con dos títulos que ningún partido publicado respaldaba, y encima le
 * quitaba la corona a The Originals, que sí ganó la final de la 3ª edición.
 * Estas pruebas existen para que ese tipo de dato no pueda volver a entrar.
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
} = require('../.test-build/lib/torneo.js');
const { EQUIPOS } = require('../.test-build/lib/torneo-data.js');

test('ningún título existe sin una final publicada que lo respalde', () => {
  const titulosContados = Object.values(TITULOS_POR_CLUB).reduce((s, n) => s + n, 0);
  const finalesPublicadas = EDICIONES.filter((e) => campeonDe(e) !== undefined).length;
  assert.equal(
    titulosContados,
    finalesPublicadas,
    'hay títulos repartidos que no salen de ninguna final publicada',
  );
});

test('el campeón de una edición sale de quién ganó su Gran Final', () => {
  const tercera = EDICIONES.find((e) => e.numero === 3);
  const final = tercera.partidos.find((p) => p.fase === 'final');
  assert.equal(final.local, 'los-pibes');
  assert.equal(final.visitante, 'the-originals');
  assert.equal(final.golesLocal, 1);
  assert.equal(final.golesVisitante, 2);
  assert.equal(campeonDe(tercera), 'The Originals', 'ganó la final, luego es el campeón');
});

test('las ediciones sin partidos publicados no otorgan título', () => {
  for (const e of EDICIONES.filter((x) => x.partidos === undefined)) {
    assert.equal(
      campeonDe(e),
      undefined,
      `la edición ${e.numero} no tiene partidos publicados: no puede coronar a nadie`,
    );
  }
});

test('Pomada Alfa no figura con títulos mientras no se publiquen sus finales', () => {
  assert.equal(
    TITULOS_POR_CLUB['Pomada Alfa'],
    undefined,
    'si se publican las llaves de las ediciones 1 y 2, esta prueba debe actualizarse',
  );
  const pomada = EQUIPOS.find((e) => e.slug === 'pomada-alfa');
  assert.equal(pomada.titulos, 0);
});

test('el campeón vigente es The Originals, de la 3ª edición', () => {
  assert.equal(CAMPEON_VIGENTE.equipo, 'The Originals');
  assert.equal(CAMPEON_VIGENTE.edicion, 3);
  assert.equal(CAMPEON_VIGENTE.periodo, '2026-1');
});

test('el campeón vigente sale de la última edición con final publicada', () => {
  const conCampeon = EDICIONES.filter((e) => e.estado === 'jugada' && campeonDe(e) !== undefined);
  const ultima = conCampeon[conCampeon.length - 1];
  assert.equal(CAMPEON_VIGENTE.equipo, campeonDe(ultima));
  assert.equal(CAMPEON_VIGENTE.edicion, ultima.numero);
});

test('el máximo ganador es The Originals, con 1 título', () => {
  assert.equal(MAXIMO_GANADOR.equipo, 'The Originals');
  assert.equal(MAXIMO_GANADOR.titulos, 1);
});

test('el bloque de máximo ganador se oculta cuando coincide con el campeón vigente', () => {
  assert.equal(
    MAXIMO_GANADOR_ES_OTRO,
    MAXIMO_GANADOR.equipo !== CAMPEON_VIGENTE.equipo,
    'la web no debe nombrar al mismo club dos veces con dos rótulos distintos',
  );
});

test('los títulos de cada club cuadran con las finales que ganaron', () => {
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
