'use client';

import { useEffect, useState } from 'react';

interface MatchCountdownProps {
  /** Fecha objetivo en ISO con zona horaria. */
  targetIso: string;
}

interface Parts {
  d: number;
  h: number;
  m: number;
  s: number;
  done: boolean;
}

function diff(target: number): Parts {
  const ms = Math.max(0, target - Date.now());
  return {
    d: Math.floor(ms / 86400000),
    h: Math.floor((ms % 86400000) / 3600000),
    m: Math.floor((ms % 3600000) / 60000),
    s: Math.floor((ms % 60000) / 1000),
    done: ms === 0,
  };
}

function Cell({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-energy min-w-[2ch] font-sport text-6xl tabular-nums leading-none md:text-8xl">
        {String(value).padStart(2, '0')}
      </span>
      <span className="mt-2 font-mono text-[10px] uppercase tracking-[0.3em] text-neutral-500">
        {label}
      </span>
    </div>
  );
}

/**
 * Cuenta regresiva en vivo al próximo partido. Tic real cada segundo:
 * es lo que da la sensación de "matchday". Hidrata en cliente; muestra
 * un esqueleto estable en SSR para evitar mismatch.
 */
export function MatchCountdown({ targetIso }: MatchCountdownProps) {
  const target = new Date(targetIso).getTime();
  const [p, setP] = useState<Parts | null>(null);

  useEffect(() => {
    setP(diff(target));
    const id = setInterval(() => setP(diff(target)), 1000);
    return () => clearInterval(id);
  }, [target]);

  const view = p ?? { d: 0, h: 0, m: 0, s: 0, done: false };

  return (
    <div
      className="flex items-end gap-4 md:gap-7"
      aria-live="polite"
      aria-label="Cuenta regresiva al próximo partido"
    >
      <Cell value={view.d} label="días" />
      <span className="pb-7 font-sport text-5xl text-white/15 md:text-7xl">:</span>
      <Cell value={view.h} label="horas" />
      <span className="pb-7 font-sport text-5xl text-white/15 md:text-7xl">:</span>
      <Cell value={view.m} label="min" />
      <span className="pb-7 font-sport text-5xl text-white/15 md:text-7xl">:</span>
      <Cell value={view.s} label="seg" />
    </div>
  );
}
