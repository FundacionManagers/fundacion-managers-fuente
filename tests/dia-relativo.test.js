/**
 * "Hoy" y "Mañana", que ahora comparten la tarjeta del Calendario y la ficha
 * de cada club.
 *
 * Antes la cuenta vivía dentro del componente de la tarjeta. Al llevarla
 * también a la ficha de club, una copia divergiendo de la otra habría sido
 * peor que no tener ninguna: dos sitios de la misma web diciendo cosas
 * distintas del mismo partido. Estas pruebas fijan la única regla.
 */

const test = require('node:test');
const assert = require('node:assert/strict');

const { diaRelativoDe } = require('../.test-build/lib/liga.js');

/** Un instante local, sin depender de la zona horaria de quien ejecute. */
function local(a, m, d, h = 12, min = 0) {
  return new Date(a, m - 1, d, h, min);
}

test('el mismo día es "Hoy", a cualquier hora', () => {
  const iso = '2026-08-30T07:00:00-05:00';
  assert.equal(diaRelativoDe(iso, local(2026, 8, 30, 0, 5)), 'Hoy');
  assert.equal(diaRelativoDe(iso, local(2026, 8, 30, 23, 55)), 'Hoy');
});

/**
 * El caso que hizo falta arreglar en su momento: a las 23:00 de la víspera
 * faltan 8 horas, pero para quien lo lee es "mañana", no "hoy". Se comparan
 * días de calendario, no milisegundos.
 */
test('la víspera es "Mañana" aunque falten pocas horas', () => {
  const iso = '2026-08-30T07:00:00-05:00';
  assert.equal(diaRelativoDe(iso, local(2026, 8, 29, 23, 0)), 'Mañana');
  assert.equal(diaRelativoDe(iso, local(2026, 8, 29, 6, 0)), 'Mañana');
});

test('a dos días o más no dice nada: no compite con lo que sí importa', () => {
  const iso = '2026-08-30T07:00:00-05:00';
  assert.equal(diaRelativoDe(iso, local(2026, 8, 28)), null);
  assert.equal(diaRelativoDe(iso, local(2026, 8, 20)), null);
});

/**
 * Un partido sigue marcado como "programado" hasta que la organización sube
 * el marcador, así que el lunes por la mañana la tarjeta seguía apuntando al
 * domingo. Llamar "próximo" a un partido de ayer es mentira.
 */
test('pasado el día, admite que faltan los resultados', () => {
  const iso = '2026-08-30T07:00:00-05:00';
  assert.equal(diaRelativoDe(iso, local(2026, 8, 31, 8, 0)), 'Resultados en camino');
  assert.equal(diaRelativoDe(iso, local(2026, 9, 2)), 'Resultados en camino');
});

test('una fecha ilegible no inventa nada', () => {
  assert.equal(diaRelativoDe('no es una fecha', local(2026, 8, 30)), null);
  assert.equal(diaRelativoDe('', local(2026, 8, 30)), null);
});
