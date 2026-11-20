"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Compass,
  CheckSquare,
  BookOpen,
  Bookmark,
  TrendingUp,
  Settings,
  LayoutDashboard,
  GraduationCap,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Trilhas de Estudo", href: "/paths", icon: Compass },
  { name: "Tarefas", href: "/tasks", icon: CheckSquare },
  { name: "Base de Conhecimento", href: "/notes", icon: BookOpen },
  { name: "Recursos", href: "/resources", icon: Bookmark },
  { name: "Progresso & Métricas", href: "/progress", icon: TrendingUp },
  { name: "Configurações", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-slate-200 dark:border-slate-800/80 bg-white/70 dark:bg-slate-950/70 backdrop-blur-md flex flex-col justify-between shrink-0 h-screen sticky top-0 hidden md:flex">
      <div>
        {/* Brand / Logo */}
        <div className="h-16 flex items-center px-6 border-b border-slate-100 dark:border-slate-800/80 gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-sky-500/20">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div>
            <span className="font-bold text-base tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
              Selftaught
            </span>
            <span className="block text-[10px] text-slate-400 font-medium -mt-1 tracking-wider uppercase">
              Study Hub
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all group",
                  isActive
                    ? "bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 font-semibold shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/60 dark:hover:bg-slate-900/60"
                )}
              >
                <Icon
                  className={cn(
                    "h-4 w-4 transition-transform group-hover:scale-110",
                    isActive ? "text-sky-600 dark:text-sky-400" : "text-slate-400 dark:text-slate-500"
                  )}
                />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Info */}
      <div className="p-4 m-3 border border-slate-200/80 dark:border-slate-800/60 rounded-xl bg-slate-50/50 dark:bg-slate-900/40 text-center">
        <p className="text-[11px] font-medium text-slate-700 dark:text-slate-300">
          Aprendizagem Autodidata
        </p>
        <p className="text-[10px] text-slate-400 mt-0.5">
          Organize. Estude. Evolua.
        </p>
      </div>
    </aside>
  );
}
