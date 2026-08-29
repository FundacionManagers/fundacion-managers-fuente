import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="canvas-dark spotlight grain relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-6 text-center">
      <p className="font-bufon text-9xl font-bold text-amarillo">404</p>
      <h1 className="mt-4 font-serif text-4xl font-bold text-neutral-50">
        Esta jugada se fue por la línea
      </h1>
      <p className="mt-4 max-w-md text-neutral-400">
        La página que buscas no existe o cambió de cancha. Volvamos al centro y seguimos jugando.
      </p>
      <Link
        href="/"
        className="mt-10 inline-flex items-center gap-2 rounded-full bg-gold px-6 py-3 text-sm font-semibold text-carbon shadow-gold transition-colors duration-200 ease-managers hover:bg-gold-hover"
      >
        Volver al inicio
      </Link>
    </div>
  );
}
