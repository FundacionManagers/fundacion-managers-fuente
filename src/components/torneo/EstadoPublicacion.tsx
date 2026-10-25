'use client';

import { useCallback, useEffect, useState } from 'react';
import { CloudUpload, Globe, HelpCircle, Loader2, Rocket } from 'lucide-react';
import { asset } from '@/lib/asset';
import { EDICION_DATOS, ES_ENSAYOS } from '@/lib/entorno';
import { pedirPublicacion } from '@/lib/panel-torneo';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

interface Marca {
  ultimo_cambio: string | null;
  filas: number | null;
}

interface Info extends Marca {
  publicado_en: string;
  /** 'respaldo' si el build no pudo leer la base. Falta en builds anteriores. */
  origen?: 'supabase' | 'respaldo';
}

type Estado =
  | { tipo: 'cargando' }
  | { tipo: 'al-dia'; publicadoEn: string }
  | { tipo: 'pendiente'; publicadoEn: string }
  | { tipo: 'respaldo'; publicadoEn: string }
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
 * hay cambios que todavía no salieron: el panel pide la publicación al
 * guardar, y este botón la repite si hizo falta.
 *
 * No se limita a mostrar la hora del último despliegue: eso no distingue
 * entre "tu cambio ya está" y "se publicó antes de que guardaras".
 */
export function EstadoPublicacion() {
  const [estado, setEstado] = useState<Estado>({ tipo: 'cargando' });
  const [publicando, setPublicando] = useState(false);
  const [aviso, setAviso] = useState('');
  const [fallo, setFallo] = useState('');

  const revisar = useCallback(async () => {
    try {
      // El parámetro evita que el navegador sirva un build-info viejo.
      const r = await fetch(`${asset('/build-info.json')}?t=${Date.now()}`, {
        cache: 'no-store',
      });
      if (!r.ok) return setEstado({ tipo: 'desconocido' });
      const info: Info = await r.json();

      // El último build no pudo leer la base y publicó los datos de respaldo:
      // la web no muestra lo cargado, aunque la marca coincida.
      if (info.origen === 'respaldo') {
        return setEstado({ tipo: 'respaldo', publicadoEn: info.publicado_en });
      }

      if (!supabase || info.ultimo_cambio == null) {
        return setEstado({ tipo: 'desconocido' });
      }

      // Solo la marca de ESTA edición: producción y ensayos comparten base,
      // y con la marca global cada sitio veía los cambios del otro.
      const { data, error } = await supabase
        .from('torneo_marca_edicion')
        .select('ultimo_cambio, filas')
        .eq('edicion', EDICION_DATOS)
        .maybeSingle();
      if (error || !data) return setEstado({ tipo: 'desconocido' });

      const actual = data as Marca;
      const igual = actual.ultimo_cambio === info.ultimo_cambio && actual.filas === info.filas;

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

  /**
   * Dispara el despliegue a mano. El panel ya lo pide al guardar; esto es
   * para reintentar si aquel disparo falló.
   *
   * La llamada va a una función de Supabase, no directo a GitHub: el token
   * que autoriza el disparo vive como secreto del servidor y nunca llega al
   * navegador. La función además comprueba que el correo esté en la lista de
   * administradores antes de hacer nada.
   */
  async function publicarAhora() {
    if (!supabase) return;
    setPublicando(true);
    setAviso('');
    setFallo('');
    const motivo = await pedirPublicacion();
    setPublicando(false);
    if (motivo) {
      setFallo(motivo);
      return;
    }
    setAviso(
      ES_ENSAYOS
        ? 'Despliegue del sitio de ensayos iniciado. Se actualiza en un par de minutos.'
        : 'Despliegue iniciado. El sitio se actualiza en un par de minutos.',
    );
    // Se vuelve a mirar pasado un rato, cuando ya deberia haber terminado.
    setTimeout(() => void revisar(), 150_000);
  }

  if (estado.tipo === 'cargando') return null;

  if (estado.tipo === 'desconocido') {
    return (
      <p className="flex items-center gap-2 text-xs text-neutral-300">
        <HelpCircle size={14} /> No se pudo comprobar el estado de publicación.
      </p>
    );
  }

  const pendiente = estado.tipo === 'pendiente' || estado.tipo === 'respaldo';
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
      {estado.tipo === 'respaldo' ? (
        <>
          <strong>La web salió con datos de respaldo.</strong>
          <span className="text-amarillo/80">
            El despliegue de {haceCuanto(estado.publicadoEn)} no pudo leer la base. Publica otra
            vez.
          </span>
        </>
      ) : pendiente ? (
        <>
          <strong>Hay cambios sin publicar.</strong>
          <span className="text-amarillo/80">
            Último despliegue {haceCuanto(estado.publicadoEn)}.
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

      <button
        type="button"
        onClick={() => void publicarAhora()}
        disabled={publicando}
        title="Dispara el despliegue sin esperar a la revisión automática"
        className={cn(
          'ml-auto inline-flex shrink-0 items-center gap-1.5 rounded-full px-4 py-1.5 font-bold transition-transform',
          'disabled:cursor-not-allowed disabled:opacity-50',
          pendiente
            ? 'bg-gradient-to-r from-amarillo to-naranja text-carbon hover:-translate-y-0.5'
            : 'border border-white/20 text-neutral-300 hover:border-amarillo/60 hover:text-amarillo',
        )}
      >
        {publicando ? <Loader2 size={13} className="animate-spin" /> : <Rocket size={13} />}
        {publicando ? 'Publicando…' : 'Publicar ahora'}
      </button>

      {aviso ? <span className="w-full text-emerald-300">{aviso}</span> : null}
      {fallo ? <span className="w-full text-red-400">{fallo}</span> : null}
    </p>
  );
}
