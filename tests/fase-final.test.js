/**
 * La fase final y el relevo del "próximo compromiso".
 *
 * Todo lo que anunciaba lo que viene —la tarjeta del Calendario, la del
 * Resumen y el punto de aviso de la pestaña— miraba solo la fase de grupos.
 * El 6 de septiembre, al jugarse la Fecha 7, esa búsqueda devolvería vacío y
 * las tres cosas desaparecerían de golpe, justo en la semana previa a
 * cuartos. Estas pruebas simulan ese día para que no vuelva a pasar.
 */

const test = require('node:test');
const assert = require('node:assert/strict');

const {
  CALENDARIO_FASE_FINAL,
  FECHA_FASE_FINAL,
  PARTIDOS_LIGA,
  fechaLargaDe,
  proximoCompromiso,
} = require('../.test-build/lib/liga.js');

/** El fixture con todas las fechas de grupos ya jugadas. */
function gruposTerminados() {
  return PARTIDOS_LIGA.map((p) => ({
    ...p,
    estado: 'jugado',
    golesLocal: p.golesLocal ?? 0,
    golesVisitante: p.golesVisitante ?? 0,
  }));
}

test('la fase final tiene las tres rondas anunciadas', () => {
  assert.deepEqual(
    CALENDARIO_FASE_FINAL.map((r) => [r.fase, r.fecha]),
    [
      ['cuartos', '13/09/2026'],
      ['semifinal', '20/09/2026'],
      ['final', '26/09/2026'],
    ],
  );
});

test('las fechas caen en los días que anunció la organización', () => {
  assert.match(fechaLargaDe('13/09/2026'), /^Domingo 13 de septiembre 2026$/);
  assert.match(fechaLargaDe('20/09/2026'), /^Domingo 20 de septiembre 2026$/);
  assert.match(fechaLargaDe('26/09/2026'), /^Sábado 26 de septiembre 2026$/);
});

test('la fecha de arranque no se escribe a mano: sale de la primera ronda', () => {
  assert.equal(FECHA_FASE_FINAL, CALENDARIO_FASE_FINAL[0].fecha);
});

test('mientras queden fechas de grupos, lo próximo es una fecha de grupos', () => {
  const c = proximoCompromiso(PARTIDOS_LIGA, []);
  assert.equal(c.tipo, 'jornada');
  assert.equal(c.titulo, 'Fecha 6');
  assert.equal(c.partidos.length, 4, 'la tarjeta muestra los cuatro cruces de esa fecha');
});

test('al terminar la fase de grupos, el relevo lo toma cuartos de final', () => {
  const c = proximoCompromiso(gruposTerminados(), []);
  assert.ok(c, 'sin esto, la tarjeta y el punto de aviso desaparecerían el 6 de septiembre');
  assert.equal(c.tipo, 'ronda');
  assert.equal(c.titulo, 'Cuartos de final');
  assert.equal(c.etiqueta, 'Domingo 13 de septiembre 2026');
  assert.equal(c.partidos.length, 0, 'todavía no hay cruces: la tarjeta lo dice, no inventa');
  assert.match(c.iso, /^2026-09-13T/);
});

test('cuando se cargan los cruces reales, mandan su fecha y su hora', () => {
  const cuartos = [
    {
      id: 'cf1',
      fase: 'cuartos',
      jornada: 8,
      fecha: '13/09/2026',
      hora: '08:00',
      local: 'pomada-alfa',
      visitante: 'la-banda-cruzada',
      golesLocal: null,
      golesVisitante: null,
      estado: 'programado',
    },
  ];
  const c = proximoCompromiso(gruposTerminados(), cuartos);
  assert.equal(c.tipo, 'ronda');
  assert.equal(c.titulo, 'Cuartos de final');
  assert.equal(c.partidos.length, 1);
  assert.equal(c.iso, '2026-09-13T08:00:00-05:00', 'la hora sale del partido, no del calendario');
});

test('jugada una ronda, el relevo pasa a la siguiente', () => {
  const cuartosJugados = [
    {
      id: 'cf1',
      fase: 'cuartos',
      jornada: 8,
      fecha: '13/09/2026',
      hora: '08:00',
      local: 'pomada-alfa',
      visitante: 'la-banda-cruzada',
      golesLocal: 2,
      golesVisitante: 0,
      estado: 'jugado',
    },
  ];
  const c = proximoCompromiso(gruposTerminados(), cuartosJugados);
  assert.equal(c.titulo, 'Semifinales');
  assert.equal(c.etiqueta, 'Domingo 20 de septiembre 2026');
});

/**
 * Qué ronda viene se decide por los datos, no por el reloj: es la primera
 * que no tiene todos sus partidos jugados. Si dependiera de "hoy", el
 * resultado quedaría congelado en la fecha en que se compiló el sitio.
 */
test('la ronda pendiente no depende de la fecha de compilación', () => {
  const a = proximoCompromiso(gruposTerminados(), []);
  const b = proximoCompromiso(gruposTerminados(), []);
  assert.deepEqual(a, b);
  assert.equal(a.titulo, 'Cuartos de final');
});

test('con todo jugado y cargado, ya no hay próximo compromiso', () => {
  const todas = CALENDARIO_FASE_FINAL.map((r, i) => ({
    id: `ff${i}`,
    fase: r.fase,
    jornada: 8 + i,
    fecha: r.fecha,
    hora: '10:00',
    local: 'pomada-alfa',
    visitante: 'the-originals',
    golesLocal: 1,
    golesVisitante: 0,
    estado: 'jugado',
  }));
  assert.equal(proximoCompromiso(gruposTerminados(), todas), null);
});
