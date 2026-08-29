'use client';

import { useCallback, useEffect, useState } from 'react';
import { FileSpreadsheet, ImageOff, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { exportarPlantelCSV, jugadorCompleto, type JugadorRow } from '@/lib/jugadores';

interface Props {
  inscripcionId: string;
  equipoNombre: string;
}

/** Convierte JugadorRow a la forma que espera jugadorCompleto (camelCase). */
function esCompleto(j: JugadorRow): boolean {
  return jugadorCompleto({
    id: j.id,
    nombre: j.nombre,
    documento: j.documento,
    celular: j.celular ?? '',
    numero: j.numero == null ? '' : String(j.numero),
    posicion: (j.posicion as 'POR' | 'DEF' | 'MED' | 'DEL') ?? '',
    fechaNacimiento: j.fecha_nacimiento ?? '',
    eps: j.eps ?? '',
    talla: j.talla ?? '',
    fotoUrl: j.foto_url ?? '',
  });
}

export function DashboardPlantel({ inscripcionId, equipoNombre }: Props) {
  const [jugadores, setJugadores] = useState<JugadorRow[]>([]);
  const [fotos, setFotos] = useState<Record<string, string>>({});
  const [cargando, setCargando] = useState(true);

  const cargar = useCallback(async () => {
    if (!supabase) return;
    const { data } = await supabase
      .from('jugadores')
      .select('*')
      .eq('inscripcion_id', inscripcionId)
      .order('orden', { ascending: true });
    const rows = (data as JugadorRow[]) ?? [];
    setJugadores(rows);
    setCargando(false);

    // URLs firmadas para las fotos (bucket privado).
    const conFoto = rows.filter((r) => r.foto_url);
    if (conFoto.length) {
      const { data: signed } = await supabase.storage.from('jugadores').createSignedUrls(
        conFoto.map((r) => r.foto_url as string),
        3600,
      );
      if (signed) {
        const map: Record<string, string> = {};
        signed.forEach((s, i) => {
          const row = conFoto[i];
          if (row && s.signedUrl) map[row.id] = s.signedUrl;
        });
        setFotos(map);
      }
    }
  }, [inscripcionId]);

  useEffect(() => {
    void cargar();
    const id = setInterval(() => void cargar(), 6000);
    return () => clearInterval(id);
  }, [cargar]);

  function exportar() {
    const blob = new Blob([exportarPlantelCSV(equipoNombre, jugadores)], {
      type: 'text/csv;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `plantel-${equipoNombre.replace(/[^\w]+/g, '_')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (cargando) {
    return (
      <p className="mt-4 flex items-center gap-2 text-xs text-neutral-400">
        <Loader2 size={14} className="animate-spin" /> Cargando plantel…
      </p>
    );
  }

  if (jugadores.length === 0) {
    return (
      <p className="mt-4 rounded-lg border border-dashed border-white/10 p-4 text-xs text-neutral-500">
        Este equipo aún no ha registrado jugadores (paso 3).
      </p>
    );
  }

  const completos = jugadores.filter(esCompleto).length;

  return (
    <div className="mt-4 rounded-xl border border-white/10 bg-[#0b0f14]/60 p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-bold uppercase tracking-wide text-neutral-300">
          Plantel · {jugadores.length} jugadores ({completos} completos)
        </p>
        <button
          type="button"
          onClick={exportar}
          className="inline-flex items-center gap-2 rounded-full border border-[#1D6F42]/50 bg-[#1D6F42]/15 px-3 py-1.5 text-xs font-bold text-[#3fbf73] transition-colors hover:bg-[#1D6F42]/25"
        >
          <FileSpreadsheet size={13} /> Exportar plantel
        </button>
      </div>

      <div className="space-y-2">
        {jugadores.map((j, i) => (
          <div
            key={j.id}
            className="flex flex-wrap items-center gap-3 rounded-lg border border-white/5 bg-[#0d1218]/70 p-3 text-sm"
          >
            {/* Foto */}
            {fotos[j.id] ? (
              <a
                href={fotos[j.id]}
                target="_blank"
                rel="noopener noreferrer"
                title="Ver / descargar foto"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={fotos[j.id]}
                  alt={j.nombre}
                  className="h-12 w-12 rounded-md object-cover ring-1 ring-white/15"
                />
              </a>
            ) : (
              <span className="flex h-12 w-12 items-center justify-center rounded-md bg-white/5 text-neutral-600">
                <ImageOff size={16} />
              </span>
            )}

            <div className="min-w-0 flex-1">
              <p className="font-semibold text-neutral-100">
                {j.numero != null ? `#${j.numero} ` : ''}
                {j.nombre || <span className="text-neutral-500">Sin nombre</span>}
                {j.posicion ? (
                  <span className="ml-2 rounded bg-white/10 px-1.5 py-0.5 text-[10px] font-bold text-neutral-300">
                    {j.posicion}
                  </span>
                ) : null}
                {esCompleto(j) ? (
                  <span className="ml-2 text-[10px] font-bold text-[#25D366]">✓</span>
                ) : (
                  <span className="ml-2 text-[10px] font-bold text-amarillo">incompleto</span>
                )}
              </p>
              <p className="text-xs text-neutral-400">
                Doc: {j.documento || '—'} · Cel: {j.celular || '—'} · Nac:{' '}
                {j.fecha_nacimiento || '—'} · EPS: {j.eps || '—'} · Talla: {j.talla || '—'}
              </p>
            </div>
            <span className="text-xs text-neutral-600">{i + 1}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
