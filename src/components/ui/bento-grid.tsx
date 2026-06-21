"use client";

import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export interface BentoGridProps {
  className?: string;
  children: ReactNode;
  columns?: 1 | 2 | 3 | 4;
  rows?: 1 | 2 | 3 | 4;
  gap?: "sm" | "md" | "lg" | "xl";
  dense?: boolean;
  asMotion?: boolean;
}

export interface BentoGridItemProps extends Omit<HTMLMotionProps<"div">, "children" | "className" | "style"> {
  className?: string;
  style?: React.CSSProperties;
  colSpan?: 1 | 2 | 3 | 4;
  rowSpan?: 1 | 2 | 3 | 4;
  colStart?: 1 | 2 | 3 | 4;
  rowStart?: 1 | 2 | 3 | 4;
  children: ReactNode;
  index?: number;
  asMotion?: boolean;
  layoutId?: string;
  hover3D?: boolean;
  hoverLift?: boolean;
  variant?: "default" | "glass" | "elevated" | "outlined" | "interactive";
}

const gapMap = {
  sm: "gap-3",
  md: "gap-4",
  lg: "gap-6",
  xl: "gap-8",
} as const;

const columnMap = {
  1: "grid-cols-1",
  2: "grid-cols-1 md:grid-cols-2 lg:grid-cols-2",
  3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
} as const;

const rowHeightMap = {
  1: "auto-rows-[18rem]",
  2: "auto-rows-[20rem]",
  3: "auto-rows-[22rem]",
  4: "auto-rows-[24rem]",
} as const;

export function BentoGrid({
  className,
  children,
  columns = 3,
  rows = 3,
  gap = "md",
  dense = true,
  asMotion = true,
}: BentoGridProps) {
  const baseGrid = cn(
    "mx-auto max-w-7xl",
    "grid",
    columnMap[columns],
    rowHeightMap[rows],
    gapMap[gap],
    dense && "grid-flow-dense",
    className
  );

  return <div className={baseGrid}>{children}</div>;
}

export function BentoGridItem({
  className,
  colSpan = 1,
  rowSpan = 1,
  colStart,
  rowStart,
  children,
  index = 0,
  asMotion = true,
  layoutId,
  hover3D = false,
  hoverLift = true,
  variant = "glass",
  style,
  ...props
}: BentoGridItemProps) {
  const colStyles = cn(
    colSpan > 1 && `col-span-${colSpan}`,
    colStart && `col-start-${colStart}`
  );
  const rowStyles = cn(
    rowSpan > 1 && `row-span-${rowSpan}`,
    rowStart && `row-start-${rowStart}`
  );

  const variantStyles = {
    default: "bg-card border-border/40",
    glass: "glass bg-card/40 border-white/10 backdrop-blur-xl",
    elevated: "bg-card/80 border-border/30 shadow-[0_4px_24px_-2px_rgba(0,0,0,0.4),0_0_0_1px_rgba(255,255,255,0.03)]",
    outlined: "bg-transparent border-border/60",
    interactive: "bg-card/60 border-border/40 cursor-pointer transition-all duration-300",
  };

  const baseStyles = cn(
    "relative group rounded-2xl overflow-hidden",
    "transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]",
    "flex flex-col",
    variantStyles[variant],
    colStyles,
    rowStyles,
    hoverLift && "hover:-translate-y-1 hover:shadow-[0_20px_60px_-8px_rgba(212,32,48,0.15),0_0_0_1px_rgba(212,32,48,0.25)] hover:border-club-red/50",
    className
  );

  const motionProps: HTMLMotionProps<"div"> = {
    initial: { opacity: 0, y: 24, scale: 0.96 },
    animate: { opacity: 1, y: 0, scale: 1 },
    transition: {
      duration: 0.6,
      delay: index * 0.07,
      ease: [0.34, 1.56, 0.64, 1],
    },
    whileInView: { opacity: 1, y: 0, scale: 1 },
    viewport: { once: true, margin: "-100px" },
    style: {
      ...style,
      transformStyle: hover3D ? "preserve-3d" : undefined,
      WebkitTransformStyle: hover3D ? "preserve-3d" : undefined,
    },
  };

  if (layoutId) {
    motionProps.layoutId = layoutId;
    motionProps.transition = { ...motionProps.transition, type: "spring", stiffness: 300, damping: 30 };
  }

  if (!asMotion) {
    return <div className={baseStyles} style={style}>{children}</div>;
  }

  if (hover3D) {
    return (
      <motion.div
        {...motionProps}
        className={baseStyles}
        whileHover={{
          rotateX: [0, 4, 0],
          rotateY: [0, -4, 0],
          scale: 1.025,
          zIndex: 20,
          boxShadow: "0 24px 80px -12px rgba(212,32,48,0.25), 0 0 0 1px rgba(212,32,48,0.35), 0 0 120px -24px rgba(212,32,48,0.15)",
          transition: { duration: 0.4, ease: [0.34, 1.56, 0.64, 1] },
        }}
        whileTap={{ scale: 0.98, rotateX: 0, rotateY: 0 }}
        {...props}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-club-red/10 via-transparent to-club-gold/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl" />
        <div className="relative z-10 flex flex-col h-full" style={{ transformStyle: "preserve-3d" }}>
          {children}
        </div>
      </motion.div>
    );
  }

  if (hoverLift) {
    return (
      <motion.div
        {...motionProps}
        className={baseStyles}
        whileHover={{
          y: -6,
          boxShadow: "0 20px 60px -10px rgba(212,32,48,0.18), 0 0 0 1px rgba(212,32,48,0.3)",
          transition: { duration: 0.35, ease: [0.34, 1.56, 0.64, 1] },
        }}
        whileTap={{ scale: 0.98, y: 0 }}
        {...props}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-club-red/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl" />
        <div className="relative z-10 flex flex-col h-full">{children}</div>
      </motion.div>
    );
  }

  return (
    <motion.div {...motionProps} className={baseStyles} style={style} {...props}>
      {children}
    </motion.div>
  );
}

export interface BentoGridPatternProps {
  pattern: "feature" | "dashboard" | "gallery" | "stats" | "mixed";
  className?: string;
  children?: ReactNode;
  items?: Array<{
    colSpan: BentoGridItemProps["colSpan"];
    rowSpan: BentoGridItemProps["rowSpan"];
    colStart?: BentoGridItemProps["colStart"];
    rowStart?: BentoGridItemProps["rowStart"];
    layoutId?: string;
    hover3D?: boolean;
    variant?: BentoGridItemProps["variant"];
    children: ReactNode;
  }>;
}

const patterns = {
  feature: [
    { colSpan: 2, rowSpan: 2, colStart: 1, rowStart: 1 },
    { colSpan: 1, rowSpan: 1, colStart: 3, rowStart: 1 },
    { colSpan: 1, rowSpan: 1, colStart: 3, rowStart: 2 },
    { colSpan: 1, rowSpan: 2, colStart: 1, rowStart: 3 },
    { colSpan: 2, rowSpan: 1, colStart: 2, rowStart: 3 },
  ],
  dashboard: [
    { colSpan: 2, rowSpan: 1, colStart: 1, rowStart: 1 },
    { colSpan: 1, rowSpan: 2, colStart: 3, rowStart: 1 },
    { colSpan: 1, rowSpan: 1, colStart: 1, rowStart: 2 },
    { colSpan: 1, rowSpan: 1, colStart: 2, rowStart: 2 },
    { colSpan: 3, rowSpan: 1, colStart: 1, rowStart: 3 },
  ],
  gallery: [
    { colSpan: 2, rowSpan: 2, colStart: 1, rowStart: 1 },
    { colSpan: 1, rowSpan: 2, colStart: 3, rowStart: 1 },
    { colSpan: 2, rowSpan: 1, colStart: 1, rowStart: 3 },
    { colSpan: 1, rowSpan: 1, colStart: 3, rowStart: 3 },
    { colSpan: 1, rowSpan: 1, colStart: 2, rowStart: 3 },
  ],
  stats: [
    { colSpan: 1, rowSpan: 1, colStart: 1, rowStart: 1 },
    { colSpan: 1, rowSpan: 1, colStart: 2, rowStart: 1 },
    { colSpan: 1, rowSpan: 1, colStart: 3, rowStart: 1 },
    { colSpan: 2, rowSpan: 2, colStart: 1, rowStart: 2 },
    { colSpan: 1, rowSpan: 2, colStart: 3, rowStart: 2 },
  ],
  mixed: [
    { colSpan: 2, rowSpan: 2, colStart: 1, rowStart: 1 },
    { colSpan: 1, rowSpan: 1, colStart: 3, rowStart: 1 },
    { colSpan: 1, rowSpan: 2, colStart: 3, rowStart: 2 },
    { colSpan: 1, rowSpan: 1, colStart: 1, rowStart: 3 },
    { colSpan: 1, rowSpan: 1, colStart: 2, rowStart: 3 },
    { colSpan: 1, rowSpan: 1, colStart: 3, rowStart: 3 },
  ],
};

export function BentoGridPattern({
  pattern = "mixed",
  className,
  children,
  items = [],
}: BentoGridPatternProps) {
  const layout = patterns[pattern];

  const cols: NonNullable<BentoGridPatternProps["items"]> = items.length > 0
    ? items
    : (layout as any).map((l: any) => ({
    colSpan: l.colSpan as 1 | 2 | 3 | 4 | undefined,
    rowSpan: l.rowSpan as 1 | 2 | 3 | 4 | undefined,
    colStart: l.colStart as 1 | 2 | 3 | 4 | undefined,
    rowStart: l.rowStart as 1 | 2 | 3 | 4 | undefined,
    children: null as ReactNode,
  }));

  return (
    <BentoGrid className={className} columns={3} rows={3} gap="md" dense>
      {cols.map((item, i) => (
        <BentoGridItem
          key={i}
          index={i}
          colSpan={item.colSpan}
          rowSpan={item.rowSpan}
          colStart={item.colStart}
          rowStart={item.rowStart}
          layoutId={item.layoutId}
          hover3D={item.hover3D}
          variant={item.variant ?? "glass"}
        >
          {item.children}
        </BentoGridItem>
      ))}
      {children}
    </BentoGrid>
  );
}

export const BentoGridCompound = Object.assign(BentoGrid, {
  Item: BentoGridItem,
  Pattern: BentoGridPattern,
});

export type BentoGridCompoundType = typeof BentoGridCompound;
