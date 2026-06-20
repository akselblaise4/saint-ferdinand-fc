import { ReactNode } from "react";

interface PageHeroProps {
  icon: string;
  title: string;
  subtitle?: string;
  children?: ReactNode;
}

export default function PageHero({ icon, title, subtitle, children }: PageHeroProps) {
  return (
    <section className="relative flex min-h-[50vh] items-center overflow-hidden bg-club-black pt-20">
      <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.07)_1px,transparent_1px)] bg-[length:24px_24px]" />
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-club-black to-club-black" />
      <div className="absolute left-1/2 top-1/3 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-[120px]" />
      <div className="absolute bottom-0 left-0 right-0 section-divider" />
      <div className="relative mx-auto w-full max-w-6xl px-6">
        <div className="flex items-center gap-5">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 ring-1 ring-white/10 backdrop-blur-sm">
            <span className="text-2xl">{icon}</span>
          </div>
          <div>
            <h1 className="font-display text-6xl leading-none tracking-tight text-white md:text-8xl">{title}</h1>
            {subtitle && <p className="mt-2 text-sm text-white/40">{subtitle}</p>}
          </div>
        </div>
        {children && <div className="mt-6">{children}</div>}
      </div>
    </section>
  );
}
