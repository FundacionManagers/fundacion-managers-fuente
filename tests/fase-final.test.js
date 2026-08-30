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
  CRUCES_POR_FASE,
  FECHA_FASE_FINAL,
  PARTIDOS_LIGA,
  caminoFaseFinal,
  fechaLargaDe,
  proximoCompromiso,
} = require('../.test-build/lib/liga.js');

/** Un partido de eliminatoria de mentira, para simular lo que carga el panel. */
function cruce(fase, id, extra = {}) {
  return {
    id,
    fase,
    jornada: 8,
    fecha: '13/09/2026',
    hora: '08:00',
    local: 'pomada-alfa',
    visitante: 'la-banda-cruzada',
    golesLocal: null,
    golesVisitante: null,
    estado: 'programado',
    ...extra,
  };
}

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

/**
 * El camino a la final, que es lo que dibuja la página de La llave.
 *
 * La página mostraba solo los cuatro cruces de cuartos y, en cuanto la
 * organización cargara los partidos reales, cambiaba entera: se quedaba sin
 * encabezado, sin fechas y sin explicación, justo el día de más visitas.
 * Estas pruebas fijan que las tres rondas existan siempre y que su estado
 * salga de los datos.
 */
test('sin nada cargado, el camino ya tiene sus tres rondas', () => {
  const camino = caminoFaseFinal([]);
  assert.deepEqual(
    camino.map((p) => [p.fase, p.estado, p.fecha]),
    [
      ['cuartos', 'pendiente', '13/09/2026'],
      ['semifinal', 'pendiente', '20/09/2026'],
      ['final', 'pendiente', '26/09/2026'],
    ],
  );
  assert.ok(
    camino.every((p) => p.partidos.length === 0),
    'sin partidos cargados no se inventa ninguno',
  );
});

test('las casillas en blanco de cada ronda son las que corresponden', () => {
  assert.equal(CRUCES_POR_FASE.cuartos, 4);
  assert.equal(CRUCES_POR_FASE.semifinal, 2);
  assert.equal(CRUCES_POR_FASE.final, 1);
});

test('una ronda a medio jugar queda en juego, no jugada', () => {
  const camino = caminoFaseFinal([
    cruce('cuartos', 'cf1', { estado: 'jugado', golesLocal: 2, golesVisitante: 0 }),
    cruce('cuartos', 'cf2'),
  ]);
  assert.equal(camino[0].estado, 'en-juego');
  assert.equal(camino[1].estado, 'pendiente', 'las semifinales siguen sin jugarse');
  assert.equal(camino[2].estado, 'pendiente');
});

test('con todos sus partidos jugados, la ronda queda jugada', () => {
  const jugado = { estado: 'jugado', golesLocal: 2, golesVisitante: 0 };
  const camino = caminoFaseFinal([
    cruce('cuartos', 'cf1', jugado),
    cruce('cuartos', 'cf2', jugado),
  ]);
  assert.equal(camino[0].estado, 'jugada');
});

test('la fecha del partido cargado manda sobre la anunciada', () => {
  const camino = caminoFaseFinal([cruce('cuartos', 'cf1', { fecha: '14/09/2026' })]);
  assert.equal(camino[0].fecha, '14/09/2026');
  assert.equal(camino[1].fecha, '20/09/2026', 'las rondas sin cargar conservan lo anunciado');
});

/**
 * Si la organización decide jugar un tercer puesto —hoy no está anunciado—,
 * el partido no puede quedar huérfano: entra en el camino, en su orden y con
 * la fecha que traiga el propio partido, sin que haya que tocar el código.
 */
test('una ronda no anunciada entra igual, y en su orden', () => {
  const camino = caminoFaseFinal([cruce('tercer-puesto', 'tp1', { fecha: '26/09/2026' })]);
  assert.deepEqual(
    camino.map((p) => p.fase),
    ['cuartos', 'semifinal', 'tercer-puesto', 'final'],
  );
  const tercero = camino.find((p) => p.fase === 'tercer-puesto');
  assert.equal(tercero.fecha, '26/09/2026');
  assert.equal(tercero.titulo, 'Tercer puesto');
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
