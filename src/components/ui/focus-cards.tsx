"use client";

import { useState } from "react";
import { motion } from "framer-motion";

interface FocusCardData {
  id: string;
  title: string;
  subtitle: string;
  metric: string;
  metricLabel: string;
}

interface FocusCardsProps {
  cards: FocusCardData[];
  className?: string;
}

export function FocusCards({ cards, className }: FocusCardsProps) {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div className={`grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 ${className ?? ""}`}>
      {cards.map((card) => (
        <motion.div
          key={card.id}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.4 }}
          onMouseEnter={() => setHovered(card.id)}
          onMouseLeave={() => setHovered(null)}
          className={`relative cursor-pointer rounded-xl border bg-card p-6 shadow-sm transition-all duration-300 ${
            hovered !== null && hovered !== card.id ? "blur-sm scale-[0.97] opacity-60" : ""
          }`}
        >
          <p className="font-display text-3xl leading-none text-primary">{card.metric}</p>
          <p className="mt-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">{card.metricLabel}</p>
          <div className="mt-4">
            <p className="text-sm font-semibold text-foreground">{card.title}</p>
            <p className="mt-1 text-xs text-muted-foreground">{card.subtitle}</p>
          </div>
          <div
            className={`absolute inset-0 flex items-center justify-center rounded-xl bg-club-black/80 backdrop-blur-sm transition-all duration-300 ${
              hovered === card.id ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          >
            <div className="px-4 text-center">
              <p className="font-display text-5xl text-primary">{card.metric}</p>
              <p className="mt-1 text-sm font-medium text-white">{card.metricLabel}</p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}