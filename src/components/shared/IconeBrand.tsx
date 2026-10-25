import Image from 'next/image';
import { asset } from '@/lib/asset';
import { ICONE_CYAN } from '@/lib/alianza';
import { cn } from '@/lib/utils';

interface IconeBrandProps {
  /** Tamaño del ícono en px (cuando el logo oficial está activo). */
  iconSize?: number;
  /** Mostrar solo el wordmark de texto (sin ícono). */
  textOnly?: boolean;
  /** Color base del "ICONE" (por defecto claro, para fondos oscuros). */
  tone?: 'light' | 'dark';
  className?: string;
}

/**
 * Marca oficial ICONEialabs — fuente ÚNICA de verdad.
 *
 * Wordmark fiel al logo: "ICONE" + "ialabs" (cyan), sin espacio.
 * Cuando exista `public/logo-icone.png` (app-icon oficial), poner
 * USE_LOGO = true: se antepone el ícono al wordmark en toda la web.
 */
const USE_LOGO = true;

export function IconeBrand({
  iconSize = 22,
  textOnly = false,
  tone = 'light',
  className,
}: IconeBrandProps) {
  return (
    <span className={cn('inline-flex items-center gap-2 align-middle', className)}>
      {USE_LOGO && !textOnly ? (
        <Image
          src={asset('/logo-icone.png')}
          alt="ICONEialabs"
          width={iconSize}
          height={iconSize}
          sizes={`${iconSize}px`}
          className="inline-block rounded-[22%] object-contain"
          style={{ width: iconSize, height: iconSize }}
        />
      ) : null}
      {/* Una sola palabra: «ICONE» en el peso más alto y «ialabs» en 500,
          pegados. El `&nbsp;` que había entre los dos partía la marca en dos
          palabras, que es justo la grafía que la marca prohíbe. La marca pide
          900 para «ICONE»; Plus Jakarta llega hasta 800, que es el que se usa. */}
      <span className="font-display tracking-tight">
        <span className="font-extrabold" style={{ color: tone === 'dark' ? '#0F1419' : '#FFFFFF' }}>
          ICONE
        </span>
        <span className="font-medium" style={{ color: ICONE_CYAN }}>
          ialabs
        </span>
      </span>
    </span>
  );
}
