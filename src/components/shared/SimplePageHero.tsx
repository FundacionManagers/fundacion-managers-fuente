interface SimplePageHeroProps {
  eyebrow: string;
  title: string;
  description?: string;
}

export function SimplePageHero({ eyebrow, title, description }: SimplePageHeroProps) {
  return (
    <section className="canvas-dark spotlight grain relative overflow-hidden">
      <div aria-hidden className="aurora pointer-events-none absolute inset-0" />
      <div className="relative mx-auto max-w-7xl px-6 py-24 lg:px-8 lg:py-28">
        <p className="font-mono text-caption uppercase tracking-[0.3em] text-gold">{eyebrow}</p>
        <h1 className="mt-5 font-serif text-[42px] font-bold leading-[1.03] text-neutral-50 md:text-[64px]">
          {title}
        </h1>
        {description ? (
          <p className="mt-6 max-w-2xl text-lg text-neutral-300">{description}</p>
        ) : null}
      </div>
    </section>
  );
}
