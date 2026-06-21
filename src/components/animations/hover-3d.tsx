"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import { useMotionValue, useTransform, useSpring, useAnimationFrame } from "framer-motion";
import type { HTMLMotionProps } from "framer-motion";

export interface Hover3DOptions {
  maxRotate?: number;
  perspective?: number;
  scale?: number;
  duration?: number;
  ease?: number[];
  reset?: boolean;
  glowColor?: string;
  glowIntensity?: number;
  magnetic?: boolean;
  magneticStrength?: number;
}

export interface Hover3DReturn {
  ref: React.RefObject<HTMLDivElement | null>;
  motionProps: Partial<HTMLMotionProps<"div">>;
  rotateX: ReturnType<typeof useMotionValue<number>>;
  rotateY: ReturnType<typeof useMotionValue<number>>;
  isHovering: boolean;
}

export function useHover3D(options: Hover3DOptions = {}): Hover3DReturn {
  const {
    maxRotate = 8,
    perspective = 1000,
    scale = 1.03,
    reset = true,
    glowColor = "var(--color-club-red, #D42030)",
    glowIntensity = 0.25,
    magnetic = false,
    magneticStrength = 0.15,
  } = options;

  const ref = useRef<HTMLDivElement>(null!);
  const isHoveringRef = useRef(false);

  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const scaleValue = useMotionValue(1);
  const glowOpacity = useMotionValue(0);

  const rotateXSpring = useSpring(rotateX, { stiffness: 300, damping: 30 });
  const rotateYSpring = useSpring(rotateY, { stiffness: 300, damping: 30 });
  const scaleSpring = useSpring(scaleValue, { stiffness: 400, damping: 35 });
  const glowSpring = useSpring(glowOpacity, { stiffness: 200, damping: 25 });

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  useAnimationFrame(() => {
    if (!magnetic || !ref.current || !isHoveringRef.current) return;

    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const deltaX = (mouseX.get() - centerX) / (rect.width / 2);
    const deltaY = (mouseY.get() - centerY) / (rect.height / 2);

    rotateX.set(-deltaY * maxRotate * magneticStrength);
    rotateY.set(deltaX * maxRotate * magneticStrength);
  });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const deltaX = (x - centerX) / centerX;
    const deltaY = (y - centerY) / centerY;

    rotateX.set(-deltaY * maxRotate);
    rotateY.set(deltaX * maxRotate);
  };

  const handleMouseEnter = () => {
    isHoveringRef.current = true;
    scaleValue.set(scale);
    glowOpacity.set(glowIntensity);
  };

  const handleMouseLeave = () => {
    isHoveringRef.current = false;
    if (reset) {
      rotateX.set(0);
      rotateY.set(0);
    }
    scaleValue.set(1);
    glowOpacity.set(0);
  };

  const transformStyle = useTransform(
    [rotateXSpring, rotateYSpring, scaleSpring],
    ([rx, ry, s]) => `perspective(${perspective}px) rotateX(${rx}deg) rotateY(${ry}deg) scale(${s})`
  );

  const glowStyle = useTransform(glowSpring, (opacity) => {
    if (opacity === 0) return "none";
    return `radial-gradient(600px circle at 50% 50%, ${glowColor}22, transparent 60%)`;
  });

  const motionProps = {
    style: {
      transform: transformStyle,
      transformStyle: "preserve-3d" as any,
      WebkitTransformStyle: "preserve-3d" as any,
    } as Record<string, unknown>,
    onMouseMove: handleMouseMove,
    onMouseEnter: handleMouseEnter,
    onMouseLeave: handleMouseLeave,
  } as Partial<HTMLMotionProps<"div">>;

  return {
    ref,
    motionProps,
    rotateX: rotateX as unknown as ReturnType<typeof useMotionValue<number>>,
    rotateY: rotateY as unknown as ReturnType<typeof useMotionValue<number>>,
    isHovering: isHoveringRef.current,
  } as Hover3DReturn;
}

export interface Hover3DProps extends Hover3DOptions {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "section" | "article" | "button";
  style?: React.CSSProperties;
}

export function Hover3D({
  children,
  className,
  as: Tag = "div",
  style,
  ...options
}: Hover3DProps) {
  const { ref, motionProps } = useHover3D(options);

  return (
    <motion.div
      ref={ref}
      className={className}
      style={style as any}
      {...(motionProps as HTMLMotionProps<"div">)}
    >
      <div
        style={{
          transformStyle: "preserve-3d",
          WebkitTransformStyle: "preserve-3d",
        }}
      >
        {children}
      </div>
    </motion.div>
  );
}
