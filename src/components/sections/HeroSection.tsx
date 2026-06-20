"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

gsap.registerPlugin(useGSAP);

interface HeroSectionProps {
  emblemUrl?: string | null;
  eventTitle?: string;
  groupLabel?: string;
  playersCount?: number;
}

export default function HeroSection({
  emblemUrl,
  eventTitle,
  groupLabel,
  playersCount,
}: HeroSectionProps) {
  const container = useRef<HTMLElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const metaRef = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const lineLeftRef = useRef<HTMLDivElement>(null);
  const lineRightRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    tl.fromTo(bgRef.current, { scale: 1.2, filter: "blur(8px)" }, { scale: 1, filter: "blur(0px)", duration: 1.6 })
      .fromTo(gridRef.current, { opacity: 0 }, { opacity: 1, duration: 1.2 }, 0)
      .fromTo(glowRef.current, { opacity: 0, scale: 0.5 }, { opacity: 1, scale: 1, duration: 1.4 }, 0.2)
      .fromTo(badgeRef.current, { opacity: 0, y: 40, rotation: -10 }, { opacity: 1, y: 0, rotation: 0, duration: 0.8 }, 0.4)
      .fromTo(titleRef.current, { opacity: 0, y: 60 }, { opacity: 1, y: 0, duration: 0.8 }, 0.6)
      .fromTo(metaRef.current, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6 }, 0.8)
      .fromTo(lineLeftRef.current, { scaleX: 0 }, { scaleX: 1, duration: 0.6, transformOrigin: "right center" }, 0.8)
      .fromTo(lineRightRef.current, { scaleX: 0 }, { scaleX: 1, duration: 0.6, transformOrigin: "left center" }, 0.8)
      .fromTo(indicatorRef.current, { opacity: 0 }, { opacity: 1, duration: 0.4 }, 1.1);
  }, []);

  return (
    <section
      ref={container}
      className="relative flex min-h-[90vh] items-center justify-center overflow-hidden bg-club-black"
    >
      {/* Background gradient */}
      <div
        ref={bgRef}
        className="absolute inset-0 bg-gradient-to-b from-club-red/30 via-club-black to-club-black"
      />

      {/* Grid overlay */}
      <div
        ref={gridRef}
        className="absolute inset-0 bg-grid-white opacity-40"
      />

      {/* Radial glow */}
      <div
        ref={glowRef}
        className="absolute left-1/2 top-1/3 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-club-red/20 blur-[120px]"
      />

      {/* Decorative lines */}
      <div ref={lineLeftRef} className="absolute left-0 top-1/2 h-px w-1/4 bg-gradient-to-r from-transparent to-club-red/40" />
      <div ref={lineRightRef} className="absolute right-0 top-1/2 h-px w-1/4 bg-gradient-to-l from-transparent to-club-red/40" />

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
        {/* Emblem / Badge */}
        <div ref={badgeRef} className="mx-auto mb-8 flex items-center justify-center">
          {emblemUrl ? (
            <img
              src={emblemUrl}
              alt="Escudo"
              className="h-28 w-28 animate-float rounded-full object-contain drop-shadow-2xl md:h-36 md:w-36"
            />
          ) : (
            <div className="flex h-28 w-28 animate-float items-center justify-center rounded-full bg-club-red/20 text-5xl font-display text-club-red md:h-36 md:w-36 md:text-7xl">
              SFFC
            </div>
          )}
        </div>

        {/* Title */}
        <div className="overflow-hidden">
          <h1
            ref={titleRef}
            className="font-display text-7xl leading-none tracking-tight text-white md:text-9xl"
          >
            SAINT
            <br />
            FERDINAND
          </h1>
        </div>

        {/* Meta */}
        <div
          ref={metaRef}
          className="mt-6 flex flex-col items-center gap-3 md:flex-row md:justify-center md:gap-6"
        >
          {eventTitle && (
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium uppercase tracking-wider text-white/70 backdrop-blur-sm">
              {eventTitle}
            </span>
          )}
          {groupLabel && (
            <span className="inline-flex items-center gap-2 rounded-full border border-club-gold/20 bg-club-gold/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-club-gold">
              Grupo {groupLabel}
            </span>
          )}
          {playersCount !== undefined && playersCount !== null && (
            <span className="text-sm text-white/50">
              {playersCount} jugadores
            </span>
          )}
        </div>
      </div>

      {/* Scroll indicator */}
      <div
        ref={indicatorRef}
        className="absolute bottom-10 left-1/2 -translate-x-1/2"
      >
        <div className="flex flex-col items-center gap-2">
          <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/30">Scroll</span>
          <div className="h-8 w-[1px] bg-gradient-to-b from-white/40 to-transparent animate-scroll-indicator" />
        </div>
      </div>
    </section>
  );
}
