import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-surface border-t border-secondary-container py-section-gap">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter max-w-desktop mx-auto px-margin-mobile md:px-margin-desktop">
        <div className="md:col-span-4 mb-12 md:mb-0">
          <h3 className="font-headline-lg text-headline-lg text-primary mb-8 tracking-tighter font-bold">
            SAINT FERDINAND FC
          </h3>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-xs mb-8">
            La cúspide de la excelencia atlética y el lujo deportivo moderno. Desde 2024.
          </p>
          <div className="flex gap-4">
            <span className="material-symbols-outlined text-2xl text-on-surface-variant cursor-pointer hover:text-primary transition-colors">
              share
            </span>
            <span className="material-symbols-outlined text-2xl text-on-surface-variant cursor-pointer hover:text-primary transition-colors">
              language
            </span>
          </div>
        </div>

        <div className="col-span-6 md:col-span-2">
          <h5 className="font-label-lg text-label-lg uppercase mb-6 text-on-surface">Club</h5>
          <ul className="space-y-4 font-body-md text-body-md text-on-surface-variant">
            <li><Link href="/club" className="hover:text-primary transition-colors hover:underline decoration-primary underline-offset-4">Sobre nosotros</Link></li>
            <li><Link href="/club" className="hover:text-primary transition-colors hover:underline decoration-primary underline-offset-4">Academia</Link></li>
            <li><Link href="/club" className="hover:text-primary transition-colors hover:underline decoration-primary underline-offset-4">Estadio</Link></li>
            <li><Link href="/club" className="hover:text-primary transition-colors hover:underline decoration-primary underline-offset-4">Museo</Link></li>
          </ul>
        </div>

        <div className="col-span-6 md:col-span-2">
          <h5 className="font-label-lg text-label-lg uppercase mb-6 text-on-surface">Soporte</h5>
          <ul className="space-y-4 font-body-md text-body-md text-on-surface-variant">
            <li><Link href="/contacto" className="hover:text-primary transition-colors hover:underline decoration-primary underline-offset-4">Contacto</Link></li>
            <li><Link href="/contacto" className="hover:text-primary transition-colors hover:underline decoration-primary underline-offset-4">Carreras</Link></li>
            <li><Link href="/club" className="hover:text-primary transition-colors hover:underline decoration-primary underline-offset-4">Términos de servicio</Link></li>
            <li><Link href="/club" className="hover:text-primary transition-colors hover:underline decoration-primary underline-offset-4">Política de privacidad</Link></li>
          </ul>
        </div>

        <div className="md:col-span-4">
          <h5 className="font-label-lg text-label-lg uppercase mb-6 text-on-surface">Newsletter</h5>
          <div className="flex border-b border-secondary-container pb-2 mb-4">
            <input
              className="bg-transparent border-none focus:ring-0 w-full font-label-lg uppercase tracking-widest outline-none"
              placeholder="TU EMAIL"
              type="email"
            />
            <button className="text-primary font-bold uppercase tracking-widest hover:text-primary-container transition-colors">
              JOIN
            </button>
          </div>
        </div>
      </div>
      <div className="max-w-desktop mx-auto px-margin-mobile md:px-margin-desktop mt-16 md:mt-20 pt-8 border-t border-secondary-container/30">
        <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest opacity-60">
          &copy; 2024 SAINT FERDINAND FC. ALL RIGHTS RESERVED.
        </p>
      </div>
    </footer>
  );
}
