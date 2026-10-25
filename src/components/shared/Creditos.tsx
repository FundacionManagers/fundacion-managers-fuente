import { AUTORIA, avisoDerechos } from '@/lib/autoria';
import { cn } from '@/lib/utils';

/**
 * Firma de autoría: quién diseñó y construyó el sitio.
 *
 * Va en una línea discreta, debajo del aviso de derechos de la fundación. El
 * enlace sale a la web de ICONEialabs en una pestaña nueva, para no sacar a
 * nadie del sitio del cliente.
 */
export function FirmaAutor({ className }: { className?: string }) {
  return (
    <span className={cn('text-neutral-400', className)}>
      Diseño y desarrollo: {AUTORIA.autor} · {AUTORIA.estudio} ·{' '}
      <a
        href={AUTORIA.sitio}
        target="_blank"
        rel="noopener"
        className="underline decoration-white/20 underline-offset-2 transition-colors hover:text-neutral-100"
      >
        {AUTORIA.sitioVisible}
      </a>
    </span>
  );
}

/**
 * Cierre de las páginas que no llevan el pie del sitio: el panel, su guía y
 * las inscripciones. Mismo aviso y misma firma que el pie.
 */
export function Creditos({ className }: { className?: string }) {
  return (
    <p
      className={cn(
        'mt-14 flex flex-col gap-1 border-t border-white/10 pt-6 text-xs text-neutral-300',
        className,
      )}
    >
      <span>{avisoDerechos(new Date().getFullYear())}</span>
      <FirmaAutor />
    </p>
  );
}
