'use client';

import { useCallback, useEffect, useRef } from 'react';
import { PartyPopper, Trophy } from 'lucide-react';

const COLORES = ['#F2C230', '#E8722C', '#D4A437', '#ffffff', '#25D366', '#2D6CDF'];

export function CelebracionTrofeo() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);

  const lanzar = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const W = rect.width;
    const H = rect.height;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    type P = {
      x: number;
      y: number;
      vx: number;
      vy: number;
      g: number;
      size: number;
      rot: number;
      vr: number;
      color: string;
    };
    const parts: P[] = [];
    // Dos chorros desde abajo + lluvia desde arriba.
    for (let i = 0; i < 200; i++) {
      const desdeAbajo = i % 2 === 0;
      parts.push({
        x: desdeAbajo ? (i % 4 === 0 ? W * 0.15 : W * 0.85) : Math.random() * W,
        y: desdeAbajo ? H + 10 : -10,
        vx: (Math.random() - 0.5) * (desdeAbajo ? 10 : 4),
        vy: desdeAbajo ? -(8 + Math.random() * 8) : 2 + Math.random() * 3,
        g: 0.16 + Math.random() * 0.12,
        size: 6 + Math.random() * 9,
        rot: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.4,
        color: COLORES[i % COLORES.length] as string,
      });
    }

    const start = performance.now();
    const DUR = 4500;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);

    const frame = (t: number) => {
      const el = t - start;
      ctx.clearRect(0, 0, W, H);
      const alpha = Math.max(0, 1 - el / DUR);
      parts.forEach((p) => {
        p.vy += p.g;
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vr;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.globalAlpha = alpha;
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.55);
        ctx.restore();
      });
      if (el < DUR) rafRef.current = requestAnimationFrame(frame);
      else ctx.clearRect(0, 0, W, H);
    };
    rafRef.current = requestAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const id = setTimeout(lanzar, 250);
    return () => {
      clearTimeout(id);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [lanzar]);

  return (
    <div className="relative my-8 overflow-hidden rounded-2xl border border-amarillo/30 bg-gradient-to-b from-amarillo/10 via-transparent to-transparent p-8 text-center">
      {/* Confeti */}
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 h-full w-full"
        aria-hidden
      />

      <div className="relative">
        {/* Trofeo con rayos giratorios + glow */}
        <div className="relative mx-auto flex h-32 w-32 items-center justify-center">
          <span
            className="coin-spin absolute inset-0 rounded-full opacity-70"
            style={{
              background:
                'conic-gradient(from 0deg, transparent 0 18deg, rgba(242,194,48,0.55) 18deg 24deg, transparent 24deg 48deg, rgba(232,114,44,0.5) 48deg 54deg, transparent 54deg)',
              maskImage: 'radial-gradient(circle, transparent 38%, #000 40%)',
              WebkitMaskImage: 'radial-gradient(circle, transparent 38%, #000 40%)',
            }}
            aria-hidden
          />
          <span className="cta-glow flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-amarillo to-naranja">
            <Trophy size={46} className="text-carbon" />
          </span>
        </div>

        <h3 className="mt-5 font-sport text-4xl uppercase leading-none text-neutral-50 md:text-5xl">
          ¡Ganaste tu
          <br />
          <span className="bg-gradient-to-r from-amarillo to-naranja bg-clip-text text-transparent">
            primer trofeo!
          </span>
        </h3>
        <p className="mx-auto mt-3 max-w-md text-sm text-neutral-300">
          🏆 El <strong className="text-neutral-100">trofeo de la inscripción</strong>. Tu equipo
          ya es parte del Torneo Managers. ¡Que empiece la batalla!
        </p>

        <button
          type="button"
          onClick={lanzar}
          className="mt-5 inline-flex items-center gap-2 rounded-full border border-amarillo/50 bg-amarillo/10 px-5 py-2.5 text-sm font-bold text-amarillo transition-colors hover:bg-amarillo/20"
        >
          <PartyPopper size={16} /> ¡Celebrar otra vez!
        </button>
      </div>
    </div>
  );
}
