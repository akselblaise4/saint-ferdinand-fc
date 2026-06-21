"use client";

import { useRef, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { Menu, X } from "lucide-react";

gsap.registerPlugin(useGSAP);

const links = [
  { label: "Inicio", href: "/" },
  { label: "Partidos", href: "/partidos" },
  { label: "Equipo", href: "/plantilla" },
  { label: "Club", href: "/club" },
  { label: "Galería", href: "/galeria" },
  { label: "Noticias", href: "/blog" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const brandRef = useRef<HTMLAnchorElement>(null);
  const linksRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(brandRef.current, { y: -20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: "power3.out", delay: 0.1 });

      if (linksRef.current) {
        gsap.fromTo(
          linksRef.current.children,
          { y: -16, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5, ease: "power3.out", stagger: 0.04, delay: 0.2 }
        );
      }
    }, navRef);
    return () => ctx.revert();
  }, []);

  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 100);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  return (
    <>
      <nav
        ref={navRef}
        className={`fixed top-0 w-full z-50 bg-surface-container-lowest border-b border-secondary-container transition-all duration-200 ${scrolled ? "h-16 zero-gravity-shadow" : "h-20"}`}
      >
        <div className="flex justify-between items-center max-w-desktop mx-auto px-margin-mobile md:px-margin-desktop h-full">
          <Link
            ref={brandRef}
            href="/"
            className="font-headline-md text-headline-md font-bold text-primary tracking-tighter"
          >
            SAINT FERDINAND FC
          </Link>

          <div ref={linksRef} className="hidden md:flex items-center gap-8">
            {links.map((l) => {
              const isActive = pathname === l.href;
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`font-label-lg text-label-lg uppercase tracking-wider transition-colors ${
                    isActive
                      ? "text-primary border-b-2 border-primary pb-1"
                      : "text-on-surface-variant hover:text-primary"
                  }`}
                >
                  {l.label}
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-6">
            <button className="hidden md:block bg-primary text-on-primary font-label-lg uppercase px-6 py-2 tracking-widest transition-all hover:brightness-110">
              Entradas
            </button>
            <button
              className="md:hidden inline-flex items-center justify-center p-2 text-on-surface-variant"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Menu"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </nav>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="absolute top-20 right-0 bottom-0 w-72 bg-surface-container-lowest p-8 shadow-2xl">
            <nav className="flex flex-col gap-2">
              {links.map((l) => {
                const isActive = pathname === l.href;
                return (
                  <Link
                    key={l.href}
                    href={l.href}
                    className={`px-4 py-3 font-label-lg uppercase tracking-wider transition-colors ${
                      isActive ? "text-primary bg-primary/5" : "text-on-surface-variant hover:text-primary"
                    }`}
                  >
                    {l.label}
                  </Link>
                );
              })}
              <button className="mt-4 bg-primary text-on-primary font-label-lg uppercase py-3 tracking-widest">
                Entradas
              </button>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
