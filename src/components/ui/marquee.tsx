"use client";

import { cn } from "@/lib/utils";

interface MarqueeProps {
  children: React.ReactNode;
  direction?: "left" | "right" | "up" | "down";
  pauseOnHover?: boolean;
  reverse?: boolean;
  className?: string;
  duration?: number;
}

export function Marquee({
  children,
  direction = "left",
  pauseOnHover = false,
  reverse = false,
  className,
  duration = 20,
}: MarqueeProps) {
  const isVert = direction === "up" || direction === "down";
  return (
    <div
      className={`group flex overflow-hidden ${isVert ? "flex-col" : ""} ${className ?? ""}`}
      style={{
        maskImage: "linear-gradient(to right, transparent 0%, #000 10%, #000 90%, transparent 100%)",
        WebkitMaskImage: "linear-gradient(to right, transparent 0%, #000 10%, #000 90%, transparent 100%)",
      }}
    >
      <div
        className={`flex shrink-0 justify-around gap-4 ${
          direction === "left" ? "animate-marquee-left" : ""
        } ${direction === "right" ? "animate-marquee-right" : ""} ${
          direction === "up" ? "animate-marquee-up flex-col" : ""
        } ${direction === "down" ? "animate-marquee-down flex-col" : ""} ${
          pauseOnHover ? "group-hover:[animation-play-state:paused]" : ""
        }`}
        style={{ "--duration": `${duration}s` } as React.CSSProperties}
      >
        {children}
      </div>
    </div>
  );
}