'use client';

import { useEffect, useState } from 'react';
import { diaRelativoDe, type DiaRelativo } from '@/lib/liga';

/**
 * Chip de "Hoy" / "Mañana" para el próximo partido de un club.
 *
 * La ficha de club listaba los siete partidos en gris, todos iguales: el que
 * se juega mañana se veía exactamente igual que el de dentro de una semana.
 * Es el dato por el que un jugador entra a la ficha de su equipo, así que
 * ahora se marca, con la misma lógica y las mismas palabras que la tarjeta
 * del Calendario.
 *
 * Es de cliente por lo mismo que aquella: el sitio es estático y un "faltan
 * 2 días" calculado al compilar se quedaría congelado. La cuenta se hace en
 * el navegador de quien mira, contra su reloj.
 */
export function EtiquetaDia({ iso }: { iso: string }) {
  // null hasta que monta en el navegador: en el servidor no hay "hoy" que
  // valga, y pintar uno provocaría un desajuste de hidratación.
  const [cuando, setCuando] = useState<DiaRelativo>(null);

  useEffect(() => {
    const calcular = () => diaRelativoDe(iso, new Date());
    setCuando(calcular());
    const id = setInterval(() => setCuando(calcular()), 60_000);
    return () => clearInterval(id);
  }, [iso]);

  if (!cuando) return null;

  return (
    <span className="shrink-0 rounded-full border border-amarillo/40 bg-amarillo/10 px-2.5 py-0.5 font-bufon text-[10px] font-bold uppercase tracking-[0.15em] text-amarillo">
      {cuando}
    </span>
  );
}
