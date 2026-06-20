"use client";

import { motion } from "framer-motion";

interface StatBar {
  label: string;
  value: number;
  max: number;
  color?: string;
}

interface StatsVisualizerProps {
  title: string;
  stats: StatBar[];
}

const barColors = [
  "club-gradient",
  "gold-gradient",
  "from-club-red to-club-gold",
  "from-club-gold to-club-red",
];

export default function StatsVisualizer({ title, stats }: StatsVisualizerProps) {
  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm md:p-8">
      <h3 className="mb-6 font-display text-2xl text-foreground">{title}</h3>
      <div className="space-y-5">
        {stats.map((stat, i) => (
          <div key={stat.label}>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">{stat.label}</span>
              <span className="font-display text-xl leading-none text-club-red">
                {stat.value}/{stat.max}
              </span>
            </div>
            <div className="relative h-3 overflow-hidden rounded-full bg-muted">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: `${(stat.value / stat.max) * 100}%` }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay: i * 0.1, ease: [0.25, 0.1, 0.25, 1] }}
                className={`h-full rounded-full bg-gradient-to-r ${barColors[i % barColors.length]}`}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
