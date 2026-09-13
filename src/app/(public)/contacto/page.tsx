import type { Metadata } from 'next';
import Link from 'next/link';
import { Instagram, Mail, MapPin, Phone } from 'lucide-react';
import { FormularioContacto } from '@/components/contacto/FormularioContacto';
import { SectionBackdrop } from '@/components/shared/SectionBackdrop';
import { TORNEO_INSTAGRAM, TORNEO_INSTAGRAM_URL } from '@/lib/torneo';
import { EJES_VISIBLES } from '@/lib/navigation';

export const metadata: Metadata = {
  title: 'Contacto',
  description: 'Habla con la Fundación Managers.',
};

/** Unico lugar donde vive el destino del contacto. Lo usan la tarjeta de
 *  canales y el formulario, que antes lo repetian por su cuenta. */
const CORREO_CONTACTO = 'williammojica@fundacionmanagers.com';
/** El mismo celular de la tarjeta, en el formato que pide wa.me. */
const WHATSAPP_CONTACTO = '573126299744';

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
    valor: CORREO_CONTACTO,
    nota: 'Respondemos en menos de 48 horas hábiles.',
    href: `mailto:${CORREO_CONTACTO}`,
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

/**
 * Se arma desde los ejes visibles para que el formulario nunca ofrezca un
 * frente que ya no está en el sitio. Al volver a mostrar un eje reaparece aquí
 * solo. Quien busque algo que no esté en la lista tiene «Otro».
 */
const EJES_SELECT = [
  ...EJES_VISIBLES.map((e) => ({ value: e.slug, label: e.nombre })),
  { value: 'otro', label: 'Otro / no estoy seguro' },
];

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

              {/* El formulario vive en un componente de cliente porque tiene que
                  reaccionar al envio. Antes era pura maqueta: el boton estaba
                  deshabilitado y el unico aviso era un `title`, invisible en
                  movil. */}
              <FormularioContacto
                correo={CORREO_CONTACTO}
                ejes={EJES_SELECT}
                whatsapp={WHATSAPP_CONTACTO}
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
