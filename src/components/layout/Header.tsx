import Image from 'next/image';
import Link from 'next/link';
import { MobileMenu } from '@/components/layout/MobileMenu';
import { asset } from '@/lib/asset';
import { ICONE_CYAN } from '@/lib/alianza';
import { EJES } from '@/lib/navigation';

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#0b0f14]/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
        <Link href="/" className="flex items-center" aria-label="Inicio Fundación Managers">
          <Image
            src={asset('/logo-fundacion.png')}
            alt="Fundación Managers"
            width={720}
            height={190}
            priority
            className="h-9 w-auto sm:h-10"
          />
        </Link>

        <nav aria-label="Navegación principal" className="hidden lg:block">
          <ul className="flex items-center gap-7 text-sm font-medium text-neutral-300">
            {EJES.map((eje) => (
              <li key={eje.slug}>
                <Link
                  href={`/${eje.slug}/`}
                  className="transition-colors duration-200 ease-managers hover:text-gold"
                >
                  {eje.nombre}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/alianza/"
                className="rounded-full border px-3 py-1.5 font-semibold text-neutral-50 transition-colors duration-200 ease-managers"
                style={{ borderColor: ICONE_CYAN, color: ICONE_CYAN }}
              >
                Managers Lab
              </Link>
            </li>
          </ul>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/contacto/"
            className="hidden rounded-full bg-gold px-5 py-2 text-sm font-semibold text-carbon shadow-gold transition-colors duration-200 ease-managers hover:bg-gold-hover lg:inline-flex"
          >
            Hablemos
          </Link>
          <MobileMenu />
        </div>
      </div>
    </header>
  );
}
