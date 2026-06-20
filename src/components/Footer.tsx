import Link from "next/link";
import Emblem from "./Emblem";

const footerLinks = [
  { label: "Inicio", href: "/" },
  { label: "Partidos", href: "/partidos" },
  { label: "Equipo", href: "/plantilla" },
  { label: "Galería", href: "/galeria" },
  { label: "Noticias", href: "/blog" },
];

const socialLinks = [
  { label: "Instagram", href: "#" },
  { label: "Twitter / X", href: "#" },
  { label: "YouTube", href: "#" },
  { label: "TikTok", href: "#" },
];

export default function Footer() {
  return (
    <footer className="relative border-t border-white/5 bg-club-black">
      <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[length:24px_24px]" />
      <div className="relative mx-auto max-w-6xl px-6 py-16 md:py-20">
        <div className="grid gap-12 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-center gap-4">
              <Emblem className="h-14 w-auto" />
              <div>
                <p className="font-display text-xl tracking-wide text-white">SAINT FERDINAND FC</p>
                <p className="text-xs text-white/30">Fundado 2024 · Madrid</p>
              </div>
            </div>
            <p className="mt-6 max-w-md text-sm leading-relaxed text-white/40">
              Club de fútbol compitiendo en la USS Liga Premier · Grupo C.
              Datos obtenidos de Copa Fácil y actualizados automáticamente.
            </p>
          </div>
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-white/50">Navegación</h4>
            <div className="mt-5 flex flex-col gap-3">
              {footerLinks.map((item) => (
                <Link key={item.label} href={item.href} className="text-sm text-white/40 transition-colors hover:text-white">
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-white/50">Redes</h4>
            <div className="mt-5 flex flex-col gap-3">
              {socialLinks.map((item) => (
                <a key={item.label} href={item.href} target="_blank" rel="noopener noreferrer" className="text-sm text-white/40 transition-colors hover:text-white">
                  {item.label}
                </a>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-12 border-t border-white/5 pt-6 text-center text-xs text-white/20">
          &copy; {new Date().getFullYear()} Saint Ferdinand FC. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  );
}
