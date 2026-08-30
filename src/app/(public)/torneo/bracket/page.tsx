import type { Metadata } from 'next';
import Link from 'next/link';
import { LlaveArbol } from '@/components/torneo/LlaveArbol';
import { TorneoShell } from '@/components/torneo/TorneoShell';
import {
  TOTAL_JORNADAS,
  calcularPosiciones,
  caminoFaseFinal,
  cruzarCuartos,
  faseDeGruposCompleta,
  jornadaActualDe,
} from '@/lib/liga';
import { cargarLigaConAviso } from '@/lib/liga-supabase';
import { EDICION_EN_CURSO, ordinalFemenino, pillEdicion } from '@/lib/torneo';

export const metadata: Metadata = {
  title: 'Llave · Torneo Managers',
  description: `Llave de la fase final de la ${ordinalFemenino(EDICION_EN_CURSO.numero)} edición del Torneo Managers F7, derivada de la tabla de posiciones.`,
};

export default async function BracketPage() {
  const datos = await cargarLigaConAviso();

  // La llave sale de la tabla, y la tabla sale de los marcadores. Nada de
  // esto se escribe a mano: así no puede contradecir el resultado del campo.
  const posiciones = calcularPosiciones(datos.partidos, datos.disciplina);
  const cruces = cruzarCuartos(posiciones);
  const definitiva = faseDeGruposCompleta(datos.partidos);
  const faltan = TOTAL_JORNADAS - jornadaActualDe(datos.partidos);

  // El camino a la final, ronda por ronda y con su estado. Se calcula siempre,
  // haya o no partidos cargados: es lo que permite dibujar la llave completa.
  const camino = caminoFaseFinal(datos.eliminatoria);
  const arrancoFinal = datos.eliminatoria.length > 0;

  // Puesto de cada club, para etiquetar los cruces que ya estén programados.
  const siembra = new Map(posiciones.map((f) => [f.equipo, f.posicion]));

  return (
    <TorneoShell eyebrow={pillEdicion(EDICION_EN_CURSO)} title="La llave" active="/torneo/bracket/">
      {/* El encabezado se muestra siempre, también cuando ya hay cruces
          cargados. Antes la página cambiaba entera al llegar los partidos
          reales y se quedaba sin una sola línea que explicara qué se está
          viendo, justo el día en que más gente iba a entrar. */}
      <div className="rounded-2xl border border-white/10 bg-black/30 p-6 lg:p-8">
        <p className="font-bufon text-xs font-bold uppercase tracking-[0.25em] text-naranja">
          {arrancoFinal ? 'Fase final' : definitiva ? 'Cuartos de final' : 'Proyección'}
        </p>
        <h2 className="mt-1 font-sport text-4xl uppercase leading-none text-neutral-50 md:text-5xl">
          {arrancoFinal
            ? 'El camino al título'
            : definitiva
              ? 'Así quedaron los cruces'
              : 'Así irían los cruces hoy'}
        </h2>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-neutral-400">
          {arrancoFinal ? (
            <>
              Ocho equipos, tres rondas y un título. Cada resultado que carga la organización se
              refleja aquí y va cerrando el camino. El mejor ubicado en{' '}
              <Link href="/torneo/#fase-de-grupos" className="text-amarillo hover:text-naranja">
                la tabla
              </Link>{' '}
              hace de local.
            </>
          ) : definitiva ? (
            <>
              Terminada la fase de grupos, cruzan 1º-8º, 2º-7º, 3º-6º y 4º-5º. Los puestos salen de{' '}
              <Link href="/torneo/#fase-de-grupos" className="text-amarillo hover:text-naranja">
                la tabla
              </Link>{' '}
              y el mejor ubicado hace de local.
            </>
          ) : (
            <>
              Esto <strong className="text-neutral-200">todavía puede cambiar</strong>: faltan{' '}
              {faltan === 1 ? 'la última fecha' : `${faltan} fechas`} por jugar. La llave se calcula
              sola desde{' '}
              <Link href="/torneo/#fase-de-grupos" className="text-amarillo hover:text-naranja">
                la tabla
              </Link>{' '}
              —cruzan 1º-8º, 2º-7º, 3º-6º y 4º-5º— y se actualiza con cada resultado que cargue la
              organización. El mejor ubicado hace de local.
            </>
          )}
        </p>
      </div>

      {/* La llave completa. Las fechas viven aquí, dentro de cada ronda y junto
          a su estado: el Calendario responde "cuándo se juega" y esta página
          responde "quién juega y hasta dónde llegó". */}
      <div className="mt-10">
        <LlaveArbol
          cruces={cruces}
          camino={camino}
          provisional={!definitiva}
          siembra={siembra}
        />
      </div>

      <p className="mt-8 border-t border-white/5 pt-5 text-xs leading-relaxed text-neutral-600">
        Horarios por definir. Los puestos que aparecen junto a cada club son los de{' '}
        <Link href="/torneo/#fase-de-grupos" className="text-neutral-400 hover:text-amarillo">
          la tabla de la fase de grupos
        </Link>
        . El calendario completo, fecha por fecha, está en{' '}
        <Link href="/torneo/calendario/" className="text-neutral-400 hover:text-amarillo">
          Calendario
        </Link>
        .
      </p>

      {/* Esta página es solo de la edición en curso. La llave de la 3ª se
          consulta en el Historial de /torneo/calendario/, donde acompaña al
          resto de resultados de esa edición. */}
    </TorneoShell>
  );
}
