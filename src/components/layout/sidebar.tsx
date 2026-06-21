"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Calendar,
  Trophy,
  Image,
  Newspaper,
  Settings,
  ChevronLeft,
} from "lucide-react";
import { useState } from "react";

interface SidebarProps {
  className?: string;
}

const links = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/plantilla", label: "Plantilla", icon: Users },
  { href: "/admin/partidos", label: "Partidos", icon: Calendar },
  { href: "/admin/clasificacion", label: "Clasificación", icon: Trophy },
  { href: "/admin/galeria", label: "Galería", icon: Image },
  { href: "/admin/blog", label: "Noticias", icon: Newspaper },
  { href: "/admin/config", label: "Configuración", icon: Settings },
];

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 bottom-0 z-40 flex flex-col",
        "glass bg-card/80 backdrop-blur-2xl border-r border-white/5",
        "transition-all duration-300",
        collapsed ? "w-16" : "w-64",
        className
      )}
    >
      <div className={cn(
        "flex items-center h-16 md:h-20 px-4 border-b border-white/5",
        collapsed ? "justify-center" : "justify-between"
      )}>
        {!collapsed && (
          <Link href="/admin" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-club-red flex items-center justify-center">
              <span className="text-white font-display text-xs">SF</span>
            </div>
            <span className="font-display text-lg text-white">ADMIN</span>
          </Link>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-white hover:bg-white/5 transition-all"
        >
          <ChevronLeft size={16} className={cn("transition-transform", collapsed && "rotate-180")} />
        </button>
      </div>

      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto scrollbar-hide">
        {links.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 group",
                collapsed && "justify-center px-2",
                isActive
                  ? "bg-club-red/15 text-club-red border border-club-red/20"
                  : "text-muted-foreground hover:text-white hover:bg-white/5"
              )}
            >
              <link.icon size={18} className="shrink-0" />
              {!collapsed && <span>{link.label}</span>}
              {isActive && !collapsed && (
                <motion.div
                  layoutId="sidebar-active"
                  className="ml-auto w-1.5 h-1.5 rounded-full bg-club-red"
                />
              )}
            </Link>
          );
        })}
      </nav>

      <div className={cn(
        "p-4 border-t border-white/5",
        collapsed && "flex justify-center"
      )}>
        <div className={cn(
          "flex items-center gap-3",
          collapsed && "flex-col"
        )}>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-club-red to-club-gold flex items-center justify-center text-xs font-bold text-white shrink-0">
            AD
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-sm text-white/90 truncate">Admin</p>
              <p className="text-[10px] text-muted-foreground truncate">admin@sfc.com</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
