'use client';

import { useEffect, useRef, useState } from 'react';
import { Download, Loader2, Share2 } from 'lucide-react';
import { supabasePublico } from '@/lib/supabase';

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

function cargarImagen(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

/** Dibuja el comprobante de inscripción y devuelve un PNG (Blob). */
async function generarComprobante(equipo: string, capitan: string, fecha: string): Promise<Blob> {
  const W = 1080;
  const H = 1350;
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const ctx = c.getContext('2d')!;

  // Fondo
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#10161e');
  g.addColorStop(1, '#0a0e13');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  // Marco
  ctx.strokeStyle = 'rgba(242,194,48,0.35)';
  ctx.lineWidth = 4;
  ctx.strokeRect(40, 40, W - 80, H - 80);

  const cx = W / 2;
  ctx.textAlign = 'center';

  // Moneda
  const coin = await cargarImagen(`${window.location.origin}${BASE}/coin-managers.webp`);
  if (coin) {
    const cs = 240;
    ctx.save();
    ctx.shadowColor = 'rgba(212,164,55,0.6)';
    ctx.shadowBlur = 50;
    ctx.drawImage(coin, cx - cs / 2, 130, cs, cs);
    ctx.restore();
  }

  // Eyebrow
  ctx.fillStyle = '#E8722C';
  ctx.font = 'bold 30px Arial, sans-serif';
  ctx.fillText('TORNEO MANAGERS · EDICIÓN 4° (2026-2)', cx, 440);

  // Título
  ctx.fillStyle = '#f4f6f8';
  ctx.font = 'bold 92px Arial, sans-serif';
  ctx.fillText('INSCRIPCIÓN', cx, 540);
  ctx.fillStyle = '#F2C230';
  ctx.fillText('COMPLETA', cx, 640);

  // Barra
  const bg = ctx.createLinearGradient(cx - 120, 0, cx + 120, 0);
  bg.addColorStop(0, '#F2C230');
  bg.addColorStop(1, '#E8722C');
  ctx.fillStyle = bg;
  ctx.fillRect(cx - 120, 680, 240, 8);

  // Equipo
  ctx.fillStyle = '#9aa4b2';
  ctx.font = 'bold 28px Arial, sans-serif';
  ctx.fillText('EQUIPO', cx, 780);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 64px Arial, sans-serif';
  ctx.fillText(equipo || 'Mi equipo', cx, 850);

  if (capitan) {
    ctx.fillStyle = '#c9d1da';
    ctx.font = '34px Arial, sans-serif';
    ctx.fillText(`Capitán: ${capitan}`, cx, 905);
  }

  // 5 pasos
  const pasos = ['1', '2', '3', '4', '5'];
  const r = 42;
  const gap = 130;
  const startX = cx - (gap * (pasos.length - 1)) / 2;
  pasos.forEach((_, i) => {
    const x = startX + i * gap;
    const y = 1010;
    const grad = ctx.createLinearGradient(x - r, y - r, x + r, y + r);
    grad.addColorStop(0, '#F2C230');
    grad.addColorStop(1, '#E8722C');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#0b0f14';
    ctx.font = 'bold 40px Arial, sans-serif';
    ctx.fillText('✓', x, y + 14);
  });
  ctx.fillStyle = '#9aa4b2';
  ctx.font = 'bold 26px Arial, sans-serif';
  ctx.fillText('5 DE 5 PASOS COMPLETADOS', cx, 1110);

  // Footer
  ctx.fillStyle = '#6b7280';
  ctx.font = '26px Arial, sans-serif';
  ctx.fillText('Fundación Managers', cx, 1230);
  ctx.fillText(fecha, cx, 1270);

  return new Promise<Blob>((resolve) => c.toBlob((b) => resolve(b as Blob), 'image/png', 0.95));
}

export function ComprobanteInscripcion() {
  const [equipo, setEquipo] = useState('');
  const [capitan, setCapitan] = useState('');
  const [trabajando, setTrabajando] = useState(false);
  const blobRef = useRef<Blob | null>(null);

  useEffect(() => {
    try {
      const local = JSON.parse(window.localStorage.getItem('fm-mi-inscripcion') ?? '{}');
      if (local.equipo) setEquipo(local.equipo);
      if (local.capitan) setCapitan(local.capitan);
      const params = new URLSearchParams(window.location.search);
      const id = params.get('eq') || local.id;
      const t = params.get('t') || local.token;
      if (id && t && supabasePublico) {
        supabasePublico.rpc('fm_get_equipo', { p_id: id, p_token: t }).then(({ data }) => {
          const insc = (data as { inscripcion?: { equipo?: string; capitan?: string } } | null)
            ?.inscripcion;
          if (insc?.equipo) setEquipo(insc.equipo);
          if (insc?.capitan) setCapitan(insc.capitan);
        });
      }
    } catch {
      /* noop */
    }
  }, []);

  async function obtenerBlob(): Promise<Blob> {
    const fecha = new Date().toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const blob = await generarComprobante(equipo, capitan, fecha);
    blobRef.current = blob;
    return blob;
  }

  async function descargar() {
    setTrabajando(true);
    try {
      const blob = await obtenerBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `inscripcion-${(equipo || 'equipo').replace(/[^\w]+/g, '_')}.png`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setTrabajando(false);
    }
  }

  async function compartir() {
    setTrabajando(true);
    try {
      const blob = await obtenerBlob();
      const file = new File(
        [blob],
        `inscripcion-${(equipo || 'equipo').replace(/[^\w]+/g, '_')}.png`,
        {
          type: 'image/png',
        },
      );
      const nav = navigator as Navigator & {
        canShare?: (d: { files: File[] }) => boolean;
        share?: (d: { files?: File[]; title?: string; text?: string }) => Promise<void>;
      };
      if (nav.canShare && nav.canShare({ files: [file] }) && nav.share) {
        await nav.share({
          files: [file],
          title: 'Inscripción Torneo Managers',
          text: `¡${equipo || 'Mi equipo'} quedó inscrito en el Torneo Managers!`,
        });
      } else {
        // Sin Web Share (escritorio): descargamos para que la adjunten.
        await descargar();
        window.alert(
          'Descargamos tu comprobante. Adjúntalo en WhatsApp o correo para compartirlo.',
        );
      }
    } catch {
      /* el usuario canceló el compartir */
    } finally {
      setTrabajando(false);
    }
  }

  return (
    <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
      <button
        type="button"
        onClick={compartir}
        disabled={trabajando}
        className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-amarillo to-naranja px-6 py-3 text-sm font-bold text-carbon transition-transform hover:-translate-y-0.5 disabled:opacity-60"
      >
        {trabajando ? <Loader2 size={16} className="animate-spin" /> : <Share2 size={16} />}
        Compartir comprobante
      </button>
      <button
        type="button"
        onClick={descargar}
        disabled={trabajando}
        className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 px-6 py-3 text-sm font-bold text-neutral-200 transition-colors hover:border-gold hover:text-gold disabled:opacity-60"
      >
        <Download size={16} /> Descargar imagen
      </button>
    </div>
  );
}
