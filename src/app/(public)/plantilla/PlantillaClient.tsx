"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";

interface Player {
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  teamId: string;
  teamName: string;
  photo?: string;
  stats?: Record<string, number>;
}

interface Props {
  players: Player[];
  scorersMap: Map<string, number>;
}

const filters = [
  { key: "all", label: "Todos" },
  { key: "scorers", label: "Goleadores" },
] as const;

type FilterKey = (typeof filters)[number]["key"];

export default function PlantillaClient({ players, scorersMap }: Props) {
  const [filter, setFilter] = useState<FilterKey>("all");

  const sorted = useMemo(() => {
    return [...players].sort(
      (a: any, b: any) => (scorersMap.get(b.name) || 0) - (scorersMap.get(a.name) || 0)
    );
  }, [players, scorersMap]);

  const displayed = useMemo(() => {
    if (filter === "scorers") return sorted.filter((p) => (scorersMap.get(p.name) || 0) > 0);
    return sorted;
  }, [sorted, filter, scorersMap]);

  const getName = (p: Player) => {
    const parts = p.name.split("\t").filter(Boolean);
    return parts[0] && parts[1] ? `${parts[0]} ${parts[1]}` : parts[0] || p.firstName || "—";
  };

  const getInitials = (p: Player) => {
    const parts = p.name.split("\t").filter(Boolean);
    return (parts[0]?.[0] || "") + (parts[1]?.[0] || parts[0]?.[1] || "");
  };

  return (
    <section className="py-section-gap max-w-desktop mx-auto px-margin-mobile md:px-margin-desktop">
      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-4 mb-12 md:mb-16 items-center">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-8 py-3 font-label-lg uppercase tracking-widest transition-all ${
              filter === f.key
                ? "border-2 border-primary text-primary"
                : "border border-secondary-container text-on-surface-variant hover:border-primary"
            }`}
          >
            {f.label}
          </button>
        ))}
        <span className="font-label-sm text-on-surface-variant uppercase tracking-widest ml-auto">
          {displayed.length} jugadores
        </span>
      </div>

      {/* Player Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-gutter">
        {displayed.map((p, i) => {
          const goals = scorersMap.get(p.name) || 0;
          return (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: (i % 8) * 0.04, ease: [0.16, 1, 0.3, 1] }}
              className="player-card group relative aspect-[3/4] bg-surface-container-lowest border border-surface-container overflow-hidden"
            >
              {p.photo ? (
                <img
                  src={p.photo}
                  alt={getName(p)}
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-surface-container to-surface-container-high">
                  <span className="font-display-lg text-display-lg text-on-surface-variant/20 select-none">
                    {getInitials(p)}
                  </span>
                </div>
              )}
              {/* Hover overlay */}
              <div className="player-overlay absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/80 to-transparent opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-400 text-surface">
                <span className="text-primary-container font-label-sm uppercase mb-1 block">
                  {goals > 0 ? `${goals} goles` : "Sin goles"}
                </span>
                <h3 className="font-headline-md text-headline-md uppercase tracking-tight">{getName(p)}</h3>
              </div>
              {/* Jersey number */}
              <div className="absolute top-4 left-4 font-display-lg text-display-lg text-on-surface-variant/10 leading-none group-hover:text-primary/20 transition-colors">
                {String(i + 1).padStart(2, "0")}
              </div>
            </motion.div>
          );
        })}
      </div>
      {displayed.length === 0 && (
        <p className="text-center py-16 font-body-lg text-body-lg text-on-surface-variant">
          No hay jugadores para mostrar
        </p>
      )}
    </section>
  );
}
