import { Trophy } from 'lucide-react';
import { TeamCrest } from '@/components/torneo/TeamCrest';
import {
  CRUCES_POR_FASE,
  fechaLargaDe,
  type CruceCuartos,
  type EstadoRonda,
  type FaseFinal,
  type ParadaFinal,
} from '@/lib/liga';
import { getEquipo } from '@/lib/torneo-data';
import { cn } from '@/lib/utils';

/** Un lado de un cruce: quién es, de qué puesto viene y cuánto hizo. */
interface LadoLlave {
  slug: string | null;
  /** Puesto en la tabla de la fase de grupos. Null si todavía no se sabe. */
  siembra: number | null;
  goles: number | null;
  /**
   * De dónde saldrá quien ocupe esta casilla: «Ganador partido 1», «Perdedor
   * SF2». Solo lo llevan las casillas todavía vacías, y es lo que convierte
   * cuatro «Por definir» en una llave que se entiende.
   */
  procedencia?: string;
}

interface CeldaLlave {
  id: string;
  /** Rótulo del cruce: '1º vs 8º' mientras es proyección, la fecha y hora cuando ya está programado. */
  etiqueta: string | null;
  lados: [LadoLlave, LadoLlave];
  jugado: boolean;
}

/**
 * La paleta del cuadro oficial que reparte la organización, muestreada del
 * propio archivo: verde de fondo, franja dorada sobre cada cruce programado,
 * fila blanca para los clubes y menta para lo que aún está por definir.
 *
 * El dorado del mapa (#D4A017) y el de la marca (#D4A437) son el mismo a
 * efectos prácticos, así que se usa el token de la marca y no una copia.
 */
const VERDE = '#11482D';
const VERDE_HONDO = '#0E3D25';
/**
 * El verde va translúcido para que la fotografía del fondo siga leyéndose:
 * asi funcionan los paneles del resto del sitio y el cuadro no tiene por que
 * ser la excepción.
 *
 * 0.86 no es un numero al azar. Aun suponiendo lo peor —que detras hubiera
 * foto blanca pura— el texto blanco sobre esta mezcla da 7,04:1 de contraste,
 * que es AAA. Con la foto real, un estadio de noche, el margen es mayor. Bajar
 * de 0.75 dejaria el encabezado por debajo del minimo accesible.
 *
 * Las casillas —blanca, menta y dorada— son opacas, asi que su legibilidad no
 * depende de esto. Eso es lo que permite abrir el panel sin repetir el
 * problema de cuando todo era translucido y los cruces por definir se perdian
 * sobre el cesped iluminado.
 */
const PANEL = `linear-gradient(160deg, ${conAlfa(VERDE, 0.86)} 0%, ${conAlfa(VERDE_HONDO, 0.9)} 100%)`;

/** '#11482D' + 0.86 → 'rgb(17 72 45 / 0.86)'. */
function conAlfa(hex: string, alfa: number): string {
  const n = parseInt(hex.slice(1), 16);
  return `rgb(${(n >> 16) & 255} ${(n >> 8) & 255} ${n & 255} / ${alfa})`;
}
const MENTA = '#E7F3EC';
const MENTA_BORDE = '#CBE0D3';
const MENTA_TEXTO = '#3F6B52';

/** Cómo se pinta una casilla según lo que contiene. */
type Tono = 'blanco' | 'menta' | 'dorado';

const LADO_VACIO: LadoLlave = { slug: null, siembra: null, goles: null };

/**
 * De dónde sale cada casilla vacía, según el cuadro oficial de la fase final:
 * los ganadores de los partidos 1 y 2 forman la primera semifinal y los de
 * los partidos 3 y 4 la segunda; la final la juegan los ganadores de ambas y
 * el tercer puesto, los perdedores.
 *
 * Los partidos de cuartos se numeran por su hora de juego, que es el orden en
 * que aparecen en esta misma página.
 */
function procedenciasDe(fase: FaseFinal, i: number): [LadoLlave, LadoLlave] {
  const de = (procedencia: string): LadoLlave => ({ ...LADO_VACIO, procedencia });
  if (fase === 'semifinal') return [de(`Ganador partido ${i * 2 + 1}`), de(`Ganador partido ${i * 2 + 2}`)];
  if (fase === 'final') return [de('Ganador semifinal 1'), de('Ganador semifinal 2')];
  if (fase === 'tercer-puesto') return [de('Perdedor semifinal 1'), de('Perdedor semifinal 2')];
  return [LADO_VACIO, LADO_VACIO];
}

/**
 * Qué decir bajo cada ronda.
 *
 * Esta nota decía que el cruce de semifinales «se define al terminar los
 * cuartos» porque la organización aún no lo había fijado. Ya lo fijó: el
 * cuadro oficial empareja a los ganadores de los partidos 1 y 2 en una
 * semifinal, y a los de los 3 y 4 en la otra. Sostener lo contrario mientras
 * las casillas dicen de dónde sale cada uno sería contradecirse en la misma
 * pantalla.
 */
const NOTA_FASE: Partial<Record<FaseFinal, string>> = {
  semifinal: 'Ganadores de los partidos 1 y 2 en una; 3 y 4 en la otra.',
  final: 'La disputan los ganadores de las semifinales.',
  'tercer-puesto': 'La juegan los perdedores de las semifinales.',
};

// Sobre el verde del cuadro, no sobre el fondo oscuro del resto del sitio.
const CHIP: Record<EstadoRonda, { texto: string; clase: string }> = {
  jugada: { texto: 'Jugada', clase: 'border-gold/70 bg-gold/15 text-gold' },
  'en-juego': { texto: 'En juego', clase: 'border-gold bg-gold text-carbon' },
  pendiente: { texto: 'Por jugar', clase: 'border-white/30 text-white/70' },
};

/**
 * Una línea del cruce: escudo, nombre y marcador.
 *
 * Los dos equipos van uno sobre otro, no lado a lado. Así cada nombre tiene
 * el ancho entero de la columna y "La Banda Cruzada FC" no queda cortado en
 * el móvil, que es justo lo que pasaba cuando el cruce se pintaba horizontal.
 */
function Fila({
  lado,
  ganador,
  jugado,
  altoFijo = false,
  tono,
}: {
  lado: LadoLlave;
  ganador: boolean;
  jugado: boolean;
  /**
   * Reserva a cada club la altura de dos líneas, tenga una o dos. En el cuadro
   * con llaves todas las casillas tienen que medir lo mismo: si «Los Pibes del
   * Barrio» ocupa dos líneas y «Useches» una, los cruces dejan de estar donde
   * apuntan las líneas que los unen.
   */
  altoFijo?: boolean;
  tono: Tono;
}) {
  const eq = lado.slug ? getEquipo(lado.slug) : undefined;
  const pendiente = !eq;

  return (
    <div className={cn('flex items-center gap-2.5', altoFijo && 'h-11')}>
      <span
        className="w-5 shrink-0 font-mono text-[10px] uppercase tracking-widest"
        style={{ color: tono === 'dorado' ? 'rgb(15 20 25 / 0.5)' : `${VERDE}70` }}
      >
        {lado.siembra ? `${lado.siembra}º` : '·'}
      </span>
      {/* El marcador de escudo vacío es una placa clara con un «?». Sobre el
          dorado de la final y sobre la menta de lo que falta por jugar queda
          deslavado y no aporta nada: ahí lo que se lee es de dónde sale quien
          ocupará la casilla. Cuando ya haya equipo, su escudo sí se pinta. */}
      {pendiente ? null : <TeamCrest slug={lado.slug} size={28} />}
      {/* Sin `truncate`: con el recorte, «Los Pibes del Barrio» y «La Banda
          Cruzada FC» —los dos nombres mas largos de la edicion— se leian
          cortados justo en la pagina que explica quien juega contra quien.
          Prefiere dos lineas antes que puntos suspensivos, que es lo mismo
          que ya se decidio para la llave del Palmares. */}
      <span
        className={cn(
          'min-w-0 flex-1 text-sm font-semibold leading-tight',
          pendiente && 'italic',
        )}
        style={{ color: pendiente && tono === 'menta' ? MENTA_TEXTO : '#0F1419' }}
      >
        {eq?.nombre ?? lado.procedencia ?? 'Por definir'}
      </span>
      {jugado ? (
        <span
          className={cn('shrink-0 font-sport text-xl leading-none')}
          style={{ color: ganador ? VERDE : `${VERDE}99` }}
        >
          {lado.goles}
        </span>
      ) : null}
    </div>
  );
}

function Celda({
  celda,
  altoFijo = false,
  destacada = false,
  provisional = false,
}: {
  celda: CeldaLlave;
  altoFijo?: boolean;
  /**
   * La fase de grupos aún no ha cerrado: estos cruces salen de una tabla que
   * todavía puede moverse. Se dibujan con borde discontinuo para que no se
   * lean como definitivos.
   */
  provisional?: boolean;
  /**
   * La casilla del título. En el cuadro, la final se veía igual que cualquier
   * otra ronda por jugar: mismo borde, mismo gris. Es el sitio al que lleva
   * todo el dibujo y no se distinguía en nada del resto.
   */
  destacada?: boolean;
}) {
  const [a, b] = celda.lados;
  const ganaA = celda.jugado && a.goles != null && b.goles != null && a.goles > b.goles;
  const ganaB = celda.jugado && a.goles != null && b.goles != null && b.goles > a.goles;
  const vacia = !a.slug && !b.slug;
  const tono: Tono = destacada ? 'dorado' : vacia ? 'menta' : 'blanco';

  const fondo =
    tono === 'dorado' ? '#D4A437' : tono === 'menta' ? MENTA : '#FFFFFF';
  const borde =
    tono === 'dorado' ? '#B88A26' : tono === 'menta' ? MENTA_BORDE : '#D8E6DD';

  return (
    <div
      className={cn(
        'w-full overflow-hidden rounded-lg border',
        provisional && !destacada && 'border-dashed',
        tono === 'dorado' && 'shadow-gold',
      )}
      style={{ background: fondo, borderColor: borde }}
    >
      {/* La franja superior: dorada sobre los cruces ya programados, como en el
          cuadro oficial. En la final el rótulo va dentro de la propia casilla,
          que ya es dorada entera. */}
      {destacada ? (
        <p className="flex items-center gap-1.5 px-3 pb-1 pt-2.5 font-bufon text-[10px] font-bold uppercase tracking-[0.2em] text-carbon">
          <Trophy size={13} aria-hidden />
          Gran Final
        </p>
      ) : celda.etiqueta ? (
        <p
          className={cn(
            'px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em]',
            altoFijo && 'truncate',
          )}
          style={
            tono === 'menta'
              ? { color: `${MENTA_TEXTO}B0` }
              : { background: '#D4A437', color: '#FFFFFF' }
          }
        >
          {celda.etiqueta}
        </p>
      ) : altoFijo ? (
        <p className="h-[26px]" aria-hidden />
      ) : null}

      <div
        className={cn('px-3 pb-2.5 pt-1.5', !altoFijo && 'space-y-1.5')}
        style={{ borderTop: tono === 'blanco' ? 'none' : undefined }}
      >
        <Fila lado={a} ganador={ganaA} jugado={celda.jugado} altoFijo={altoFijo} tono={tono} />
        <div style={{ borderTop: `1px solid ${tono === 'dorado' ? '#00000022' : `${MENTA_BORDE}` }` }} />
        <Fila lado={b} ganador={ganaB} jugado={celda.jugado} altoFijo={altoFijo} tono={tono} />
      </div>
    </div>
  );
}

/**
 * La llave completa: cuartos, semifinales y final, una columna por ronda.
 *
 * Se dibujan siempre las tres, aunque estén vacías. La página se llama "La
 * llave" y antes solo mostraba los cuatro cruces de cuartos, así que no se
 * veía el camino ni dónde desemboca. Las casillas vacías dicen "Por definir",
 * que es información cierta, y se van llenando solas a medida que la
 * organización carga los partidos.
 */
export function LlaveArbol({
  cruces,
  camino,
  provisional,
  siembra,
}: {
  /** Cuartos proyectados desde la tabla, para cuando aún no hay partidos cargados. */
  cruces: readonly CruceCuartos[];
  camino: readonly ParadaFinal[];
  /** Faltan fechas de grupos por jugar: los cruces todavía pueden cambiar. */
  provisional: boolean;
  /** Puesto en la tabla de cada club, para etiquetar los cruces ya cargados. */
  siembra: ReadonlyMap<string, number>;
}) {
  function celdasDe(parada: ParadaFinal): CeldaLlave[] {
    // Manda siempre lo que haya cargado la organización.
    if (parada.partidos.length > 0) {
      return parada.partidos.map((p, i) => ({
        id: p.id,
        // Los cuartos van numerados porque las semifinales se refieren a ellos
        // por su número. Llegan ordenados por hora, que es como los numera el
        // cuadro oficial.
        etiqueta: [
          parada.fase === 'cuartos' ? `Partido ${i + 1}` : null,
          p.hora ? `${p.fecha} · ${p.hora}` : p.fecha,
        ]
          .filter(Boolean)
          .join('  ·  '),
        lados: [
          { slug: p.local, siembra: siembra.get(p.local) ?? null, goles: p.golesLocal },
          { slug: p.visitante, siembra: siembra.get(p.visitante) ?? null, goles: p.golesVisitante },
        ],
        jugado: p.estado === 'jugado' && p.golesLocal != null && p.golesVisitante != null,
      }));
    }

    // Sin partidos cargados, cuartos se proyecta desde la tabla.
    if (parada.fase === 'cuartos') {
      return cruces.map((c) => ({
        id: c.id,
        etiqueta: c.etiqueta,
        lados: [
          { slug: c.local, siembra: c.posicionLocal, goles: null },
          { slug: c.visitante, siembra: c.posicionVisitante, goles: null },
        ],
        jugado: false,
      }));
    }

    // El resto son casillas en blanco. No se sabe quién las ocupa, pero sí de
    // dónde va a salir, y eso es justo lo que hace legible una llave: decían
    // «Por definir» las cuatro, y nadie podía ver que el ganador del primer
    // cruce espera al del segundo. Sale del cuadro oficial de la organización.
    return Array.from({ length: CRUCES_POR_FASE[parada.fase] }, (_, i) => ({
      id: `${parada.fase}-${i + 1}`,
      etiqueta: null,
      lados: procedenciasDe(parada.fase, i),
      jugado: false,
    }));
  }

  const porFase = new Map(camino.map((p) => [p.fase, celdasDe(p)] as const));

  return (
    <>
      {/* En pantalla ancha, el cuadro con sus llaves. Debajo del breakpoint no
          se dibuja: un arbol horizontal de tres rondas no cabe en 375 px sin
          encoger los nombres hasta lo ilegible, y ahi las columnas apiladas
          dicen lo mismo mejor. */}
      <Cuadro camino={camino} porFase={porFase} provisional={provisional} />

      {/* Mismo verde que el cuadro: la seccion no puede cambiar de estetica
          segun el ancho de la pantalla. */}
      <div
        className="grid gap-8 rounded-2xl border border-white/15 p-5 backdrop-blur-[2px] sm:p-6 lg:hidden"
        style={{ background: PANEL }}
      >
        {camino.map((parada) => {
        const chip = CHIP[parada.estado];
        return (
          <section key={parada.fase}>
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-white/20 pb-3">
              <h3 className="font-sport text-2xl uppercase leading-none text-white">
                {parada.titulo}
              </h3>
              <span
                className={cn(
                  'rounded-full border px-2.5 py-0.5 font-bufon text-[10px] uppercase tracking-[0.15em]',
                  chip.clase,
                )}
              >
                {chip.texto}
              </span>
            </div>
            <p className="mt-2.5 text-xs text-white/65">
              {parada.fecha ? fechaLargaDe(parada.fecha) : 'Fecha por confirmar'}
            </p>

            <ul className="mt-4 space-y-3">
              {celdasDe(parada).map((c) => (
                <li key={c.id}>
                  <Celda celda={c} provisional={provisional} />
                </li>
              ))}
            </ul>

            {NOTA_FASE[parada.fase] ? (
              <p className="mt-3 text-[11px] leading-relaxed text-white/55">
                {NOTA_FASE[parada.fase]}
              </p>
            ) : null}
          </section>
        );
        })}
      </div>
    </>
  );
}

/** Las cinco columnas del cuadro: ronda, llave, ronda, llave, ronda. */
const COLUMNAS = 'grid-cols-[minmax(0,1fr)_3.5rem_minmax(0,1fr)_3.5rem_minmax(0,1fr)]';

/**
 * La llave que une dos cruces con el siguiente: dos brazos que salen de cada
 * uno, el tramo vertical que los junta y la salida hacia la ronda siguiente.
 *
 * Se dibuja con bordes, no con SVG, para que herede el color del tema y no
 * haya que medir nada en el navegador. Funciona porque las cuatro filas del
 * cuadro miden lo mismo: los dos cruces que entran quedan siempre al 25% y al
 * 75% de la altura que abarca esta llave, venga de cuartos o de semifinales.
 */
function Conector() {
  return (
    <div className="relative h-full w-full" aria-hidden>
      <span className="absolute left-0 top-1/4 block w-1/2 border-t border-white/60" />
      <span className="absolute left-0 top-3/4 block w-1/2 border-t border-white/60" />
      <span className="absolute left-1/2 top-1/4 block h-1/2 border-l border-white/60" />
      <span className="absolute left-1/2 top-1/2 block w-1/2 border-t border-white/60" />
    </div>
  );
}

function Cabecera({ parada }: { parada: ParadaFinal }) {
  const chip = CHIP[parada.estado];
  return (
    <div className="border-b border-white/20 pb-3">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h3 className="font-sport text-2xl uppercase leading-none text-white">{parada.titulo}</h3>
        <span
          className={cn(
            'rounded-full border px-2.5 py-0.5 font-bufon text-[10px] uppercase tracking-[0.15em]',
            chip.clase,
          )}
        >
          {chip.texto}
        </span>
      </div>
      <p className="mt-2 text-xs text-white/65">
        {parada.fecha ? fechaLargaDe(parada.fecha) : 'Fecha por confirmar'}
      </p>
    </div>
  );
}

/**
 * El cuadro de la fase final, con sus llaves dibujadas.
 *
 * Antes la pagina mostraba las rondas como columnas independientes: la
 * informacion estaba, pero no se veia el camino —quien espera a quien— que es
 * justo lo que un cuadro de eliminatoria sirve para contar.
 *
 * La altura es fija y las cuatro filas se reparten por igual. De ahi sale que
 * los conectores acierten sin medir nada: cada cruce queda centrado en su
 * fila, y su fila siempre esta en el mismo sitio.
 *
 * Si algun dia la fase final deja de ser de ocho equipos, este cuadro no
 * aplica y la pagina se queda con las columnas, que no dependen del numero de
 * cruces.
 */
function Cuadro({
  camino,
  porFase,
  provisional,
}: {
  camino: readonly ParadaFinal[];
  porFase: ReadonlyMap<FaseFinal, CeldaLlave[]>;
  provisional: boolean;
}) {
  const cuartos = porFase.get('cuartos') ?? [];
  const semis = porFase.get('semifinal') ?? [];
  const final = (porFase.get('final') ?? [])[0];
  const tercero = (porFase.get('tercer-puesto') ?? [])[0];
  const paradaDe = (f: FaseFinal) => camino.find((p) => p.fase === f);

  // El dibujo asume ocho equipos. Con cualquier otra forma se calla y deja
  // las columnas, en vez de pintar una llave que no corresponde.
  if (cuartos.length !== 4 || semis.length !== 2 || !final) return null;

  const cabeceras: [FaseFinal, string][] = [
    ['cuartos', 'col-start-1'],
    ['semifinal', 'col-start-3'],
    ['final', 'col-start-5'],
  ];

  return (
    /* Panel opaco. Las casillas iban translucidas sobre la foto de estadio del
       fondo, y sobre el cesped iluminado los cruces todavia por definir se
       perdian casi del todo. Un cuadro de eliminatoria se lee o no sirve. */
    <div
      className="hidden rounded-2xl border border-white/15 p-8 backdrop-blur-[2px] lg:block"
      style={{ background: PANEL }}
    >
      <div className={cn('grid gap-x-0', COLUMNAS)}>
        {cabeceras.map(([fase, col]) => {
          const p = paradaDe(fase);
          return p ? (
            <div key={fase} className={col}>
              <Cabecera parada={p} />
            </div>
          ) : null;
        })}
      </div>

      <div className={cn('mt-5 grid h-[44rem] grid-rows-4', COLUMNAS)}>
        {cuartos.map((c, i) => (
          <div key={c.id} className="col-start-1 flex items-center" style={{ gridRow: i + 1 }}>
            <Celda celda={c} altoFijo provisional={provisional} />
          </div>
        ))}

        <div className="col-start-2 row-span-2 row-start-1">
          <Conector />
        </div>
        <div className="col-start-2 row-span-2 row-start-3">
          <Conector />
        </div>

        {semis.map((c, i) => (
          <div
            key={c.id}
            className={cn('col-start-3 row-span-2 flex items-center', i === 0 ? 'row-start-1' : 'row-start-3')}
          >
            <Celda celda={c} altoFijo provisional={provisional} />
          </div>
        ))}

        <div className="col-start-4 row-span-4 row-start-1">
          <Conector />
        </div>

        <div className="col-start-5 row-span-4 row-start-1 flex items-center">
          <Celda celda={final} altoFijo destacada />
        </div>
      </div>

      {tercero ? (
        <div className={cn('grid gap-x-0', COLUMNAS)}>
          <div className="col-start-5">
            <Cabecera parada={paradaDe('tercer-puesto')!} />
            <div className="mt-4">
              <Celda celda={tercero} altoFijo />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
