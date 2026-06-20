import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: ReactNode;
  trend?: "up" | "down" | "neutral";
  trendLabel?: string;
  className?: string;
}

const trendColors = {
  up: "text-emerald-600",
  down: "text-red-600",
  neutral: "text-muted-foreground",
};

const trendArrows = {
  up: "\u2191",
  down: "\u2193",
  neutral: "\u2192",
};

export function StatCard({ label, value, icon, trend, trendLabel, className }: StatCardProps) {
  return (
    <div className={cn("flex flex-col gap-1.5 rounded-xl border bg-card p-5 shadow-sm", className)}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        {icon && <span className="text-muted-foreground">{icon}</span>}
      </div>
      <div className="flex items-baseline gap-2">
        <span className="font-display text-3xl leading-none tracking-tight text-foreground">
          {value}
        </span>
        {trend && (
          <span className={cn("text-sm font-medium", trendColors[trend])}>
            {trendArrows[trend]} {trendLabel}
          </span>
        )}
      </div>
    </div>
  );
}
