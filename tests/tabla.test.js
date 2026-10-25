/**
 * La tabla se deriva del calendario. Estas pruebas vigilan que siga siendo
 * imposible que la tabla y los marcadores se contradigan.
 *
 * Desde la 5ª edición manda la tabla de cada grupo, así que también se
 * vigila que los grupos estén bien formados y que el respaldo reproduzca la
 * tabla oficial de la organización.
 */

const test = require('node:test');
const assert = require('node:assert/strict');

const {
  DISCIPLINA,
  PARTIDOS_LIGA,
  POSICIONES_LIGA,
  TOTAL_JORNADAS,
  calcularPosiciones,
  grupoDePartido,
  posicionesPorGrupo,
} = require('../.test-build/lib/liga.js');
const { EQUIPOS, GRUPOS, LETRAS_GRUPO } = require('../.test-build/lib/torneo-data.js');
const { partido, tarjetas } = require('./ayuda.js');

const TABLAS = posicionesPorGrupo();

test('la tabla lista los 8 clubes, sin repetir ni faltar', () => {
  assert.equal(POSICIONES_LIGA.length, 8);
  const slugs = POSICIONES_LIGA.map((f) => f.equipo).sort();
  assert.deepEqual(slugs, EQUIPOS.map((e) => e.slug).sort());
});

test('hay dos grupos de cuatro y ningún club está en los dos', () => {
  assert.deepEqual(LETRAS_GRUPO, ['A', 'B']);
  for (const g of LETRAS_GRUPO) assert.equal(GRUPOS[g].length, 4, `el Grupo ${g} no tiene 4`);
  const todos = [...GRUPOS.A, ...GRUPOS.B];
  assert.equal(new Set(todos).size, 8);
});

test('cada tabla de grupo va del 1 al 4 sin huecos', () => {
  for (const t of TABLAS) {
    assert.deepEqual(
      t.filas.map((f) => f.posicion),
      [1, 2, 3, 4],
      `Grupo ${t.grupo}`,
    );
    assert.deepEqual(
      t.filas.map((f) => f.equipo).sort(),
      [...GRUPOS[t.grupo]].sort(),
      `el Grupo ${t.grupo} tiene clubes de fuera`,
    );
  }
});

test('los puntos son 3 por victoria y 1 por empate', () => {
  for (const f of POSICIONES_LIGA) {
    assert.equal(f.pts, f.pg * 3 + f.pe, `${f.equipo} tiene los puntos descuadrados`);
  }
});

test('los partidos jugados son la suma de ganados, empatados y perdidos', () => {
  for (const f of POSICIONES_LIGA) {
    assert.equal(f.pj, f.pg + f.pe + f.pp, `${f.equipo} tiene los partidos descuadrados`);
  }
});

test('la diferencia de gol es goles a favor menos goles en contra', () => {
  for (const f of POSICIONES_LIGA) {
    assert.equal(f.dg, f.gf - f.gc, `${f.equipo} tiene la diferencia mal calculada`);
  }
});

test('todo gol a favor de alguien es gol en contra de otro', () => {
  const favor = POSICIONES_LIGA.reduce((s, f) => s + f.gf, 0);
  const contra = POSICIONES_LIGA.reduce((s, f) => s + f.gc, 0);
  assert.equal(favor, contra);
});

test('los partidos programados no suman a la tabla', () => {
  const tabla = calcularPosiciones(
    [
      partido('jugado', 'pomada-alfa', 'los-pibes', 3, 0),
      { ...partido('futuro', 'pomada-alfa', 'la-banda-cruzada', 9, 0), estado: 'programado' },
    ],
    tarjetas(),
  );

  const pomada = tabla.find((f) => f.equipo === 'pomada-alfa');
  assert.equal(pomada.pj, 1, 'solo cuenta el partido ya jugado');
  assert.equal(pomada.gf, 3);
});

test('la tabla de un grupo no cuenta partidos contra clubes de fuera', () => {
  const tabla = calcularPosiciones(
    [partido('cruzado', 'pomada-alfa', 'tp-fc', 3, 0)],
    tarjetas(),
    GRUPOS.B,
  );
  assert.equal(tabla.length, 4);
  assert.equal(tabla.find((f) => f.equipo === 'pomada-alfa').pj, 0);
});

test('el fixture tiene 12 partidos: 3 fechas de 4', () => {
  assert.equal(PARTIDOS_LIGA.length, 12);
  assert.equal(TOTAL_JORNADAS, 3);
  for (let j = 1; j <= TOTAL_JORNADAS; j += 1) {
    const dela = PARTIDOS_LIGA.filter((p) => p.jornada === j);
    assert.equal(dela.length, 4, `la fecha ${j} no tiene 4 partidos`);
  }
});

test('todo partido es entre dos clubes del mismo grupo', () => {
  for (const p of PARTIDOS_LIGA) {
    const g = grupoDePartido(p);
    assert.ok(g, `${p.id}: ${p.local} no tiene grupo`);
    assert.ok(GRUPOS[g].includes(p.visitante), `${p.id} cruza grupos`);
  }
});

test('dentro de su grupo, cada club juega una sola vez contra cada rival', () => {
  const vistos = new Set();
  for (const p of PARTIDOS_LIGA) {
    const par = [p.local, p.visitante].sort().join(' vs ');
    assert.ok(!vistos.has(par), `${par} aparece dos veces en el fixture`);
    vistos.add(par);
  }
  assert.equal(vistos.size, 12, 'seis cruces por grupo');

  for (const e of EQUIPOS) {
    const suyos = PARTIDOS_LIGA.filter((p) => p.local === e.slug || p.visitante === e.slug);
    assert.equal(suyos.length, 3, `${e.slug} no juega 3 partidos`);
    const fechas = new Set(suyos.map((p) => p.jornada));
    assert.equal(fechas.size, 3, `${e.slug} juega dos veces la misma fecha`);
  }
});

test('el respaldo está al día en la Fecha 1', () => {
  for (const p of PARTIDOS_LIGA) {
    const esperado = p.jornada <= 1 ? 'jugado' : 'programado';
    assert.equal(p.estado, esperado, `el partido ${p.id} debería estar ${esperado}`);
  }
  for (const f of POSICIONES_LIGA) {
    assert.equal(f.pj, 1, `${f.equipo} debería llevar 1 partido jugado`);
  }
});

/**
 * La tabla de la organización tras la Fecha 1, fila por fila. Si el respaldo
 * o el desempate dejan de reproducirla, el sitio publicaría otra cosa que el
 * documento oficial.
 */
test('el respaldo reproduce la tabla oficial de la Fecha 1', () => {
  const resumen = (t) => t.filas.map((f) => [f.equipo, f.pts, f.gf, f.gc, f.dg, f.ta, f.tr]);
  const [a, b] = posicionesPorGrupo(PARTIDOS_LIGA, DISCIPLINA);
  assert.deepEqual(resumen(a), [
    ['tp-fc', 3, 3, 1, 2, 1, 0],
    ['cucuta-10-fc', 3, 6, 5, 1, 4, 0],
    ['yonotomo-fc', 0, 5, 6, -1, 1, 0],
    ['the-originals', 0, 1, 3, -2, 2, 0],
  ]);
  assert.deepEqual(resumen(b), [
    ['pomada-alfa', 3, 10, 4, 6, 1, 0],
    ['la-banda-cruzada', 3, 6, 1, 5, 2, 1],
    ['isotopos-portal-1', 0, 4, 10, -6, 0, 0],
    ['los-pibes', 0, 1, 6, -5, 1, 1],
  ]);
});
