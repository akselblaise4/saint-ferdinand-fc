"use client";

import { useRef, type ReactNode } from "react";
import { motion, useMotionTemplate, useMotionValue } from "framer-motion";
import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid";

export interface Tile {
  id: string;
  colSpan?: 1 | 2 | 3;
  rowSpan?: 1 | 2 | 3;
  children: ReactNode;
  className?: string;
}

interface BentoGridHomeProps {
  tiles: Tile[];
  className?: string;
}

function SpotlightCard({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const handleMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    x.set(e.clientX - rect.left);
    y.set(e.clientY - rect.top);
  };

  const background = useMotionTemplate`radial-gradient(280px circle at ${x}px ${y}px, rgba(200,16,46,0.08), transparent 80%)`;

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      className="group relative overflow-hidden rounded-xl"
    >
      <motion.div
        className="pointer-events-none absolute inset-0 z-10"
        style={{ background }}
      />
      <div className={`relative z-0 ${className ?? ""}`}>{children}</div>
    </div>
  );
}

function TiltCard({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  const handleMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    ref.current.style.transform = `perspective(600px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg)`;
  };

  const handleLeave = () => {
    if (!ref.current) return;
    ref.current.style.transform = "perspective(600px) rotateY(0deg) rotateX(0deg)";
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className="transition-transform duration-200 ease-out"
    >
      <div className={className}>{children}</div>
    </div>
  );
}

export function BentoGridHome({ tiles, className }: BentoGridHomeProps) {
  return (
    <section className={`py-16 ${className ?? ""}`}>
      <div className="mx-auto max-w-7xl px-6">
        <BentoGrid>
          {tiles.map((tile, i) => (
            <BentoGridItem
              key={tile.id}
              colSpan={tile.colSpan}
              rowSpan={tile.rowSpan}
              index={i}
            >
              <SpotlightCard>
                <TiltCard className={`h-full ${tile.className ?? ""}`}>
                  {tile.children}
                </TiltCard>
              </SpotlightCard>
            </BentoGridItem>
          ))}
        </BentoGrid>
      </div>
    </section>
  );
}
