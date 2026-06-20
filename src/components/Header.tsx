"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { label: "Inicio", href: "/" },
  { label: "Partidos", href: "/partidos" },
  { label: "Equipo", href: "/plantilla" },
  { label: "Galería", href: "/galeria" },
  { label: "Noticias", href: "/blog" },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const pathname = usePathname();
  const prevScroll = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const cur = window.scrollY;
      setScrolled(cur > 60);
      setHidden(cur > 200 && cur > prevScroll.current);
      prevScroll.current = cur;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { setOpen(false); }, [pathname]);

  return (
    <header className={`fixed left-0 top-0 z-50 w-full transition-all duration-500 ${
      scrolled
        ? "bg-club-black/90 border-b border-white/5 backdrop-blur-xl"
        : "bg-gradient-to-b from-black/30 to-transparent"
    } ${hidden ? "-translate-y-full" : "translate-y-0"}`}>
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg club-gradient shadow-sm transition-all group-hover:shadow-md group-hover:scale-105">
            <span className="font-display text-lg leading-none text-white">SF</span>
          </div>
          <div className="hidden md:block">
            <span className="font-display text-sm tracking-wider text-white/90 group-hover:text-white transition-colors">SAINT FERDINAND</span>
            <span className="ml-2 text-[10px] font-medium text-white/30">FC</span>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`relative inline-flex items-center justify-center whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "text-white"
                    : "text-white/50 hover:text-white/80"
                }`}
              >
                {item.label}
                {isActive && (
                  <span className="absolute bottom-0.5 left-4 right-4 h-0.5 rounded-full club-gradient" />
                )}
              </Link>
            );
          })}
        </nav>

        <button
          className="relative z-50 inline-flex flex-col items-center justify-center gap-1 rounded-md p-2 text-white/50 transition-colors hover:text-white md:hidden"
          onClick={() => setOpen(!open)}
          aria-label="Menu"
        >
          <span className={`h-[1.5px] w-5 rounded-full bg-current transition-all duration-300 ${open ? "translate-y-[3.5px] rotate-45" : ""}`} />
          <span className={`h-[1.5px] w-5 rounded-full bg-current transition-all duration-300 ${open ? "opacity-0" : ""}`} />
          <span className={`h-[1.5px] w-5 rounded-full bg-current transition-all duration-300 ${open ? "-translate-y-[3.5px] -rotate-45" : ""}`} />
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-40 flex flex-col items-center justify-center gap-6 bg-club-black/95 backdrop-blur-2xl md:hidden">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.label} href={item.href}
                className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-6 py-3 text-lg font-medium transition-colors ${
                  isActive ? "text-white" : "text-white/50 hover:text-white/80"
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
