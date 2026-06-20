"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor) return;

    const onMouseMove = (e: MouseEvent) => {
      pos.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseOver = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest(
        "a, button, [data-hover]"
      );
      if (!target) {
        gsap.to(cursor, { scale: 1, duration: 0.3, ease: "power2.out" });
        return;
      }
      const rect = target.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = pos.current.x - cx;
      const dy = pos.current.y - cy;

      gsap.to(cursor, {
        x: pos.current.x + dx * 0.3,
        y: pos.current.y + dy * 0.3,
        scale: 1.8,
        duration: 0.6,
        ease: "elastic.out(1, 0.3)",
      });
    };

    const onMouseOut = () => {
      gsap.to(cursor, {
        scale: 1,
        duration: 0.4,
        ease: "power2.out",
      });
    };

    const tick = () => {
      gsap.set(cursor, {
        x: pos.current.x,
        y: pos.current.y,
      });
      requestAnimationFrame(tick);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseover", onMouseOver);
    document.addEventListener("mouseout", onMouseOut);
    const raf = requestAnimationFrame(tick);

    return () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseover", onMouseOver);
      document.removeEventListener("mouseout", onMouseOut);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={cursorRef}
      className="pointer-events-none fixed left-0 top-0 z-[999] h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white bg-transparent"
    />
  );
}
