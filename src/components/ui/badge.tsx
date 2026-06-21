"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "success" | "warning" | "info" | "club" | "gold" | "glass";
  size?: "sm" | "md" | "lg";
  dot?: boolean;
  dotColor?: string;
  pulse?: boolean;
  children: ReactNode;
}

const variantStyles = {
  default: "bg-muted text-muted-foreground border-transparent",
  secondary: "bg-secondary text-secondary-foreground border-transparent",
  destructive: "bg-destructive/10 text-destructive border-destructive/20",
  outline: "bg-transparent text-foreground border-border",
  success: "bg-green-500/10 text-green-400 border-green-500/20",
  warning: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  info: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  club: "bg-club-red/10 text-club-red border-club-red/20",
  gold: "bg-club-gold/10 text-club-gold border-club-gold/20",
  glass: "glass bg-white/5 border-white/10 text-white",
} as const;

const sizeStyles = {
  sm: "px-2 py-0.5 text-xs gap-1",
  md: "px-2.5 py-1 text-xs gap-1.5",
  lg: "px-3 py-1.5 text-sm gap-2",
} as const;

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      className,
      variant = "default",
      size = "md",
      dot = false,
      dotColor,
      pulse = false,
      children,
      style,
      ...props
    },
    ref
  ) => {
    const baseStyles = cn(
      "inline-flex items-center font-medium rounded-full border",
      "transition-colors duration-200",
      variantStyles[variant],
      sizeStyles[size],
      className
    );

    return (
      <span ref={ref} className={baseStyles} style={style} {...props}>
        {dot && (
          <span
            className={cn(
              "relative h-1.5 w-1.5 rounded-full flex-shrink-0",
              pulse && "animate-pulse-soft",
              dotColor ? "" : "bg-current"
            )}
            style={dotColor ? { backgroundColor: dotColor } : undefined}
            aria-hidden="true"
          />
        )}
        {children}
      </span>
    );
  }
);

Badge.displayName = "Badge";

export interface StatusBadgeProps {
  status: "live" | "upcoming" | "finished" | "postponed" | "cancelled" | "half-time" | "extra-time" | "penalties";
  size?: BadgeProps["size"];
  className?: string;
}

const statusConfig: Record<string, { label: string; variant: "destructive" | "info" | "success" | "warning" | "default" | "club" | "gold"; dot: boolean; dotColor: string; pulse: boolean }> = {
  live: { label: "EN VIVO", variant: "destructive", dot: true, dotColor: "#EF4444", pulse: true },
  upcoming: { label: "PRÓXIMO", variant: "info", dot: true, dotColor: "#3B82F6", pulse: false },
  finished: { label: "FINALIZADO", variant: "success", dot: true, dotColor: "#22C55E", pulse: false },
  postponed: { label: "APLAZADO", variant: "warning", dot: true, dotColor: "#F59E0B", pulse: false },
  cancelled: { label: "CANCELADO", variant: "default", dot: true, dotColor: "#9CA3AF", pulse: false },
  "half-time": { label: "DESCANSO", variant: "warning", dot: true, dotColor: "#F59E0B", pulse: true },
  "extra-time": { label: "PRÓRROGA", variant: "club", dot: true, dotColor: "#D42030", pulse: true },
  penalties: { label: "PENALTIS", variant: "gold", dot: true, dotColor: "#CEAB5D", pulse: true },
};

export function StatusBadge({ status, size = "md", className }: StatusBadgeProps) {
  const config = statusConfig[status];
  return <Badge variant={config.variant} size={size} dot={config.dot} dotColor={config.dotColor} pulse={config.pulse} className={className}>{config.label}</Badge>;
}