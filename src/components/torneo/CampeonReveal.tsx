'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowRight, Trophy } from 'lucide-react';
import { TeamCrest } from '@/components/torneo/TeamCrest';

const COLORES = ['#F2C230', '#E8722C', '#D4A437', '#ffffff', '#25D366', '#2D6CDF'];

interface Props {
  slug: string;
  nombre: string;
  scoreText: string;
  edicion: string;
}

export function CampeonReveal({ slug, nombre, scoreText, edicion }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let W = 0;
    let H = 0;
    const dpr = window.devicePixelRatio || 1;
    const ajustar = () => {
      const r = canvas.getBoundingClientRect();
      W = r.width;
      H = r.height;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    ajustar();
    window.addEventListener('resize', ajustar);

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
    const nuevoArriba = (): P => ({
      x: Math.random() * W,
      y: -12,
      vx: (Math.random() - 0.5) * 2,
      vy: 1.5 + Math.random() * 2.5,
      g: 0.03 + Math.random() * 0.03,
      size: 6 + Math.random() * 8,
      rot: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.3,
      color: COLORES[(Math.random() * COLORES.length) | 0] as string,
    });
    // Estallido inicial desde abajo (los dos lados).
    for (let i = 0; i < 160; i++) {
      parts.push({
        x: i % 2 === 0 ? W * 0.12 : W * 0.88,
        y: H * 0.6,
        vx: (Math.random() - 0.5) * 12,
        vy: -(7 + Math.random() * 9),
        g: 0.14 + Math.random() * 0.08,
        size: 6 + Math.random() * 9,
        rot: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.4,
        color: COLORES[i % COLORES.length] as string,
      });
    }

    let raf = 0;
    let last = performance.now();
    let acc = 0;
    const loop = (t: number) => {
      const dt = t - last;
      last = t;
      acc += dt;
      // Lluvia ambiente suave.
      while (acc > 90 && parts.length < 110) {
        acc -= 90;
        parts.push(nuevoArriba());
      }
      ctx.clearRect(0, 0, W, H);
      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i]!;
        p.vy += p.g;
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vr;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.5);
        ctx.restore();
        if (p.y > H + 20) parts.splice(i, 1);
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', ajustar);
    };
  }, []);

  return (
    <div className="campeon-reveal relative mt-10 overflow-hidden rounded-3xl border border-amarillo/40 bg-gradient-to-b from-[#1a1206]/80 via-[#0b0f14]/70 to-[#0b0f14]/80 shadow-[0_40px_120px_rgba(242,194,48,0.18)] backdrop-blur-sm">
      {/* Confeti */}
      <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden />

      {/* Reflector superior */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-2/3 opacity-70"
        style={{
          background:
            'radial-gradient(60% 80% at 50% 0%, rgba(242,194,48,0.22), transparent 70%)',
        }}
        aria-hidden
      />

      <div className="relative flex flex-col items-center px-6 py-12 text-center lg:py-16">
        <span className="font-bufon text-xs font-bold uppercase tracking-[0.35em] text-neutral-400">
          Torneo finalizado · {edicion}
        </span>

        {/* CAMPEÓN con brillo */}
        <span className="campeon-title mt-3 inline-flex items-center gap-3 font-sport text-5xl uppercase leading-none md:text-7xl">
          <Trophy size={40} className="text-amarillo" aria-hidden />
          Campeón
        </span>

        {/* Escudo con rayos + aura */}
        <div className="relative mt-8 flex h-64 w-64 items-center justify-center md:h-72 md:w-72">
          <span
            className="coin-spin absolute inset-0 rounded-full"
            style={{
              background:
                'conic-gradient(from 0deg, transparent 0 10deg, rgba(242,194,48,0.45) 10deg 14deg, transparent 14deg 30deg, rgba(232,114,44,0.4) 30deg 34deg, transparent 34deg)',
              maskImage: 'radial-gradient(circle, transparent 46%, #000 48%)',
              WebkitMaskImage: 'radial-gradient(circle, transparent 46%, #000 48%)',
            }}
            aria-hidden
          />
          <span
            className="campeon-aura absolute h-44 w-44 rounded-full md:h-52 md:w-52"
            style={{
              background: 'radial-gradient(circle, rgba(242,194,48,0.55), transparent 70%)',
            }}
            aria-hidden
          />
          <div className="relative drop-shadow-[0_10px_40px_rgba(242,194,48,0.5)]">
            <TeamCrest slug={slug} size={184} showStars />
          </div>
        </div>

        <h2 className="mt-8 font-sport text-6xl uppercase leading-[0.9] text-neutral-50 drop-shadow-[0_4px_20px_rgba(0,0,0,0.6)] md:text-8xl">
          {nombre}
        </h2>

        <span className="mt-5 rounded-full border border-amarillo/50 bg-black/30 px-5 py-1.5 font-mono text-sm uppercase tracking-widest text-amarillo">
          Final · {scoreText}
        </span>

        <Link
          href="/torneo/bracket/"
          className="group mt-8 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amarillo to-naranja px-8 py-4 text-sm font-bold text-carbon shadow-[0_12px_40px_rgba(232,114,44,0.45)] transition-all duration-200 ease-managers hover:-translate-y-0.5"
        >
          Ver la llave completa
          <ArrowRight
            size={18}
            aria-hidden
            className="transition-transform duration-200 ease-managers group-hover:translate-x-1"
          />
        </Link>
      </div>
    </div>
  );
}
