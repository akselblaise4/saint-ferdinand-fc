"use client";

import * as React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "glass" | "destructive" | "gold";
  size?: "sm" | "md" | "lg" | "xl" | "icon" | "icon-sm";
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  asChild?: boolean;
  hoverLift?: boolean;
  hoverGlow?: boolean;
}

const variantStyles = {
  primary: "bg-club-red text-white border-club-red hover:bg-club-red/90 hover:border-club-red/90 active:bg-club-red-dark focus:ring-club-red/40",
  secondary: "bg-surface-high text-foreground border-surface-highest hover:bg-surface-highest active:bg-surface-highest focus:ring-white/20",
  outline: "bg-transparent border-border hover:bg-white/5 active:bg-white/10 focus:ring-white/20",
  ghost: "bg-transparent hover:bg-white/5 active:bg-white/10 focus:ring-white/20",
  glass: "glass bg-card/40 border-white/10 backdrop-blur-xl hover:bg-card/60 hover:border-white/20 active:bg-card/70 focus:ring-white/20",
  destructive: "bg-red-600 text-white border-red-600 hover:bg-red-600/90 active:bg-red-700 focus:ring-red-500/40",
  gold: "bg-club-gold text-club-navy border-club-gold hover:bg-club-gold/90 active:bg-club-gold/80 focus:ring-club-gold/40",
} as const;

const sizeStyles = {
  sm: "h-9 px-3 text-xs gap-1.5",
  md: "h-10 px-4 text-sm gap-2",
  lg: "h-11 px-6 text-base gap-2",
  xl: "h-12 px-8 text-lg gap-2.5",
  icon: "h-10 w-10 p-0",
  "icon-sm": "h-8 w-8 p-0",
} as const;

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      loading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      asChild = false,
      hoverLift = false,
      hoverGlow = false,
      disabled,
      children,
      style,
      ...props
    },
    ref
  ) => {
    const baseStyles = cn(
      "inline-flex items-center justify-center font-medium rounded-xl",
      "transition-all duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)]",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
      "disabled:pointer-events-none disabled:opacity-50",
      "relative overflow-hidden",
      variantStyles[variant],
      sizeStyles[size],
      fullWidth && "w-full",
      hoverLift && "hover:-translate-y-0.5 hover:shadow-lg",
      hoverGlow && variant !== "ghost" && "hover:shadow-[0_0_20px_-2px_rgba(var(--color-club-red),0.4)]",
      className
    );

    const glowStyles = {
      primary: "absolute inset-0 bg-gradient-to-r from-club-red/30 via-transparent to-club-red/30 opacity-0 transition-opacity duration-300",
      gold: "absolute inset-0 bg-gradient-to-r from-club-gold/30 via-transparent to-club-gold/30 opacity-0 transition-opacity duration-300",
      glass: "absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-white/10 opacity-0 transition-opacity duration-300",
    };

    const glow = hoverGlow && glowStyles[variant as keyof typeof glowStyles] ? (
      <span className={cn("absolute inset-0 rounded-xl pointer-events-none", glowStyles[variant as keyof typeof glowStyles], "group-hover:opacity-100")} aria-hidden="true" />
    ) : null;

    return (
      <motion.button
        ref={ref}
        className={baseStyles}
        style={style}
        disabled={disabled || loading}
        whileTap={{ scale: loading ? 1 : 0.97 }}
        whileHover={{ scale: hoverLift && !loading ? 1.01 : 1 }}
        {...props as any}
      >
        {glow}
        <span className="relative flex items-center justify-center gap-2">
          {loading ? (
            <motion.svg
              className="h-4 w-4 animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              initial={{ rotate: 0 }}
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="3"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </motion.svg>
          ) : leftIcon ? (
            <span className="flex-shrink-0" aria-hidden="true">{leftIcon}</span>
          ) : null}
          {children}
          {!loading && rightIcon && <span className="flex-shrink-0" aria-hidden="true">{rightIcon}</span>}
        </span>
      </motion.button>
    );
  }
);

Button.displayName = "Button";

export interface ButtonGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: "horizontal" | "vertical";
}

export const ButtonGroup = React.forwardRef<HTMLDivElement, ButtonGroupProps>(
  ({ className, orientation = "horizontal", children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "inline-flex",
        orientation === "horizontal" ? "space-x-2" : "space-y-2",
        className
      )}
      role="group"
      {...props}
    >
      {children}
    </div>
  )
);

ButtonGroup.displayName = "ButtonGroup";