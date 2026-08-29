'use client';

import { useState } from 'react';
import { Check, KeyRound, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const MINIMO = 8;

/**
 * Deja que cada administrador defina su propia contraseña, ya estando dentro.
 *
 * El flujo es: se entra con el enlace al correo —que hace de acceso
 * provisional, de un solo uso— y aquí se elige la clave definitiva. La
 * contraseña viaja del navegador a Supabase y no pasa por ningún otro lado:
 * nadie más la ve, ni queda escrita en ninguna conversación.
 *
 * Sirve para los dos paneles: la cuenta es la misma, así que definirla aquí
 * también habilita el ingreso en el de inscripciones.
 */
export function DefinirClave({ correo }: { correo: string }) {
  const [clave, setClave] = useState('');
  const [repetida, setRepetida] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [listo, setListo] = useState(false);
  const [error, setError] = useState('');

  const corta = clave.length > 0 && clave.length < MINIMO;
  const distintas = repetida.length > 0 && clave !== repetida;
  const valida = clave.length >= MINIMO && clave === repetida;

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase || !valida) return;
    setGuardando(true);
    setError('');
    const { error: err } = await supabase.auth.updateUser({ password: clave });
    setGuardando(false);
    if (err) {
      setError(
        err.message.toLowerCase().includes('should be different')
          ? 'Esa ya es tu contraseña actual. Elige una distinta.'
          : 'No se pudo guardar. Prueba con una contraseña más larga.',
      );
      return;
    }
    setClave('');
    setRepetida('');
    setListo(true);
  }

  return (
    <div className="mt-8 max-w-md">
      <p className="flex items-center gap-2 font-bufon text-xs font-bold uppercase tracking-[0.15em] text-amarillo">
        <KeyRound size={14} /> Tu contraseña
      </p>
      <p className="mt-2 text-sm text-neutral-400">
        Entraste con un enlace de un solo uso. Si quieres, define aquí una contraseña para entrar
        directo la próxima vez. Sirve también para el panel de inscripciones.
      </p>
      <p className="mt-1 text-xs text-neutral-500">
        Sesión de <strong className="text-neutral-400">{correo}</strong>. Solo tú la escribes: no se
        le muestra a nadie más.
      </p>

      {listo ? (
        <p className="mt-4 flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
          <Check size={16} /> Contraseña guardada. Ya puedes entrar con ella en los dos paneles.
        </p>
      ) : (
        <form onSubmit={guardar} className="mt-4 space-y-3">
          <input
            type="password"
            autoComplete="new-password"
            value={clave}
            onChange={(e) => setClave(e.target.value)}
            placeholder={`Nueva contraseña (mínimo ${MINIMO} caracteres)`}
            className="block w-full rounded-md border border-white/15 bg-black/40 px-3 py-2.5 text-sm text-neutral-100 placeholder:text-neutral-500 focus:border-amarillo focus:outline-none focus:ring-2 focus:ring-amarillo/30"
          />
          <input
            type="password"
            autoComplete="new-password"
            value={repetida}
            onChange={(e) => setRepetida(e.target.value)}
            placeholder="Repítela"
            className="block w-full rounded-md border border-white/15 bg-black/40 px-3 py-2.5 text-sm text-neutral-100 placeholder:text-neutral-500 focus:border-amarillo focus:outline-none focus:ring-2 focus:ring-amarillo/30"
          />

          {corta ? (
            <p className="text-xs text-amber-400">Debe tener al menos {MINIMO} caracteres.</p>
          ) : null}
          {distintas ? <p className="text-xs text-amber-400">Las dos no coinciden.</p> : null}
          {error ? <p className="text-xs text-red-400">{error}</p> : null}

          <button
            type="submit"
            disabled={!valida || guardando}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amarillo to-naranja px-6 py-2.5 text-sm font-bold text-carbon disabled:cursor-not-allowed disabled:opacity-40"
          >
            {guardando ? <Loader2 size={16} className="animate-spin" /> : <KeyRound size={16} />}
            Guardar contraseña
          </button>
        </form>
      )}
    </div>
  );
}
