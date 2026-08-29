import { GoldCoin } from '@/components/shared/GoldCoin';
import { TeamCrest } from '@/components/torneo/TeamCrest';
import { TorneoBackdrop } from '@/components/torneo/TorneoBackdrop';
import { TorneoNav } from '@/components/torneo/TorneoNav';
import { isoDe, proximoPartidoDe } from '@/lib/liga';
import { cargarLigaConAviso } from '@/lib/liga-supabase';
import { EQUIPOS } from '@/lib/torneo-data';

interface TorneoShellProps {
  eyebrow: string;
  title: string;
  active: string;
  children: React.ReactNode;
}

/**
 * Shell común de las subpáginas: foto de fondo a pantalla completa.
 *
 * Carga el calendario para saber cuándo es el próximo partido y encender el
 * punto de aviso de la pestaña. Se hace aquí, y no en cada página, para que
 * el aviso salga en todas por igual: un punto que aparece en unas secciones
 * y en otras no se lee como un fallo, no como un aviso.
 */
export async function TorneoShell({ eyebrow, title, active, children }: TorneoShellProps) {
  const datos = await cargarLigaConAviso();
  const proximo = proximoPartidoDe(datos.partidos);

  return (
    <div className="tournament-section relative">
      <TorneoBackdrop seed={47} query="stadium,floodlights,night" />

      <div className="relative z-10">
        {/* HERO */}
        <section className="grain relative overflow-hidden">
          <span
            aria-hidden
            className="pointer-events-none absolute -right-8 top-1/2 -translate-y-1/2 select-none font-sport text-[30vw] leading-none text-white/[0.04] lg:text-[230px]"
          >
            F7
          </span>

          <div className="relative mx-auto flex min-h-[58vh] max-w-7xl items-center justify-between gap-6 px-6 py-20 lg:px-8 lg:py-28">
            <div className="animate-fade-up">
              <span className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amarillo to-naranja px-4 py-1.5 font-bufon text-xs font-bold uppercase tracking-[0.18em] text-carbon">
                {eyebrow}
              </span>
              <h1 className="mt-6 font-sport text-[16vw] uppercase leading-[0.85] text-neutral-50 drop-shadow-[0_6px_24px_rgba(0,0,0,0.7)] lg:text-[110px]">
                {title}
              </h1>
              <div className="energy-bar mt-5 h-1.5 w-32 rounded-full" />
            </div>
            <div className="hidden shrink-0 lg:block">
              <div className="float-y">
                <GoldCoin size={170} animate />
              </div>
            </div>
          </div>

          {/* Marquee de equipos */}
          <div className="relative border-y border-white/10 bg-black/40 py-4 backdrop-blur-sm">
            <div className="marquee flex w-max gap-12 px-6">
              {[...EQUIPOS, ...EQUIPOS].map((e, i) => (
                <span
                  key={`${e.slug}-${i}`}
                  className="flex items-center gap-3 font-sport text-xl uppercase tracking-wide text-neutral-400"
                >
                  <TeamCrest slug={e.slug} size={24} />
                  {e.nombre}
                </span>
              ))}
            </div>
          </div>
        </section>

        <TorneoNav active={active} avisoISO={proximo ? isoDe(proximo) : undefined} />

        {/* CONTENIDO (panel translúcido para que la foto se vea detrás) */}
        <section className="grain relative">
          <div className="relative mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-24">{children}</div>
        </section>
      </div>
    </div>
  );
}
