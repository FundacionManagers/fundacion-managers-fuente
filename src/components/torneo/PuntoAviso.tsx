'use client';

import { useEffect, useState } from 'react';

/**
 * Punto dorado que titila junto a la pestaña de Calendario cuando hay algo
 * que ver: la fecha se juega hoy, mañana, o ya se jugó y faltan los
 * resultados.
 *
 * Se calcula en el navegador y no en el build. El sitio es estático y se
 * recompila solo cuando cambian los datos del panel, así que un aviso
 * horneado seguiría encendido días después del partido.
 *
 * No aparece cuando falta más de un día: un punto permanente deja de ser un
 * aviso y pasa a ser decoración, y la gente aprende a ignorarlo.
 */
export function PuntoAviso({ iso }: { iso: string }) {
  const [visible, setVisible] = useState(false);
  const [titulo, setTitulo] = useState('');

  useEffect(() => {
    function revisar() {
      const inicio = new Date(iso);
      if (Number.isNaN(inicio.getTime())) return;

      const ahora = new Date();
      const soloDia = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
      const dias = Math.round((soloDia(inicio) - soloDia(ahora)) / 86400000);

      if (dias < 0) {
        // Ya se jugó y el marcador aún no está cargado. Se avisa una semana
        // como mucho: pasado eso, o los cargaron o algo se quedó atrás, y en
        // ninguno de los dos casos ayuda seguir parpadeando.
        const encendido = dias >= -7;
        setVisible(encendido);
        setTitulo(encendido ? 'Resultados en camino' : '');
      } else if (dias === 0) {
        setVisible(true);
        setTitulo('Hoy se juega');
      } else if (dias === 1) {
        setVisible(true);
        setTitulo('Mañana se juega');
      } else {
        setVisible(false);
        setTitulo('');
      }
    }

    revisar();
    const id = setInterval(revisar, 60_000);
    return () => clearInterval(id);
  }, [iso]);

  if (!visible) return null;

  return (
    <span
      className="pulse-live ml-1.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-amarillo align-middle"
      title={titulo}
      role="status"
      aria-label={titulo}
    />
  );
}
