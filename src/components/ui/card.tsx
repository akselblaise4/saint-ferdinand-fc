"use client";

import * as React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "outlined" | "interactive" | "glass";
  padding?: "none" | "sm" | "md" | "lg";
  hover?: boolean;
  hover3D?: boolean;
  asChild?: boolean;
}

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}
export interface CardTitleProps extends React.HTMLAttributes<HTMLDivElement> {}
export interface CardDescriptionProps extends React.HTMLAttributes<HTMLDivElement> {}
export interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {}
export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {}
export interface CardActionProps extends React.HTMLAttributes<HTMLDivElement> {}

const variantStyles = {
  default: "bg-card border-border/40",
  elevated: "bg-card/80 border-border/30 shadow-[0_4px_24px_-2px_rgba(0,0,0,0.4),0_0_0_1px_rgba(255,255,255,0.03)]",
  outlined: "bg-transparent border-border/60",
  interactive: "bg-card/60 border-border/40 cursor-pointer transition-all duration-300",
  glass: "glass bg-card/40 border-white/10 backdrop-blur-xl",
} as const;

const paddingStyles = {
  none: "",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
} as const;

function Card({
  className,
  variant = "glass",
  padding = "md",
  hover = false,
  hover3D = false,
  asChild = false,
  children,
  style,
  ...props
}: CardProps) {
  const baseStyles = cn(
    "relative rounded-2xl overflow-hidden transition-all duration-300",
    "bg-card/50 backdrop-blur-xl border border-white/10",
    "shadow-[0_2px_8px_-2px_rgba(0,0,0,0.3),0_0_0_1px_rgba(255,255,255,0.02)]",
    variantStyles[variant],
    paddingStyles[padding],
    hover && "hover:border-club-red/50 hover:shadow-[0_8px_32px_-4px_rgba(212,32,48,0.15),0_0_0_1px_rgba(212,32,48,0.2)]",
    className
  );

  const Component = asChild ? motion.div : motion.div;

  if (hover3D) {
    return (
      <motion.div
        className={baseStyles}
        style={style as any}
        {...props as any}
        whileHover={{
          rotateX: 3,
          rotateY: -3,
          scale: 1.02,
          zIndex: 10,
          boxShadow: "0 20px 60px -8px rgba(212,32,48,0.2), 0 0 0 1px rgba(212,32,48,0.3), 0 0 80px -20px rgba(212,32,48,0.1)",
          transition: { duration: 0.3, ease: [0.34, 1.56, 0.64, 1] },
        }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-club-red/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
        <div className="relative z-10">{children}</div>
      </motion.div>
    );
  }

  if (hover) {
    return (
      <motion.div
        className={baseStyles}
        style={style as any}
        {...props as any}
        whileHover={{
          y: -4,
          boxShadow: "0 16px 48px -8px rgba(212,32,48,0.15), 0 0 0 1px rgba(212,32,48,0.25)",
          transition: { duration: 0.3, ease: [0.34, 1.56, 0.64, 1] },
        }}
        whileTap={{ scale: 0.98, y: 0 }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-club-red/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl" />
        <div className="relative z-10">{children}</div>
      </motion.div>
    );
  }

  return <Component className={baseStyles} style={style as any} {...props as any}>{children}</Component>;
}

function CardHeader({ className, children, ...props }: CardHeaderProps) {
  return (
    <div
      data-slot="card-header"
      className={cn("flex flex-col gap-1.5", className)}
      {...props}
    >
      {children}
    </div>
  );
}

function CardTitle({ className, children, ...props }: CardTitleProps) {
  return (
    <div
      data-slot="card-title"
      className={cn(
        "font-display text-2xl md:text-3xl tracking-tight text-card-foreground",
        "bg-gradient-to-r from-white via-white/90 to-club-gold/80 bg-clip-text text-transparent",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

function CardDescription({ className, children, ...props }: CardDescriptionProps) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-sm text-muted-foreground leading-relaxed", className)}
      {...props}
    >
      {children}
    </div>
  );
}

function CardAction({ className, children, ...props }: CardActionProps) {
  return (
    <div
      data-slot="card-action"
      className={cn("flex items-center justify-end", className)}
      {...props}
    >
      {children}
    </div>
  );
}

function CardContent({ className, children, ...props }: CardContentProps) {
  return (
    <div data-slot="card-content" className={cn("", className)} {...props}>
      {children}
    </div>
  );
}

function CardFooter({ className, children, ...props }: CardFooterProps) {
  return (
    <div
      data-slot="card-footer"
      className={cn(
        "flex items-center gap-4 rounded-b-[inherit] border-t border-white/5",
        "bg-white/2.5 backdrop-blur-sm px-6 py-4",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export const CardCompound = Object.assign(Card, {
  Header: CardHeader,
  Title: CardTitle,
  Description: CardDescription,
  Action: CardAction,
  Content: CardContent,
  Footer: CardFooter,
});

export type CardCompoundType = typeof CardCompound;
export { Card, CardHeader, CardTitle, CardDescription, CardAction, CardContent, CardFooter };