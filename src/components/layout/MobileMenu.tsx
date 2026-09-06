'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { asset } from '@/lib/asset';
import { ICONE_CYAN } from '@/lib/alianza';
import { ENTRADAS, hrefDeEje } from '@/lib/navigation';

/**
 * Menú móvil (hamburguesa). Visible solo < lg.
 *
 * CLAVE: el `<header>` usa `backdrop-blur`, lo que crea un "containing
 * block" → un `position:fixed` hijo se posicionaría DENTRO del header
 * (64px) y el menú quedaba oculto. Por eso el panel se renderiza con
 * `createPortal` directo en `document.body`, fuera del header.
 */
export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const panel = (
    <div
      className="fixed inset-0 z-[9999] flex flex-col"
      style={{ backgroundColor: '#0b0f14' }}
      role="dialog"
      aria-modal="true"
      aria-label="Menú de navegación"
    >
      <div className="flex h-16 items-center justify-between border-b border-white/10 px-6">
        <Image
          src={asset('/logo-fundacion.png')}
          alt="Fundación Managers"
          width={720}
          height={190}
          className="h-9 w-auto"
        />
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Cerrar menú"
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-neutral-100 transition-colors duration-200 hover:border-gold hover:text-gold"
        >
          <X size={22} aria-hidden />
        </button>
      </div>

      <nav
        aria-label="Navegación principal móvil"
        className="flex flex-1 flex-col gap-1 overflow-y-auto px-6 py-8"
      >
        {ENTRADAS.map((eje) => (
          <Link
            key={eje.slug}
            href={hrefDeEje(eje)}
            onClick={() => setOpen(false)}
            className="border-b border-white/5 py-4 font-serif text-2xl font-bold text-neutral-100 transition-colors duration-200 hover:text-gold"
          >
            {eje.nombre}
          </Link>
        ))}

        <Link
          href="/alianza/"
          onClick={() => setOpen(false)}
          className="mt-6 inline-flex w-fit rounded-full border px-5 py-2.5 text-sm font-semibold"
          style={{ borderColor: ICONE_CYAN, color: ICONE_CYAN }}
        >
          Managers Lab
        </Link>

        <Link
          href="/contacto/"
          onClick={() => setOpen(false)}
          className="mt-4 inline-flex w-fit rounded-full bg-gold px-6 py-3 text-sm font-semibold text-carbon shadow-gold transition-colors duration-200 hover:bg-gold-hover"
        >
          Hablemos
        </Link>
      </nav>
    </div>
  );

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Abrir menú"
        aria-expanded={open}
        className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-white/15 px-4 text-sm font-semibold text-neutral-100 transition-colors duration-200 hover:border-gold hover:text-gold"
      >
        <Menu size={20} aria-hidden />
        Menú
      </button>

      {mounted && open ? createPortal(panel, document.body) : null}
    </div>
  );
}
