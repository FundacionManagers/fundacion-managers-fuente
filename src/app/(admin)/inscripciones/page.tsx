import type { Metadata } from 'next';
import { ShieldAlert } from 'lucide-react';
import { InscripcionesDashboard } from '@/components/torneo/InscripcionesDashboard';
import { NavAdmin } from '@/components/shared/NavAdmin';

export const metadata: Metadata = {
  title: 'Dashboard de inscripciones · Admin',
  robots: { index: false, follow: false },
};

export default function AdminInscripcionesPage() {
  return (
    <div className="min-h-screen bg-carbon">
      <div className="mx-auto max-w-5xl px-6 py-16 lg:py-20">
        <NavAdmin actual="/inscripciones/" />

        <p className="mt-8 font-bufon text-sm font-bold uppercase tracking-[0.25em] text-naranja">
          Panel interno · Torneo Managers
        </p>
        <h1 className="mt-2 font-sport text-5xl uppercase leading-none text-neutral-50 md:text-6xl">
          Inscripciones
        </h1>
        <div className="energy-bar mt-5 h-1 w-32 rounded-full" />

        <p className="mt-6 flex items-start gap-2 rounded-md border border-dashed border-amarillo/40 bg-amarillo/5 p-4 text-xs text-neutral-300">
          <ShieldAlert size={16} className="mt-0.5 shrink-0 text-amarillo" aria-hidden />
          <span>
            Datos personales (Ley 1581 de 2012). La información se guarda en la base de datos
            privada (Supabase) protegida con control de acceso; solo personal autorizado puede
            verla. No la publiques en el sitio ni en un repositorio público.
          </span>
        </p>

        <div className="mt-10">
          <InscripcionesDashboard />
        </div>
      </div>
    </div>
  );
}
