'use client';

import { useCallback, useEffect, useState } from 'react';
import { CloudUpload, Globe, HelpCircle } from 'lucide-react';
import { asset } from '@/lib/asset';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

interface Marca {
  ultimo_cambio: string | null;
  filas: number | null;
}

interface Info extends Marca {
  publicado_en: string;
}

type Estado =
  | { tipo: 'cargando' }
  | { tipo: 'al-dia'; publicadoEn: string }
  | { tipo: 'pendiente'; publicadoEn: string }
  | { tipo: 'desconocido' };

function haceCuanto(iso: string): string {
  const minutos = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (minutos < 1) return 'hace menos de un minuto';
  if (minutos === 1) return 'hace un minuto';
  if (minutos < 60) return `hace ${minutos} minutos`;
  const horas = Math.round(minutos / 60);
  if (horas === 1) return 'hace una hora';
  if (horas < 24) return `hace ${horas} horas`;
  const dias = Math.round(horas / 24);
  return dias === 1 ? 'hace un día' : `hace ${dias} días`;
}

/**
 * Responde la pregunta que uno se hace después de guardar: ¿esto ya salió al
 * aire?
 *
 * Compara la marca del sitio publicado —que el build deja en
 * `build-info.json`— contra la que tiene la base ahora mismo. Si difieren,
 * hay cambios esperando al próximo despliegue automático.
 *
 * No se limita a mostrar la hora del último despliegue: eso no distingue
 * entre "tu cambio ya está" y "se publicó antes de que guardaras".
 */
export function EstadoPublicacion() {
  const [estado, setEstado] = useState<Estado>({ tipo: 'cargando' });

  const revisar = useCallback(async () => {
    try {
      // El parámetro evita que el navegador sirva un build-info viejo.
      const r = await fetch(`${asset('/build-info.json')}?t=${Date.now()}`, {
        cache: 'no-store',
      });
      if (!r.ok) return setEstado({ tipo: 'desconocido' });
      const info: Info = await r.json();

      if (!supabase || info.ultimo_cambio == null) {
        return setEstado({ tipo: 'desconocido' });
      }

      const { data, error } = await supabase
        .from('torneo_marca')
        .select('ultimo_cambio, filas')
        .maybeSingle();
      if (error || !data) return setEstado({ tipo: 'desconocido' });

      const actual = data as Marca;
      const igual =
        actual.ultimo_cambio === info.ultimo_cambio && actual.filas === info.filas;

      setEstado({
        tipo: igual ? 'al-dia' : 'pendiente',
        publicadoEn: info.publicado_en,
      });
    } catch {
      setEstado({ tipo: 'desconocido' });
    }
  }, []);

  useEffect(() => {
    void revisar();
    const id = setInterval(() => void revisar(), 60_000);
    return () => clearInterval(id);
  }, [revisar]);

  if (estado.tipo === 'cargando') return null;

  if (estado.tipo === 'desconocido') {
    return (
      <p className="flex items-center gap-2 text-xs text-neutral-500">
        <HelpCircle size={14} /> No se pudo comprobar el estado de publicación.
      </p>
    );
  }

  const pendiente = estado.tipo === 'pendiente';
  const Icono = pendiente ? CloudUpload : Globe;

  return (
    <p
      className={cn(
        'flex flex-wrap items-center gap-2 rounded-lg border px-3 py-2 text-xs',
        pendiente
          ? 'border-amarillo/40 bg-amarillo/10 text-amarillo'
          : 'border-emerald-500/30 bg-emerald-500/5 text-emerald-400',
      )}
    >
      <Icono size={14} className="shrink-0" />
      {pendiente ? (
        <>
          <strong>Hay cambios sin publicar.</strong>
          <span className="text-amarillo/80">
            El sitio se actualiza solo en unos minutos. Último despliegue{' '}
            {haceCuanto(estado.publicadoEn)}.
          </span>
        </>
      ) : (
        <>
          <strong>Todo publicado.</strong>
          <span className="text-emerald-400/80">
            El sitio salió al aire {haceCuanto(estado.publicadoEn)} con estos datos.
          </span>
        </>
      )}
    </p>
  );
}
