"use client";

import { useEffect, useRef } from "react";

export default function AnalogNoiseOverlay() {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const filter = svg.querySelector("feTurbulence");
    if (!filter) return;

    let frame: number;
    const animate = () => {
      const seed = Math.floor(Math.random() * 1000);
      filter.setAttribute("seed", String(seed));
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <svg
      ref={svgRef}
      className="pointer-events-none fixed inset-0 z-50 h-full w-full opacity-[0.015]"
      style={{ isolation: "isolate" }}
    >
      <filter x="0" y="0" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#noise)" />
    </svg>
  );
}
