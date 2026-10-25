import {
  Bebas_Neue,
  Playfair_Display,
  Fredoka,
  Plus_Jakarta_Sans,
  Inter,
  JetBrains_Mono,
} from 'next/font/google';

/** Display sans neutro (titulares secundarios, UI densa). */
export const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  // 500 para «ialabs» en el lockup de la alianza (IconeBrand).
  weight: ['500', '700', '800'],
  variable: '--font-display',
  display: 'swap',
});

/** Sádico — display de lujo (Didone, espíritu Didot/Baskerville). */
export const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['600', '700', '800', '900'],
  style: ['normal', 'italic'],
  variable: '--font-serif',
  display: 'swap',
});

/** Bufón — acento juguetón (redonda, amigable). Uso con cuentagotas. */
export const fredoka = Fredoka({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-bufon',
  display: 'swap',
});

/** Marcador deportivo del torneo. */
export const bebasNeue = Bebas_Neue({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-display-sport',
  display: 'swap',
});

/** Cuerpo — neutral y legible (ningún arquetipo manda el body). */
export const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-body',
  display: 'swap',
});

export const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
  display: 'swap',
});
