/**
 * La final de la edición anterior se cuenta una sola vez.
 *
 * El Palmarés y el bloque del campeón del Resumen la nombran los dos: el
 * marcador, el rival y la tanda. Si cada página la calculara por su lado,
 * tarde o temprano dirían dos resultados distintos. Estas pruebas vigilan
 * que salga contada desde el lado del campeón, también cuando el campeón
 * jugó de visitante.
 */

const test = require('node:test');
const assert = require('node:assert/strict');

const { CAMPEON_VIGENTE, FINAL_ANTERIOR } = require('../.test-build/lib/torneo.js');
const { getEquipo } = require('../.test-build/lib/torneo-data.js');

test('la final anterior sale del lado del campeón vigente', () => {
  assert.ok(FINAL_ANTERIOR, 'la edición anterior tiene una final jugada');
  assert.equal(getEquipo(FINAL_ANTERIOR.campeon)?.nombre, CAMPEON_VIGENTE.equipo);
});

test('la 4ª se cerró 3–3 y 6–5 en penales ante The Originals', () => {
  assert.deepEqual(FINAL_ANTERIOR, {
    campeon: 'pomada-alfa',
    rival: 'the-originals',
    golesCampeon: 3,
    golesRival: 3,
    penales: { campeon: 6, rival: 5 },
  });
});

test('con empate en los 90, la tanda la gana el campeón', () => {
  assert.equal(FINAL_ANTERIOR.golesCampeon, FINAL_ANTERIOR.golesRival);
  assert.ok(FINAL_ANTERIOR.penales.campeon > FINAL_ANTERIOR.penales.rival);
});
