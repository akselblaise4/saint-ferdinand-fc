import Link from "next/link";

const sections = [
  {
    title: "Club",
    links: [
      { label: "Sobre el club", href: "/club" },
      { label: "Historia", href: "/club/historia" },
      { label: "Instalaciones", href: "/club/instalaciones" },
      { label: "Directiva", href: "/club/directiva" },
    ],
  },
  {
    title: "Equipo",
    links: [
      { label: "Plantilla", href: "/plantilla" },
      { label: "Partidos", href: "/partidos" },
      { label: "Clasificación", href: "/clasificacion" },
      { label: "Estadísticas", href: "/estadisticas" },
    ],
  },
  {
    title: "Contenido",
    links: [
      { label: "Galería", href: "/galeria" },
      { label: "Noticias", href: "/blog" },
      { label: "Contacto", href: "/contacto" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Aviso Legal", href: "/aviso-legal" },
      { label: "Privacidad", href: "/privacidad" },
      { label: "Cookies", href: "/cookies" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="relative border-t border-border bg-surface-container-low">
      {/* Subtle red accent line at top */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-club-red/30" />

      <div className="mx-auto max-w-[1440px] px-6 md:px-8 py-16 md:py-20">
        {/* Top section: brand + social */}
        <div className="grid gap-12 md:grid-cols-5 mb-16">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center bg-club-red">
                <span className="font-display text-sm font-bold tracking-wider text-white">SF</span>
              </div>
              <div>
                <p className="font-display text-lg font-bold tracking-wide text-on-surface leading-tight">
                  SAINT FERDINAND
                </p>
                <p className="font-display text-sm font-semibold tracking-[0.12em] text-on-surface-variant/60">
                  FC
                </p>
              </div>
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-on-surface-variant mb-6">
              Club de fútbol con sede en Madrid. Compitiendo en la USS Liga Premier
              con excelencia, pasión y dedicación desde 2024.
            </p>
            <div className="flex gap-3">
              {["Instagram", "Twitter", "YouTube", "TikTok"].map((s) => (
                <a
                  key={s}
                  href="#"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center border border-border text-on-surface-variant transition-all duration-300 hover:border-club-red hover:bg-club-red hover:text-white"
                >
                  <span className="text-[10px] font-bold uppercase tracking-wider">{s.charAt(0)}</span>
                </a>
              ))}
            </div>
          </div>

          {sections.map((sec) => (
            <div key={sec.title}>
              <h4 className="font-display text-[10px] font-semibold uppercase tracking-[0.15em] text-on-surface-variant mb-5">
                {sec.title}
              </h4>
              <ul className="flex flex-col gap-2.5">
                {sec.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-on-surface-variant transition-all duration-200 hover:text-on-surface hover:translate-x-0.5 inline-block"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 border-t border-border">
          <p className="text-[11px] text-on-surface-variant/60">
            &copy; {new Date().getFullYear()} Saint Ferdinand FC. Todos los derechos reservados.
          </p>
          <p className="text-[11px] text-on-surface-variant/40">
            Diseñado con precisión en Madrid
          </p>
        </div>
      </div>
    </footer>
  );
}
