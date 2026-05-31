'use client';

import Link from 'next/link';
import { useState } from 'react';
import { CheckCircle2, ShieldCheck } from 'lucide-react';
import { GoldCoin } from '@/components/shared/GoldCoin';
import { WhatsAppIcon } from '@/components/shared/WhatsAppIcon';
import { supabase, supabaseConfigurado } from '@/lib/supabase';

/** Celular oficial al que llega la pre-inscripción por WhatsApp. */
const WHATSAPP_NUMERO = '573126299744';

function construirMensaje(capitan: string, equipo: string): string {
  return [
    'Hola, ya hice mi pre-inscripción al Torneo Managers — Edición 4° (2026-2) y quiero solicitar unirme al grupo de WhatsApp.',
    `Capitán: ${capitan}`,
    `Equipo: ${equipo}`,
  ].join('\n');
}

function urlWhatsApp(capitan: string, equipo: string): string {
  const mensaje = construirMensaje(capitan, equipo);
  return `https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(mensaje)}`;
}

type Estado = 'idle' | 'enviando' | 'enviado' | 'error';

export function InscripcionForm() {
  const [capitan, setCapitan] = useState('');
  const [equipo, setEquipo] = useState('');
  const [contacto, setContacto] = useState('');
  const [autoriza, setAutoriza] = useState(false);
  const [estado, setEstado] = useState<Estado>('idle');

  const listo =
    capitan.trim() !== '' && equipo.trim() !== '' && contacto.trim() !== '' && autoriza;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!listo) return;

    const cap = capitan.trim();
    const eq = equipo.trim();
    const tel = contacto.trim();

    // Giro mínimo visible: aunque el guardado sea instantáneo, la moneda gira
    // al menos este tiempo para que se perciba el "procesando".
    const giroMinimo = new Promise((r) => setTimeout(r, 1300));

    // Si Supabase está configurado, guardamos la pre-inscripción en la BD.
    if (supabaseConfigurado && supabase) {
      setEstado('enviando');
      try {
        const { error } = await supabase.from('inscripciones').insert({
          equipo: eq,
          capitan: cap,
          contacto: tel || null,
        });
        if (error) {
          // No bloqueamos al usuario: dejamos registro en consola y seguimos
          // a WhatsApp para no perder el lead (red/caché/extensión, etc.).
          console.error('Supabase insert error:', error.message);
        }
      } catch (err) {
        console.error('Supabase insert exception:', err);
      }
      await giroMinimo;
      // No saltamos automáticamente: mostramos la confirmación y dejamos que
      // el usuario abra WhatsApp con un botón (evita el salto que confunde).
      setEstado('enviado');
      return;
    }

    // Respaldo (sin BD): mostramos confirmación; el usuario abre WhatsApp.
    setEstado('enviando');
    await giroMinimo;
    setEstado('enviado');
  }

  if (estado === 'enviado') {
    return (
      <div className="space-y-5 text-center">
        <CheckCircle2 size={48} className="mx-auto text-gold" aria-hidden />
        <div>
          <h3 className="font-sport text-3xl uppercase text-neutral-50">¡Vas muy bien!</h3>
          <p className="mt-1 text-sm font-semibold uppercase tracking-wide text-gold">
            Paso 1 de 5 completado
          </p>
        </div>

        {/* Mini progreso de los 5 pasos */}
        <div className="flex items-center justify-center gap-2" aria-hidden>
          {[1, 2, 3, 4, 5].map((n) => (
            <span
              key={n}
              className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                n === 1
                  ? 'bg-gradient-to-br from-amarillo to-naranja text-carbon'
                  : n === 2
                    ? 'border-2 border-[#25D366] text-[#25D366]'
                    : 'border border-white/15 text-neutral-500'
              }`}
            >
              {n === 1 ? '✓' : n}
            </span>
          ))}
        </div>

        <p className="text-sm text-neutral-300">
          Tu pre-inscripción quedó registrada. El{' '}
          <strong className="text-neutral-100">paso 2</strong> es{' '}
          <strong className="text-neutral-100">solicitar unirte al grupo de WhatsApp</strong> del
          torneo: toca el botón de abajo para enviar tu solicitud. Cuando te acepten, ahí te
          guiamos para confirmar el equipo, hacer el pago y recibir la programación.
        </p>
        <a
          href={urlWhatsApp(capitan.trim(), equipo.trim())}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex w-full items-center justify-center gap-2.5 rounded-full bg-[#25D366] px-7 py-3.5 text-sm font-bold text-white shadow-[0_12px_40px_rgba(37,211,102,0.35)] transition-all duration-200 ease-managers hover:-translate-y-0.5"
        >
          <WhatsAppIcon size={20} /> Solicitar unirme al grupo (paso 2)
        </a>
        <p className="text-xs text-neutral-500">Se abrirá WhatsApp en una pestaña nueva.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="capitan" className="block text-sm font-medium text-neutral-300">
          Nombre del capitán
        </label>
        <input
          id="capitan"
          type="text"
          name="capitan"
          required
          autoComplete="name"
          value={capitan}
          onChange={(e) => setCapitan(e.target.value)}
          placeholder="Tu nombre completo"
          className="mt-2 block w-full rounded-md border border-white/15 px-3 py-2.5 text-sm shadow-sm transition-colors duration-200 ease-managers placeholder:text-neutral-500 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30"
        />
      </div>

      <div>
        <label htmlFor="equipo" className="block text-sm font-medium text-neutral-300">
          Nombre del equipo
        </label>
        <input
          id="equipo"
          type="text"
          name="equipo"
          required
          value={equipo}
          onChange={(e) => setEquipo(e.target.value)}
          placeholder="Como quieres que aparezca en la tabla"
          className="mt-2 block w-full rounded-md border border-white/15 px-3 py-2.5 text-sm shadow-sm transition-colors duration-200 ease-managers placeholder:text-neutral-500 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30"
        />
      </div>

      <div>
        <label htmlFor="contacto" className="block text-sm font-medium text-neutral-300">
          WhatsApp
        </label>
        <input
          id="contacto"
          type="tel"
          name="contacto"
          required
          autoComplete="tel"
          value={contacto}
          onChange={(e) => setContacto(e.target.value)}
          placeholder="+57 3xx xxx xxxx"
          className="mt-2 block w-full rounded-md border border-white/15 px-3 py-2.5 text-sm shadow-sm transition-colors duration-200 ease-managers placeholder:text-neutral-500 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30"
        />
      </div>

      <label className="flex items-start gap-2 text-xs text-neutral-400">
        <input
          type="checkbox"
          checked={autoriza}
          onChange={(e) => setAutoriza(e.target.checked)}
          className="mt-0.5 h-4 w-4 rounded border-white/15 text-gold focus:ring-gold"
        />
        <span>
          Autorizo el tratamiento de mis datos personales según la{' '}
          <Link href="/privacidad/" className="font-semibold text-gold hover:underline">
            política de privacidad
          </Link>{' '}
          (Ley 1581 de 2012).
        </span>
      </label>

      {estado === 'error' ? (
        <p className="rounded-md border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-300">
          No pudimos registrar la pre-inscripción. Intenta de nuevo o escríbenos por WhatsApp.
        </p>
      ) : null}

      <button
        type="submit"
        disabled={!listo || estado === 'enviando'}
        className="inline-flex w-full items-center justify-center gap-3 rounded-full bg-gradient-to-r from-amarillo to-naranja py-2 pl-2.5 pr-7 text-sm font-bold text-carbon shadow-[0_12px_40px_rgba(232,114,44,0.4)] transition-all duration-200 ease-managers hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
      >
        <GoldCoin
          size={44}
          className={`shrink-0 drop-shadow-none ${estado === 'enviando' ? 'coin-spin' : ''}`}
          ariaLabel=""
        />
        {estado === 'enviando' ? 'Enviando…' : 'Enviar pre-inscripción'}
      </button>

      <p className="flex items-start gap-2 rounded-md border border-dashed border-white/15 p-3 text-xs text-neutral-500">
        <ShieldCheck size={14} className="mt-0.5 shrink-0 text-gold" aria-hidden />
        {supabaseConfigurado
          ? 'Guardamos tu pre-inscripción de forma segura y te llevamos a WhatsApp para unirte al grupo del torneo. Tus datos no se publican en el sitio.'
          : 'Al continuar te llevamos a un chat de WhatsApp con la Fundación para unirte al grupo del torneo. Tus datos no se publican en el sitio.'}
      </p>
    </form>
  );
}
