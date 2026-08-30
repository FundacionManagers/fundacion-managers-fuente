import type { Metadata } from 'next';

/**
 * Todo lo que cuelga de /torneo/ comparte imagen de compartir.
 *
 * Existe solo para eso: las páginas del torneo heredaban la imagen genérica
 * de la Fundación, y el enlace que más se reparte —el de inscripciones, que
 * va por WhatsApp a los capitanes— llegaba sin la moneda ni el estadio.
 * Cada página conserva su propio título y su descripción.
 */
export const metadata: Metadata = {
  openGraph: {
    images: [
      {
        url: '/og/torneo.jpg',
        width: 1200,
        height: 630,
        alt: 'Torneo Managers F7 · Fundación Managers',
      },
    ],
  },
};

export default function TorneoLayout({ children }: { children: React.ReactNode }) {
  return children;
}
