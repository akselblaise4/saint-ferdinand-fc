"use client";

import { useState, useEffect } from "react";

const links = [
  { label: "Inicio", href: "/" },
  { label: "Partidos", href: "/partidos" },
  { label: "Plantilla", href: "/plantilla" },
  { label: "Jugadores", href: "/jugadores" },
  { label: "Club", href: "/club" },
  { label: "Contacto", href: "/contacto" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-[#121214]/80 backdrop-blur-xl border-b border-white/[0.06] py-3"
          : "bg-transparent py-5"
      }`}
    >
      <div className="flex items-center justify-between px-5 md:px-10 max-w-7xl mx-auto">
        <a href="/" className="font-display text-2xl md:text-3xl italic tracking-tighter text-white font-extrabold leading-none hover:opacity-80 transition-opacity">
          SFFC
        </a>

        <div className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-xs font-medium uppercase tracking-[0.15em] text-white/60 hover:text-white transition-all duration-300"
            >
              {l.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <a
            href="/login"
            className="hidden md:inline-flex items-center gap-2 rounded-lg border border-white/[0.12] bg-white/[0.04] px-5 py-2.5 text-xs font-semibold uppercase tracking-widest text-white/80 hover:bg-white/[0.08] hover:text-white transition-all"
          >
            Acceso
          </a>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden text-white/60 hover:text-white transition-colors"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              {mobileOpen ? <path d="M6 6l12 12M6 18L18 6" /> : <path d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-[#121214]/95 backdrop-blur-xl border-t border-white/[0.06]">
          <div className="flex flex-col px-5 py-6 gap-4">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="text-sm font-medium uppercase tracking-[0.15em] text-white/60 hover:text-white transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                {l.label}
              </a>
            ))}
            <a
              href="/login"
              className="rounded-lg border border-white/[0.12] bg-white/[0.04] px-5 py-3 text-center text-xs font-semibold uppercase tracking-widest text-white/80 mt-2"
              onClick={() => setMobileOpen(false)}
            >
              Acceso Privado
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
