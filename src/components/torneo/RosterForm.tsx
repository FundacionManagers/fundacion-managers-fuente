'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Check, Copy, Loader2, Plus, Trash2, Upload, UserPlus } from 'lucide-react';
// Cliente público sin sesión: el capitán siempre actúa como anon (las funciones
// RPC validan el token, así que el acceso sigue siendo seguro).
import { supabasePublico as supabase, supabaseConfigurado } from '@/lib/supabase';
import {
  jugadorCompleto,
  jugadorVacio,
  MIN_JUGADORES,
  plantelListo,
  POSICIONES_JUGADOR,
  progresoPlantel,
  TALLAS,
  type Jugador,
} from '@/lib/jugadores';

type Fila = Jugador & { _key: string };

type EstadoCarga = 'cargando' | 'ok' | 'sin-acceso' | 'sin-config';

function nuevaKey(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function aFila(row: Record<string, unknown>): Fila {
  return {
    _key: nuevaKey(),
    id: String(row.id ?? ''),
    nombre: String(row.nombre ?? ''),
    documento: String(row.documento ?? ''),
    celular: String(row.celular ?? ''),
    numero: row.numero == null ? '' : String(row.numero),
    posicion: (row.posicion as Jugador['posicion']) ?? '',
    fechaNacimiento: String(row.fecha_nacimiento ?? ''),
    eps: String(row.eps ?? ''),
    talla: String(row.talla ?? ''),
    fotoUrl: String(row.foto_url ?? ''),
  };
}

export function RosterForm() {
  const [estado, setEstado] = useState<EstadoCarga>('cargando');
  const [eq, setEq] = useState('');
  const [token, setToken] = useState('');
  const [equipoNombre, setEquipoNombre] = useState('');
  const [filas, setFilas] = useState<Fila[]>([]);
  const [guardando, setGuardando] = useState(false);
  const [copiado, setCopiado] = useState(false);
  const [finalizado, setFinalizado] = useState(false);
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  // Lee eq/t de la URL o del respaldo local.
  useEffect(() => {
    if (!supabaseConfigurado || !supabase) {
      setEstado('sin-config');
      return;
    }
    const params = new URLSearchParams(window.location.search);
    let id = params.get('eq') ?? '';
    let tk = params.get('t') ?? '';
    if (!id || !tk) {
      try {
        const local = JSON.parse(window.localStorage.getItem('fm-mi-inscripcion') ?? '{}');
        id = id || local.id || '';
        tk = tk || local.token || '';
      } catch {
        /* noop */
      }
    }
    if (!id || !tk) {
      setEstado('sin-acceso');
      return;
    }
    setEq(id);
    setToken(tk);

    supabase
      .rpc('fm_get_equipo', { p_id: id, p_token: tk })
      .then(({ data, error }) => {
        if (error || !data) {
          setEstado('sin-acceso');
          return;
        }
        const insc = (data as { inscripcion?: { equipo?: string } }).inscripcion;
        const jug = (data as { jugadores?: Record<string, unknown>[] }).jugadores ?? [];
        setEquipoNombre(insc?.equipo ?? '');
        setFilas(jug.length ? jug.map(aFila) : [{ ...jugadorVacio(), _key: nuevaKey() }]);
        setEstado('ok');
      });
  }, []);

  const guardarFila = useCallback(
    async (key: string) => {
      const sb = supabase;
      if (!sb) return;
      setFilas((prev) => {
        const fila = prev.find((f) => f._key === key);
        if (!fila) return prev;
        const idx = prev.findIndex((f) => f._key === key);
        const payload = {
          id: fila.id || '',
          nombre: fila.nombre,
          documento: fila.documento,
          celular: fila.celular,
          numero: fila.numero,
          posicion: fila.posicion,
          fecha_nacimiento: fila.fechaNacimiento,
          eps: fila.eps,
          talla: fila.talla,
          foto_url: fila.fotoUrl,
          orden: idx,
        };
        setGuardando(true);
        sb
          .rpc('fm_upsert_jugador', { p_id: eq, p_token: token, p_jugador: payload })
          .then(({ data, error }) => {
            if (!error && data) {
              setFilas((cur) =>
                cur.map((f) => (f._key === key && !f.id ? { ...f, id: String(data) } : f)),
              );
            }
            setGuardando(false);
          });
        return prev;
      });
    },
    [eq, token],
  );

  // Programa autoguardado de una fila ~900ms tras el último cambio.
  function programarGuardado(key: string) {
    if (timers.current[key]) clearTimeout(timers.current[key]);
    timers.current[key] = setTimeout(() => guardarFila(key), 900);
  }

  function editar(key: string, campo: keyof Jugador, valor: string) {
    setFilas((prev) => prev.map((f) => (f._key === key ? { ...f, [campo]: valor } : f)));
    programarGuardado(key);
  }

  function agregar() {
    setFilas((prev) => [...prev, { ...jugadorVacio(), _key: nuevaKey() }]);
  }

  async function eliminar(key: string) {
    const fila = filas.find((f) => f._key === key);
    setFilas((prev) => prev.filter((f) => f._key !== key));
    if (fila?.id && supabase) {
      await supabase.rpc('fm_delete_jugador', { p_id: eq, p_token: token, p_jugador_id: fila.id });
    }
  }

  async function subirFoto(key: string, file: File) {
    if (!supabase) return;
    const preview = URL.createObjectURL(file);
    setFilas((prev) => prev.map((f) => (f._key === key ? { ...f, fotoPreview: preview } : f)));
    const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
    const path = `${eq}/${key}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage
      .from('jugadores')
      .upload(path, file, { cacheControl: '3600', upsert: false });
    if (!error) {
      setFilas((prev) => prev.map((f) => (f._key === key ? { ...f, fotoUrl: path } : f)));
      programarGuardado(key);
    } else {
      window.alert('No se pudo subir la foto. Intenta con una imagen más liviana.');
    }
  }

  function copiarEnlace() {
    const base = process.env.NEXT_PUBLIC_BASE_PATH ?? '';
    const url = `${window.location.origin}${base}/torneo/inscripciones/equipo/?eq=${eq}&t=${token}`;
    navigator.clipboard?.writeText(url).then(
      () => {
        setCopiado(true);
        setTimeout(() => setCopiado(false), 2500);
      },
      () => window.prompt('Copia este enlace para retomar después:', url),
    );
  }

  if (estado === 'cargando') {
    return (
      <p className="flex items-center justify-center gap-2 py-20 text-neutral-400">
        <Loader2 className="animate-spin" size={18} /> Cargando tu equipo…
      </p>
    );
  }

  if (estado === 'sin-config' || estado === 'sin-acceso') {
    return (
      <div className="mx-auto max-w-md rounded-2xl border border-white/10 bg-[#0d1218]/70 p-8 text-center">
        <h3 className="font-sport text-2xl uppercase text-neutral-50">Enlace no válido</h3>
        <p className="mt-3 text-sm text-neutral-400">
          Para registrar tu plantel necesitas el enlace que aparece tras hacer la pre-inscripción.
          Si ya la hiciste en este dispositivo, vuelve a abrirla desde el mismo navegador.
        </p>
        <a
          href={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}/torneo/inscripciones/`}
          className="mt-6 inline-flex rounded-full bg-gradient-to-r from-amarillo to-naranja px-6 py-3 text-sm font-bold text-carbon"
        >
          Ir a inscripciones
        </a>
      </div>
    );
  }

  const completos = filas.filter(jugadorCompleto).length;
  const progreso = progresoPlantel(filas);
  const listo = plantelListo(filas);

  // Pantalla de cierre tras pulsar "Finalizar".
  if (finalizado) {
    const base = process.env.NEXT_PUBLIC_BASE_PATH ?? '';
    return (
      <div className="mx-auto max-w-lg rounded-3xl border border-white/10 bg-[#0b0f14]/80 p-8 text-center">
        <Check
          size={48}
          className={`mx-auto ${listo ? 'text-[#25D366]' : 'text-amarillo'}`}
        />
        {listo ? (
          <>
            <h3 className="mt-3 font-sport text-3xl uppercase text-neutral-50">
              ¡Equipo inscrito!
            </h3>
            <p className="mt-1 text-sm font-semibold uppercase tracking-wide text-[#25D366]">
              Paso 3 completado
            </p>
            <p className="mt-4 text-sm text-neutral-300">
              Tu plantel quedó registrado con <strong className="text-neutral-100">{completos}</strong>{' '}
              jugadores completos. ¡Ya tienes tu cupo!
            </p>
          </>
        ) : (
          <>
            <h3 className="mt-3 font-sport text-3xl uppercase text-neutral-50">Avance guardado</h3>
            <p className="mt-4 text-sm text-neutral-300">
              Guardamos todo tu progreso. Te faltan{' '}
              <strong className="text-neutral-100">{Math.max(0, MIN_JUGADORES - completos)}</strong>{' '}
              jugadores para completar el mínimo. Vuelve cuando quieras con tu enlace y continúa.
            </p>
          </>
        )}

        <div className="mt-6 rounded-2xl border border-white/10 bg-[#0d1218]/70 p-4 text-left text-sm text-neutral-300">
          <p className="font-bold text-neutral-100">¿Qué sigue?</p>
          <ul className="mt-2 space-y-1.5">
            <li>📋 Revisamos tu plantel en el grupo de WhatsApp.</li>
            <li>💳 <strong className="text-neutral-100">Paso 4 — Pago:</strong> una semana antes del torneo te habilitamos el botón de pago.</li>
            <li>📅 <strong className="text-neutral-100">Paso 5 — Programación:</strong> te enviamos el calendario y las reglas.</li>
          </ul>
        </div>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={() => setFinalizado(false)}
            className="inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-2.5 text-sm font-bold text-neutral-200 transition-colors hover:border-gold hover:text-gold"
          >
            Seguir editando el plantel
          </button>
          <a
            href={`${base}/torneo/`}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amarillo to-naranja px-6 py-2.5 text-sm font-bold text-carbon"
          >
            Ir al torneo
          </a>
        </div>
        <p className="mt-4 text-xs text-neutral-500">
          Tu enlace sigue activo: puedes volver a editar este plantel cuando quieras.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Encabezado + progreso */}
      <div className="rounded-3xl border border-white/10 bg-[#0b0f14]/80 p-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="font-bufon text-xs font-bold uppercase tracking-[0.25em] text-naranja">
              Paso 3 · Plantel
            </p>
            <h2 className="mt-1 font-sport text-3xl uppercase leading-none text-neutral-50">
              {equipoNombre || 'Tu equipo'}
            </h2>
          </div>
          <span className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-400">
            {guardando ? (
              <>
                <Loader2 size={14} className="animate-spin" /> Guardando…
              </>
            ) : (
              <>
                <Check size={14} className="text-[#25D366]" /> Guardado automático
              </>
            )}
          </span>
        </div>

        <div className="mt-5">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span>
              {completos} de {MIN_JUGADORES} jugadores completos
            </span>
            <span className="font-bold text-amarillo">{progreso}%</span>
          </div>
          <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amarillo to-naranja transition-all duration-500"
              style={{ width: `${progreso}%` }}
            />
          </div>
        </div>

        {listo ? (
          <p className="mt-4 flex items-center gap-2 rounded-xl border border-[#25D366]/40 bg-[#25D366]/10 p-3 text-sm font-semibold text-[#25D366]">
            <Check size={16} /> ¡Plantel completo al 100%! Tu equipo quedó listo. Puedes seguir
            agregando suplentes.
          </p>
        ) : null}

        {/* Enlace para retomar */}
        <button
          type="button"
          onClick={copiarEnlace}
          className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-xs font-bold text-neutral-200 transition-colors hover:border-gold hover:text-gold"
        >
          {copiado ? <Check size={14} /> : <Copy size={14} />}
          {copiado ? 'Enlace copiado' : 'Copiar enlace para continuar en otro dispositivo'}
        </button>
      </div>

      {/* Jugadores */}
      <div className="space-y-4">
        {filas.map((f, i) => (
          <article
            key={f._key}
            className={`rounded-2xl border p-5 ${
              jugadorCompleto(f) ? 'border-[#25D366]/30 bg-[#0d1a12]/40' : 'border-white/10 bg-[#0d1218]/70'
            }`}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-lg font-bold text-neutral-50">
                Jugador {i + 1}
                {jugadorCompleto(f) ? (
                  <span className="ml-2 text-xs font-semibold text-[#25D366]">✓ completo</span>
                ) : null}
              </h3>
              <button
                type="button"
                onClick={() => eliminar(f._key)}
                aria-label="Eliminar jugador"
                className="rounded-full border border-white/10 p-2 text-neutral-400 transition-colors hover:border-red-500/50 hover:text-red-400"
              >
                <Trash2 size={15} />
              </button>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <Campo label="Nombre completo" value={f.nombre} onChange={(v) => editar(f._key, 'nombre', v)} />
              <Campo label="Documento (cédula)" value={f.documento} onChange={(v) => editar(f._key, 'documento', v)} />
              <Campo label="Celular" type="tel" value={f.celular} onChange={(v) => editar(f._key, 'celular', v)} />
              <Campo label="N° camiseta" type="number" value={f.numero} onChange={(v) => editar(f._key, 'numero', v)} />
              <div>
                <Etiqueta>Posición</Etiqueta>
                <select
                  value={f.posicion}
                  onChange={(e) => editar(f._key, 'posicion', e.target.value)}
                  className="mt-1 block w-full rounded-md border border-white/15 bg-transparent px-3 py-2.5 text-sm text-neutral-100 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30"
                >
                  <option value="" className="bg-carbon">Selecciona…</option>
                  {POSICIONES_JUGADOR.map((p) => (
                    <option key={p.value} value={p.value} className="bg-carbon">
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>
              <Campo label="Fecha de nacimiento" type="date" value={f.fechaNacimiento} onChange={(v) => editar(f._key, 'fechaNacimiento', v)} />
              <Campo label="EPS" value={f.eps} onChange={(v) => editar(f._key, 'eps', v)} />
              <div>
                <Etiqueta>Talla de camiseta</Etiqueta>
                <select
                  value={f.talla}
                  onChange={(e) => editar(f._key, 'talla', e.target.value)}
                  className="mt-1 block w-full rounded-md border border-white/15 bg-transparent px-3 py-2.5 text-sm text-neutral-100 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30"
                >
                  <option value="" className="bg-carbon">Selecciona…</option>
                  {TALLAS.map((t) => (
                    <option key={t} value={t} className="bg-carbon">
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              {/* Foto */}
              <div>
                <Etiqueta>Foto (fondo blanco)</Etiqueta>
                <div className="mt-1 flex items-center gap-3">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-white/15 bg-white/5">
                    {f.fotoPreview ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={f.fotoPreview} alt="" className="h-full w-full object-cover" />
                    ) : f.fotoUrl ? (
                      <Check size={20} className="text-[#25D366]" />
                    ) : (
                      <Upload size={18} className="text-neutral-500" />
                    )}
                  </div>
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-white/15 px-3 py-2 text-xs font-bold text-neutral-200 transition-colors hover:border-gold hover:text-gold">
                    {f.fotoUrl ? 'Cambiar foto' : 'Subir foto'}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) void subirFoto(f._key, file);
                        e.target.value = '';
                      }}
                    />
                  </label>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>

      <button
        type="button"
        onClick={agregar}
        className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-white/20 py-4 text-sm font-bold text-neutral-300 transition-colors hover:border-gold hover:text-gold"
      >
        <UserPlus size={18} /> Agregar otro jugador
      </button>

      <p className="flex items-start gap-2 rounded-md border border-dashed border-white/15 p-3 text-xs text-neutral-500">
        <Plus size={14} className="mt-0.5 shrink-0 text-gold" />
        Todo se guarda automáticamente. Puedes cerrar y volver con el mismo enlace; tu avance no se
        pierde. Mínimo {MIN_JUGADORES} jugadores completos para quedar inscrito.
      </p>

      {/* Cierre: finalizar la inscripción del equipo */}
      <div className="rounded-2xl border border-white/10 bg-[#0b0f14]/80 p-6 text-center">
        <p className="text-sm text-neutral-300">
          {listo
            ? '¡Tu plantel está completo! Pulsa para finalizar y ver los próximos pasos.'
            : `Cuando termines de cargar tus jugadores, pulsa finalizar. (Vas ${completos} de ${MIN_JUGADORES} completos.)`}
        </p>
        <button
          type="button"
          onClick={() => {
            if (!listo && !window.confirm(`Tienes ${completos} de ${MIN_JUGADORES} jugadores completos. ¿Finalizar de todas formas? Podrás volver a editar con tu enlace.`))
              return;
            setFinalizado(true);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full px-7 py-3.5 text-sm font-bold transition-all duration-200 ease-managers hover:-translate-y-0.5 sm:w-auto ${
            listo
              ? 'bg-[#25D366] text-white shadow-[0_12px_40px_rgba(37,211,102,0.35)]'
              : 'bg-gradient-to-r from-amarillo to-naranja text-carbon'
          }`}
        >
          <Check size={18} />
          {listo ? 'Finalizar inscripción del equipo' : 'Terminé por ahora'}
        </button>
      </div>
    </div>
  );
}

function Etiqueta({ children }: { children: React.ReactNode }) {
  return <label className="block text-xs font-medium text-neutral-400">{children}</label>;
}

interface CampoProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}

function Campo({ label, value, onChange, type = 'text' }: CampoProps) {
  return (
    <div>
      <Etiqueta>{label}</Etiqueta>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 block w-full rounded-md border border-white/15 bg-transparent px-3 py-2.5 text-sm text-neutral-100 placeholder:text-neutral-500 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30"
      />
    </div>
  );
}
