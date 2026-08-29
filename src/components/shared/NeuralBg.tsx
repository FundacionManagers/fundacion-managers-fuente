'use client';

import { useEffect, useRef } from 'react';

interface NeuralBgProps {
  /** Color de nodos/líneas (por defecto cyan ICONE). */
  color?: string;
  /** Densidad aproximada de nodos (se ajusta al área). */
  density?: number;
  className?: string;
}

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

/**
 * Fondo sutil de red neuronal (partículas conectadas). Liviano:
 * pocos nodos, líneas de baja opacidad, respeta prefers-reduced-motion,
 * se pausa fuera de viewport. Pensado para secciones oscuras.
 */
export function NeuralBg({ color = '#00D4FF', density = 0.00009, className }: NeuralBgProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const canvas: HTMLCanvasElement = cv;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const g: CanvasRenderingContext2D = ctx;

    // El fondo neuronal es un elemento de marca solicitado: siempre anima.
    // Con prefers-reduced-motion solo se mueve más lento (no se congela).
    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const speed = reduced ? 0.22 : 0.55;

    let nodes: Node[] = [];
    let raf = 0;
    let running = true;
    let w = 0;
    let h = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const MAX_DIST = 130;

    function resize() {
      const parent = canvas.parentElement;
      if (!parent) return;
      w = parent.clientWidth;
      h = parent.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      g.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = Math.min(70, Math.max(24, Math.round(w * h * density)));
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 2 * speed,
        vy: (Math.random() - 0.5) * 2 * speed,
      }));
    }

    function draw() {
      g.clearRect(0, 0, w, h);

      for (const n of nodes) {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > w) n.vx *= -1;
        if (n.y < 0 || n.y > h) n.vy *= -1;
      }

      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i]!;
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j]!;
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.hypot(dx, dy);
          if (dist < MAX_DIST) {
            g.strokeStyle = color;
            g.globalAlpha = (1 - dist / MAX_DIST) * 0.16;
            g.lineWidth = 1;
            g.beginPath();
            g.moveTo(a.x, a.y);
            g.lineTo(b.x, b.y);
            g.stroke();
          }
        }
      }

      g.globalAlpha = 0.5;
      g.fillStyle = color;
      for (const n of nodes) {
        g.beginPath();
        g.arc(n.x, n.y, 1.4, 0, Math.PI * 2);
        g.fill();
      }
      g.globalAlpha = 1;

      if (running) raf = requestAnimationFrame(draw);
    }

    resize();
    draw();

    const onResize = () => resize();
    window.addEventListener('resize', onResize);

    const io = new IntersectionObserver(
      ([entry]) => {
        running = !!entry?.isIntersecting;
        if (running) {
          cancelAnimationFrame(raf);
          raf = requestAnimationFrame(draw);
        } else {
          cancelAnimationFrame(raf);
        }
      },
      { threshold: 0 },
    );
    if (canvas.parentElement) io.observe(canvas.parentElement);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
      io.disconnect();
    };
  }, [color, density]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={className}
      style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
    />
  );
}
