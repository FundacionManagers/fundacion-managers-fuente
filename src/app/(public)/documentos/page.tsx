import type { Metadata } from 'next';
import { Download, FileText, ShieldCheck } from 'lucide-react';
import { SectionBackdrop } from '@/components/shared/SectionBackdrop';

export const metadata: Metadata = {
  title: 'Documentos institucionales',
  description:
    'Documentos legales y de constitución de la Fundación Managers: estatutos, RUT, actas, certificados y solicitud de inscripción al RTE.',
};

interface Documento {
  titulo: string;
  descripcion: string;
  archivo: string;
  categoria: string;
}

const DOCUMENTOS: Documento[] = [
  {
    titulo: 'Certificado de Cámara de Comercio',
    descripcion: 'Certificado de existencia y representación legal de la Fundación Managers.',
    archivo: '/documentos/certificado-camara-comercio.pdf',
    categoria: 'Constitución',
  },
  {
    titulo: 'Estatutos fundacionales',
    descripcion: 'Estatutos firmados de la Fundación Managers.',
    archivo: '/documentos/estatutos-firmados.pdf',
    categoria: 'Constitución',
  },
  {
    titulo: 'Acta de constitución',
    descripcion: 'Acta autenticada de constitución con aprobación de los estatutos.',
    archivo: '/documentos/acta-constitucion.pdf',
    categoria: 'Constitución',
  },
  {
    titulo: 'Acta N.º 002 — Reforma estatutaria',
    descripcion: 'Acta extraordinaria de reforma de los estatutos de la fundación.',
    archivo: '/documentos/acta-002-reforma-estatutaria.pdf',
    categoria: 'Gobernanza',
  },
  {
    titulo: 'RUT',
    descripcion: 'Registro Único Tributario actualizado a octubre de 2026.',
    archivo: '/documentos/rut.pdf',
    categoria: 'Tributario',
  },
  {
    titulo: 'Certificación de antecedentes y caducidad',
    descripcion: 'Certificación de antecedentes y caducidad a julio de 2026.',
    archivo: '/documentos/certificacion-antecedentes.pdf',
    categoria: 'Jurídico',
  },
  {
    titulo: 'Solicitud de ingreso al RTE',
    descripcion:
      'Solicitud de inscripción al Régimen Tributario Especial ante la DIAN, octubre de 2026.',
    archivo: '/documentos/solicitud-ingreso-rte.pdf',
    categoria: 'Tributario',
  },
];

const COLORES_CATEGORIA: Record<string, string> = {
  Constitución: 'text-gold bg-gold/10 border-gold/20',
  Gobernanza: 'text-terracotta bg-terracotta/10 border-terracotta/20',
  Tributario: 'text-[#4ade80] bg-[#4ade80]/10 border-[#4ade80]/20',
  Jurídico: 'text-sky-400 bg-sky-400/10 border-sky-400/20',
};

export default function DocumentosPage() {
  return (
    <div className="relative">
      <SectionBackdrop tint="#D4A437" image="/fotos/seccion-nosotros.webp" />
      <div className="relative z-10">
        {/* HERO */}
        <section className="grain relative overflow-hidden">
          <div className="relative mx-auto max-w-7xl px-6 py-24 lg:px-8 lg:py-32">
            <div className="animate-fade-up max-w-3xl">
              <p className="font-mono text-caption uppercase tracking-[0.35em] text-gold">
                Transparencia institucional
              </p>
              <h1 className="mt-6 font-serif text-[42px] font-bold leading-[1.03] text-neutral-50 md:text-[64px]">
                Documentos institucionales.
              </h1>
              <p className="mt-7 max-w-2xl font-serif text-xl leading-snug text-neutral-300">
                Documentos legales y de constitución de la Fundación Managers, disponibles para
                descarga libre. Incluyen los exigidos por la DIAN para el proceso de inscripción al
                Régimen Tributario Especial.
              </p>
              <div className="mt-8 flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm text-neutral-400">
                <ShieldCheck size={18} className="shrink-0 text-gold" aria-hidden />
                <span>
                  Todos los documentos son originales o copias autenticadas. La Fundación Managers
                  está inscrita en la Cámara de Comercio de Bogotá, Colombia.
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* DOCUMENTOS */}
        <section className="grain relative overflow-hidden">
          <div className="relative mx-auto max-w-7xl px-6 pb-32 lg:px-8">
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {DOCUMENTOS.map((doc) => (
                <li key={doc.archivo}>
                  <a
                    href={doc.archivo}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex h-full flex-col gap-4 rounded-2xl border border-white/10 bg-[#0d1218]/80 p-7 transition-all duration-200 ease-managers hover:-translate-y-1 hover:border-gold/40 hover:shadow-[0_20px_50px_rgba(212,164,55,0.12)]"
                  >
                    {/* Cabecera */}
                    <div className="flex items-start justify-between gap-3">
                      <span
                        aria-hidden
                        className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/5 text-gold transition-colors duration-200 ease-managers group-hover:bg-gold group-hover:text-neutral-900"
                      >
                        <FileText size={20} />
                      </span>
                      <span
                        className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.15em] ${COLORES_CATEGORIA[doc.categoria] ?? 'text-neutral-400 bg-white/5 border-white/10'}`}
                      >
                        {doc.categoria}
                      </span>
                    </div>

                    {/* Cuerpo */}
                    <div className="flex-1">
                      <h2 className="font-serif text-lg font-bold leading-snug text-neutral-50">
                        {doc.titulo}
                      </h2>
                      <p className="mt-1.5 text-sm text-neutral-400">{doc.descripcion}</p>
                    </div>

                    {/* CTA */}
                    <div className="flex items-center gap-2 text-sm font-semibold text-gold">
                      <Download
                        size={15}
                        aria-hidden
                        className="transition-transform duration-200 ease-managers group-hover:translate-y-0.5"
                      />
                      Descargar PDF
                    </div>
                  </a>
                </li>
              ))}
            </ul>

            {/* Nota legal */}
            <p className="mt-12 text-center text-xs text-neutral-600">
              Información actualizada a octubre de 2026 · Fundación Managers · Bogotá, Colombia ·
              NIT verificable en el RUT adjunto
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
