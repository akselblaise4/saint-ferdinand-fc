"use client";

import { motion } from "framer-motion";

interface BentoGridProps {
  className?: string;
  children: React.ReactNode;
}

export function BentoGrid({ className, children }: BentoGridProps) {
  return (
    <div
      className={`mx-auto grid max-w-7xl grid-cols-1 gap-4 md:auto-rows-[18rem] md:grid-cols-3 ${className ?? ""}`}
    >
      {children}
    </div>
  );
}

interface BentoGridItemProps {
  className?: string;
  colSpan?: "1" | "2" | "3";
  rowSpan?: "1" | "2" | "3";
  children: React.ReactNode;
  index?: number;
  asMotion?: boolean;
}

export function BentoGridItem({
  className,
  colSpan = "1",
  rowSpan = "1",
  children,
  index = 0,
  asMotion = true,
}: BentoGridItemProps) {
  const colMap: Record<string, string> = { "1": "", "2": "md:col-span-2", "3": "md:col-span-3" };
  const rowMap: Record<string, string> = { "1": "", "2": "md:row-span-2", "3": "md:row-span-3" };

  const base = `group relative flex flex-col justify-between overflow-hidden rounded-xl border bg-card shadow-sm transition-all duration-300 hover:shadow-md ${colMap[colSpan]} ${rowMap[rowSpan]} ${className ?? ""}`;

  if (!asMotion) {
    return <div className={base}>{children}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      className={base}
    >
      {children}
    </motion.div>
  );
}