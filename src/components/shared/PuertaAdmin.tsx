'use client';

import { useCallback, useEffect, useState } from 'react';
import { supabase, supabaseConfigurado } from '@/lib/supabase';

/**
 * Envoltura de acceso para las pantallas de administración.
 *
 * Ofrece las dos formas de entrar —contraseña y enlace al correo— y, una vez
 * dentro, comprueba que el correo esté en `public.admins`. Esa comprobación
 * es solo para dar un mensaje claro: quien mande la seguridad son las
 * políticas RLS de la base, que rechazan la escritura aunque esta pantalla
 * se saltara.
 *
 * Es un componente aparte, no una refactorización del panel de inscripciones:
 * aquel ya funciona y no había razón para arriesgarlo.
 */
export function PuertaAdmin({
  titulo,
  children,
}: {
  titulo: string;
  children: (salir: () => Promise<void>) => React.ReactNode;
}) {
  const [listo, setListo] = useState(false);
  const [sesion, setSesion] = useState(false);
  const [correoSesion, setCorreoSesion] = useState('');
  const [autorizado, setAutorizado] = useState<boolean | null>(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);

  const revisarAutorizacion = useCallback(async (correo: string) => {
    if (!supabase) return;
    const { data, error: err } = await supabase
      .from('admins')
      .select('correo')
      .eq('correo', correo.toLowerCase())
      .eq('activo', true)
      .maybeSingle();
    setAutorizado(!err && data != null);
  }, []);

  useEffect(() => {
    if (!supabaseConfigurado || !supabase) {
      setListo(true);
      return;
    }
    supabase.auth.getSession().then(({ data }) => {
      const correo = data.session?.user?.email ?? '';
      setSesion(data.session != null);
      setCorreoSesion(correo);
      if (correo) void revisarAutorizacion(correo);
      setListo(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      const correo = s?.user?.email ?? '';
      setSesion(s != null);
      setCorreoSesion(correo);
      setAutorizado(null);
      if (correo) void revisarAutorizacion(correo);
    });
    return () => sub.subscription.unsubscribe();
  }, [revisarAutorizacion]);

  async function entrarConClave(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase) return;
    setError('');
    const { error: err } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (err) setError('Credenciales incorrectas.');
  }

  async function enviarEnlace() {
    if (!supabase) return;
    const correo = email.trim();
    if (!correo) {
      setError('Escribe tu correo primero.');
      return;
    }
    setError('');
    setEnviando(true);
    const { error: err } = await supabase.auth.signInWithOtp({
      email: correo,
      options: { emailRedirectTo: window.location.origin + window.location.pathname },
    });
    setEnviando(false);
    if (err) {
      setError('No se pudo enviar el enlace. Intenta con tu contraseña.');
      return;
    }
    setEnviado(true);
  }

  async function salir() {
    if (!supabase) return;
    await supabase.auth.signOut();
    setAutorizado(null);
  }

  if (!listo) {
    return <p className="text-sm text-neutral-400">Verificando sesión…</p>;
  }

  if (!supabaseConfigurado) {
    return (
      <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
        Supabase no está configurado en este entorno, así que el panel no puede abrirse.
      </p>
    );
  }

  // ── Sin sesión: pantalla de ingreso ──────────────────────────────────
  if (!sesion) {
    return (
      <div className="mx-auto max-w-sm rounded-3xl border border-white/10 bg-[#0b0f14]/80 p-8">
        <h2 className="font-sport text-2xl uppercase text-neutral-50">{titulo}</h2>
        <p className="mt-2 text-sm text-neutral-400">Solo personal autorizado de la Fundación.</p>

        <form onSubmit={entrarConClave} className="mt-6 space-y-4">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Correo"
            className="block w-full rounded-md border border-white/15 px-3 py-2.5 text-sm placeholder:text-neutral-500 focus:border-amarillo focus:outline-none focus:ring-2 focus:ring-amarillo/30"
          />
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Contraseña"
            className="block w-full rounded-md border border-white/15 px-3 py-2.5 text-sm placeholder:text-neutral-500 focus:border-amarillo focus:outline-none focus:ring-2 focus:ring-amarillo/30"
          />
          {error ? <p className="text-xs text-red-400">{error}</p> : null}
          <button
            type="submit"
            className="inline-flex w-full items-center justify-center rounded-full bg-gradient-to-r from-amarillo to-naranja px-7 py-3 text-sm font-bold text-carbon transition-transform hover:-translate-y-0.5"
          >
            Ingresar
          </button>
        </form>

        <div className="mt-6 flex items-center gap-3">
          <span className="h-px flex-1 bg-white/10" />
          <span className="font-bufon text-[10px] uppercase tracking-[0.2em] text-neutral-500">o</span>
          <span className="h-px flex-1 bg-white/10" />
        </div>

        {enviado ? (
          <p className="mt-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
            Te enviamos un enlace a <strong>{email.trim()}</strong>. Ábrelo desde este mismo
            dispositivo.
          </p>
        ) : (
          <button
            type="button"
            onClick={() => void enviarEnlace()}
            disabled={enviando}
            className="mt-4 inline-flex w-full items-center justify-center rounded-full border border-white/20 px-7 py-3 text-sm font-semibold text-neutral-200 transition-colors hover:border-amarillo/60 hover:text-amarillo disabled:opacity-50"
          >
            {enviando ? 'Enviando…' : 'Enviarme un enlace al correo'}
          </button>
        )}
        <p className="mt-3 text-center text-xs text-neutral-500">
          Sin contraseña: te llega un enlace de un solo uso.
        </p>
      </div>
    );
  }

  // ── Con sesión pero fuera de la lista blanca ─────────────────────────
  if (autorizado === false) {
    return (
      <div className="mx-auto max-w-md rounded-3xl border border-red-500/30 bg-red-500/5 p-8 text-center">
        <h2 className="font-sport text-2xl uppercase text-neutral-50">Sin autorización</h2>
        <p className="mt-3 text-sm text-neutral-300">
          La cuenta <strong>{correoSesion}</strong> tiene sesión válida, pero no está en la lista
          de administradores del torneo.
        </p>
        <p className="mt-2 text-xs text-neutral-500">
          Pide que agreguen tu correo a la lista para poder cargar resultados.
        </p>
        <button
          type="button"
          onClick={() => void salir()}
          className="mt-6 rounded-full border border-white/20 px-6 py-2.5 text-sm font-semibold text-neutral-200 hover:border-amarillo/60 hover:text-amarillo"
        >
          Cerrar sesión
        </button>
      </div>
    );
  }

  if (autorizado === null) {
    return <p className="text-sm text-neutral-400">Comprobando permisos…</p>;
  }

  return <>{children(salir)}</>;
}
