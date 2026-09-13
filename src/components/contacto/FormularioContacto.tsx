'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MessageCircle, Send } from 'lucide-react';

/**
 * El formulario de contacto, que ahora sí envía.
 *
 * Antes era decorativo: los cinco campos funcionaban, pero el botón estaba
 * deshabilitado y lo único que lo explicaba era un `title` —invisible en
 * cualquier pantalla táctil— que además hablaba de conectar el backend en una
 * fase interna. Alguien escribía su mensaje completo y se topaba con un botón
 * muerto al final. Ese contacto se perdía sin que nadie se enterara.
 *
 * El sitio es estático y no tiene servidor donde recibir un envío, así que el
 * mensaje se compone y se entrega al cliente de correo de quien escribe. No
 * hace falta backend, nada viaja a un tercero y el texto queda redactado: solo
 * hay que pulsar enviar. Si el navegador no tiene cliente de correo asociado,
 * debajo quedan el correo y el WhatsApp para copiar a mano.
 */

interface Props {
  /** A dónde llega el mensaje. */
  correo: string;
  /** Los ejes que hoy ofrece el sitio, más «Otro». */
  ejes: readonly { value: string; label: string }[];
  /** Celular en formato internacional sin signos, para el enlace de WhatsApp. */
  whatsapp: string;
}

const ORIGENES = [
  { value: 'fm', label: 'Fundación Managers' },
  { value: 'icone', label: 'ICONE ialabs' },
  { value: 'alianza', label: 'Managers Lab (powered by ICONE ialabs)' },
  { value: 'otro', label: 'Otro' },
] as const;

const campo =
  'mt-2 block w-full rounded-md border border-white/15 px-3 py-2.5 text-sm shadow-sm transition-colors duration-200 ease-managers placeholder:text-neutral-500 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30';
const desplegable = `${campo} bg-[#0d1218]/80`;
const etiqueta = 'block text-sm font-medium text-neutral-300';

export function FormularioContacto({ correo, ejes, whatsapp }: Props) {
  const [enviado, setEnviado] = useState(false);

  function componer(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const datos = new FormData(e.currentTarget);
    const texto = (k: string) => String(datos.get(k) ?? '').trim();

    const eje = ejes.find((o) => o.value === texto('eje'))?.label ?? texto('eje');
    const origen = ORIGENES.find((o) => o.value === texto('origen'))?.label ?? texto('origen');

    const asunto = `Contacto desde la web · ${eje}`;
    const cuerpo = [
      `Nombre: ${texto('nombre')}`,
      `Correo: ${texto('correo')}`,
      `Eje: ${eje}`,
      `Nos conoce por: ${origen}`,
      '',
      texto('mensaje'),
    ].join('\n');

    window.location.href = `mailto:${correo}?subject=${encodeURIComponent(
      asunto,
    )}&body=${encodeURIComponent(cuerpo)}`;
    setEnviado(true);
  }

  return (
    <form
      onSubmit={componer}
      className="rounded-lg border border-white/10 bg-[#0d1218]/80 p-8 shadow-sm"
      aria-describedby="form-status"
    >
      <p className="font-mono text-caption uppercase tracking-widest text-gold">Escríbenos</p>
      <h2 className="mt-2 font-display text-2xl font-bold text-neutral-50">Cuéntanos tu idea</h2>

      <div className="mt-8 space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="nombre" className={etiqueta}>
              Nombre
            </label>
            <input
              id="nombre"
              type="text"
              name="nombre"
              required
              autoComplete="name"
              placeholder="Tu nombre"
              className={campo}
            />
          </div>
          <div>
            <label htmlFor="correo" className={etiqueta}>
              Correo
            </label>
            <input
              id="correo"
              type="email"
              name="correo"
              required
              autoComplete="email"
              placeholder="tucorreo@ejemplo.com"
              className={campo}
            />
          </div>
        </div>

        <div>
          <label htmlFor="eje" className={etiqueta}>
            ¿Sobre qué eje?
          </label>
          <select id="eje" name="eje" defaultValue="" required className={desplegable}>
            <option value="" disabled>
              Selecciona un eje…
            </option>
            {ejes.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="origen" className={etiqueta}>
            ¿De dónde nos conoces?
          </label>
          <select id="origen" name="origen" defaultValue="" required className={desplegable}>
            <option value="" disabled>
              Selecciona…
            </option>
            {ORIGENES.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="mensaje" className={etiqueta}>
            Mensaje
          </label>
          <textarea
            id="mensaje"
            name="mensaje"
            required
            rows={5}
            placeholder="Cuéntanos en pocas líneas qué tienes en mente."
            className={`${campo} resize-none`}
          />
        </div>

        <label className="flex items-start gap-2 text-xs text-neutral-400">
          <input
            type="checkbox"
            required
            className="mt-0.5 h-4 w-4 rounded border-white/15 text-gold focus:ring-gold"
          />
          <span>
            Autorizo el tratamiento de mis datos personales según la{' '}
            <Link href="/privacidad/" className="font-semibold text-gold hover:underline">
              política de privacidad
            </Link>
            .
          </span>
        </label>

        <button
          type="submit"
          className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-gold px-6 py-3 text-sm font-semibold text-carbon shadow-gold transition-all duration-200 ease-managers hover:-translate-y-0.5 hover:bg-gold-hover sm:w-auto"
        >
          <Send size={18} aria-hidden />
          Enviar mensaje
        </button>

        {/* `aria-live` para que quien use lector de pantalla se entere de que
            algo pasó: el correo se abre en otra aplicación y, sin aviso, la
            página parecería no haber hecho nada. */}
        <p
          id="form-status"
          aria-live="polite"
          className="rounded-md border border-dashed border-white/15 p-3 text-xs text-neutral-400"
        >
          <MessageCircle size={14} className="-mt-0.5 mr-1 inline text-gold" aria-hidden />
          {enviado ? (
            <>
              Abrimos tu correo con el mensaje ya redactado: revísalo y pulsa enviar. Si no se
              abrió, escríbenos a <strong>{correo}</strong> o por{' '}
              <a
                href={`https://wa.me/${whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-gold hover:underline"
              >
                WhatsApp
              </a>
              .
            </>
          ) : (
            <>
              Al enviar, abrimos tu programa de correo con el mensaje redactado. También puedes
              escribir directo a <strong>{correo}</strong> o por{' '}
              <a
                href={`https://wa.me/${whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-gold hover:underline"
              >
                WhatsApp
              </a>
              .
            </>
          )}
        </p>
      </div>
    </form>
  );
}
