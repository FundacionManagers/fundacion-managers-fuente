import Link from 'next/link';
import { Trophy } from 'lucide-react';
import { TeamCrest } from '@/components/torneo/TeamCrest';
import { EDICIONES_DISPUTADAS, TITULOS_POR_CLUB, campeonDe, respaldoDe } from '@/lib/torneo';
import { EQUIPOS } from '@/lib/torneo-data';
import { cn } from '@/lib/utils';

/**
 * Palmarés del torneo: todas las ediciones y quién ganó cada una.
 *
 * Existe porque los títulos de las dos primeras ediciones no tenían dónde
 * verse. Vivían como un número suelto en la ficha de Pomada Alfa, sin ninguna
 * lista detrás, y por eso llegaron a contradecir al resto del sitio. Aquí
 * están las cuatro ediciones en un solo sitio, cada una con su campeón y con
 * de dónde sale ese dato: si la llave está publicada se enlaza para que
 * cualquiera la compruebe, y si no, se dice que el palmarés lo aporta la
 * organización. Ninguna de las dos cosas se esconde.
 */
export function PalmaresTorneo() {
  // De la más reciente hacia atrás: lo último jugado es lo que más se busca.
  // Solo las disputadas — una edición que aún no ha empezado no tiene sitio
  // en un palmarés, por mucho que ya esté abierta la inscripción.
  const ediciones = [...EDICIONES_DISPUTADAS].sort((a, b) => b.numero - a.numero);

  const palmares = Object.entries(TITULOS_POR_CLUB).sort((a, b) => b[1] - a[1]);

  return (
    <div>
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="flex items-center gap-2 font-bufon text-sm font-bold uppercase tracking-[0.25em] text-naranja">
            <Trophy size={18} aria-hidden /> Palmarés
          </p>
          <h2 className="mt-1 font-sport text-5xl uppercase leading-none text-neutral-50 md:text-6xl">
            Todas las ediciones
          </h2>
        </div>
        <span className="hidden shrink-0 rounded-full border border-amarillo/40 bg-amarillo/10 px-4 py-1.5 font-bufon text-xs font-bold uppercase tracking-[0.15em] text-amarillo sm:block">
          {ediciones.length} ediciones
        </span>
      </div>
      <div className="energy-bar mt-5 h-1 w-full rounded-full opacity-70" />

      <ul className="stagger-in mt-8 space-y-3">
        {ediciones.map((e) => {
          const campeon = campeonDe(e);
          const club = campeon ? EQUIPOS.find((x) => x.nombre === campeon) : undefined;
          const respaldo = respaldoDe(e);
          const enCurso = e.estado === 'en-curso';

          return (
            <li
              key={e.numero}
              className={cn(
                'flex flex-wrap items-center gap-x-5 gap-y-3 rounded-2xl border px-5 py-4 sm:px-6',
                enCurso ? 'border-amarillo/40 bg-amarillo/[0.06]' : 'border-white/10 bg-black/40',
              )}
            >
              {/* Edición */}
              <div className="w-20 shrink-0">
                <p className="font-sport text-3xl leading-none text-neutral-100">{e.numero}ª</p>
                <p className="mt-1 font-mono text-[11px] uppercase tracking-widest text-neutral-500">
                  {e.periodo}
                </p>
              </div>

              {/* Campeón */}
              <div className="flex min-w-0 flex-1 items-center gap-3">
                {club ? <TeamCrest slug={club.slug} size={38} /> : null}
                <div className="min-w-0">
                  {campeon ? (
                    <>
                      <p className="truncate font-serif text-base font-bold text-neutral-100">
                        {campeon}
                      </p>
                      <p className="mt-0.5 font-bufon text-[11px] uppercase tracking-widest text-neutral-500">
                        Campeón
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="font-serif text-base font-bold text-neutral-400">
                        {enCurso ? 'En juego' : 'Sin campeón registrado'}
                      </p>
                      <p className="mt-0.5 font-bufon text-[11px] uppercase tracking-widest text-neutral-600">
                        {enCurso ? 'La final se juega en septiembre' : ''}
                      </p>
                    </>
                  )}
                </div>
              </div>

              {/* De dónde sale el dato */}
              <div className="w-full shrink-0 sm:w-auto sm:text-right">
                {respaldo === 'llave-publicada' ? (
                  <Link
                    href="/torneo/calendario/"
                    className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-1 font-bufon text-[10px] font-bold uppercase tracking-[0.15em] text-neutral-300 transition-colors hover:border-amarillo/50 hover:text-amarillo"
                  >
                    Ver la llave
                  </Link>
                ) : respaldo === 'declarado' ? (
                  <span className="inline-flex items-center rounded-full border border-dashed border-white/15 px-3 py-1 font-bufon text-[10px] font-bold uppercase tracking-[0.15em] text-neutral-500">
                    Sin llave publicada
                  </span>
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>

      {/* Títulos acumulados, que es lo que la gente discute */}
      {palmares.length ? (
        <div className="mt-8 rounded-2xl border border-white/10 bg-black/30 px-5 py-5 sm:px-6">
          <p className="font-bufon text-xs font-bold uppercase tracking-[0.2em] text-amarillo">
            Títulos por club
          </p>
          <ul className="mt-4 flex flex-wrap gap-x-8 gap-y-3">
            {palmares.map(([nombre, titulos]) => {
              const club = EQUIPOS.find((x) => x.nombre === nombre);
              return (
                <li key={nombre} className="flex items-center gap-2.5">
                  {club ? <TeamCrest slug={club.slug} size={26} /> : null}
                  <span className="text-sm font-semibold text-neutral-200">{nombre}</span>
                  <span className="font-sport text-xl leading-none text-amarillo">{titulos}</span>
                </li>
              );
            })}
          </ul>
          <p className="mt-4 max-w-3xl text-xs leading-relaxed text-neutral-500">
            Las ediciones marcadas como «sin llave publicada» son las dos primeras: su palmarés lo
            aporta la organización del torneo, porque sus partidos nunca se publicaron en el sitio.
            El día que se carguen, el campeón pasará a salir de la final como el de la 3ª edición.
          </p>
        </div>
      ) : null}
    </div>
  );
}
