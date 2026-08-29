import type { Metadata } from 'next';
import Link from 'next/link';
import { Instagram, Mail, MapPin, MessageCircle, Phone, Send } from 'lucide-react';
import { SectionBackdrop } from '@/components/shared/SectionBackdrop';
import { TORNEO_INSTAGRAM, TORNEO_INSTAGRAM_URL } from '@/lib/torneo';

export const metadata: Metadata = {
  title: 'Contacto',
  description: 'Habla con la Fundación Managers.',
};

interface Canal {
  icon: typeof Mail;
  titulo: string;
  valor: string;
  nota: string;
  href?: string;
}

const CANALES: readonly Canal[] = [
  {
    icon: Mail,
    titulo: 'Correo',
    valor: 'williammojica@fundacionmanagers.com',
    nota: 'Respondemos en menos de 48 horas hábiles.',
    href: 'mailto:williammojica@fundacionmanagers.com',
  },
  {
    icon: Phone,
    titulo: 'Celular',
    valor: '+57 312 629 9744',
    nota: 'Disponible en horario laboral (hora Colombia).',
    href: 'tel:+573126299744',
  },
  {
    icon: Instagram,
    titulo: 'Instagram',
    valor: TORNEO_INSTAGRAM,
    nota: 'Síguenos para ver el Torneo Managers en vivo.',
    href: TORNEO_INSTAGRAM_URL,
  },
  {
    icon: MapPin,
    titulo: 'Ubicación',
    valor: 'Bogotá, Colombia',
    nota: 'Trabajamos a nivel nacional y con aliados regionales.',
  },
];

const EJES_SELECT = [
  { value: 'consultoria', label: 'Consultoría empresarial' },
  { value: 'torneo', label: 'Torneo Managers (F7)' },
  { value: 'turismo', label: 'Turismo' },
  { value: 'eventos', label: 'Eventos' },
  { value: 'emprendimiento', label: 'Emprendimiento' },
  { value: 'rural', label: 'Managers Rural' },
  { value: 'otro', label: 'Otro / no estoy seguro' },
] as const;

export default function ContactoPage() {
  return (
    <div className="relative">
      <SectionBackdrop tint="#D4A437" image="/fotos/seccion-home.jpg" />
      <div className="relative z-10 text-neutral-200">
        {/* HERO */}
        <section className="grain relative overflow-hidden">
          <div aria-hidden className="pointer-events-none absolute inset-0" />
          <div className="relative mx-auto max-w-7xl px-6 py-24 lg:px-8 lg:py-28">
            <p className="font-mono text-caption uppercase tracking-[0.3em] text-gold">Hablemos</p>
            <h1 className="mt-5 font-serif text-[42px] font-bold leading-[1.03] text-neutral-50 md:text-[64px]">
              Acércate a la comunidad
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-neutral-300">
              ¿Tienes una idea, un proyecto, un equipo que quiere jugar el torneo o una propuesta de
              aliado? Escríbenos. La mesa es larga.
            </p>
          </div>
        </section>

        {/* CANALES + FORM */}
        <section className="grain relative overflow-hidden">
          <div className="relative mx-auto max-w-7xl px-6 py-24 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr]">
              {/* Canales */}
              <div>
                <p className="font-mono text-caption uppercase tracking-widest text-neutral-500">
                  Canales directos
                </p>
                <h2 className="mt-2 font-display text-2xl font-bold text-neutral-50">
                  Donde nos encuentras
                </h2>

                <ul className="mt-8 space-y-4">
                  {CANALES.map(({ icon: Icon, titulo, valor, nota, href }) => {
                    const Wrapper = href ? 'a' : 'div';
                    const wrapperProps = href
                      ? { href, target: '_blank', rel: 'noopener noreferrer' }
                      : {};
                    return (
                      <li key={titulo}>
                        <Wrapper
                          {...wrapperProps}
                          className="group flex items-start gap-4 rounded-md border border-white/10 bg-[#0d1218]/80 p-5 transition-all duration-200 ease-managers hover:-translate-y-0.5 hover:border-gold hover:shadow-md"
                        >
                          <span
                            aria-hidden
                            className="inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md bg-white/5 text-gold transition-colors duration-200 ease-managers group-hover:bg-gold group-hover:text-neutral-50"
                          >
                            <Icon size={20} />
                          </span>
                          <div>
                            <p className="font-display text-sm font-bold text-neutral-50">
                              {titulo}
                            </p>
                            <p className="mt-0.5 text-sm font-medium text-neutral-300">{valor}</p>
                            <p className="mt-1 text-xs text-neutral-500">{nota}</p>
                          </div>
                        </Wrapper>
                      </li>
                    );
                  })}
                </ul>

                <div className="mt-8 rounded-md border border-dashed border-white/15 p-5">
                  <p className="font-mono text-caption uppercase tracking-widest text-neutral-500">
                    Protección de datos
                  </p>
                  <p className="mt-2 text-xs text-neutral-400">
                    Al escribirnos aceptas nuestra{' '}
                    <Link href="/privacidad/" className="font-semibold text-gold hover:underline">
                      política de privacidad
                    </Link>{' '}
                    conforme a la Ley 1581 de 2012 (Habeas Data Colombia).
                  </p>
                </div>
              </div>

              {/* Formulario UI */}
              <form
                className="rounded-lg border border-white/10 bg-[#0d1218]/80 p-8 shadow-sm"
                aria-describedby="form-status"
              >
                <p className="font-mono text-caption uppercase tracking-widest text-gold">
                  Escríbenos
                </p>
                <h2 className="mt-2 font-display text-2xl font-bold text-neutral-50">
                  Cuéntanos tu idea
                </h2>

                <div className="mt-8 space-y-5">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="nombre"
                        className="block text-sm font-medium text-neutral-300"
                      >
                        Nombre
                      </label>
                      <input
                        id="nombre"
                        type="text"
                        name="nombre"
                        required
                        autoComplete="name"
                        placeholder="Tu nombre"
                        className="mt-2 block w-full rounded-md border border-white/15 px-3 py-2.5 text-sm shadow-sm transition-colors duration-200 ease-managers placeholder:text-neutral-500 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="correo"
                        className="block text-sm font-medium text-neutral-300"
                      >
                        Correo
                      </label>
                      <input
                        id="correo"
                        type="email"
                        name="correo"
                        required
                        autoComplete="email"
                        placeholder="tucorreo@ejemplo.com"
                        className="mt-2 block w-full rounded-md border border-white/15 px-3 py-2.5 text-sm shadow-sm transition-colors duration-200 ease-managers placeholder:text-neutral-500 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="eje" className="block text-sm font-medium text-neutral-300">
                      ¿Sobre qué eje?
                    </label>
                    <select
                      id="eje"
                      name="eje"
                      defaultValue=""
                      required
                      className="mt-2 block w-full rounded-md border border-white/15 bg-[#0d1218]/80 px-3 py-2.5 text-sm shadow-sm transition-colors duration-200 ease-managers focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30"
                    >
                      <option value="" disabled>
                        Selecciona un eje…
                      </option>
                      {EJES_SELECT.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="origen" className="block text-sm font-medium text-neutral-300">
                      ¿De dónde nos conoces?
                    </label>
                    <select
                      id="origen"
                      name="origen"
                      defaultValue=""
                      required
                      className="mt-2 block w-full rounded-md border border-white/15 bg-[#0d1218]/80 px-3 py-2.5 text-sm shadow-sm transition-colors duration-200 ease-managers focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30"
                    >
                      <option value="" disabled>
                        Selecciona…
                      </option>
                      <option value="fm">Fundación Managers</option>
                      <option value="icone">ICONE ialabs</option>
                      <option value="alianza">Managers Lab (powered by ICONE ialabs)</option>
                      <option value="otro">Otro</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="mensaje" className="block text-sm font-medium text-neutral-300">
                      Mensaje
                    </label>
                    <textarea
                      id="mensaje"
                      name="mensaje"
                      required
                      rows={5}
                      placeholder="Cuéntanos en pocas líneas qué tienes en mente."
                      className="mt-2 block w-full resize-none rounded-md border border-white/15 px-3 py-2.5 text-sm shadow-sm transition-colors duration-200 ease-managers placeholder:text-neutral-500 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30"
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
                    disabled
                    title="Envío disponible cuando se conecte el backend en Fase 1"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-gold px-6 py-3 text-sm font-semibold text-carbon shadow-gold transition-all duration-200 ease-managers hover:-translate-y-0.5 hover:bg-gold-hover disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                  >
                    <Send size={18} aria-hidden />
                    Enviar mensaje
                  </button>

                  <p
                    id="form-status"
                    className="rounded-md border border-dashed border-white/15 p-3 text-xs text-neutral-500"
                  >
                    <MessageCircle
                      size={14}
                      className="-mt-0.5 mr-1 inline text-gold"
                      aria-hidden
                    />
                    El envío real se conecta con Resend en la Fase 1 del roadmap. Mientras tanto,
                    escribe a <strong>williammojica@fundacionmanagers.com</strong>.
                  </p>
                </div>
              </form>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
