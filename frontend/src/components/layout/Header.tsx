"use client";

import React from "react";
import Link from "next/link";
import { useTheme } from "@/context/theme-context";
import { useAuth } from "@/context/auth-context";
import { Moon, Sun, LogOut, User as UserIcon, Menu } from "lucide-react";
import { Button } from "../ui/Button";

interface HeaderProps {
  title?: string;
  onOpenMobileNav?: () => void;
}

export function Header({ title = "Dashboard", onOpenMobileNav }: HeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();

  return (
    <header className="h-16 border-b border-slate-200 dark:border-slate-800/80 bg-white/70 dark:bg-slate-950/70 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3">
        {onOpenMobileNav && (
          <button
            onClick={onOpenMobileNav}
            className="md:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}
        <h1 className="text-base font-semibold text-slate-900 dark:text-slate-100">{title}</h1>
      </div>

      <div className="flex items-center gap-3">
        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          aria-label="Alternar tema"
          className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        {/* User Info & Logout */}
        {user ? (
          <div className="flex items-center gap-3 pl-2 border-l border-slate-200 dark:border-slate-800">
            <div className="text-right hidden sm:block">
              <span className="block text-xs font-semibold text-slate-900 dark:text-slate-100 leading-tight">
                {user.full_name}
              </span>
              <span className="block text-[10px] text-slate-400 leading-tight truncate max-w-[140px]">
                {user.email}
              </span>
            </div>
            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-sky-400 to-indigo-500 text-white flex items-center justify-center font-medium text-xs shadow-xs">
              {user.full_name.charAt(0).toUpperCase()}
            </div>
            <button
              onClick={logout}
              title="Encerrar sessão"
              className="p-2 rounded-xl text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link href="/login">
              <Button variant="ghost" size="sm">Entrar</Button>
            </Link>
            <Link href="/register">
              <Button size="sm">Cadastrar</Button>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
