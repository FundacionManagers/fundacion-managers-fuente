/**
 * La fase final y el relevo del "próximo compromiso".
 *
 * Todo lo que anunciaba lo que viene —la tarjeta del Calendario, la del
 * Resumen y el punto de aviso de la pestaña— miraba solo la fase de grupos.
 * En la 4ª, al jugarse la última fecha, esa búsqueda habría devuelto vacío y
 * las tres cosas habrían desaparecido de golpe, justo en la semana previa a
 * la fase final. Estas pruebas simulan ese día para que no vuelva a pasar.
 *
 * Desde la 5ª hay dos copas, y cada ronda se juega en las dos. Las pruebas de
 * aquí fijan también que una copa no se cuele en el camino de la otra.
 */

const test = require('node:test');
const assert = require('node:assert/strict');

const {
  CALENDARIO_FASE_FINAL,
  COPAS,
  CRUCES_POR_FASE,
  FECHA_FASE_FINAL,
  PARTIDOS_LIGA,
  caminoFaseFinal,
  fechaLargaDe,
  podioDeEdicion,
  proximoCompromiso,
} = require('../.test-build/lib/liga.js');

/** Un partido de eliminatoria de mentira, para simular lo que carga el panel. */
function cruce(fase, id, extra = {}) {
  return {
    id,
    fase,
    copa: 'oro',
    jornada: 0,
    fecha: '11/11/2026',
    hora: '20:00',
    local: 'tp-fc',
    visitante: 'la-banda-cruzada',
    golesLocal: null,
    golesVisitante: null,
    penalesLocal: null,
    penalesVisitante: null,
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

test('la fase final tiene las tres rondas anunciadas, sin cuartos', () => {
  assert.deepEqual(
    CALENDARIO_FASE_FINAL.map((r) => [r.fase, r.fecha]),
    [
      ['semifinal', '11/11/2026'],
      ['tercer-puesto', '22/11/2026'],
      ['final', '22/11/2026'],
    ],
  );
});

test('las semifinales van en dos noches, y el rótulo lo dice', () => {
  const semis = CALENDARIO_FASE_FINAL.find((r) => r.fase === 'semifinal');
  assert.match(semis.etiqueta, /Miércoles 11 y jueves 12 de noviembre/);
});

test('las fechas caen en los días que anunció la organización', () => {
  assert.match(fechaLargaDe('11/11/2026'), /^Miércoles 11 de noviembre 2026$/);
  assert.match(fechaLargaDe('22/11/2026'), /^Domingo 22 de noviembre 2026$/);
});

test('la fecha de arranque no se escribe a mano: sale de la primera ronda', () => {
  assert.equal(FECHA_FASE_FINAL, CALENDARIO_FASE_FINAL[0].fecha);
});

test('hay dos copas, y la Oro es la de los dos primeros', () => {
  assert.deepEqual(
    COPAS.map((c) => [c.copa, [...c.puestos]]),
    [
      ['oro', [1, 2]],
      ['plata', [3, 4]],
    ],
  );
});

test('mientras queden fechas de grupos, lo próximo es una fecha de grupos', () => {
  const c = proximoCompromiso(PARTIDOS_LIGA, []);
  assert.equal(c.tipo, 'jornada');
  assert.equal(c.titulo, 'Fecha 2');
  assert.equal(c.etiqueta, 'Domingo 25 de octubre 2026');
  assert.equal(c.partidos.length, 4, 'la tarjeta muestra los cuatro partidos de esa fecha');
});

test('al terminar la fase de grupos, el relevo lo toman las semifinales', () => {
  const c = proximoCompromiso(gruposTerminados(), []);
  assert.ok(c, 'sin esto, la tarjeta y el punto de aviso desaparecerían el 8 de noviembre');
  assert.equal(c.tipo, 'ronda');
  assert.equal(c.titulo, 'Semifinales');
  assert.match(c.etiqueta, /Miércoles 11 y jueves 12/, 'son dos noches: no basta con la primera');
  assert.equal(c.partidos.length, 0, 'no hay partidos cargados: no se inventa ninguno');
  assert.match(c.iso, /^2026-11-11T/);
});

test('cerrada la fase de grupos, la tarjeta ya trae los cruces de las dos copas', () => {
  const c = proximoCompromiso(gruposTerminados(), []);
  assert.equal(c.cruces.length, 4, 'dos semifinales por copa');
  assert.deepEqual(
    c.cruces.map((x) => [x.copa, x.etiqueta]),
    [
      ['oro', '1º A vs 2º B'],
      ['oro', '1º B vs 2º A'],
      ['plata', '3º A vs 4º B'],
      ['plata', '3º B vs 4º A'],
    ],
  );
  assert.ok(
    c.cruces.every((x) => x.local && x.visitante),
    'cada cruce tiene sus dos clubes: si no, no habría que mostrarlo',
  );
});

test('con fechas de grupos por jugar, la tarjeta no adelanta ningún cruce', () => {
  const c = proximoCompromiso(PARTIDOS_LIGA, []);
  assert.equal(c.cruces, undefined, 'la tabla todavía puede cambiar; no se promete nada');
});

test('cuando se cargan los cruces reales, mandan su fecha y su hora', () => {
  const c = proximoCompromiso(gruposTerminados(), [cruce('semifinal', 'sf1')]);
  assert.equal(c.tipo, 'ronda');
  assert.equal(c.titulo, 'Semifinales');
  assert.equal(c.partidos.length, 1);
  assert.equal(c.partidos[0].copa, 'oro', 'el partido llega con su copa para poder rotularlo');
  assert.equal(c.iso, '2026-11-11T20:00:00-05:00', 'la hora sale del partido, no del calendario');
});

test('jugada una ronda en las dos copas, el relevo pasa a la siguiente', () => {
  const jugado = { estado: 'jugado', golesLocal: 2, golesVisitante: 0 };
  const semis = [
    cruce('semifinal', 'o1', jugado),
    cruce('semifinal', 'o2', jugado),
    cruce('semifinal', 'p1', { ...jugado, copa: 'plata' }),
    cruce('semifinal', 'p2', { ...jugado, copa: 'plata' }),
  ];
  const c = proximoCompromiso(gruposTerminados(), semis);
  // El tercer puesto y la final caen el mismo domingo: se anuncia la final.
  assert.equal(c.titulo, 'Gran Final');
  assert.equal(c.etiqueta, 'Domingo 22 de noviembre 2026');
});

test('si a la Plata le falta una semifinal, la ronda sigue pendiente', () => {
  const jugado = { estado: 'jugado', golesLocal: 2, golesVisitante: 0 };
  const semis = [
    cruce('semifinal', 'o1', jugado),
    cruce('semifinal', 'o2', jugado),
    cruce('semifinal', 'p1', { copa: 'plata' }),
  ];
  assert.equal(proximoCompromiso(gruposTerminados(), semis).titulo, 'Semifinales');
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
  assert.equal(a.titulo, 'Semifinales');
});

/**
 * El camino a la final, que es lo que dibuja la página de La llave. Una vez
 * por copa.
 */
test('sin nada cargado, el camino de cada copa ya tiene sus tres rondas', () => {
  for (const { copa } of COPAS) {
    const camino = caminoFaseFinal([], copa);
    assert.deepEqual(
      camino.map((p) => [p.fase, p.estado, p.fecha]),
      [
        ['semifinal', 'pendiente', '11/11/2026'],
        ['tercer-puesto', 'pendiente', '22/11/2026'],
        ['final', 'pendiente', '22/11/2026'],
      ],
    );
    assert.ok(camino.every((p) => p.partidos.length === 0));
  }
});

test('el camino de una copa no recoge los cruces de la otra', () => {
  const todos = [cruce('semifinal', 'o1'), cruce('semifinal', 'p1', { copa: 'plata' })];
  assert.deepEqual(
    caminoFaseFinal(todos, 'oro')[0].partidos.map((p) => p.id),
    ['o1'],
  );
  assert.deepEqual(
    caminoFaseFinal(todos, 'plata')[0].partidos.map((p) => p.id),
    ['p1'],
  );
});

test('un cruce sin copa es de la llave única, que cuenta como la Oro', () => {
  const viejo = cruce('final', 'f4', { copa: null });
  assert.equal(caminoFaseFinal([viejo], 'oro').find((p) => p.fase === 'final').partidos.length, 1);
  assert.equal(
    caminoFaseFinal([viejo], 'plata').find((p) => p.fase === 'final').partidos.length,
    0,
  );
});

test('las casillas en blanco de cada ronda son las que corresponden', () => {
  assert.equal(CRUCES_POR_FASE.semifinal, 2);
  assert.equal(CRUCES_POR_FASE['tercer-puesto'], 1);
  assert.equal(CRUCES_POR_FASE.final, 1);
});

test('una ronda a medio jugar queda en juego, no jugada', () => {
  const camino = caminoFaseFinal([
    cruce('semifinal', 'sf1', { estado: 'jugado', golesLocal: 2, golesVisitante: 0 }),
    cruce('semifinal', 'sf2'),
  ]);
  assert.equal(camino[0].estado, 'en-juego');
  assert.equal(camino[1].estado, 'pendiente');
});

test('con todos sus partidos jugados, la ronda queda jugada', () => {
  const jugado = { estado: 'jugado', golesLocal: 2, golesVisitante: 0 };
  const camino = caminoFaseFinal([
    cruce('semifinal', 'sf1', jugado),
    cruce('semifinal', 'sf2', jugado),
  ]);
  assert.equal(camino[0].estado, 'jugada');
});

test('la fecha del partido cargado manda sobre la anunciada', () => {
  const camino = caminoFaseFinal([
    cruce('semifinal', 'sf1', { fecha: '12/11/2026' }),
    cruce('semifinal', 'sf2', { fecha: '12/11/2026' }),
  ]);
  assert.equal(camino[0].fecha, '12/11/2026');
  assert.equal(camino[0].etiqueta, undefined, 'las dos el jueves: el rótulo de dos noches sobra');
  assert.equal(camino[2].fecha, '22/11/2026', 'las rondas sin cargar conservan lo anunciado');
});

test('con todo jugado y cargado en las dos copas, ya no hay próximo compromiso', () => {
  const todas = COPAS.flatMap(({ copa }) =>
    CALENDARIO_FASE_FINAL.map((r, i) =>
      cruce(r.fase, `${copa}${i}`, {
        copa,
        fecha: r.fecha,
        golesLocal: 1,
        golesVisitante: 0,
        estado: 'jugado',
      }),
    ),
  );
  assert.equal(proximoCompromiso(gruposTerminados(), todas), null);
});

test('el campeón del torneo es el de la Copa Oro, no el de la Plata', () => {
  const jugado = { estado: 'jugado', golesLocal: 1, golesVisitante: 0 };
  const finales = [
    cruce('final', 'fp', {
      ...jugado,
      copa: 'plata',
      local: 'los-pibes',
      visitante: 'yonotomo-fc',
    }),
    cruce('final', 'fo', { ...jugado, local: 'tp-fc', visitante: 'pomada-alfa' }),
  ];
  assert.equal(podioDeEdicion(finales).campeon, 'tp-fc');
  assert.equal(podioDeEdicion(finales, 'plata').campeon, 'los-pibes');
});

/**
 * Definición por penales.
 *
 * En la liga un empate es un resultado y reparte un punto. En eliminatoria
 * alguien tiene que pasar: hasta que existió la tanda, un 1-1 en cuartos
 * dejaba la llave sin ganador resaltado y al sitio sin poder decir quién
 * seguía. `ladoGanador` es el único sitio donde se decide, para que la
 * Llave y el Calendario no puedan contradecirse.
 */
const { ladoGanador } = require('../.test-build/lib/liga.js');

test('en los 90 gana quien hizo más goles, y la tanda no pinta nada', () => {
  assert.equal(ladoGanador(2, 1), 'local');
  assert.equal(ladoGanador(0, 3), 'visitante');
  // Aunque llegara una tanda por error, el resultado manda.
  assert.equal(ladoGanador(2, 1, 3, 4), 'local');
});

test('un empate lo resuelve la tanda de penales', () => {
  assert.equal(ladoGanador(1, 1, 4, 2), 'local');
  assert.equal(ladoGanador(1, 1, 2, 4), 'visitante');
  assert.equal(ladoGanador(0, 0, 5, 3), 'local');
});

test('sin tanda, un empate no tiene ganador: la llave no debe inventarlo', () => {
  assert.equal(ladoGanador(1, 1), null);
  assert.equal(ladoGanador(1, 1, 3, null), null);
  assert.equal(ladoGanador(1, 1, 3, 3), null);
});

test('un partido sin jugar no tiene ganador', () => {
  assert.equal(ladoGanador(null, null), null);
  assert.equal(ladoGanador(2, null), null);
});
