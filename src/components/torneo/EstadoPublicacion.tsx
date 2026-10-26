'use client';

import { useCallback, useEffect, useState } from 'react';
import { CloudUpload, Globe, HelpCircle, Loader2, Rocket } from 'lucide-react';
import { asset } from '@/lib/asset';
import { EDICION_DATOS, ES_ENSAYOS } from '@/lib/entorno';
import {
  EVENTO_PUBLICACION_PEDIDA,
  momentoPublicacionPedida,
  pedirPublicacion,
} from '@/lib/panel-torneo';
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
  | { tipo: 'en-curso' }
  | { tipo: 'desconocido' };

/**
 * Hasta cuándo se espera el despliegue pedido. Uno normal tarda un minuto y
 * medio; si hay otro en cola, el doble. Pasado esto, el aviso vuelve a
 * comparar marcas y dice si quedó algo sin publicar.
 */
const ESPERA_DESPLIEGUE = 6 * 60_000;

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
  const [fallo, setFallo] = useState('');

  const revisar = useCallback(async () => {
    try {
      // El parámetro evita que el navegador sirva un build-info viejo.
      const r = await fetch(`${asset('/build-info.json')}?t=${Date.now()}`, {
        cache: 'no-store',
      });
      if (!r.ok) return setEstado({ tipo: 'desconocido' });
      const info: Info = await r.json();

      // Se pidió publicar y el sitio todavía es de antes del pedido: GitHub
      // está compilando. Hay que decirlo, no repetir la hora vieja.
      const pedido = momentoPublicacionPedida();
      if (
        pedido > 0 &&
        Date.now() - pedido < ESPERA_DESPLIEGUE &&
        new Date(info.publicado_en).getTime() < pedido
      ) {
        return setEstado({ tipo: 'en-curso' });
      }

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

  // Mientras hay un despliegue en curso se mira más seguido, para avisar en
  // cuanto termine.
  const enCurso = estado.tipo === 'en-curso';
  useEffect(() => {
    void revisar();
    const id = setInterval(() => void revisar(), enCurso ? 15_000 : 60_000);
    return () => clearInterval(id);
  }, [revisar, enCurso]);

  // Guardar en el panel también pide publicar: el aviso se entera al momento.
  useEffect(() => {
    const alPedir = () => void revisar();
    window.addEventListener(EVENTO_PUBLICACION_PEDIDA, alPedir);
    return () => window.removeEventListener(EVENTO_PUBLICACION_PEDIDA, alPedir);
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
    setFallo('');
    const motivo = await pedirPublicacion();
    setPublicando(false);
    // Si salió, el evento de publicación pedida ya pasó el aviso a «en curso».
    if (motivo) setFallo(motivo);
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
  const Icono = enCurso ? Loader2 : pendiente ? CloudUpload : Globe;
  const ocupado = publicando || enCurso;

  return (
    <p
      className={cn(
        'flex flex-wrap items-center gap-2 rounded-lg border px-3 py-2 text-xs',
        enCurso
          ? 'border-sky-400/40 bg-sky-400/10 text-sky-300'
          : pendiente
            ? 'border-amarillo/40 bg-amarillo/10 text-amarillo'
            : 'border-emerald-500/30 bg-emerald-500/5 text-emerald-400',
      )}
    >
      <Icono size={14} className={cn('shrink-0', enCurso && 'animate-spin')} />
      {enCurso ? (
        <>
          <strong>Publicación en curso.</strong>
          <span className="text-sky-200/90">
            {ES_ENSAYOS ? 'El sitio de ensayos' : 'La web'} se está actualizando: tarda unos dos
            minutos. Este aviso cambia solo cuando termine; no hace falta volver a pulsar.
          </span>
        </>
      ) : estado.tipo === 'respaldo' ? (
        <>
          <strong>La web salió con datos de respaldo.</strong>
          <span className="text-amarillo/80">
            El despliegue de {haceCuanto(estado.publicadoEn)} no pudo leer la base. Publica otra
            vez.
          </span>
        </>
      ) : estado.tipo === 'pendiente' ? (
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
        disabled={ocupado}
        title={
          pendiente
            ? 'Dispara el despliegue sin esperar a la revisión automática'
            : 'La web ya está al día: solo hace falta si algo se ve mal'
        }
        className={cn(
          'ml-auto inline-flex shrink-0 items-center gap-1.5 rounded-full px-4 py-1.5 font-bold transition-transform',
          'disabled:cursor-not-allowed disabled:opacity-50',
          pendiente
            ? 'bg-gradient-to-r from-amarillo to-naranja text-carbon hover:-translate-y-0.5'
            : 'border border-white/20 text-neutral-300 hover:border-amarillo/60 hover:text-amarillo',
        )}
      >
        {ocupado ? <Loader2 size={13} className="animate-spin" /> : <Rocket size={13} />}
        {/* Con todo publicado, «Publicar ahora» invitaba a pulsar sin motivo. */}
        {ocupado ? 'Publicando…' : pendiente ? 'Publicar ahora' : 'Volver a publicar'}
      </button>

      {fallo ? <span className="w-full text-red-400">{fallo}</span> : null}
    </p>
  );
}
