import type { Metadata } from 'next';
import { EliminatoriaLiga } from '@/components/torneo/EliminatoriaLiga';
import { LlaveProyectada } from '@/components/torneo/LlaveProyectada';
import { TorneoShell } from '@/components/torneo/TorneoShell';
import {
  CALENDARIO_FASE_FINAL,
  FECHA_FASE_FINAL,
  TOTAL_JORNADAS,
  fechaLargaDe,
  calcularPosiciones,
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
  // esto se escribe a mano: asi no puede contradecir el resultado del campo.
  const posiciones = calcularPosiciones(datos.partidos, datos.disciplina);
  const cruces = cruzarCuartos(posiciones);
  const definitiva = faseDeGruposCompleta(datos.partidos);
  const jornadaActual = jornadaActualDe(datos.partidos);
  const faltan = TOTAL_JORNADAS - jornadaActual;

  // Si la organizacion ya cargo los cruces reales en el panel, mandan esos.
  const hayCrucesReales = datos.eliminatoria.length > 0;

  return (
    <TorneoShell eyebrow={pillEdicion(EDICION_EN_CURSO)} title="La llave" active="/torneo/bracket/">
      {hayCrucesReales ? (
        <EliminatoriaLiga partidos={datos.eliminatoria} />
      ) : (
        <>
          <div className="rounded-2xl border border-white/10 bg-black/30 p-6 lg:p-8">
            <p className="font-bufon text-xs font-bold uppercase tracking-[0.25em] text-naranja">
              {definitiva ? 'Cuartos de final' : 'Proyección'}
            </p>
            <h2 className="mt-1 font-sport text-4xl uppercase leading-none text-neutral-50 md:text-5xl">
              {definitiva ? 'Así quedaron los cruces' : 'Así irían los cruces hoy'}
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-neutral-400">
              {definitiva ? (
                <>
                  Terminada la fase de grupos, cruzan 1º-8º, 2º-7º, 3º-6º y 4º-5º. El mejor ubicado
                  hace de local. La fase final arranca el {FECHA_FASE_FINAL}.
                </>
              ) : (
                <>
                  Esto <strong className="text-neutral-200">todavía puede cambiar</strong>: faltan{' '}
                  {faltan === 1 ? 'la última fecha' : `${faltan} fechas`} por jugar. La llave se
                  calcula sola desde la tabla —cruzan 1º-8º, 2º-7º, 3º-6º y 4º-5º— y se actualiza
                  con cada resultado que cargue la organización. La fase final arranca el{' '}
                  {FECHA_FASE_FINAL}.
                </>
              )}
            </p>
          </div>

          <div className="mt-8">
            <LlaveProyectada cruces={cruces} provisional={!definitiva} />
          </div>

          {/* Las tres rondas con su fecha. La página anunciaba solo el día de
              cuartos, en mitad de un párrafo; el camino completo hasta la
              final es justo lo que esta página quiere contar. */}
          <div className="mt-10 rounded-2xl border border-white/10 bg-black/30 p-6 lg:p-8">
            <p className="font-bufon text-xs font-bold uppercase tracking-[0.25em] text-amarillo">
              Camino a la final
            </p>
            <ol className="mt-4 space-y-2.5">
              {CALENDARIO_FASE_FINAL.map((r, i) => (
                <li key={r.fase} className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-white/15 font-mono text-[10px] text-neutral-400">
                    {i + 1}
                  </span>
                  <span className="font-semibold text-neutral-200">{r.titulo}</span>
                  <span className="text-sm text-neutral-400">{fechaLargaDe(r.fecha)}</span>
                </li>
              ))}
            </ol>
            <p className="mt-4 text-xs text-neutral-500">
              Horarios por definir. El mejor ubicado en la tabla hace de local.
            </p>
          </div>
        </>
      )}

      {/* Esta pagina es solo de la edicion en curso. La llave de la 3a se
          consulta en el Historial de /torneo/calendario/, donde acompana al
          resto de resultados de esa edicion. */}
    </TorneoShell>
  );
}
