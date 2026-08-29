'use client';

import { useEffect, useState } from 'react';
import { CreditCard, ShieldCheck } from 'lucide-react';
import { GoldCoin } from '@/components/shared/GoldCoin';
import { WhatsAppIcon } from '@/components/shared/WhatsAppIcon';
import { supabasePublico } from '@/lib/supabase';
import { BOLD_PAGO, pagoConfigurado } from '@/lib/pago';

function urlSoporte(equipo: string): string {
  const msg = `Hola, tengo una duda con el pago de la inscripción de mi equipo${
    equipo ? ` "${equipo}"` : ''
  } al Torneo Managers.`;
  return `https://wa.me/${BOLD_PAGO.WHATSAPP}?text=${encodeURIComponent(msg)}`;
}

function urlPagoWhatsApp(equipo: string): string {
  // El valor solo se nombra si está publicado: si no, el mensaje saldría con
  // un "(valor )" vacío.
  const msg = `Hola, quiero pagar la inscripción de mi equipo${
    equipo ? ` "${equipo}"` : ''
  } al Torneo Managers${BOLD_PAGO.VALOR ? ` (valor ${BOLD_PAGO.VALOR})` : ''}. ¿Cómo realizo el pago?`;
  return `https://wa.me/${BOLD_PAGO.WHATSAPP}?text=${encodeURIComponent(msg)}`;
}

export function PagoBold() {
  const [equipo, setEquipo] = useState('');

  useEffect(() => {
    if (!supabasePublico) return;
    const params = new URLSearchParams(window.location.search);
    let id = params.get('eq') ?? '';
    let t = params.get('t') ?? '';
    if (!id || !t) {
      try {
        const local = JSON.parse(window.localStorage.getItem('fm-mi-inscripcion') ?? '{}');
        id = id || local.id || '';
        t = t || local.token || '';
        if (local.equipo) setEquipo(local.equipo);
      } catch {
        /* noop */
      }
    }
    if (id && t) {
      supabasePublico.rpc('fm_get_equipo', { p_id: id, p_token: t }).then(({ data }) => {
        const nombre = (data as { inscripcion?: { equipo?: string } } | null)?.inscripcion?.equipo;
        if (nombre) setEquipo(nombre);
      });
    }
  }, []);

  return (
    <div className="mx-auto max-w-lg space-y-6">
      {/* Stepper */}
      <div className="flex items-center justify-center gap-2" aria-hidden>
        {[1, 2, 3, 4, 5].map((n) => (
          <span
            key={n}
            className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
              n <= 3
                ? 'bg-gradient-to-br from-amarillo to-naranja text-carbon'
                : n === 4
                  ? 'border-2 border-[#25D366] text-[#25D366]'
                  : 'border border-white/15 text-neutral-500'
            }`}
          >
            {n <= 3 ? '✓' : n}
          </span>
        ))}
      </div>

      <div className="rounded-3xl border border-white/10 bg-[#0b0f14]/80 p-8 text-center">
        <CreditCard size={44} className="mx-auto text-amarillo" />
        <h2 className="mt-3 font-sport text-3xl uppercase text-neutral-50">Paso 4 · Pago</h2>
        {equipo ? (
          <p className="mt-1 text-sm font-semibold uppercase tracking-wide text-gold">{equipo}</p>
        ) : null}

        <p className="mt-4 text-sm text-neutral-300">
          Asegura el cupo de tu equipo pagando la inscripción de forma segura con{' '}
          <strong className="text-neutral-100">Bold</strong>.
        </p>

        {/* El recuadro del importe solo existe si hay precio publicado. Sin
            valor no se pinta nada: un "Por confirmar" ahí sería el mismo
            placeholder que la auditoría quitó del resto del sitio. */}
        {BOLD_PAGO.VALOR ? (
          <div className="mt-5 rounded-2xl border border-white/10 bg-[#0d1218]/70 p-5">
            <p className="text-xs uppercase tracking-wide text-neutral-400">
              Valor de la inscripción
            </p>
            <p className="mt-1 font-sport text-4xl text-amarillo">{BOLD_PAGO.VALOR}</p>
          </div>
        ) : null}

        {/* El link de Bold es de monto abierto: pregunta cuánto se va a pagar
            y el campo arranca en $0. Sin este aviso el capitán llega a la
            pasarela sin saber qué teclear. */}
        {pagoConfigurado && BOLD_PAGO.MONTO_ABIERTO ? (
          <p className="mt-5 rounded-2xl border border-white/10 bg-[#0d1218]/70 p-5 text-sm leading-relaxed text-neutral-300">
            Bold te va a preguntar cuánto vas a pagar y el campo empieza en $0.{' '}
            {BOLD_PAGO.VALOR ? (
              <>
                Escribe <strong className="text-neutral-100">{BOLD_PAGO.VALOR}</strong> exacto.
              </>
            ) : (
              <>
                Escribe el valor de la inscripción que te confirmó la organización. Si no lo tienes
                a mano, pregúntalo antes de pagar con el botón de abajo.
              </>
            )}
          </p>
        ) : null}

        {pagoConfigurado ? (
          <a
            href={BOLD_PAGO.LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-amarillo to-naranja px-7 py-4 text-base font-bold text-carbon shadow-[0_12px_40px_rgba(232,114,44,0.4)] transition-all duration-200 ease-managers hover:-translate-y-0.5"
          >
            <CreditCard size={20} /> Pagar con Bold
          </a>
        ) : BOLD_PAGO.POR_WHATSAPP ? (
          <a
            href={urlPagoWhatsApp(equipo)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] px-7 py-4 text-base font-bold text-white shadow-[0_12px_40px_rgba(37,211,102,0.35)] transition-all duration-200 ease-managers hover:-translate-y-0.5"
          >
            <WhatsAppIcon size={20} /> Coordinar el pago por WhatsApp
          </a>
        ) : (
          <p className="mt-6 rounded-full border border-dashed border-white/20 px-6 py-4 text-sm font-semibold text-neutral-400">
            El botón de pago estará disponible muy pronto.
          </p>
        )}

        <p className="mt-4 flex items-center justify-center gap-2 text-xs text-neutral-500">
          <ShieldCheck size={14} className="text-gold" />
          {pagoConfigurado
            ? 'Pago seguro procesado por Bold.'
            : 'Te coordinamos el pago por WhatsApp. Pronto, pago en línea con Bold.'}
        </p>

        {pagoConfigurado ? (
          <a
            href={urlSoporte(equipo)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center justify-center gap-2 rounded-full border border-white/15 px-5 py-2.5 text-xs font-bold text-neutral-200 transition-colors hover:border-[#25D366] hover:text-[#25D366]"
          >
            <WhatsAppIcon size={14} /> Tengo una duda con el pago
          </a>
        ) : null}
      </div>

      <a
        href={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}/torneo/inscripciones/listo/`}
        className="cta-glow inline-flex w-full items-center justify-center gap-2.5 rounded-full border-2 border-amarillo bg-amarillo/10 px-6 py-3.5 text-sm font-bold text-amarillo transition-all duration-200 ease-managers hover:-translate-y-0.5 hover:bg-amarillo/20"
      >
        <GoldCoin size={26} className="coin-spin drop-shadow-none" ariaLabel="" />
        Ya coordiné mi pago — ver paso 5 (programación)
      </a>

      <p className="text-center text-xs text-neutral-500">
        Tras confirmar tu pago, el <strong className="text-neutral-300">paso 5</strong> es recibir
        la programación del torneo. Te la enviamos por el grupo de WhatsApp.
      </p>
    </div>
  );
}
