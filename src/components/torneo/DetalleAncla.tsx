'use client';

import { useEffect, useState } from 'react';
import { ChevronRight } from 'lucide-react';

/**
 * Un acordeón que se abre solo cuando se llega a él por su ancla.
 *
 * Sin esto, los enlaces que prometen "ver la llave" dejan al lector delante
 * de un acordeón cerrado y le piden un clic más para ver lo que el enlace ya
 * le había prometido. Era justo el problema del que venimos: el enlace
 * llevaba a la página correcta pero no a lo que dice.
 *
 * Navegar al ancla de un <details> no lo abre por sí solo —solo algunos
 * navegadores lo hacen, y únicamente si el ancla apunta a algo de dentro—,
 * así que se comprueba el hash al montar y en cada cambio.
 *
 * Sigue siendo un <details> nativo: se puede abrir y cerrar a mano, funciona
 * con teclado, y el buscador indexa el contenido esté abierto o no.
 */
export function DetalleAncla({
  id,
  resumen,
  className,
  children,
}: {
  id: string;
  resumen: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  // Arranca cerrado en el servidor y en el cliente: si dependiera del hash en
  // el primer render, no coincidirían y la hidratación se quejaría.
  const [abierto, setAbierto] = useState(false);

  useEffect(() => {
    const comprobar = () => {
      if (window.location.hash === `#${id}`) setAbierto(true);
    };
    comprobar();
    window.addEventListener('hashchange', comprobar);
    return () => window.removeEventListener('hashchange', comprobar);
  }, [id]);

  return (
    <details
      id={id}
      open={abierto}
      onToggle={(e) => setAbierto(e.currentTarget.open)}
      className={className}
    >
      <summary className="flex cursor-pointer list-none items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-neutral-500 transition-colors hover:text-neutral-300">
        <ChevronRight
          size={13}
          aria-hidden
          className="shrink-0 transition-transform duration-200 group-open:rotate-90"
        />
        {resumen}
      </summary>
      {children}
    </details>
  );
}
