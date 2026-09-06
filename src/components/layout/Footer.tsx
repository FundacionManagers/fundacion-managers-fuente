import Link from 'next/link';
import { GoldCoin } from '@/components/shared/GoldCoin';
import { IconeBrand } from '@/components/shared/IconeBrand';
import { ALIANZA } from '@/lib/alianza';
import { ENTRADAS, hrefDeEje } from '@/lib/navigation';
import { NORTE } from '@/lib/strategy';

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="canvas-dark relative overflow-hidden border-t border-white/10 text-neutral-100">
      <div className="relative mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3">
              <GoldCoin size={48} />
              <span className="font-display text-lg font-extrabold">Fundación Managers</span>
            </div>
            <p className="mt-5 max-w-xs font-serif text-lg italic text-neutral-400">
              Ocio serio para que los líderes tomen mejores decisiones.
            </p>
          </div>

          <div>
            <h3 className="text-caption uppercase tracking-[0.2em] text-gold">Ejes</h3>
            <ul className="mt-5 space-y-2.5 text-sm text-neutral-300">
              {ENTRADAS.map((eje) => (
                <li key={eje.slug}>
                  <Link
                    href={hrefDeEje(eje)}
                    className="transition-colors duration-200 ease-managers hover:text-gold"
                  >
                    {eje.nombre}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-caption uppercase tracking-[0.2em] text-gold">Fundación</h3>
            <ul className="mt-5 space-y-2.5 text-sm text-neutral-300">
              <li>
                <Link
                  href="/nosotros/"
                  className="transition-colors duration-200 ease-managers hover:text-gold"
                >
                  Ocio serio
                </Link>
              </li>
              <li>
                <Link
                  href="/alianza/"
                  className="transition-colors duration-200 ease-managers hover:text-gold"
                >
                  Managers Lab
                </Link>
              </li>
              <li>
                <Link
                  href="/blog/"
                  className="transition-colors duration-200 ease-managers hover:text-gold"
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  href="/contacto/"
                  className="transition-colors duration-200 ease-managers hover:text-gold"
                >
                  Contacto
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-caption uppercase tracking-[0.2em] text-gold">Legal</h3>
            <ul className="mt-5 space-y-2.5 text-sm text-neutral-300">
              <li>
                <Link
                  href="/privacidad/"
                  className="transition-colors duration-200 ease-managers hover:text-gold"
                >
                  Política de privacidad
                </Link>
              </li>
              <li>
                <Link
                  href="/terminos/"
                  className="transition-colors duration-200 ease-managers hover:text-gold"
                >
                  Términos de uso
                </Link>
              </li>
              <li className="pt-1 text-xs text-neutral-500">Ley 1581 de 2012 · Habeas Data</li>
            </ul>
          </div>
        </div>

        {/* Firma co-brand */}
        <Link
          href="/alianza/"
          className="mt-16 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-xl border border-white/10 bg-white/[0.03] px-5 py-4 text-sm text-neutral-400 transition-colors duration-200 ease-managers hover:border-white/20"
        >
          <span className="font-serif text-base font-bold text-neutral-200">{ALIANZA.nombre}</span>
          <span className="font-bufon text-caption uppercase tracking-[0.18em] text-neutral-400">
            powered by
          </span>
          <IconeBrand className="text-base" />
          <span className="ml-auto text-xs text-neutral-500">{ALIANZA.claim}</span>
        </Link>

        <div className="rule-gold mt-10 h-px" />
        <div className="mt-6 flex flex-col gap-2 text-xs text-neutral-500 sm:flex-row sm:items-center sm:justify-between">
          <span>© {year} Fundación Managers · Bogotá, Colombia</span>
          <span className="font-mono uppercase tracking-[0.2em] text-neutral-600">{NORTE}</span>
        </div>
      </div>
    </footer>
  );
}
