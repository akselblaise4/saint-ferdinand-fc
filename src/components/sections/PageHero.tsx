import { ReactNode } from "react";

interface PageHeroProps {
  title: string;
  subtitle?: string;
  children?: ReactNode;
}

export default function PageHero({ title, subtitle, children }: PageHeroProps) {
  return (
    <section className="relative border-b border-border bg-surface-container-lowest pt-20 md:pt-24">
      <div className="mx-auto max-w-6xl px-6 py-10 md:py-14">
        <div>
          <h1 className="font-display text-5xl font-bold uppercase leading-[0.9] tracking-[-0.02em] text-on-surface md:text-7xl">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-2 text-sm text-on-surface-variant md:text-base">{subtitle}</p>
          )}
        </div>
        {children && <div className="mt-6">{children}</div>}
      </div>
    </section>
  );
}
