import Link from "next/link";

const footerLinks = [
  { label: "Inicio", href: "/" },
  { label: "Partidos", href: "/partidos" },
  { label: "Equipo", href: "/plantilla" },
  { label: "Club", href: "/club" },
  { label: "Galería", href: "/galeria" },
  { label: "Noticias", href: "/blog" },
  { label: "Contacto", href: "/contacto" },
];

const socialLinks = [
  { label: "Instagram", href: "#" },
  { label: "Twitter / X", href: "#" },
  { label: "YouTube", href: "#" },
  { label: "TikTok", href: "#" },
];

export default function Footer() {
  return (
    <footer className="border-t border-border bg-surface-container-low">
      <div className="mx-auto max-w-6xl px-6 py-12 md:py-16">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center bg-club-red">
                <span className="font-display text-xs font-bold tracking-wider text-white">SF</span>
              </div>
              <div>
                <p className="font-display text-base font-semibold tracking-wide text-on-surface">SAINT FERDINAND FC</p>
                <p className="text-xs text-on-surface-variant">Fundado 2024 · Madrid</p>
              </div>
            </div>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-on-surface-variant">
              Club de fútbol compitiendo en la USS Liga Premier · Grupo C.
              Datos obtenidos de Copa Fácil y actualizados automáticamente.
            </p>
          </div>
          <div>
            <h4 className="font-display text-[10px] font-semibold uppercase tracking-[0.12em] text-on-surface-variant">Navegación</h4>
            <div className="mt-4 flex flex-col gap-2">
              {footerLinks.map((item) => (
                <Link key={item.label} href={item.href} className="text-sm text-on-surface-variant transition-colors hover:text-on-surface">
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-display text-[10px] font-semibold uppercase tracking-[0.12em] text-on-surface-variant">Redes</h4>
            <div className="mt-4 flex flex-col gap-2">
              {socialLinks.map((item) => (
                <a key={item.label} href={item.href} target="_blank" rel="noopener noreferrer" className="text-sm text-on-surface-variant transition-colors hover:text-on-surface">
                  {item.label}
                </a>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-10 border-t border-border pt-5 text-center text-xs text-on-surface-variant">
          &copy; {new Date().getFullYear()} Saint Ferdinand FC.
        </div>
      </div>
    </footer>
  );
}
