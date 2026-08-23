'use client';

import { useState } from 'react';
import {
  AlertTriangle,
  Check,
  ChevronDown,
  KeyRound,
  ListOrdered,
  Rocket,
  ShieldQuestion,
  SquarePen,
  Table2,
  Users,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Paso {
  id: string;
  numero: string;
  titulo: string;
  resumen: string;
  icono: React.ComponentType<{ size?: number; className?: string }>;
  cuerpo: React.ReactNode;
}

/** Recuadro de consejo, para no repetir clases en cada paso. */
function Nota({
  tono = 'info',
  children,
}: {
  tono?: 'info' | 'aviso' | 'bien';
  children: React.ReactNode;
}) {
  const estilos = {
    info: 'border-white/15 bg-white/[0.04] text-neutral-300',
    aviso: 'border-amber-500/40 bg-amber-500/10 text-amber-200',
    bien: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
  }[tono];
  return <div className={cn('mt-4 rounded-lg border px-4 py-3 text-sm', estilos)}>{children}</div>;
}

const PASOS: Paso[] = [
  {
    id: 'entrar',
    numero: '1',
    titulo: 'Entrar al panel',
    resumen: 'Sin contraseña la primera vez',
    icono: KeyRound,
    cuerpo: (
      <>
        <p>
          Abre <strong className="text-amarillo">fundacionmanagers.com/resultados</strong> y escribe
          tu correo. Puedes entrar de dos formas:
        </p>
        <ul className="mt-3 space-y-2">
          <li>
            <strong className="text-neutral-100">Con enlace al correo.</strong> Pulsa{' '}
            <em>Enviarme un enlace al correo</em> y ábrelo desde el mismo dispositivo. No necesitas
            recordar nada.
          </li>
          <li>
            <strong className="text-neutral-100">Con contraseña</strong>, si ya definiste una.
          </li>
        </ul>
        <p className="mt-3">
          Una vez dentro, en la pestaña <strong>Mi acceso</strong> puedes fijar tu propia
          contraseña. La escribes tú y nadie más la ve.
        </p>
        <Nota tono="aviso">
          Solo entran los tres correos autorizados. Si el tuyo no está en la lista, el panel te lo
          dirá con claridad en vez de dejarte a medias.
        </Nota>
      </>
    ),
  },
  {
    id: 'marcadores',
    numero: '2',
    titulo: 'Cargar los marcadores',
    resumen: 'Lo que harás cada fecha',
    icono: SquarePen,
    cuerpo: (
      <>
        <p>
          En la pestaña <strong>Marcadores</strong>, elige el número de fecha arriba. Los números en
          verde son fechas ya completas; el amarillo es la que estás viendo.
        </p>
        <ol className="mt-3 list-decimal space-y-2 pl-5">
          <li>Escribe los goles de cada equipo en los dos recuadros.</li>
          <li>
            Marca la casilla <strong>Partido jugado</strong>.
          </li>
          <li>
            Pulsa <strong className="text-amarillo">Guardar fecha</strong> al final.
          </li>
        </ol>
        <Nota>
          <strong className="text-neutral-100">¿Te equivocaste?</strong> Desmarca{' '}
          <em>Partido jugado</em> y guarda: el marcador se borra y el partido vuelve a programado.
          Todo se puede deshacer.
        </Nota>
        <Nota tono="aviso">
          La tabla de posiciones no se edita en ninguna parte. Se calcula sola con estos marcadores,
          y por eso nunca puede contradecir al calendario.
        </Nota>
      </>
    ),
  },
  {
    id: 'tarjetas',
    numero: '3',
    titulo: 'Registrar las tarjetas',
    resumen: 'Amarillas y rojas por club',
    icono: Users,
    cuerpo: (
      <>
        <p>
          En <strong>Tarjetas</strong> anotas el acumulado de cada club. Son{' '}
          <strong className="text-neutral-100">totales de todo el torneo</strong>, no de la fecha:
          si un equipo tenía 5 amarillas y le sacaron 2 más, escribes 7.
        </p>
        <p className="mt-3">
          Al terminar, <strong className="text-amarillo">Guardar tarjetas</strong>.
        </p>
        <Nota>
          Es el único dato que hay que escribir a mano. Todo lo demás —puntos, diferencia de gol,
          posiciones— sale solo de los marcadores.
        </Nota>
      </>
    ),
  },
  {
    id: 'goleadores',
    numero: '4',
    titulo: 'Añadir los goleadores',
    resumen: 'Quién anotó cada gol',
    icono: ListOrdered,
    cuerpo: (
      <>
        <p>
          En <strong>Goleadores</strong>, arriba está el formulario para agregar: nombre, equipo,
          dorsal y goles. Pulsa <strong className="text-amarillo">Agregar</strong>.
        </p>
        <p className="mt-3">
          Si un jugador ya está en la lista y anotó más,{' '}
          <strong className="text-neutral-100">no lo agregues de nuevo</strong>: búscalo abajo y
          cambia su número de goles al total acumulado.
        </p>
        <p className="mt-3">
          El ranking se ordena solo. Las posiciones no se guardan, se calculan.
        </p>
        <Nota>
          El botón de la papelera elimina a un anotador. Úsalo si lo cargaste por error o con el
          club equivocado.
        </Nota>
      </>
    ),
  },
  {
    id: 'revisar',
    numero: '5',
    titulo: 'Revisar antes de publicar',
    resumen: 'El paso que evita errores públicos',
    icono: Table2,
    cuerpo: (
      <>
        <p>El panel hace dos comprobaciones por ti. Míralas antes de publicar.</p>

        <div className="mt-4 rounded-lg border border-emerald-500/30 bg-emerald-500/5 px-4 py-3">
          <p className="flex items-center gap-2 text-sm font-semibold text-emerald-400">
            <Check size={15} /> Los goles del ranking cuadran con los marcadores
          </p>
          <p className="mt-1 text-sm text-neutral-400">Todo en orden, puedes publicar.</p>
        </div>

        <div className="mt-3 rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3">
          <p className="flex items-center gap-2 text-sm font-semibold text-amber-300">
            <AlertTriangle size={15} /> Los goles no cuadran
          </p>
          <p className="mt-1 text-sm text-amber-200/80">
            Falta registrar anotadores, o un marcador está mal. El aviso te dice club por club
            cuántos goles sobran o faltan.
          </p>
        </div>

        <p className="mt-4">
          Y en <strong>Tabla (previa)</strong> ves cómo quedarían las posiciones{' '}
          <strong className="text-neutral-100">antes de publicar nada</strong>, incluso sin haber
          guardado. Sirve para comprobar un resultado dudoso sin que lo vea nadie.
        </p>
      </>
    ),
  },
  {
    id: 'publicar',
    numero: '6',
    titulo: 'Publicar en la web',
    resumen: 'Guardar no es publicar',
    icono: Rocket,
    cuerpo: (
      <>
        <p>
          Guardar deja los datos en la base, pero{' '}
          <strong className="text-neutral-100">la web todavía no los muestra</strong>. Hay que
          publicar.
        </p>
        <ul className="mt-3 space-y-2">
          <li>
            <strong className="text-amarillo">Publicar ahora</strong> — el botón de arriba. Tarda
            unos dos minutos.
          </li>
          <li>
            <strong className="text-neutral-100">O esperar.</strong> El sitio se republica solo,
            aunque puede tardar hasta una hora.
          </li>
        </ul>
        <p className="mt-3">El aviso de arriba te dice siempre en qué estado estás:</p>
        <ul className="mt-2 space-y-1 text-sm">
          <li>
            🌐 <strong className="text-emerald-400">Todo publicado</strong> — la web está al día.
          </li>
          <li>
            ☁️ <strong className="text-amarillo">Hay cambios sin publicar</strong> — falta que
            salgan.
          </li>
        </ul>
        <Nota tono="bien">
          Comprueba el resultado en{' '}
          <strong className="text-neutral-100">fundacionmanagers.com/torneo</strong>. Si lo ves
          viejo, recarga con <strong>Ctrl + Shift + R</strong>.
        </Nota>
      </>
    ),
  },
];

const PROBLEMAS = [
  {
    p: 'No me llega el enlace al correo',
    r: 'Revisa la carpeta de spam. Si tampoco está, prueba con la contraseña, o pide que confirmen que tu correo está en la lista de autorizados.',
  },
  {
    p: 'Guardé, pero la web sigue igual',
    r: 'Guardar no publica. Pulsa "Publicar ahora" y espera dos minutos. Si ya lo hiciste, recarga la web con Ctrl + Shift + R: tu navegador puede estar mostrando una copia guardada.',
  },
  {
    p: 'El botón de publicar da un error con un número',
    r: 'Ese número es el diagnóstico. 401 es un problema con la llave de acceso a GitHub, 403 son permisos, 404 es configuración. Pásale el número a quien administre el sitio.',
  },
  {
    p: 'Cargué un marcador equivocado y ya lo publiqué',
    r: 'Corrígelo en Marcadores, guarda y vuelve a publicar. La tabla se recalcula sola y la web queda corregida en dos minutos.',
  },
  {
    p: 'Dice que los goles no cuadran y no encuentro el error',
    r: 'El aviso indica el club y la diferencia. Suma los goles de ese club en el calendario y compáralos con su ranking: la diferencia es justo lo que falta por registrar.',
  },
];

export function GuiaPanel() {
  const [abierto, setAbierto] = useState<string | null>('entrar');

  return (
    <div>
      {/* Pasos */}
      <div className="space-y-3">
        {PASOS.map((paso) => {
          const activo = abierto === paso.id;
          const Icono = paso.icono;
          return (
            <section
              key={paso.id}
              className={cn(
                'overflow-hidden rounded-2xl border transition-colors',
                activo ? 'border-amarillo/40 bg-black/60' : 'border-white/10 bg-black/40',
              )}
            >
              <button
                type="button"
                onClick={() => setAbierto(activo ? null : paso.id)}
                aria-expanded={activo}
                className="flex w-full items-center gap-4 px-5 py-4 text-left"
              >
                <span
                  className={cn(
                    'inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl font-sport text-xl',
                    activo
                      ? 'bg-gradient-to-b from-amarillo to-naranja text-carbon'
                      : 'border border-white/15 text-neutral-400',
                  )}
                >
                  {paso.numero}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2 font-sport text-2xl uppercase leading-none text-neutral-50">
                    <Icono size={17} className="shrink-0 text-amarillo" />
                    {paso.titulo}
                  </span>
                  <span className="mt-1 block text-sm text-neutral-500">{paso.resumen}</span>
                </span>
                <ChevronDown
                  size={20}
                  aria-hidden
                  className={cn(
                    'shrink-0 text-neutral-500 transition-transform duration-200',
                    activo && 'rotate-180 text-amarillo',
                  )}
                />
              </button>

              {activo ? (
                <div className="border-t border-white/10 px-5 py-5 text-neutral-300 sm:px-[5.5rem]">
                  {paso.cuerpo}
                </div>
              ) : null}
            </section>
          );
        })}
      </div>

      {/* Problemas frecuentes */}
      <div className="mt-14">
        <p className="flex items-center gap-2 font-bufon text-sm font-bold uppercase tracking-[0.25em] text-naranja">
          <ShieldQuestion size={16} /> Si algo sale mal
        </p>
        <h2 className="mt-1 font-sport text-4xl uppercase leading-none text-neutral-50">
          Problemas frecuentes
        </h2>
        <div className="mt-6 space-y-3">
          {PROBLEMAS.map((x) => (
            <details
              key={x.p}
              className="group rounded-xl border border-white/10 bg-black/40 px-5 py-4"
            >
              <summary className="cursor-pointer list-none font-semibold text-neutral-100 marker:hidden">
                <span className="flex items-center justify-between gap-3">
                  {x.p}
                  <ChevronDown
                    size={17}
                    aria-hidden
                    className="shrink-0 text-neutral-500 transition-transform group-open:rotate-180"
                  />
                </span>
              </summary>
              <p className="mt-3 text-sm text-neutral-400">{x.r}</p>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}
