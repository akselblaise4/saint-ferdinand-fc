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
  const pathname = usePathname();
  const prevScroll = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const cur = window.scrollY;
      setScrolled(cur > 60);
      prevScroll.current = cur;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { setOpen(false); }, [pathname]);

  return (
    <header className={`fixed left-0 top-0 z-50 w-full transition-all duration-500 ${
      scrolled ? "bg-background/90 border-b backdrop-blur-xl" : "bg-gradient-to-b from-black/10 to-transparent"
    }`}>
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary shadow-sm transition-shadow group-hover:shadow-md">
            <span className="font-display text-lg leading-none text-primary-foreground">SF</span>
          </div>
          <span className="hidden text-xs font-medium text-muted-foreground transition-colors group-hover:text-foreground md:block">F.C.</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                  isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <button
          className="relative z-50 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground h-10 w-10 md:hidden"
          onClick={() => setOpen(!open)}
          aria-label="Menu"
        >
          <span className={`h-[1.5px] w-5 rounded-full bg-foreground transition-all duration-300 ${open ? "translate-y-1.5 rotate-45" : ""}`} />
          <span className={`h-[1.5px] w-5 rounded-full bg-foreground transition-all duration-300 ${open ? "opacity-0" : ""}`} />
          <span className={`h-[1.5px] w-5 rounded-full bg-foreground transition-all duration-300 ${open ? "-translate-y-1.5 -rotate-45" : ""}`} />
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-40 flex flex-col items-center justify-center gap-6 bg-background/95 backdrop-blur-xl md:hidden">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.label} href={item.href}
                className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-6 py-3 text-lg font-medium transition-colors ${
                  isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
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
