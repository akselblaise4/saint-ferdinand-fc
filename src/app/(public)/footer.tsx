import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-surface border-t border-secondary-container w-full py-section-gap">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter max-w-desktop mx-auto px-margin-mobile md:px-margin-desktop">
        {/* Brand Column */}
        <div className="md:col-span-4 mb-12 md:mb-0">
          <h3 className="font-headline-lg text-headline-lg text-primary mb-8 font-bold tracking-tighter">
            SAINT FERDINAND FC
          </h3>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-xs mb-8">
            La cúspide de la excelencia atlética y el lujo deportivo moderno. Desde 2024.
          </p>
          <div className="flex gap-4">
            <button className="w-10 h-10 border border-secondary-container flex items-center justify-center hover:bg-primary hover:text-white transition-colors cursor-pointer" aria-label="Compartir">
              <span className="material-symbols-outlined text-xl">share</span>
            </button>
            <button className="w-10 h-10 border border-secondary-container flex items-center justify-center hover:bg-primary hover:text-white transition-colors cursor-pointer" aria-label="Idioma">
              <span className="material-symbols-outlined text-xl">language</span>
            </button>
          </div>
        </div>

        {/* Club Column */}
        <div className="col-span-6 md:col-span-2">
          <h6 className="font-label-lg text-label-lg text-on-background uppercase mb-6">Club</h6>
          <ul className="space-y-4">
            <li><Link href="/club" className="font-body-md text-body-md text-on-surface-variant hover:underline decoration-primary underline-offset-4">Sobre nosotros</Link></li>
            <li><Link href="/club" className="font-body-md text-body-md text-on-surface-variant hover:underline decoration-primary underline-offset-4">Academia</Link></li>
            <li><Link href="/club" className="font-body-md text-body-md text-on-surface-variant hover:underline decoration-primary underline-offset-4">Estadio</Link></li>
            <li><Link href="/club" className="font-body-md text-body-md text-on-surface-variant hover:underline decoration-primary underline-offset-4">Museo</Link></li>
          </ul>
        </div>

        {/* Support Column */}
        <div className="col-span-6 md:col-span-2">
          <h6 className="font-label-lg text-label-lg text-on-background uppercase mb-6">Soporte</h6>
          <ul className="space-y-4">
            <li><Link href="/contacto" className="font-body-md text-body-md text-on-surface-variant hover:underline decoration-primary underline-offset-4">Contacto</Link></li>
            <li><Link href="/contacto" className="font-body-md text-body-md text-on-surface-variant hover:underline decoration-primary underline-offset-4">Carreras</Link></li>
            <li><Link href="/club" className="font-body-md text-body-md text-on-surface-variant hover:underline decoration-primary underline-offset-4">Términos de servicio</Link></li>
            <li><Link href="/club" className="font-body-md text-body-md text-on-surface-variant hover:underline decoration-primary underline-offset-4">Política de privacidad</Link></li>
          </ul>
        </div>

        {/* Newsletter Column */}
        <div className="md:col-span-4 mt-12 md:mt-0">
          <h6 className="font-label-lg text-label-lg text-on-background uppercase mb-6">Newsletter</h6>
          <div className="flex border-b border-on-surface-variant/30 pb-2 mb-4">
            <input
              className="bg-transparent border-none focus:ring-0 w-full font-label-sm uppercase tracking-widest text-on-surface outline-none"
              placeholder="TU EMAIL"
              type="email"
            />
            <button className="text-primary material-symbols-outlined">arrow_forward</button>
          </div>
          <p className="font-label-sm text-label-sm text-on-surface-variant opacity-60">
            Únete a 500k+ fans para exclusivos semanales.
          </p>
        </div>

        {/* Copyright */}
        <div className="md:col-span-12 border-t border-secondary-container mt-20 pt-8">
          <p className="font-body-md text-body-md text-on-surface-variant text-center md:text-left">
            &copy; 2024 SAINT FERDINAND FC. ALL RIGHTS RESERVED.
          </p>
        </div>
      </div>
    </footer>
  );
}
