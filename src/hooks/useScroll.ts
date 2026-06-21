"use client";

import { useEffect, useRef, useState } from "react";

interface ScrollState {
  y: number;
  direction: "up" | "down";
  isAtTop: boolean;
  isAtBottom: boolean;
  progress: number;
  velocity: number;
}

export function useScroll(): ScrollState {
  const [state, setState] = useState<ScrollState>({
    y: 0,
    direction: "down",
    isAtTop: true,
    isAtBottom: false,
    progress: 0,
    velocity: 0,
  });

  const lastY = useRef(0);
  const rafId = useRef<number>(0);

  useEffect(() => {
    const handleScroll = () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
      rafId.current = requestAnimationFrame(() => {
        const y = window.scrollY;
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        const velocity = y - lastY.current;

        setState({
          y,
          direction: velocity > 0 ? "down" : velocity < 0 ? "up" : state.direction,
          isAtTop: y < 10,
          isAtBottom: y >= maxScroll - 10,
          progress: maxScroll > 0 ? y / maxScroll : 0,
          velocity,
        });

        lastY.current = y;
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, []);

  return state;
}
