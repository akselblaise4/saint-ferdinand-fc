import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="mx-auto max-w-6xl px-6 py-12 md:py-16">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary shadow-sm">
                <span className="font-display text-lg leading-none text-primary-foreground">SF</span>
              </div>
              <span className="text-xs font-medium text-muted-foreground">F.C.</span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
              USS Liga Premier · Grupo C. Datos obtenidos de Copa Fácil y actualizados automáticamente.
            </p>
          </div>
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Navegación</h4>
            <div className="mt-4 flex flex-col gap-2">
              {[
                { label: "Inicio", href: "/" },
                { label: "Partidos", href: "/partidos" },
                { label: "Equipo", href: "/plantilla" },
              ].map((item) => (
                <Link key={item.label} href={item.href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Más</h4>
            <div className="mt-4 flex flex-col gap-2">
              {[
                { label: "Galería", href: "/galeria" },
                { label: "Noticias", href: "/blog" },
              ].map((item) => (
                <Link key={item.label} href={item.href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-12 border-t pt-6 text-center text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} Saint Ferdinand FC
        </div>
      </div>
    </footer>
  );
}
