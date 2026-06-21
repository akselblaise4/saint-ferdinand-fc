"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { label: "Partidos", href: "/partidos" },
  { label: "Equipo", href: "/plantilla" },
  { label: "Club", href: "/club" },
  { label: "Galería", href: "/galeria" },
  { label: "Noticias", href: "/blog" },
  { label: "Contacto", href: "/contacto" },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { setOpen(false); }, [pathname]);

  return (
    <header className={`fixed left-0 top-0 z-50 w-full transition-all duration-300 ${
      scrolled ? "bg-surface-container-lowest/95 border-b border-border backdrop-blur-md" : "bg-surface-container-lowest/80"
    }`}>
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="flex h-7 w-7 items-center justify-center bg-club-red">
            <span className="font-display text-[11px] font-bold tracking-wider text-white">SF</span>
          </div>
          <span className="font-display text-sm font-semibold tracking-wider text-on-surface">
            SAINT FERDINAND
          </span>
        </Link>

        <nav className="hidden items-center gap-0 md:flex">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.08em] transition-colors ${
                  isActive ? "text-club-red" : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                {item.label}
                {isActive && <span className="block h-[1px] bg-club-red mt-0.5" />}
              </Link>
            );
          })}
        </nav>

        <button
          className="relative z-50 inline-flex flex-col items-center justify-center gap-1 p-2 text-on-surface-variant hover:text-on-surface md:hidden"
          onClick={() => setOpen(!open)}
          aria-label="Menu"
        >
          <span className={`h-[1px] w-5 bg-current transition-all duration-300 ${open ? "translate-y-[3px] rotate-45" : ""}`} />
          <span className={`h-[1px] w-5 bg-current transition-all duration-300 ${open ? "opacity-0" : ""}`} />
          <span className={`h-[1px] w-5 bg-current transition-all duration-300 ${open ? "-translate-y-[3px] -rotate-45" : ""}`} />
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-40 flex flex-col items-center justify-center gap-6 bg-surface-container-lowest md:hidden">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.label} href={item.href}
                className={`px-6 py-3 text-base font-semibold uppercase tracking-[0.08em] transition-colors ${
                  isActive ? "text-club-red" : "text-on-surface-variant hover:text-on-surface"
                }`}>
                {item.label}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
