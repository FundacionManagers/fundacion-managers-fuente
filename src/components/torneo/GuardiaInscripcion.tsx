'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { supabasePublico } from '@/lib/supabase';

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

type Estado = 'cargando' | 'ok' | 'sin-acceso';

/**
 * Deja pasar solo a quien viene de una pre-inscripción real.
 *
 * El paso 3 ya validaba —"Enlace no válido" si faltaba el token—, pero los
 * pasos 4 y 5 se abrían a cualquiera que tecleara la URL. En el 4 eso dejaba
 * el botón de Bold activo, y como el link es de monto abierto podía entrar
 * dinero sin ningún equipo al que asociarlo. En el 5 era peor: la página
 * felicitaba con un "¡Equipo inscrito! Completaste los 5 pasos", los cinco
 * pasos en verde y un comprobante descargable, a quien no había hecho nada.
 * Una web que afirma algo falso vale menos que una que no dice nada.
 *
 * Se valida como en el paso 3: el token contra Supabase, que es quien manda.
 * Leerlo de la URL o del respaldo local no basta —cualquiera puede
 * inventárselo—, así que la respuesta del servidor es la que decide.
 */
/**
 * Comprueba el acceso y devuelve en qué va: 'cargando' hasta que Supabase
 * contesta, y luego 'ok' o 'sin-acceso'.
 */
function useAcceso(): Estado {
  const [estado, setEstado] = useState<Estado>('cargando');

  useEffect(() => {
    const sb = supabasePublico;
    if (!sb) {
      setEstado('sin-acceso');
      return;
    }

    // De la URL o del respaldo local, igual que el paso 3: quien ya se
    // pre-inscribió en este navegador puede volver sin el enlace a mano.
    const params = new URLSearchParams(window.location.search);
    let id = params.get('eq') ?? '';
    let tk = params.get('t') ?? '';
    if (!id || !tk) {
      try {
        const local = JSON.parse(window.localStorage.getItem('fm-mi-inscripcion') ?? '{}');
        id = id || local.id || '';
        tk = tk || local.token || '';
      } catch {
        /* noop */
      }
    }
    if (!id || !tk) {
      setEstado('sin-acceso');
      return;
    }

    let vivo = true;
    sb.rpc('fm_get_equipo', { p_id: id, p_token: tk }).then(({ data, error }) => {
      if (!vivo) return;
      setEstado(error || !data ? 'sin-acceso' : 'ok');
    });
    return () => {
      vivo = false;
    };
  }, []);

  return estado;
}

/**
 * El titular de la página, que solo se enseña a quien de verdad llegó hasta
 * aquí. En el paso 5 decía "¡Equipo inscrito! Completaste los 5 pasos" en
 * letras enormes, y bloquear solo el cuerpo dejaba ese titular justo encima
 * del aviso de "enlace no válido".
 */
export function GuardiaInscripcionHero({ children }: { children: React.ReactNode }) {
  const estado = useAcceso();
  if (estado !== 'ok') return null;
  return <>{children}</>;
}

export function GuardiaInscripcion({ children }: { children: React.ReactNode }) {
  const estado = useAcceso();

  if (estado === 'cargando') {
    return (
      <p className="flex items-center justify-center gap-2 py-16 text-sm text-neutral-400">
        <Loader2 className="animate-spin" size={18} /> Comprobando tu inscripción…
      </p>
    );
  }

  if (estado === 'sin-acceso') {
    return (
      <div className="mx-auto max-w-md rounded-2xl border border-white/10 bg-[#0d1218]/70 p-8 text-center">
        <h3 className="font-sport text-2xl uppercase text-neutral-50">Enlace no válido</h3>
        <p className="mt-3 text-sm text-neutral-400">
          Para llegar a este paso necesitas el enlace de tu equipo, el que aparece tras hacer la
          pre-inscripción. Si ya la hiciste en este dispositivo, vuelve a abrirla desde el mismo
          navegador.
        </p>
        <a
          href={`${BASE}/torneo/inscripciones/`}
          className="mt-6 inline-flex rounded-full bg-gradient-to-r from-amarillo to-naranja px-6 py-3 text-sm font-bold text-carbon"
        >
          Ir a inscripciones
        </a>
      </div>
    );
  }

  return <>{children}</>;
}
