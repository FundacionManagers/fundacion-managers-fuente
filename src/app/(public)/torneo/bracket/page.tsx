import type { Metadata } from 'next';
import Link from 'next/link';
import { LlaveArbol } from '@/components/torneo/LlaveArbol';
import { TorneoShell } from '@/components/torneo/TorneoShell';
import {
  COPAS,
  TOTAL_JORNADAS,
  caminoFaseFinal,
  cruzarFaseFinal,
  faseDeGruposCompleta,
  jornadaActualDe,
  posicionesPorGrupo,
  siembraPorGrupo,
} from '@/lib/liga';
import { cargarLigaConAviso } from '@/lib/liga-supabase';
import { EDICION_EN_CURSO, ordinalFemenino, pillEdicion } from '@/lib/torneo';

export const metadata: Metadata = {
  title: 'Llave · Torneo Managers',
  description: `Copa Oro y Copa Plata de la ${ordinalFemenino(EDICION_EN_CURSO.numero)} edición del Torneo Managers F7, derivadas de las tablas de grupo.`,
};

export default async function BracketPage() {
  const datos = await cargarLigaConAviso();

  // La llave sale de las tablas, y las tablas salen de los marcadores. Nada
  // de esto se escribe a mano: así no puede contradecir el resultado del campo.
  const tablas = posicionesPorGrupo(datos.partidos, datos.disciplina);
  const cruces = cruzarFaseFinal(tablas);
  const definitiva = faseDeGruposCompleta(datos.partidos);
  const faltan = TOTAL_JORNADAS - jornadaActualDe(datos.partidos);
  const arrancoFinal = datos.eliminatoria.length > 0;

  // Puesto de grupo de cada club ('1A'), para etiquetar los cruces programados.
  const siembra = siembraPorGrupo(tablas);

  return (
    <TorneoShell eyebrow={pillEdicion(EDICION_EN_CURSO)} title="La llave" active="/torneo/bracket/">
      {/* El encabezado se muestra siempre, también cuando ya hay cruces
          cargados. Antes la página cambiaba entera al llegar los partidos
          reales y se quedaba sin una sola línea que explicara qué se está
          viendo, justo el día en que más gente iba a entrar. */}
      <div className="rounded-2xl border border-white/10 bg-black/30 p-6 lg:p-8">
        <p className="font-bufon text-xs font-bold uppercase tracking-[0.25em] text-naranja">
          {arrancoFinal ? 'Fase final' : definitiva ? 'Semifinales' : 'Proyección'}
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
              Dos copas, cuatro clubes en cada una. Cada resultado que carga la organización se
              refleja aquí y va cerrando el camino. El mejor ubicado en{' '}
              <Link href="/torneo/#fase-de-grupos" className="text-amarillo hover:text-naranja">
                su grupo
              </Link>{' '}
              hace de local.
            </>
          ) : (
            <>
              {definitiva ? (
                'Terminada la fase de grupos, '
              ) : (
                <>
                  Esto <strong className="text-neutral-200">todavía puede cambiar</strong>: faltan{' '}
                  {faltan === 1 ? 'la última fecha' : `${faltan} fechas`} por jugar. Al cerrar la
                  fase de grupos,{' '}
                </>
              )}
              los dos primeros de cada grupo juegan la{' '}
              <strong className="text-neutral-200">Copa Oro</strong> y el tercero y el cuarto, la{' '}
              <strong className="text-neutral-200">Copa Plata</strong>. Las semifinales se cruzan
              —1º A con 2º B y 1º B con 2º A— y los puestos salen de{' '}
              <Link href="/torneo/#fase-de-grupos" className="text-amarillo hover:text-naranja">
                las tablas
              </Link>
              . El mejor ubicado hace de local.
            </>
          )}
        </p>
      </div>

      {/* Una llave por copa, la Oro primero: es la del título. Las fechas
          viven dentro de cada ronda y junto a su estado: el Calendario
          responde "cuándo se juega" y esta página responde "quién juega y
          hasta dónde llegó". */}
      {COPAS.map(({ copa, titulo, puestos }) => (
        <section key={copa} id={`copa-${copa}`} className="mt-14 scroll-mt-32">
          <p className="font-bufon text-xs font-bold uppercase tracking-[0.25em] text-naranja">
            {puestos[0]}º y {puestos[1]}º de cada grupo
          </p>
          <h2 className="mt-1 font-sport text-4xl uppercase leading-none text-neutral-50 md:text-5xl">
            {titulo}
          </h2>
          <div className="mt-6">
            <LlaveArbol
              cruces={cruces.filter((c) => c.copa === copa)}
              camino={caminoFaseFinal(datos.eliminatoria, copa)}
              provisional={!definitiva}
              siembra={siembra}
            />
          </div>
        </section>
      ))}

      <p className="mt-8 border-t border-white/5 pt-5 text-xs leading-relaxed text-neutral-300">
        Horarios por definir. Los puestos que aparecen junto a cada club son los de{' '}
        <Link href="/torneo/#fase-de-grupos" className="text-neutral-400 hover:text-amarillo">
          su grupo
        </Link>{' '}
        —1A es el primero del Grupo A— . El calendario completo, fecha por fecha, está en{' '}
        <Link href="/torneo/calendario/" className="text-neutral-400 hover:text-amarillo">
          Calendario
        </Link>
        .
      </p>

      {/* Esta página es solo de la edición en curso. La llave de la anterior
          se consulta en el Palmarés. */}
    </TorneoShell>
  );
}
