"use client";

import { useRef, type ReactNode } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

type SectionTheme = "dark" | "light" | "alt";

interface SectionProps {
  children: ReactNode;
  theme?: SectionTheme;
  className?: string;
  id?: string;
  animate?: boolean;
}

const themeStyles: Record<SectionTheme, string> = {
  dark: "section-dark bg-grid-white",
  light: "section-light bg-grid-black",
  alt: "section-alt",
};

export function Section({ children, theme = "light", className, id, animate = true }: SectionProps) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(() => {
    if (!animate || !ref.current) return;
    const els = ref.current.querySelectorAll(".section-fade");
    if (!els.length) return;
    gsap.fromTo(
      els,
      { opacity: 0, y: 40 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ref.current,
          start: "top 85%",
          toggleActions: "play none none reverse",
        },
      }
    );
  }, [animate]);

  return (
    <section
      ref={ref}
      id={id}
      className={`relative overflow-hidden py-20 md:py-28 ${themeStyles[theme]} ${className ?? ""}`}
    >
      <div className="relative z-10 mx-auto max-w-7xl px-6">{children}</div>
    </section>
  );
}

export function SectionTitle({ label, title, theme = "light" }: { label?: string; title: string; theme?: SectionTheme }) {
  return (
    <div className="section-fade mb-12 text-center">
      {label && (
        <span className={`mb-2 inline-block text-xs font-semibold uppercase tracking-[0.2em] ${theme === "dark" ? "text-club-gold" : "text-club-red"}`}>
          {label}
        </span>
      )}
      <h2 className={`font-display text-5xl leading-none md:text-7xl ${theme === "dark" ? "text-white" : "text-club-black"}`}>
        {title}
      </h2>
      <div className={`mx-auto mt-4 h-0.5 w-16 ${theme === "dark" ? "bg-club-gold" : "bg-club-red"}`} />
    </div>
  );
}
