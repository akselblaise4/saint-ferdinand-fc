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
  const topBarRef = useRef<HTMLDivElement>(null);
  const compactBrandRef = useRef<HTMLAnchorElement>(null);

  useGSAP(() => {
    const tl = gsap.timeline({ defaults: { ease: "power3.out", duration: 0.6 } });
    tl.fromTo(topBarRef.current, { y: -24, opacity: 0 }, { y: 0, opacity: 1 }, 0)
      .fromTo(brandRef.current, { y: -20, opacity: 0 }, { y: 0, opacity: 1 }, 0.1)
      .fromTo(linksRef.current?.children ?? [], { y: -16, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.04 }, 0.2);
  }, []);

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;

    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const y = window.scrollY;
          if (y > 80) {
            gsap.to(nav, { backgroundColor: "rgba(249,249,250,0.92)", borderBottomWidth: 1, duration: 0.3, ease: "power2.out" });
            gsap.to(compactBrandRef.current, { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" });
          } else {
            gsap.to(nav, { backgroundColor: "rgba(249,249,250,0)", borderBottomWidth: 0, duration: 0.3, ease: "power2.out" });
            gsap.to(compactBrandRef.current, { opacity: 0, y: -8, duration: 0.3, ease: "power2.out" });
          }
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  return (
    <>
      <header
        ref={navRef}
        className="fixed top-0 left-0 right-0 z-50 bg-surface-container-lowest/0 border-b border-transparent"
      >
        {/* Top bar — thin red line + tagline */}
        <div
          ref={topBarRef}
          className="hidden md:flex items-center justify-between h-7 px-8 bg-club-red"
        >
          <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-white/80">
            USS Liga Premier · 2026
          </span>
          <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-white/80">
            Madrid · Spain
          </span>
        </div>

        {/* Main bar */}
        <div className="flex items-center justify-between h-14 md:h-16 px-6 md:px-8 max-w-[1440px] mx-auto">
          {/* Primary brand — full */}
          <Link
            ref={brandRef}
            href="/"
            className="flex items-center gap-3 group shrink-0"
          >
            <div className="relative flex h-8 w-8 items-center justify-center overflow-hidden bg-club-red transition-all duration-300 group-hover:scale-105">
              <span className="font-display text-xs font-bold tracking-wider text-white">SF</span>
            </div>
            <div className="hidden sm:block">
              <span className="block font-display text-sm font-bold tracking-[0.08em] text-on-surface leading-none">
                SAINT FERDINAND
              </span>
              <span className="block text-[9px] font-semibold uppercase tracking-[0.15em] text-on-surface-variant/60 leading-tight">
                Football Club
              </span>
            </div>
          </Link>

          {/* Compact brand — appears on scroll */}
          <a
            ref={compactBrandRef}
            href="/"
            className="absolute left-1/2 -translate-x-1/2 opacity-0 pointer-events-none"
          >
            <span className="font-display text-sm font-bold tracking-[0.08em] text-on-surface">SFC</span>
          </a>

          {/* Desktop nav */}
          <nav ref={linksRef} className="hidden md:flex items-center gap-1">
            {links.map((l) => {
              const isActive = pathname === l.href;
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`relative px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.1em] transition-colors duration-300 ${
                    isActive ? "text-club-red" : "text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  {l.label}
                  {isActive && (
                    <span className="absolute -bottom-px left-4 right-4 h-[2px] bg-club-red" />
                  )}
                </Link>
              );
            })}
            <Link
              href="/contacto"
              className="ml-3 bg-club-red px-5 py-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-white transition-all duration-300 hover:bg-club-red/90"
            >
              Entradas
            </Link>
          </nav>

          {/* Mobile toggle */}
          <button
            className="relative z-50 inline-flex items-center justify-center p-2 text-on-surface md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {/* Mobile menu — slide in from right */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-on-surface/20 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="absolute top-0 right-0 bottom-0 w-72 bg-surface-container-lowest p-8 pt-28 shadow-2xl">
            <nav className="flex flex-col gap-1">
              {links.map((l) => {
                const isActive = pathname === l.href;
                return (
                  <Link
                    key={l.href}
                    href={l.href}
                    className={`px-4 py-3 text-sm font-semibold uppercase tracking-[0.08em] transition-colors ${
                      isActive ? "text-club-red bg-club-red/5" : "text-on-surface-variant hover:text-on-surface"
                    }`}
                  >
                    {l.label}
                  </Link>
                );
              })}
              <Link
                href="/contacto"
                className="mt-4 bg-club-red px-5 py-3 text-center text-xs font-semibold uppercase tracking-[0.1em] text-white"
              >
                Entradas
              </Link>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
