import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-surface border-t border-secondary-container py-section-gap">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter max-w-desktop mx-auto px-margin-mobile md:px-margin-desktop">
        <div className="md:col-span-4 mb-12 md:mb-0">
          <h3 className="font-headline-lg text-headline-lg text-primary mb-6 tracking-tighter">
            SAINT FERDINAND FC
          </h3>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-xs mb-8">
            Un club de élite comprometido con los más altos estándares de rendimiento deportivo y lujo minimalista.
          </p>
          <div className="flex gap-4">
            <span className="material-symbols-outlined text-2xl text-on-surface-variant cursor-pointer hover:text-primary transition-colors">
              share
            </span>
            <span className="material-symbols-outlined text-2xl text-on-surface-variant cursor-pointer hover:text-primary transition-colors">
              language
            </span>
            <span className="material-symbols-outlined text-2xl text-on-surface-variant cursor-pointer hover:text-primary transition-colors">
              play_circle
            </span>
          </div>
        </div>

        <div className="col-span-6 md:col-span-2">
          <h5 className="font-label-lg text-label-lg uppercase mb-6 text-on-surface">Club</h5>
          <ul className="space-y-4 font-body-md text-body-md text-on-surface-variant">
            <li><Link href="/club" className="hover:text-primary transition-colors hover:underline decoration-primary underline-offset-4">Sobre el club</Link></li>
            <li><Link href="/club/historia" className="hover:text-primary transition-colors hover:underline decoration-primary underline-offset-4">Historia</Link></li>
            <li><Link href="/club/instalaciones" className="hover:text-primary transition-colors hover:underline decoration-primary underline-offset-4">Instalaciones</Link></li>
            <li><Link href="/club/directiva" className="hover:text-primary transition-colors hover:underline decoration-primary underline-offset-4">Directiva</Link></li>
          </ul>
        </div>

        <div className="col-span-6 md:col-span-2">
          <h5 className="font-label-lg text-label-lg uppercase mb-6 text-on-surface">Equipo</h5>
          <ul className="space-y-4 font-body-md text-body-md text-on-surface-variant">
            <li><Link href="/plantilla" className="hover:text-primary transition-colors hover:underline decoration-primary underline-offset-4">Plantilla</Link></li>
            <li><Link href="/partidos" className="hover:text-primary transition-colors hover:underline decoration-primary underline-offset-4">Partidos</Link></li>
            <li><Link href="/galeria" className="hover:text-primary transition-colors hover:underline decoration-primary underline-offset-4">Galería</Link></li>
            <li><Link href="/contacto" className="hover:text-primary transition-colors hover:underline decoration-primary underline-offset-4">Contacto</Link></li>
          </ul>
        </div>

        <div className="md:col-span-4">
          <h5 className="font-label-lg text-label-lg uppercase mb-6 text-on-surface">Newsletter</h5>
          <p className="font-body-md text-body-md text-on-surface-variant mb-6">Mantente al día con lo último del club.</p>
          <div className="flex border-b border-secondary-container pb-2 mb-4">
            <input
              className="bg-transparent border-none focus:ring-0 w-full font-label-lg uppercase tracking-wider outline-none"
              placeholder="EMAIL"
              type="email"
            />
            <button className="text-primary font-label-lg uppercase tracking-widest hover:text-primary-container transition-colors">
              JOIN
            </button>
          </div>
          <p className="font-label-sm text-label-sm text-on-surface-variant/60 uppercase tracking-widest">
            &copy; 2026 SAINT FERDINAND FC. ALL RIGHTS RESERVED.
          </p>
        </div>
      </div>
    </footer>
  );
}
