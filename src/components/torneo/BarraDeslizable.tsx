'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * El carril deslizable de la barra de pestañas del torneo.
 *
 * Las siete pestañas miden 758 px y en un teléfono hay 375: se veían
 * "Resumen · Llave · Calendario" y "Equipos" cortado contra el borde.
 * Estadísticas, Palmarés e Inscripciones quedaban fuera de pantalla, sin
 * ninguna señal de que se pudiera deslizar. Es probable que a Inscripciones
 * —lo que se reparte por WhatsApp— casi nadie llegara desde el móvil.
 *
 * Dos arreglos, los dos necesarios:
 *
 * 1. Un degradado en el borde por el que queda contenido. Aparece solo si de
 *    verdad hay algo más allá, así que en escritorio no se ve nunca.
 * 2. La pestaña activa se centra sola al entrar. Sin esto, alguien que abre
 *    Palmarés desde un enlace veía la barra empezada en "Resumen" y sin
 *    rastro de dónde está parado.
 *
 * Es de cliente porque las dos cosas dependen de medir el ancho real en el
 * navegador de quien mira. Las pestañas siguen siendo enlaces del servidor:
 * llegan como `children` y se indexan igual.
 */
export function BarraDeslizable({ children }: { children: React.ReactNode }) {
  const carril = useRef<HTMLDivElement>(null);
  const [sobra, setSobra] = useState({ izquierda: false, derecha: false });

  const medir = useCallback(() => {
    const el = carril.current;
    if (!el) return;

    /**
     * El relleno lateral cuenta dentro de `scrollWidth`, así que al llegar al
     * final quedaban 15 px sin recorrer y el degradado derecho seguía
     * encendido sobre "Inscripciones" —la pestaña que todo esto viene a
     * rescatar— anunciando un contenido que ya no existe. Se descuenta, más
     * 2 px por los redondeos del navegador.
     */
    const relleno = parseFloat(getComputedStyle(el).paddingRight) || 0;
    setSobra({
      izquierda: el.scrollLeft > 2,
      derecha: el.scrollLeft + el.clientWidth < el.scrollWidth - relleno - 2,
    });
  }, []);

  useEffect(() => {
    const el = carril.current;
    if (!el) return;

    // Centrar la activa sin tocar el desplazamiento vertical de la página:
    // `scrollIntoView` movería también el scroll de la ventana y la barra es
    // pegajosa, así que el salto se vería.
    const activa = el.querySelector<HTMLElement>('[data-activa="true"]');
    if (activa) {
      const centro = activa.offsetLeft - (el.clientWidth - activa.offsetWidth) / 2;
      el.scrollLeft = Math.max(0, centro);
    }

    medir();
    const observador = new ResizeObserver(medir);
    observador.observe(el);
    return () => observador.disconnect();
  }, [medir]);

  return (
    <div className="relative">
      <div
        ref={carril}
        onScroll={medir}
        className="mx-auto flex max-w-7xl gap-0.5 overflow-x-auto px-4 [-ms-overflow-style:none] [scrollbar-width:none] sm:gap-1 sm:px-6 lg:px-8 [&::-webkit-scrollbar]:hidden"
      >
        {children}
      </div>

      {/* Solo señal visual: no deben robar el toque al enlace de debajo. */}
      <span
        aria-hidden
        className={`pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-[#0b0f14] to-transparent transition-opacity duration-200 ${
          sobra.izquierda ? 'opacity-100' : 'opacity-0'
        }`}
      />
      <span
        aria-hidden
        className={`pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-[#0b0f14] to-transparent transition-opacity duration-200 ${
          sobra.derecha ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </div>
  );
}
