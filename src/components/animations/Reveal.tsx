"use client";

import { motion } from "framer-motion";
import { ReactNode, useRef } from "react";

const easeOut = [0.16, 1, 0.3, 1] as const;

interface RevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  duration?: number;
  once?: boolean;
}

export function Reveal({ children, className, delay = 0, y = 32, duration = 0.6, once = true }: RevealProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: "-40px" }}
      transition={{ duration, delay, ease: easeOut }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface RevealClipProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
}

export function RevealClip({ children, className, delay = 0, duration = 0.8 }: RevealClipProps) {
  return (
    <div className={`overflow-hidden ${className ?? ""}`}>
      <motion.div
        initial={{ clipPath: "inset(0 0 100% 0)", y: 40 }}
        whileInView={{ clipPath: "inset(0 0 0% 0)", y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration, delay, ease: easeOut }}
      >
        {children}
      </motion.div>
    </div>
  );
}

interface StaggerContainerProps {
  children: ReactNode;
  className?: string;
  stagger?: number;
  delay?: number;
}

export function StaggerContainer({ children, className, stagger = 0.04, delay = 0 }: StaggerContainerProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-40px" }}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: stagger, delayChildren: delay } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 24 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: easeOut } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface ScaleOnViewProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export function ScaleOnView({ children, className, delay = 0 }: ScaleOnViewProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay, ease: easeOut }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface MaskTextProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export function MaskText({ children, className, delay = 0 }: MaskTextProps) {
  return (
    <div className={`overflow-hidden ${className ?? ""}`}>
      <motion.div
        initial={{ y: "100%" }}
        whileInView={{ y: "0%" }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.6, delay, ease: easeOut }}
      >
        {children}
      </motion.div>
    </div>
  );
}
