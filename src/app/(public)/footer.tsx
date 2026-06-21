export default function Footer() {
  return (
    <footer className="relative border-t border-white/[0.06] bg-[#121214]">
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-8 px-5 md:px-10 py-16 max-w-7xl mx-auto">
        <div className="md:col-span-4">
          <div className="font-display text-3xl md:text-4xl italic tracking-tighter text-white font-extrabold mb-6">SFFC</div>
          <p className="text-sm text-white/40 max-w-xs leading-relaxed">
            Saint Ferdinand FC compite en la USS Liga Premier con orgullo, pasión y excelencia.
          </p>
        </div>
        {[{
          title: "Club",
          links: [
            { label: "Historia", href: "/club" },
            { label: "Plantilla", href: "/plantilla" },
            { label: "Partidos", href: "/partidos" },
            { label: "Jugadores", href: "/jugadores" },
            { label: "Galería", href: "/galeria" },
          ],
        }, {
          title: "Comunidad",
          links: [
            { label: "Noticias", href: "/blog" },
            { label: "Contacto", href: "/contacto" },
            { label: "Privacidad", href: "#" },
            { label: "Términos", href: "#" },
          ],
        }].map((section) => (
          <div key={section.title} className="md:col-span-2">
            <h5 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/30 mb-6">{section.title}</h5>
            <ul className="space-y-3">
              {section.links.map((l) => (
                <li key={l.label}>
                  <a href={l.href} className="text-sm text-white/40 hover:text-white transition-colors">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
        <div className="md:col-span-4">
          <h5 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/30 mb-6">Newsletter</h5>
          <p className="text-sm text-white/40 mb-6">Recibe las últimas novedades del club.</p>
          <div className="flex">
            <input
              className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-l-lg px-4 py-3 text-sm text-white placeholder:text-white/20 outline-none focus:border-white/20 transition-colors"
              placeholder="tu@email.com"
              type="email"
            />
            <button className="bg-white text-[#09090b] px-6 py-3 text-xs font-semibold uppercase tracking-widest rounded-r-lg hover:opacity-90 transition-opacity">
              Suscribir
            </button>
          </div>
        </div>
        <div className="md:col-span-12 pt-8 mt-8 border-t border-white/[0.06] flex flex-col md:flex-row justify-between items-center gap-4">
          <span className="text-[11px] text-white/20">
            &copy; {new Date().getFullYear()} SAINT FERDINAND FC.
          </span>
        </div>
      </div>
    </footer>
  );
}
