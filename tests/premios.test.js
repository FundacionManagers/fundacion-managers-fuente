/**
 * Los premios de la clausura.
 *
 * El error que originó estas pruebas: la web premiaba «la valla menos
 * vencida» con los goles de la FASE DE GRUPOS mientras la organización la
 * calculaba sobre el torneo entero. Con el criterio de la pizarra el premio
 * cambiaba de dueño, y se habría entregado al club equivocado en la
 * clausura. Aquí queda fijado que los premios se cuentan sobre todas las
 * fases.
 */

const test = require('node:test');
const assert = require('node:assert/strict');

const {
  equipoMasGoleador,
  podioDeEdicion,
  totalesDeEdicion,
  vallaMenosVencida,
} = require('../.test-build/lib/liga.js');

const jugado = (local, visitante, gl, gv, extra = {}) => ({
  id: `${local}-${visitante}`,
  jornada: 1,
  fecha: '13/09/2026',
  hora: '08:00',
  local,
  visitante,
  golesLocal: gl,
  golesVisitante: gv,
  estado: 'jugado',
  penalesLocal: null,
  penalesVisitante: null,
  ...extra,
});

test('los totales suman todas las fases, no solo la de grupos', () => {
  const totales = totalesDeEdicion([
    jugado('pomada', 'yonotomo', 3, 1), // grupos
    jugado('pomada', 'banda', 2, 0, { fase: 'cuartos' }),
    jugado('pibes', 'pomada', 0, 1, { fase: 'semifinal' }),
  ]);
  const pomada = totales.find((t) => t.equipo === 'pomada');
  assert.equal(pomada.gf, 6); // 3 + 2 + 1
  assert.equal(pomada.gc, 1);
  assert.equal(pomada.pj, 3);
});

test('un partido sin jugar no suma nada', () => {
  const totales = totalesDeEdicion([
    jugado('a', 'b', 2, 1),
    { ...jugado('a', 'c', null, null), estado: 'programado' },
  ]);
  assert.equal(totales.find((t) => t.equipo === 'a').pj, 1);
  assert.equal(totales.find((t) => t.equipo === 'c'), undefined);
});

test('el equipo más goleador sale de los goles a favor', () => {
  const totales = totalesDeEdicion([jugado('a', 'b', 5, 1), jugado('c', 'b', 4, 0)]);
  assert.deepEqual(equipoMasGoleador(totales), { equipo: 'a', valor: 5 });
});

test('la valla menos vencida premia al que menos recibió', () => {
  const totales = totalesDeEdicion([jugado('a', 'b', 1, 0), jugado('c', 'b', 3, 2)]);
  assert.deepEqual(vallaMenosVencida(totales), { equipo: 'a', valor: 0 });
});

test('a igualdad de goles recibidos gana quien jugó más partidos', () => {
  // `b` recibe 2 en dos partidos; `c` recibe 2 en uno solo. Mejor defensa es
  // aguantar lo mismo durante más tiempo, y así no se premia al que se fue antes.
  const totales = totalesDeEdicion([
    jugado('x', 'b', 1, 5),
    jugado('y', 'b', 1, 5),
    jugado('z', 'c', 2, 5),
  ]);
  assert.equal(vallaMenosVencida(totales).equipo, 'b');
});

test('el podio sale de la final y del tercer puesto, no se escribe a mano', () => {
  const podio = podioDeEdicion([
    jugado('pomada', 'originals', 2, 1, { fase: 'final' }),
    jugado('pibes', 'tp', 3, 0, { fase: 'tercer-puesto' }),
  ]);
  assert.deepEqual(podio, { campeon: 'pomada', subcampeon: 'originals', tercero: 'pibes' });
});

test('una final por penales corona a quien ganó la tanda', () => {
  const podio = podioDeEdicion([
    jugado('pomada', 'originals', 1, 1, {
      fase: 'final',
      penalesLocal: 3,
      penalesVisitante: 5,
    }),
  ]);
  assert.equal(podio.campeon, 'originals');
  assert.equal(podio.subcampeon, 'pomada');
});

test('sin final jugada no hay campeón: no se inventa', () => {
  const podio = podioDeEdicion([
    { ...jugado('pomada', 'originals', null, null), fase: 'final', estado: 'programado' },
  ]);
  assert.deepEqual(podio, { campeon: null, subcampeon: null, tercero: null });
});

test('un empate en la final sin tanda tampoco corona a nadie', () => {
  const podio = podioDeEdicion([jugado('pomada', 'originals', 1, 1, { fase: 'final' })]);
  assert.equal(podio.campeon, null);
});
