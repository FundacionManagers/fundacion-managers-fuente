import type { Metadata } from 'next';
import Link from 'next/link';
import { FixtureLiga } from '@/components/torneo/FixtureLiga';
import { EliminatoriaLiga } from '@/components/torneo/EliminatoriaLiga';
import { ProximaFecha } from '@/components/torneo/ProximaFecha';
import { TorneoShell } from '@/components/torneo/TorneoShell';
import { CALENDARIO_FASE_FINAL, fechaLargaDe, proximoCompromiso } from '@/lib/liga';
import { cargarLigaConAviso } from '@/lib/liga-supabase';
import { EDICION_ANTERIOR, EDICION_EN_CURSO, ordinalFemenino, pillEdicion } from '@/lib/torneo';

export const metadata: Metadata = {
  title: 'Calendario · Torneo Managers',
  description: `Fixture y resultados de la fase de grupos de la ${ordinalFemenino(EDICION_EN_CURSO.numero)} edición del Torneo Managers F7.`,
};

export default async function CalendarioPage() {
  const datos = await cargarLigaConAviso();

  // Lo próximo que se juega. Puede ser una fecha de grupos o, cuando ya no
  // queden, una ronda de la fase final: así el Calendario no se queda sin
  // "próximo" el 6 de septiembre, al terminar la Fecha 7.
  const proximo = proximoCompromiso(datos.partidos, datos.eliminatoria);

  return (
    <TorneoShell
      eyebrow={pillEdicion(EDICION_EN_CURSO)}
      title="Calendario"
      active="/torneo/calendario/"
    >
      {proximo ? (
        <div className="mb-14">
          <ProximaFecha compromiso={proximo} />
        </div>
      ) : null}

      <FixtureLiga datos={datos} />

      {/* ===== Fase final =====
          Mientras no haya cruces cargados se publican las fechas que anunció
          la organización, que ya sirven para reservar el día. En cuanto los
          partidos entren por el panel, este bloque cede el sitio a la llave
          real con sus equipos y horarios. */}
      <div className="mt-20">
        <p className="font-bufon text-sm font-bold uppercase tracking-[0.25em] text-naranja">
          Fase final
        </p>
        <h2 className="mt-1 font-sport text-5xl uppercase leading-none text-neutral-50 md:text-6xl">
          La llave
        </h2>
        <div className="energy-bar mt-5 h-1 w-full rounded-full opacity-70" />

        {datos.eliminatoria.length > 0 ? (
          <div className="mt-8">
            <EliminatoriaLiga partidos={datos.eliminatoria} />
          </div>
        ) : (
          <>
            <ul className="mt-8 space-y-2.5">
              {CALENDARIO_FASE_FINAL.map((r) => (
                <li
                  key={r.fase}
                  className="flex flex-wrap items-baseline gap-x-4 gap-y-1 rounded-xl border border-dashed border-white/10 bg-black/20 px-5 py-4"
                >
                  <span className="font-sport text-2xl uppercase leading-none text-neutral-200">
                    {r.titulo}
                  </span>
                  <span className="text-sm text-neutral-400">{fechaLargaDe(r.fecha)}</span>
                  <span className="ml-auto font-bufon text-[10px] uppercase tracking-[0.15em] text-neutral-600">
                    Equipos y horarios por definir
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-4 max-w-2xl text-xs leading-relaxed text-neutral-500">
              Los cruces salen de la tabla al cerrar la fase de grupos —1º-8º, 2º-7º, 3º-6º y 4º-5º—
              y se pueden ver proyectados en{' '}
              <Link href="/torneo/bracket/" className="text-amarillo hover:text-naranja">
                La llave
              </Link>
              .
            </p>
          </>
        )}
      </div>

      {/* ===== La edición anterior ya no vive aquí =====

          Estuvo plegada bajo el fixture, y ahí es donde más confundía: quien
          entra al Calendario viene a ver cuándo juega su equipo, no a mirar
          atrás. Su sitio es el Palmarés, que es la página de la historia del
          torneo, y allí es donde apuntaban ya los enlaces que prometían "ver
          la llave". Queda solo el puntero, en letra pequeña. */}
      <p className="mt-12 border-t border-white/5 pt-5 text-[11px] uppercase tracking-[0.2em] text-neutral-600">
        ¿Quieres ver qué pasó en la {ordinalFemenino(EDICION_ANTERIOR.numero)} edición? La llave
        completa está en{' '}
        <Link href="/torneo/palmares/#llave-anterior" className="text-neutral-400 hover:text-amarillo">
          Palmarés
        </Link>
        .
      </p>
    </TorneoShell>
  );
}
